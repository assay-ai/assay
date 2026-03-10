import type { z } from "zod";
import type { MetricResult } from "../metric.js";
import { BaseMetric } from "../metric.js";
import type { MetricConfig } from "../metric.js";
import type { LLMTestCase } from "../test-case.js";

export interface JsonCorrectnessConfig extends MetricConfig {
  /** Optional Zod schema to validate the JSON structure against */
  schema?: z.ZodSchema;
  /** If true, also compares against expectedOutput JSON (default: false) */
  compareWithExpected?: boolean;
}

export class JsonCorrectnessMetric extends BaseMetric {
  readonly name = "JSON Correctness";
  readonly requiredFields: (keyof LLMTestCase)[] = ["actualOutput"];
  readonly requiresProvider = false;

  private readonly schema?: z.ZodSchema;
  private readonly compareWithExpected: boolean;

  constructor(config?: JsonCorrectnessConfig) {
    super({ ...config, provider: undefined as never });
    this.schema = config?.schema;
    this.compareWithExpected = config?.compareWithExpected ?? false;
  }

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    this.validate(testCase);
    const start = performance.now();

    const output = testCase.actualOutput!;

    // Step 1: Check if it's valid JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(output);
    } catch {
      return this.buildResult(0, `Output is not valid JSON: ${output.slice(0, 100)}...`, start);
    }

    // Step 2: Validate against schema if provided
    if (this.schema) {
      const result = this.schema.safeParse(parsed);
      if (!result.success) {
        const errors = result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
        return this.buildResult(0, `JSON does not match schema: ${errors}`, start, {
          validationErrors: result.error.issues,
        });
      }
    }

    // Step 3: Compare with expectedOutput if requested
    if (this.compareWithExpected && testCase.expectedOutput) {
      try {
        const expected = JSON.parse(testCase.expectedOutput);
        const isEqual = JSON.stringify(parsed) === JSON.stringify(expected);
        if (!isEqual) {
          return this.buildResult(0, "JSON is valid but does not match expected output.", start);
        }
      } catch {
        return this.buildResult(0, "Expected output is not valid JSON for comparison.", start);
      }
    }

    return this.buildResult(1, "Output is valid JSON and passes all checks.", start);
  }
}
