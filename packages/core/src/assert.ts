import type { BaseMetric, MetricResult } from "./metric.js";
import type { LLMTestCase } from "./test-case.js";

export interface AssertEvalOptions {
  /** The test case to evaluate */
  testCase: LLMTestCase;
  /** Metrics to check */
  metrics: BaseMetric[];
}

export interface AssertEvalResult {
  /** Whether all metrics passed */
  passed: boolean;
  /** Individual metric results */
  results: MetricResult[];
  /** Failure messages for metrics that did not pass */
  failures: string[];
}

/**
 * Evaluate a single test case against one or more metrics.
 * Designed for use inside unit tests (vitest, jest, etc).
 *
 * @example
 * ```ts
 * const result = await assertEval({
 *   testCase: { input: "What is 2+2?", actualOutput: "4" },
 *   metrics: [new AnswerRelevancyMetric({ threshold: 0.7 })],
 * });
 * expect(result.passed).toBe(true);
 * ```
 */
export async function assertEval(options: AssertEvalOptions): Promise<AssertEvalResult> {
  const results: MetricResult[] = [];
  const failures: string[] = [];

  for (const metric of options.metrics) {
    try {
      const result = await metric.measure(options.testCase);
      results.push(result);

      if (!result.pass) {
        failures.push(
          `${result.metricName}: score ${result.score.toFixed(3)} (threshold ${result.threshold}). Reason: ${result.reason}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        score: 0,
        pass: false,
        reason: message,
        metricName: metric.name,
        threshold: metric.threshold,
        evaluationTimeMs: 0,
      });
      failures.push(`${metric.name}: error - ${message}`);
    }
  }

  return {
    passed: failures.length === 0,
    results,
    failures,
  };
}
