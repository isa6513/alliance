import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  bulkAssign,
  placeIncremental,
  type ClusterUser,
} from './cluster.algorithm';
import { Cluster } from './entities/cluster.entity';

export interface ClusterAssignResult {
  clustersCreated: number;
  usersAssigned: number;
}

// Single advisory-lock key shared by all cluster-mutation transactions, so
// concurrent placements (and a placement racing with a reassign) serialize
// against each other instead of violating friend-conflict invariants.
const CLUSTER_LOCK_KEY = 73954294;

@Injectable()
export class ClusterService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Cluster)
    private readonly clusterRepository: Repository<Cluster>,
  ) {}

  async findAllWithMembers(): Promise<Cluster[]> {
    return this.clusterRepository.find({
      relations: { members: true },
      order: { id: 'ASC' },
    });
  }

  async updateDisplayName(id: number, displayName: string): Promise<Cluster> {
    const result = await this.clusterRepository.update(id, { displayName });
    if (result.affected === 0) {
      throw new NotFoundException(`Cluster ${id} not found`);
    }
    return this.clusterRepository.findOneOrFail({
      where: { id },
      relations: { members: true },
    });
  }

  /**
   * Wipes all existing clusters and re-clusters every eligible user (active
   * signed contract) from scratch. Intended for an admin "reassign all"
   * action — users may see their cluster change between runs.
   */
  async reassignAllUsers(): Promise<ClusterAssignResult> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query(`SELECT pg_advisory_xact_lock($1)`, [
        CLUSTER_LOCK_KEY,
      ]);

      // ----- Fetch -----
      const eligibleRows = await manager.query<{ id: number }[]>(`
        SELECT u.id
        FROM "user" u
        WHERE (
          SELECT ce."type" FROM "contract_event" ce
          WHERE ce."userId" = u.id AND ce."date" <= NOW()
          ORDER BY ce."date" DESC
          LIMIT 1
        ) = 'signed'
      `);
      const eligibleIds = eligibleRows.map((r) => r.id);

      if (eligibleIds.length === 0) {
        // ON DELETE SET NULL cascades to user.clusterId.
        await manager.query(`DELETE FROM "cluster"`);
        return { clustersCreated: 0, usersAssigned: 0 };
      }

      const byId = await loadClusterUsers(manager, eligibleIds);

      // ----- Compute -----
      const users = eligibleIds.map((id) => byId.get(id)!);
      const clusters = bulkAssign(users);

      // ----- Write -----
      await manager.query(`DELETE FROM "cluster"`);

      let clusterNumber = 0;
      for (const cluster of clusters) {
        clusterNumber++;
        const inserted = await manager.query<{ id: number }[]>(
          `INSERT INTO "cluster" ("displayName") VALUES ($1) RETURNING id`,
          [`Group ${clusterNumber}`],
        );
        const clusterId = inserted[0].id;
        await manager.query(
          `UPDATE "user" SET "clusterId" = $1 WHERE id = ANY($2::int[])`,
          [clusterId, cluster.map((u) => u.id)],
        );
      }

      return {
        clustersCreated: clusters.length,
        usersAssigned: eligibleIds.length,
      };
    });
  }

  /**
   * Places a single newly-signed user into the best-fit existing cluster, or
   * creates a new singleton if every existing cluster contains one of their
   * friends. Idempotent — does nothing if the user is already clustered, and
   * no-op if no clusters exist yet (admin must run a bulk reassign to seed).
   *
   * Call from the contract-signing flow when a user transitions to 'signed'.
   */
  async placeNewlySignedUser(userId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SELECT pg_advisory_xact_lock($1)`, [
        CLUSTER_LOCK_KEY,
      ]);

      // ----- Fetch -----
      const userRow = await manager.query<{ clusterId: number | null }[]>(
        `SELECT "clusterId" FROM "user" WHERE id = $1`,
        [userId],
      );
      if (userRow.length === 0 || userRow[0].clusterId !== null) return;

      const clusterRows = await manager.query<{ id: number }[]>(
        `SELECT id FROM "cluster" ORDER BY id ASC`,
      );
      if (clusterRows.length === 0) return;

      const clusteredRows = await manager.query<
        { id: number; clusterId: number }[]
      >(`SELECT id, "clusterId" FROM "user" WHERE "clusterId" IS NOT NULL`);

      const relevantIds = [userId, ...clusteredRows.map((r) => r.id)];
      const byId = await loadClusterUsers(manager, relevantIds);

      // ----- Compute -----
      const clusterIds = clusterRows.map((r) => r.id);
      const clustersById = new Map<number, ClusterUser[]>(
        clusterIds.map((id) => [id, []]),
      );
      for (const row of clusteredRows) {
        clustersById.get(row.clusterId)!.push(byId.get(row.id)!);
      }
      const clusters = clusterIds.map((id) => clustersById.get(id)!);

      const idx = placeIncremental(byId.get(userId)!, clusters);

      // ----- Write -----
      let targetClusterId: number;
      if (idx === null) {
        const nextNumber = clusterIds.length + 1;
        const inserted = await manager.query<{ id: number }[]>(
          `INSERT INTO "cluster" ("displayName") VALUES ($1) RETURNING id`,
          [`Group ${nextNumber}`],
        );
        targetClusterId = inserted[0].id;
      } else {
        targetClusterId = clusterIds[idx];
      }
      await manager.query(`UPDATE "user" SET "clusterId" = $1 WHERE id = $2`, [
        targetClusterId,
        userId,
      ]);
    });
  }
}

async function loadClusterUsers(
  manager: EntityManager,
  ids: number[],
): Promise<Map<number, ClusterUser>> {
  const byId = new Map<number, ClusterUser>();
  if (ids.length === 0) return byId;
  for (const id of ids) {
    byId.set(id, { id, communities: new Set(), friends: new Set() });
  }
  const memberships = await manager.query<
    { userId: number; communityId: number }[]
  >(
    'SELECT "userId", "communityId" FROM community_users_user WHERE "userId" = ANY($1::int[])',
    [ids],
  );
  const friendsRows = await manager.query<
    { requesterId: number; addresseeId: number }[]
  >(
    `SELECT "requesterId", "addresseeId" FROM friend
     WHERE status = 'accepted'
     AND "requesterId" = ANY($1::int[]) AND "addresseeId" = ANY($1::int[])`,
    [ids],
  );
  for (const m of memberships) {
    byId.get(m.userId)!.communities.add(m.communityId);
  }
  for (const f of friendsRows) {
    byId.get(f.requesterId)!.friends.add(f.addresseeId);
    byId.get(f.addresseeId)!.friends.add(f.requesterId);
  }
  return byId;
}
