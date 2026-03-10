import { expect } from "vitest";
import { assayMatchers } from "./matchers";

export { AssayReporter } from "./reporter";
export type {} from "./types";

/**
 * Register all Assay custom matchers with Vitest.
 *
 * Call this once in your test setup file:
 * ```ts
 * import { setupAssayMatchers } from "@assay-ai/vitest";
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
