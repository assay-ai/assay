import { z } from "zod";
import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { ContextualPrecisionTemplate } from "../templates/contextual-precision.js";
import type { LLMTestCase } from "../test-case.js";

const relevanceSchema = z.object({
  verdict: z.enum(["yes", "no"]),
  reason: z.string(),
});

const reasonSchema = z.object({
  reason: z.string(),
});

export class ContextualPrecisionMetric extends BaseMetric {
  readonly name = "Contextual Precision";
  readonly requiredFields: (keyof LLMTestCase)[] = [
    "input",
    "actualOutput",
    "expectedOutput",
    "retrievalContext",
  ];

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();
    const nodes = testCase.retrievalContext!;

    if (nodes.length === 0) {
      return this.buildResult(0, "No retrieval context provided.", start);
    }

    // Classify each node as relevant/irrelevant
    const verdicts = await Promise.all(
      nodes.map(async (node) => {
        const result = await this.provider.generateJSON(
          ContextualPrecisionTemplate.classifyRelevance(
            node,
            testCase.input,
            testCase.expectedOutput!,
          ),
          relevanceSchema,
        );
        return { node, verdict: result.verdict, reason: result.reason };
      }),
    );

    // Compute Weighted Cumulative Precision (Mean Average Precision)
    const relevances = verdicts.map((v) => v.verdict === "yes");
    const totalRelevant = relevances.filter(Boolean).length;

    if (totalRelevant === 0) {
      return this.buildResult(0, "No relevant nodes found in retrieval context.", start, {
        verdicts,
      });
    }

    let score = 0;
    let relevantSoFar = 0;
    for (let k = 0; k < relevances.length; k++) {
      if (relevances[k]) {
        relevantSoFar++;
        const precisionAtK = relevantSoFar / (k + 1);
        score += precisionAtK;
      }
    }
    score = score / totalRelevant;
    score = this.applyStrictMode(score);

    // Generate reason
    let reason: string | undefined;
    if (this.includeReason) {
      const result = await this.provider.generateJSON(
        ContextualPrecisionTemplate.generateReason(score, verdicts),
        reasonSchema,
      );
      reason = result.reason;
    }

    return this.buildResult(score, reason, start, { verdicts, relevances });
  }
}
