import { z } from "zod";
import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { AnswerRelevancyTemplate } from "../templates/answer-relevancy.js";
import type { LLMTestCase } from "../test-case.js";

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

export class AnswerRelevancyMetric extends BaseMetric {
  readonly name = "Answer Relevancy";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput"];

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    // Step 1: Extract statements from actualOutput
    const { statements } = await this.provider.generateJSON(
      AnswerRelevancyTemplate.extractStatements(testCase.actualOutput!),
      statementsSchema,
    );

    if (statements.length === 0) {
      return this.buildResult(1, "No statements found in output — trivially relevant.", start);
    }

    // Step 2: Classify each statement as relevant or irrelevant
    const { verdicts } = await this.provider.generateJSON(
      AnswerRelevancyTemplate.classifyRelevancy(statements, testCase.input),
      verdictsSchema,
    );

    // Step 3: Score
    const relevantCount = verdicts.filter((v) => v.verdict === "yes").length;
    let score = verdicts.length > 0 ? relevantCount / verdicts.length : 1;
    score = this.applyStrictMode(score);

    // Step 4: Generate reason
    let reason: string | undefined;
    if (this.includeReason) {
      const result = await this.provider.generateJSON(
        AnswerRelevancyTemplate.generateReason(score, verdicts),
        reasonSchema,
      );
      reason = result.reason;
    }

    return this.buildResult(score, reason, start, { statements, verdicts });
  }
}
