import type { ZodType } from "zod";
import { parseJson } from "../utils/json-parser.js";

export interface ProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export abstract class BaseLLMProvider {
  readonly modelName: string;
  protected readonly temperature: number;
  protected readonly maxTokens: number;

  constructor(
    protected readonly config: ProviderConfig,
    defaultModel: string,
  ) {
    this.modelName = config.model ?? defaultModel;
    this.temperature = config.temperature ?? 0;
    this.maxTokens = config.maxTokens ?? 4096;
  }

  /**
   * Generate a raw text completion from the LLM.
   */
  abstract generate(prompt: string): Promise<string>;

  /**
   * Generate a typed JSON response from the LLM, validated against a Zod schema.
   * Instructs the model to return JSON conforming to the schema, then parses
   * and validates the response.
   *
   * @param prompt - The user prompt
   * @param schema - A Zod schema to validate the response
   * @param retries - Number of retries on parse/validation failure (default 2)
   */
  async generateJSON<T>(prompt: string, schema: ZodType<T>, retries = 2): Promise<T> {
    const jsonInstruction = [
      "You MUST respond with valid JSON only. No markdown, no explanation, no extra text.",
      "Your response must be a single JSON object or array that can be directly parsed.",
      "",
      prompt,
    ].join("\n");

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const raw = await this.generate(jsonInstruction);
        const parsed = parseJson<unknown>(raw);
        return schema.parse(parsed);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw new Error(
      `Failed to generate valid JSON after ${retries + 1} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Returns the provider name for logging/identification.
   */
  abstract get providerName(): string;
}
