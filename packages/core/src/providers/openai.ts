import { BaseLLMProvider } from "./base.js";
import type { ProviderConfig } from "./base.js";

const DEFAULT_MODEL = "gpt-4o";

export class OpenAIProvider extends BaseLLMProvider {
  private client: unknown;

  constructor(config: ProviderConfig = {}) {
    super(config, DEFAULT_MODEL);
  }

  get providerName(): string {
    return "openai";
  }

  async generate(prompt: string): Promise<string> {
    if (!this.client) {
      const { default: OpenAI } = await import("openai");
      this.client = new OpenAI({
        apiKey: this.config.apiKey ?? process.env.OPENAI_API_KEY,
        ...(this.config.baseUrl ? { baseURL: this.config.baseUrl } : {}),
      });
    }

    // Use the dynamically imported client with type assertion
    const openai = this.client as {
      chat: {
        completions: {
          create(params: {
            model: string;
            messages: Array<{ role: string; content: string }>;
            temperature: number;
            max_tokens: number;
          }): Promise<{
            choices: Array<{ message: { content: string | null } }>;
          }>;
        };
      };
    };

    const response = await openai.chat.completions.create({
      model: this.modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }
    return content;
  }
}
