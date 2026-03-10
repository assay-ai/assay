import type { BaseMetric, LLMTestCase } from "@assay-ai/core";
import {
  AnswerRelevancyMetric,
  FaithfulnessMetric,
  HallucinationMetric,
} from "@assay-ai/core";

function formatScore(score: number): string {
  return (score * 100).toFixed(1) + "%";
}

function formatFailureMessage(
  metricName: string,
  score: number,
  threshold: number,
  reason?: string,
): string {
  const lines = [
    `Expected test case to pass ${metricName}`,
    `  Score:     ${formatScore(score)}`,
    `  Threshold: ${formatScore(threshold)}`,
  ];
  if (reason) {
    lines.push(`  Reason:    ${reason}`);
  }
  return lines.join("\n");
}

function formatPassMessage(
  metricName: string,
  score: number,
  threshold: number,
): string {
  return [
    `Expected test case NOT to pass ${metricName}`,
    `  Score:     ${formatScore(score)}`,
    `  Threshold: ${formatScore(threshold)}`,
  ].join("\n");
}

async function evaluateWithMetric(
  testCase: LLMTestCase,
  metric: BaseMetric,
): Promise<{ pass: boolean; message: () => string; actual?: unknown; expected?: unknown }> {
  const result = await metric.measure(testCase);
  const passed = result.score >= metric.threshold;

  return {
    pass: passed,
    message: () =>
      passed
        ? formatPassMessage(metric.name, result.score, metric.threshold)
        : formatFailureMessage(
            metric.name,
            result.score,
            metric.threshold,
            result.reason,
          ),
    actual: result.score,
    expected: metric.threshold,
  };
}

export const assayMatchers = {
  async toBeRelevant(
    received: LLMTestCase,
    options?: { threshold?: number },
  ): Promise<{ pass: boolean; message: () => string; actual?: unknown; expected?: unknown }> {
    const threshold = options?.threshold ?? 0.5;
    const metric = new AnswerRelevancyMetric({ threshold });
    return evaluateWithMetric(received, metric);
  },

  async toBeFaithful(
    received: LLMTestCase,
    options?: { threshold?: number },
  ): Promise<{ pass: boolean; message: () => string; actual?: unknown; expected?: unknown }> {
    const threshold = options?.threshold ?? 0.5;
    const metric = new FaithfulnessMetric({ threshold });
    return evaluateWithMetric(received, metric);
  },

  async toNotHallucinate(
    received: LLMTestCase,
    options?: { threshold?: number },
  ): Promise<{ pass: boolean; message: () => string; actual?: unknown; expected?: unknown }> {
    const threshold = options?.threshold ?? 0.5;
    const metric = new HallucinationMetric({ threshold });
    const result = await metric.measure(received);
    // HallucinationMetric returns a score where higher = more hallucination.
    // We invert: the test passes when hallucination score is BELOW the threshold.
    const hallucinationScore = result.score;
    const passed = hallucinationScore <= 1 - threshold;

    return {
      pass: passed,
      message: () =>
        passed
          ? formatPassMessage(
              "HallucinationMetric (inverted)",
              1 - hallucinationScore,
              threshold,
            )
          : formatFailureMessage(
              "HallucinationMetric",
              1 - hallucinationScore,
              threshold,
              result.reason,
            ),
      actual: 1 - hallucinationScore,
      expected: threshold,
    };
  },

  async toPassMetric(
    received: LLMTestCase,
    metric: BaseMetric,
  ): Promise<{ pass: boolean; message: () => string; actual?: unknown; expected?: unknown }> {
    return evaluateWithMetric(received, metric);
  },

  async toPassAllMetrics(
    received: LLMTestCase,
    metrics: BaseMetric[],
  ): Promise<{ pass: boolean; message: () => string; actual?: unknown; expected?: unknown }> {
    const results = await Promise.all(
      metrics.map(async (metric) => {
        const result = await metric.measure(received);
        return {
          metric,
          result,
          passed: result.score >= metric.threshold,
        };
      }),
    );

    const allPassed = results.every((r) => r.passed);
    const failures = results.filter((r) => !r.passed);

    return {
      pass: allPassed,
      message: () => {
        if (allPassed) {
          const summary = results
            .map(
              (r) =>
                `  ${r.metric.name}: ${formatScore(r.result.score)} (threshold: ${formatScore(r.metric.threshold)})`,
            )
            .join("\n");
          return `Expected test case NOT to pass all metrics:\n${summary}`;
        }

        const summary = failures
          .map(
            (r) =>
              `  ${r.metric.name}: ${formatScore(r.result.score)} < ${formatScore(r.metric.threshold)}${r.result.reason ? ` — ${r.result.reason}` : ""}`,
          )
          .join("\n");
        return `Expected test case to pass all metrics. ${failures.length} of ${metrics.length} failed:\n${summary}`;
      },
      actual: results.map((r) => ({
        metric: r.metric.name,
        score: r.result.score,
      })),
      expected: metrics.map((m) => ({
        metric: m.name,
        threshold: m.threshold,
      })),
    };
  },
};
