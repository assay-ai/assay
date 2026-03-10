# Configuration

## Provider setup

Assay auto-detects your LLM provider based on environment variables. Set one of the following:

```bash
# OpenAI (default)
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# Google Gemini
export GOOGLE_GENERATIVE_AI_API_KEY="..."

# Azure OpenAI
export AZURE_OPENAI_API_KEY="..."
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"

# Ollama (no key needed, just a running instance)
export OLLAMA_BASE_URL="http://localhost:11434"
```

## assay.config.ts

Create an `assay.config.ts` file in your project root for shared defaults:

```typescript
import type { AssayConfig } from "@assay-ai/core";

const config: AssayConfig = {
  provider: {
    name: "openai",
    model: "gpt-4o-mini",
  },
  defaultThreshold: 0.7,
  concurrency: 5,
  verbose: false,
};

export default config;
```

Assay resolves configuration in this order (later wins):

1. Built-in defaults
2. `assay.config.ts` in project root
3. Options passed directly to `evaluate()` or metric constructors

## Metric options

Every metric constructor accepts a configuration object:

```typescript
import { FaithfulnessMetric } from "@assay-ai/core";

const metric = new FaithfulnessMetric({
  threshold: 0.8, // Score >= 0.8 to pass (default: 0.5)
  model: "gpt-4o", // Override the provider model
  verbose: true, // Log LLM reasoning to console
});
```

## Evaluation options

The `evaluate()` function accepts global options:

```typescript
import { evaluate, FaithfulnessMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    /* ... */
  ],
  metrics: [new FaithfulnessMetric()],
  options: {
    concurrency: 5, // Run 5 test cases in parallel (default: 10)
    verbose: true, // Detailed logging
  },
});
```

## Environment variables reference

| Variable | Provider | Required |
|----------|----------|----------|
| `OPENAI_API_KEY` | OpenAI | Yes (if using OpenAI) |
| `ANTHROPIC_API_KEY` | Anthropic | Yes (if using Anthropic) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini | Yes (if using Gemini) |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI | Yes (if using Azure) |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI | Yes (if using Azure) |
| `OLLAMA_BASE_URL` | Ollama | No (defaults to `http://localhost:11434`) |
