# Providers

Assay uses LLM providers to power evaluation metrics. It supports multiple providers out of the box and can auto-detect which one to use based on your environment variables.

## Supported providers

| Provider | Class | Environment Variable |
|----------|-------|---------------------|
| OpenAI | `OpenAIProvider` | `OPENAI_API_KEY` |
| Anthropic | `AnthropicProvider` | `ANTHROPIC_API_KEY` |
| Google Gemini | `GeminiProvider` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Azure OpenAI | `AzureOpenAIProvider` | `AZURE_OPENAI_API_KEY` + `AZURE_OPENAI_ENDPOINT` |
| Ollama | `OllamaProvider` | `OLLAMA_BASE_URL` (optional) |

## Auto-detection

When you do not explicitly configure a provider, Assay calls `resolveProvider()` which checks environment variables in this order:

1. `OPENAI_API_KEY` -- uses OpenAI
2. `ANTHROPIC_API_KEY` -- uses Anthropic
3. `GOOGLE_GENERATIVE_AI_API_KEY` -- uses Gemini
4. `AZURE_OPENAI_API_KEY` -- uses Azure OpenAI
5. `OLLAMA_BASE_URL` -- uses Ollama

The first match wins.

## OpenAI

```bash
export OPENAI_API_KEY="sk-..."
```

```typescript
import { OpenAIProvider } from "@assay-ai/core";

const provider = new OpenAIProvider({
  model: "gpt-4o-mini",
});
```

## Anthropic

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

```typescript
import { AnthropicProvider } from "@assay-ai/core";

const provider = new AnthropicProvider({
  model: "claude-sonnet-4-20250514",
});
```

## Google Gemini

```bash
export GOOGLE_GENERATIVE_AI_API_KEY="..."
```

```typescript
import { GeminiProvider } from "@assay-ai/core";

const provider = new GeminiProvider({
  model: "gemini-2.0-flash",
});
```

## Azure OpenAI

```bash
export AZURE_OPENAI_API_KEY="..."
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
```

```typescript
import { AzureOpenAIProvider } from "@assay-ai/core";
import type { AzureOpenAIConfig } from "@assay-ai/core";

const provider = new AzureOpenAIProvider({
  model: "gpt-4o",
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
});
```

## Ollama

Run evaluations locally without an API key:

```bash
# Start Ollama (default: http://localhost:11434)
ollama serve
ollama pull llama3.1
```

```typescript
import { OllamaProvider } from "@assay-ai/core";

const provider = new OllamaProvider({
  model: "llama3.1",
  baseUrl: "http://localhost:11434", // optional, this is the default
});
```

## Custom providers

Extend `BaseLLMProvider` to integrate any LLM:

```typescript
import { BaseLLMProvider } from "@assay-ai/core";
import type { ProviderConfig } from "@assay-ai/core";

class MyProvider extends BaseLLMProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  async generate(prompt: string): Promise<string> {
    // Call your LLM API here
    const response = await fetch("https://my-llm-api.com/generate", {
      method: "POST",
      body: JSON.stringify({ prompt, model: this.model }),
    });
    const data = await response.json();
    return data.text;
  }
}
```

Use your custom provider in evaluation:

```typescript
import { evaluate, FaithfulnessMetric } from "@assay-ai/core";

const provider = new MyProvider({ model: "my-model" });

await evaluate({
  testCases: [/* ... */],
  metrics: [new FaithfulnessMetric()],
  options: { provider },
});
```
