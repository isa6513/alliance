export const CLUSTER_TARGET_SIZE = 10;
const MAX_REFINEMENT_PASSES = 50;

export interface ClusterUser {
  id: number;
  communities: Set<number>;
  friends: Set<number>;
}

function sharesCommunity(a: ClusterUser, b: ClusterUser): boolean {
  for (const c of a.communities) if (b.communities.has(c)) return true;
  return false;
}

function hasFriendIn(
  u: ClusterUser,
  others: ClusterUser[],
  excludeIdx: number,
): boolean {
  for (let k = 0; k < others.length; k++) {
    if (k === excludeIdx) continue;
    if (u.friends.has(others[k].id)) return true;
  }
  return false;
}

function scoreAdd(candidate: ClusterUser, cluster: ClusterUser[]): number {
  let s = 0;
  for (const m of cluster) {
    if (candidate.friends.has(m.id)) return -Infinity;
    if (sharesCommunity(candidate, m)) s++;
  }
  return s;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function bulkAssign(users: ClusterUser[]): ClusterUser[][] {
  const clusters = greedyAssign(users);
  refine(clusters);
  return clusters;
}

function greedyAssign(users: ClusterUser[]): ClusterUser[][] {
  if (users.length === 0) return [];

  // Fix cluster count upfront so sizes stay near-equal; filling each cluster
  // to TARGET before the next would strand friend-blocked users in a tiny tail.
  const numClusters = Math.max(
    1,
    Math.ceil(users.length / CLUSTER_TARGET_SIZE),
  );

  // Seed hardest-to-place users first (fewest communities to match on).
  const seedOrder = shuffleInPlace([...users]);
  seedOrder.sort((a, b) => a.communities.size - b.communities.size);

  const remaining = new Set(users.map((u) => u.id));
  const byId = new Map(users.map((u) => [u.id, u]));
  const clusters: ClusterUser[][] = [];

  for (const seed of seedOrder) {
    if (!remaining.has(seed.id)) continue;
    if (clusters.length >= numClusters) break;
    const cluster: ClusterUser[] = [seed];
    remaining.delete(seed.id);

    // Recomputed per cluster so later clusters absorb earlier shortfalls.
    const clustersLeft = numClusters - clusters.length;
    const target = Math.ceil((remaining.size + cluster.length) / clustersLeft);

    while (cluster.length < target && remaining.size > 0) {
      let bestId: number | null = null;
      let bestScore = -Infinity;
      for (const id of remaining) {
        const cand = byId.get(id)!;
        const s = scoreAdd(cand, cluster);
        if (s === -Infinity) continue;
        if (s > bestScore) {
          bestScore = s;
          bestId = id;
        }
      }
      if (bestId === null) break;
      cluster.push(byId.get(bestId)!);
      remaining.delete(bestId);
    }
    clusters.push(cluster);
  }

  // Slight over-target placement beats singletons for friend-blocked leftovers.
  for (const id of remaining) {
    const u = byId.get(id)!;
    let bestIdx: number | null = null;
    let bestSize = Infinity;
    for (let idx = 0; idx < clusters.length; idx++) {
      if (scoreAdd(u, clusters[idx]) === -Infinity) continue;
      if (clusters[idx].length < bestSize) {
        bestSize = clusters[idx].length;
        bestIdx = idx;
      }
    }
    if (bestIdx !== null) {
      clusters[bestIdx].push(u);
    } else {
      clusters.push([u]);
    }
  }

  return clusters;
}

function refine(clusters: ClusterUser[][]): void {
  let passes = 0;
  while (passes < MAX_REFINEMENT_PASSES) {
    passes++;
    let bestDelta = 0;
    let bestSwap: [number, number, number, number] | null = null;

    for (let ca = 0; ca < clusters.length; ca++) {
      for (let cb = ca + 1; cb < clusters.length; cb++) {
        const A = clusters[ca];
        const B = clusters[cb];
        for (let i = 0; i < A.length; i++) {
          const ai = A[i];
          for (let j = 0; j < B.length; j++) {
            const bj = B[j];
            if (hasFriendIn(bj, A, i)) continue;
            if (hasFriendIn(ai, B, j)) continue;
            let cur = 0;
            let next = 0;
            for (let k = 0; k < A.length; k++) {
              if (k === i) continue;
              if (sharesCommunity(ai, A[k])) cur++;
              if (sharesCommunity(bj, A[k])) next++;
            }
            for (let k = 0; k < B.length; k++) {
              if (k === j) continue;
              if (sharesCommunity(bj, B[k])) cur++;
              if (sharesCommunity(ai, B[k])) next++;
            }
            const delta = next - cur;
            if (delta > bestDelta) {
              bestDelta = delta;
              bestSwap = [ca, i, cb, j];
            }
          }
        }
      }
    }

    if (!bestSwap || bestDelta <= 0) break;
    const [ca, i, cb, j] = bestSwap;
    [clusters[ca][i], clusters[cb][j]] = [clusters[cb][j], clusters[ca][i]];
  }
}
