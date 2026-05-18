import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  bulkAssign,
  placeIncremental,
  type ClusterUser,
} from './cluster.algorithm';

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
  constructor(private readonly dataSource: DataSource) {}

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
   * friends. Idempotent — does nothing if the user is already clustered.
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

      const clusteredRows = await manager.query<
        { id: number; clusterId: number }[]
      >(`SELECT id, "clusterId" FROM "user" WHERE "clusterId" IS NOT NULL`);

      const relevantIds = [userId, ...clusteredRows.map((r) => r.id)];
      const byId = await loadClusterUsers(manager, relevantIds);

      // ----- Compute -----
      const clustersById = new Map<number, ClusterUser[]>();
      for (const row of clusteredRows) {
        const u = byId.get(row.id)!;
        let arr = clustersById.get(row.clusterId);
        if (!arr) {
          arr = [];
          clustersById.set(row.clusterId, arr);
        }
        arr.push(u);
      }
      const clusterIds = [...clustersById.keys()];
      const clusters = clusterIds.map((id) => clustersById.get(id)!);

      const idx = placeIncremental(byId.get(userId)!, clusters);

      // ----- Write -----
      let targetClusterId: number;
      if (idx === null) {
        const countRow = await manager.query<{ count: string }[]>(
          `SELECT COUNT(*)::text AS count FROM "cluster"`,
        );
        const nextNumber = Number(countRow[0].count) + 1;
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
