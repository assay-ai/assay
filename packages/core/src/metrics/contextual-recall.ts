import type { LLMTestCase } from "../test-case.js";
import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { ContextualRecallTemplate } from "../templates/contextual-recall.js";
import { z } from "zod";

const sentencesSchema = z.object({
  sentences: z.array(z.string()),
});

const verdictsSchema = z.object({
  verdicts: z.array(
    z.object({
      sentence: z.string(),
      verdict: z.enum(["yes", "no"]),
      reason: z.string().optional(),
    }),
  ),
});

const reasonSchema = z.object({
  reason: z.string(),
});

export class ContextualRecallMetric extends BaseMetric {
  readonly name = "Contextual Recall";
  readonly requiredFields: (keyof LLMTestCase)[] = [
    "input",
    "actualOutput",
    "expectedOutput",
    "retrievalContext",
  ];

  constructor(config?: MetricConfig) {
    super(config);
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    // Step 1: Extract sentences from expectedOutput
    const { sentences } = await this.provider.generateJSON(
      ContextualRecallTemplate.extractSentences(testCase.expectedOutput!),
      sentencesSchema,
    );

    if (sentences.length === 0) {
      return this.buildResult(1, "No sentences in expected output — trivially recalled.", start);
    }

    // Step 2: Check each sentence for attribution
    const { verdicts } = await this.provider.generateJSON(
      ContextualRecallTemplate.classifyAttribution(sentences, testCase.retrievalContext!),
      verdictsSchema,
    );

    // Step 3: Score
    const attributableCount = verdicts.filter((v) => v.verdict === "yes").length;
    let score = attributableCount / sentences.length;
    score = this.applyStrictMode(score);

    // Generate reason
    let reason: string | undefined;
    if (this.includeReason) {
      const result = await this.provider.generateJSON(
        ContextualRecallTemplate.generateReason(score, verdicts),
        reasonSchema,
      );
      reason = result.reason;
    }

    return this.buildResult(score, reason, start, { sentences, verdicts });
  }
}
