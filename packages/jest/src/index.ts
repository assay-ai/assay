import { assayMatchers } from "./matchers";

export type {} from "./types";

/**
 * Register all Assay custom matchers with Jest.
 *
 * Call this once in your test setup file (e.g., `jest.setup.ts`):
 * ```ts
 * import { setupAssayMatchers } from "@assay-ai/jest";
 * setupAssayMatchers();
 * ```
 *
 * Then use the matchers in your tests:
 * ```ts
 * await expect(testCase).toBeRelevant({ threshold: 0.7 });
 * await expect(testCase).toBeFaithful();
 * await expect(testCase).toNotHallucinate();
 * await expect(testCase).toPassMetric(myCustomMetric);
 * await expect(testCase).toPassAllMetrics([metric1, metric2]);
 * ```
 */
export function setupAssayMatchers(): void {
  expect.extend(assayMatchers);
}

export { assayMatchers } from "./matchers";
