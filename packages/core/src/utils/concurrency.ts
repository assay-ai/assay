/**
 * A minimal p-limit style concurrency limiter.
 * Controls the maximum number of concurrent async operations.
 */

export type Limiter = <T>(fn: () => Promise<T>) => Promise<T>;

/**
 * Creates a concurrency limiter that ensures no more than `concurrency`
 * async operations run simultaneously.
 *
 * @param concurrency - Maximum number of concurrent operations. Must be >= 1.
 * @returns A function that wraps async operations with concurrency control.
 *
 * @example
 * ```ts
 * const limit = createLimiter(5);
 * const results = await Promise.all(
 *   urls.map(url => limit(() => fetch(url)))
 * );
 * ```
 */
export function createLimiter(concurrency: number): Limiter {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error(
      `Concurrency must be a positive integer, got ${concurrency}`,
    );
  }

  let activeCount = 0;
  const queue: Array<() => void> = [];

  function next(): void {
    if (queue.length > 0 && activeCount < concurrency) {
      activeCount++;
      const run = queue.shift()!;
      run();
    }
  }

  return <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const run = (): void => {
        fn().then(
          (value) => {
            resolve(value);
            activeCount--;
            next();
          },
          (error) => {
            reject(error);
            activeCount--;
            next();
          },
        );
      };

      if (activeCount < concurrency) {
        activeCount++;
        run();
      } else {
        queue.push(run);
      }
    });
  };
}
