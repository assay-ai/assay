import { BaseLLMProvider } from "./base.js";
import type { ProviderConfig } from "./base.js";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export class AnthropicProvider extends BaseLLMProvider {
  private client: unknown;

  constructor(config: ProviderConfig = {}) {
    super(config, DEFAULT_MODEL);
  }

  get providerName(): string {
    return "anthropic";
  }

  async generate(prompt: string): Promise<string> {
    if (!this.client) {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      this.client = new Anthropic({
        apiKey: this.config.apiKey ?? process.env.ANTHROPIC_API_KEY,
        ...(this.config.baseUrl ? { baseURL: this.config.baseUrl } : {}),
      });
    }

    const anthropic = this.client as {
      messages: {
        create(params: {
          model: string;
          max_tokens: number;
          messages: Array<{ role: string; content: string }>;
          temperature: number;
        }): Promise<{
          content: Array<{ type: string; text?: string }>;
        }>;
      };
    };

    const response = await anthropic.messages.create({
      model: this.modelName,
      max_tokens: this.maxTokens,
      messages: [{ role: "user", content: prompt }],
      temperature: this.temperature,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock?.text) {
      throw new Error("Anthropic returned an empty response");
    }
    return textBlock.text;
  }
}
