import { BaseLLMProvider } from "./base.js";
import type { ProviderConfig } from "./base.js";

export interface AzureOpenAIConfig extends ProviderConfig {
  endpoint?: string;
  deploymentName?: string;
  apiVersion?: string;
}

const DEFAULT_API_VERSION = "2024-08-01-preview";

export class AzureOpenAIProvider extends BaseLLMProvider {
  private client: unknown;
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly deploymentName: string;
  private readonly apiVersion: string;

  constructor(private readonly azureConfig: AzureOpenAIConfig = {}) {
    super(
      azureConfig,
      azureConfig.deploymentName ?? process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o",
    );
    this.endpoint = azureConfig.endpoint ?? process.env.AZURE_OPENAI_ENDPOINT ?? "";
    this.apiKey = azureConfig.apiKey ?? process.env.AZURE_OPENAI_API_KEY ?? "";
    this.deploymentName =
      azureConfig.deploymentName ?? process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o";
    this.apiVersion = azureConfig.apiVersion ?? DEFAULT_API_VERSION;

    if (!this.endpoint) {
      throw new Error(
        "Azure OpenAI endpoint is required. Set AZURE_OPENAI_ENDPOINT env var or pass endpoint in config.",
      );
    }
    if (!this.apiKey) {
      throw new Error(
        "Azure OpenAI API key is required. Set AZURE_OPENAI_API_KEY env var or pass apiKey in config.",
      );
    }
  }

  get providerName(): string {
    return "azure-openai";
  }

  async generate(prompt: string): Promise<string> {
    if (!this.client) {
      const { default: OpenAI } = await import("openai");
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: `${this.endpoint}/openai/deployments/${this.deploymentName}`,
        defaultQuery: { "api-version": this.apiVersion },
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
      model: this.deploymentName,
      messages: [{ role: "user", content: prompt }],
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("Azure OpenAI returned an empty response");
    }
    return content;
  }
}
