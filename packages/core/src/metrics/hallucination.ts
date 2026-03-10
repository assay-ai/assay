import type { LLMTestCase } from "../test-case.js";
import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { HallucinationTemplate } from "../templates/hallucination.js";
import { z } from "zod";

const contradictionSchema = z.object({
  verdict: z.enum(["yes", "no"]),
  reason: z.string(),
});

const reasonSchema = z.object({
  reason: z.string(),
});

export class HallucinationMetric extends BaseMetric {
  readonly name = "Hallucination";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput", "context"];
  readonly lowerIsBetter = true;

  constructor(config?: MetricConfig) {
    super({ threshold: 0.5, ...config });
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();
    const contexts = testCase.context!;

    if (contexts.length === 0) {
      return this.buildResult(0, "No context provided — no hallucination possible.", start);
    }

    // Check each context node for contradiction (can run in parallel)
    const verdicts = await Promise.all(
      contexts.map(async (ctx) => {
        const result = await this.provider.generateJSON(
          HallucinationTemplate.checkContradiction(testCase.actualOutput!, ctx),
          contradictionSchema,
        );
        return { context: ctx, verdict: result.verdict, reason: result.reason };
      }),
    );

    // Score: proportion of contradicted contexts (lower is better)
    const contradictedCount = verdicts.filter((v) => v.verdict === "yes").length;
    let score = contradictedCount / contexts.length;
    score = this.applyStrictMode(score);

    // Generate reason
    let reason: string | undefined;
    if (this.includeReason) {
      const result = await this.provider.generateJSON(
        HallucinationTemplate.generateReason(score, verdicts),
        reasonSchema,
      );
      reason = result.reason;
    }

    return this.buildResult(score, reason, start, { verdicts });
  }
}
