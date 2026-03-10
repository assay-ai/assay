import { z } from "zod";
import type { MetricConfig, MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import { FaithfulnessTemplate } from "../templates/faithfulness.js";
import type { LLMTestCase } from "../test-case.js";

const truthsSchema = z.object({
  truths: z.array(z.string()),
});

const claimsSchema = z.object({
  claims: z.array(z.string()),
});

const verdictsSchema = z.object({
  verdicts: z.array(
    z.object({
      claim: z.string(),
      verdict: z.enum(["yes", "no"]),
      reason: z.string(),
    }),
  ),
});

const reasonSchema = z.object({
  reason: z.string(),
});

export class FaithfulnessMetric extends BaseMetric {
  readonly name = "Faithfulness";
  readonly requiredFields: (keyof LLMTestCase)[] = ["input", "actualOutput", "retrievalContext"];

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    // Steps 1 & 2 run in parallel: extract truths and claims simultaneously
    const [truthsResult, claimsResult] = await Promise.all([
      this.provider.generateJSON(
        FaithfulnessTemplate.extractTruths(testCase.retrievalContext!),
        truthsSchema,
      ),
      this.provider.generateJSON(
        FaithfulnessTemplate.extractClaims(testCase.actualOutput!),
        claimsSchema,
      ),
    ]);

    const { truths } = truthsResult;
    const { claims } = claimsResult;

    if (claims.length === 0) {
      return this.buildResult(1, "No factual claims found in output — trivially faithful.", start);
    }

    // Step 3: Classify each claim against the truths
    const { verdicts } = await this.provider.generateJSON(
      FaithfulnessTemplate.classifyClaims(claims, truths),
      verdictsSchema,
    );

    // Step 4: Score
    const truthfulCount = verdicts.filter((v) => v.verdict === "yes").length;
    let score = verdicts.length > 0 ? truthfulCount / verdicts.length : 1;
    score = this.applyStrictMode(score);

    // Step 5: Generate reason
    let reason: string | undefined;
    if (this.includeReason) {
      const result = await this.provider.generateJSON(
        FaithfulnessTemplate.generateReason(score, verdicts),
        reasonSchema,
      );
      reason = result.reason;
    }

    return this.buildResult(score, reason, start, { truths, claims, verdicts });
  }
}
