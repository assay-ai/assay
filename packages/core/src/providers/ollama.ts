import { BaseLLMProvider } from "./base.js";
import type { ProviderConfig } from "./base.js";

const DEFAULT_MODEL = "llama3";
const DEFAULT_BASE_URL = "http://localhost:11434";

interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
}

export class OllamaProvider extends BaseLLMProvider {
  private readonly baseUrl: string;

  constructor(config: ProviderConfig = {}) {
    super(config, DEFAULT_MODEL);
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  }

  get providerName(): string {
    return "ollama";
  }

  async generate(prompt: string): Promise<string> {
    const url = `${this.baseUrl}/api/chat`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        options: {
          temperature: this.temperature,
          num_predict: this.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = data.message?.content;

    if (!content) {
      throw new Error("Ollama returned an empty response");
    }

    return content;
  }
}
