/**
 * Tracks async work that runs detached from any request lifecycle (e.g. async
 * event-emitter listeners), so shutdown can wait for it before shared
 * resources like the database connection are torn down.
 *
 * Rejections are swallowed by the tracker — attach a `.catch` that logs
 * before calling `track` if the promise can reject.
 */
export class DetachedWorkTracker {
  private readonly pending = new Set<Promise<unknown>>();

  track(promise: Promise<unknown>): void {
    this.pending.add(promise);
    void promise
      .catch(() => undefined)
      .finally(() => this.pending.delete(promise));
  }

  /** Resolves once all tracked work, including any added while waiting, settles. */
  async drain(): Promise<void> {
    while (this.pending.size) {
      await Promise.allSettled([...this.pending]);
    }
  }
}
