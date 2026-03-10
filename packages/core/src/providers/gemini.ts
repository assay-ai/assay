import { BaseLLMProvider } from "./base.js";
import type { ProviderConfig } from "./base.js";

const DEFAULT_MODEL = "gemini-2.0-flash";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export class GeminiProvider extends BaseLLMProvider {
  private readonly apiKey: string;

  constructor(config: ProviderConfig = {}) {
    super(config, DEFAULT_MODEL);
    const key = config.apiKey ?? process.env.GOOGLE_API_KEY;
    if (!key) {
      throw new Error(
        "Google API key is required. Set GOOGLE_API_KEY env var or pass apiKey in config.",
      );
    }
    this.apiKey = key;
  }

  get providerName(): string {
    return "gemini";
  }

  async generate(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: this.temperature },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Gemini returned an empty response");
    }

    return content;
  }
}
