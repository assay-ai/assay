export { BaseLLMProvider } from "./base.js";
export type { ProviderConfig } from "./base.js";
export { OpenAIProvider } from "./openai.js";
export { AnthropicProvider } from "./anthropic.js";
export { OllamaProvider } from "./ollama.js";
export { GeminiProvider } from "./gemini.js";
export { AzureOpenAIProvider } from "./azure-openai.js";
export type { AzureOpenAIConfig } from "./azure-openai.js";

import { AnthropicProvider } from "./anthropic.js";
import { AzureOpenAIProvider } from "./azure-openai.js";
import { BaseLLMProvider } from "./base.js";
import { GeminiProvider } from "./gemini.js";
import { OllamaProvider } from "./ollama.js";
import { OpenAIProvider } from "./openai.js";

/**
 * A no-op provider used by non-LLM metrics (ExactMatch, JsonCorrectness).
 * Throws if actually called.
 */
class NoopProvider extends BaseLLMProvider {
  constructor() {
    super({}, "noop");
  }

  get providerName(): string {
    return "noop";
  }

  async generate(): Promise<string> {
    throw new Error("This metric does not require an LLM provider.");
  }
}

/**
 * Resolve a provider from a string name, provider instance, or auto-detect from env vars.
 * Returns a noop provider if undefined (for non-LLM metrics).
 */
export function resolveProvider(provider?: BaseLLMProvider | string): BaseLLMProvider {
  if (!provider) {
    // Auto-detect from env vars
    if (typeof process !== "undefined" && process.env) {
      if (process.env.OPENAI_API_KEY) return new OpenAIProvider();
      if (process.env.ANTHROPIC_API_KEY) return new AnthropicProvider();
      if (process.env.GOOGLE_API_KEY) return new GeminiProvider();
      if (process.env.AZURE_OPENAI_API_KEY) return new AzureOpenAIProvider();
    }
    // Return noop for metrics that don't need a provider
    return new NoopProvider();
  }

  if (typeof provider === "object" && provider instanceof BaseLLMProvider) return provider;

  if (typeof provider === "string") {
    if (provider.startsWith("gpt-") || provider.startsWith("o1") || provider.startsWith("o3")) {
      return new OpenAIProvider({ model: provider });
    }
    if (provider.startsWith("claude-")) {
      return new AnthropicProvider({ model: provider });
    }
    if (provider.startsWith("gemini-")) {
      return new GeminiProvider({ model: provider });
    }
    return new OllamaProvider({ model: provider });
  }

  return new NoopProvider();
}
