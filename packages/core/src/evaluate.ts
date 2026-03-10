import type { EvaluationDataset } from "./dataset.js";
import type { BaseMetric, MetricResult } from "./metric.js";
import type { EvaluationSummary, TestCaseResult } from "./reporter.js";
import { ConsoleReporter } from "./reporter.js";
import type { LLMTestCase } from "./test-case.js";
import { createLimiter } from "./utils/concurrency.js";

export interface EvaluateConfig {
  /** Maximum concurrent metric evaluations (default: 10) */
  maxConcurrency?: number;
  /** Delay between batches in ms (default: 0) */
  throttleMs?: number;
  /** Continue even if some metrics error (default: false) */
  ignoreErrors?: boolean;
  /** Show verbose output (default: true) */
  verbose?: boolean;
  /** Display mode: "all" | "failing" | "passing" (default: "all") */
  display?: "all" | "failing" | "passing";
}

export interface EvaluateResult {
  testCases: Array<{
    testCase: LLMTestCase;
    results: MetricResult[];
    passed: boolean;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    averageScores: Record<string, number>;
    totalTimeMs: number;
  };
}

/**
 * Run a batch evaluation: execute all metrics on all test cases,
 * collect results, compute summary statistics, and print a report.
 */
export async function evaluate(
  testCases: LLMTestCase[] | EvaluationDataset,
  metrics: BaseMetric[],
  config?: EvaluateConfig,
): Promise<EvaluateResult> {
  const maxConcurrency = config?.maxConcurrency ?? 10;
  const verbose = config?.verbose ?? true;
  const ignoreErrors = config?.ignoreErrors ?? false;
  const display = config?.display ?? "all";
  const limit = createLimiter(maxConcurrency);

  const startTime = performance.now();

  // Resolve test cases from dataset if needed
  const cases: LLMTestCase[] = Array.isArray(testCases)
    ? testCases
    : testCases.goldens.map((g) => ({ ...g }));

  // Run all metrics on all test cases with concurrency control
  const taskResults = await Promise.all(
    cases.map((testCase, idx) =>
      limit(async () => {
        const metricResults: MetricResult[] = [];

        for (const metric of metrics) {
          try {
            const result = await metric.measure(testCase);
            metricResults.push(result);
          } catch (error) {
            if (!ignoreErrors) throw error;
            metricResults.push({
              score: 0,
              pass: false,
              reason: error instanceof Error ? error.message : String(error),
              metricName: metric.name,
              threshold: metric.threshold,
              evaluationTimeMs: 0,
            });
          }
        }

        return {
          testCase,
          results: metricResults,
          passed: metricResults.every((r) => r.pass),
          testCaseName: testCase.name ?? `Test Case #${idx + 1}`,
        };
      }),
    ),
  );

  // Compute summary
  const totalPassed = taskResults.filter((r) => r.passed).length;
  const scoreSums: Record<string, number> = {};
  const scoreCounts: Record<string, number> = {};

  for (const { results: mrs } of taskResults) {
    for (const mr of mrs) {
      scoreSums[mr.metricName] = (scoreSums[mr.metricName] ?? 0) + mr.score;
      scoreCounts[mr.metricName] = (scoreCounts[mr.metricName] ?? 0) + 1;
    }
  }

  const averageScores: Record<string, number> = {};
  for (const [name, sum] of Object.entries(scoreSums)) {
    const count = scoreCounts[name];
    if (count && count > 0) averageScores[name] = sum / count;
  }

  const totalTimeMs = performance.now() - startTime;

  const evalResult: EvaluateResult = {
    testCases: taskResults.map(({ testCase, results, passed }) => ({
      testCase,
      results,
      passed,
    })),
    summary: {
      total: taskResults.length,
      passed: totalPassed,
      failed: taskResults.length - totalPassed,
      passRate: taskResults.length > 0 ? (totalPassed / taskResults.length) * 100 : 0,
      averageScores,
      totalTimeMs,
    },
  };

  // Print report
  if (verbose) {
    const filtered = taskResults.filter((r) => {
      if (display === "failing") return !r.passed;
      if (display === "passing") return r.passed;
      return true;
    });

    const reporterResults: TestCaseResult[] = filtered.map((r) => ({
      testCaseName: r.testCaseName,
      input: r.testCase.input,
      metricResults: r.results,
      passed: r.passed,
    }));

    const summary: EvaluationSummary = {
      results: reporterResults,
      totalTests: taskResults.length,
      totalPassed,
      totalFailed: taskResults.length - totalPassed,
      averageScores,
      duration: totalTimeMs,
    };

    const reporter = new ConsoleReporter();
    reporter.report(summary);
  }

  return evalResult;
}
