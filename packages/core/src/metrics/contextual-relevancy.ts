import type { LLMTestCase } from "../test-case.js";
import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { ContextualRelevancyTemplate } from "../templates/contextual-relevancy.js";
import { z } from "zod";

const statementsSchema = z.object({
  statements: z.array(z.string()),
});

const verdictsSchema = z.object({
  verdicts: z.array(
    z.object({
      statement: z.string(),
      verdict: z.enum(["yes", "no"]),
    }),
  ),
});

const reasonSchema = z.object({
  reason: z.string(),
});

export class ContextualRelevancyMetric extends BaseMetric {
  readonly name = "Contextual Relevancy";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput", "retrievalContext"];

  constructor(config?: MetricConfig) {
    super(config);
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    // Step 1: Extract statements from retrievalContext
    const { statements } = await this.provider.generateJSON(
      ContextualRelevancyTemplate.extractStatements(testCase.retrievalContext!),
      statementsSchema,
    );

    if (statements.length === 0) {
      return this.buildResult(0, "No statements extracted from retrieval context.", start);
    }

    // Step 2: Classify each statement as relevant or irrelevant to input
    const { verdicts } = await this.provider.generateJSON(
      ContextualRelevancyTemplate.classifyRelevancy(statements, testCase.input),
      verdictsSchema,
    );

    // Step 3: Score
    const relevantCount = verdicts.filter((v) => v.verdict === "yes").length;
    let score = relevantCount / verdicts.length;
    score = this.applyStrictMode(score);

    // Generate reason
    let reason: string | undefined;
    if (this.includeReason) {
      const result = await this.provider.generateJSON(
        ContextualRelevancyTemplate.generateReason(score, verdicts),
        reasonSchema,
      );
      reason = result.reason;
    }

    return this.buildResult(score, reason, start, { statements, verdicts });
  }
}
