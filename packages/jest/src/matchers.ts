import type { BaseMetric, LLMTestCase } from "@assay-ai/core";
import { AnswerRelevancyMetric, FaithfulnessMetric, HallucinationMetric } from "@assay-ai/core";

function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
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

function formatPassMessage(metricName: string, score: number, threshold: number): string {
  return [
    `Expected test case NOT to pass ${metricName}`,
    `  Score:     ${formatScore(score)}`,
    `  Threshold: ${formatScore(threshold)}`,
  ].join("\n");
}

async function evaluateWithMetric(
  testCase: LLMTestCase,
  metric: BaseMetric,
  isNot: boolean,
): Promise<jest.CustomMatcherResult> {
  const result = await metric.measure(testCase);
  const passed = result.score >= metric.threshold;

  return {
    pass: passed,
    message: () =>
      (passed && !isNot) || (!passed && isNot)
        ? formatPassMessage(metric.name, result.score, metric.threshold)
        : formatFailureMessage(metric.name, result.score, metric.threshold, result.reason),
  };
}

export const assayMatchers: Record<string, jest.CustomMatcher> = {
  async toBeRelevant(
    this: jest.MatcherContext,
    received: LLMTestCase,
    options?: { threshold?: number },
  ): Promise<jest.CustomMatcherResult> {
    const threshold = options?.threshold ?? 0.5;
    const metric = new AnswerRelevancyMetric({ threshold });
    return evaluateWithMetric(received, metric, this.isNot ?? false);
  },

  async toBeFaithful(
    this: jest.MatcherContext,
    received: LLMTestCase,
    options?: { threshold?: number },
  ): Promise<jest.CustomMatcherResult> {
    const threshold = options?.threshold ?? 0.5;
    const metric = new FaithfulnessMetric({ threshold });
    return evaluateWithMetric(received, metric, this.isNot ?? false);
  },

  async toNotHallucinate(
    this: jest.MatcherContext,
    received: LLMTestCase,
    options?: { threshold?: number },
  ): Promise<jest.CustomMatcherResult> {
    const threshold = options?.threshold ?? 0.5;
    const metric = new HallucinationMetric({ threshold });
    const result = await metric.measure(received);
    // HallucinationMetric: higher score = more hallucination.
    // Invert so that "toNotHallucinate" passes when hallucination is low.
    const hallucinationScore = result.score;
    const invertedScore = 1 - hallucinationScore;
    const passed = invertedScore >= threshold;

    return {
      pass: passed,
      message: () =>
        passed
          ? formatPassMessage("HallucinationMetric (inverted)", invertedScore, threshold)
          : formatFailureMessage("HallucinationMetric", invertedScore, threshold, result.reason),
    };
  },

  async toPassMetric(
    this: jest.MatcherContext,
    received: LLMTestCase,
    metric: BaseMetric,
  ): Promise<jest.CustomMatcherResult> {
    return evaluateWithMetric(received, metric, this.isNot ?? false);
  },

  async toPassAllMetrics(
    this: jest.MatcherContext,
    received: LLMTestCase,
    metrics: BaseMetric[],
  ): Promise<jest.CustomMatcherResult> {
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
    };
  },
};
