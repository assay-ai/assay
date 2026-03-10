# API Reference

## evaluate()

The main entry point for running evaluations. Accepts test cases and metrics, returns scored results.

```typescript
import { evaluate } from "@assay-ai/core";
import type { EvaluateConfig, EvaluateResult } from "@assay-ai/core";

const config: EvaluateConfig = {
  testCases: [
    {
      input: "What is TypeScript?",
      actualOutput: "A typed superset of JavaScript.",
      context: ["TypeScript is a typed superset of JavaScript."],
    },
  ],
  metrics: [new FaithfulnessMetric()],
  options: {
    concurrency: 5,
    verbose: true,
  },
};

const results: EvaluateResult = await evaluate(config);
```

### EvaluateConfig

| Field | Type | Description |
|-------|------|-------------|
| `testCases` | `LLMTestCase[]` | Array of test cases to evaluate |
| `metrics` | `BaseMetric[]` | Array of metric instances |
| `options.concurrency` | `number` | Max parallel evaluations (default: 10) |
| `options.verbose` | `boolean` | Enable detailed logging |
| `options.provider` | `BaseLLMProvider` | Override the default provider |

## assertEval()

A convenience wrapper that runs evaluation and returns a pass/fail result. Useful in test assertions.

```typescript
import { assertEval } from "@assay-ai/core";
import type { AssertEvalOptions, AssertEvalResult } from "@assay-ai/core";

const result: AssertEvalResult = await assertEval({
  testCase: {
    input: "What is TypeScript?",
    actualOutput: "A typed superset of JavaScript.",
    context: ["TypeScript is a typed superset of JavaScript."],
  },
  metrics: [new FaithfulnessMetric()],
});

console.log(result.passed); // true if all metrics passed
console.log(result.results); // individual MetricResult[]
```

## LLMTestCase

The input to all single-turn metrics.

```typescript
import type { LLMTestCase, ToolCall } from "@assay-ai/core";

const testCase: LLMTestCase = {
  input: "User question or prompt",
  actualOutput: "LLM response",
  expectedOutput: "Ground truth answer", // optional
  context: ["Retrieved documents..."], // optional
  toolsCalled: [{ name: "search", parameters: { q: "test" } }], // optional
  expectedTools: [{ name: "search", parameters: { q: "test" } }], // optional
};
```

| Field | Type | Description |
|-------|------|-------------|
| `input` | `string` | The user input or prompt |
| `actualOutput` | `string` | The LLM's actual response |
| `expectedOutput` | `string?` | Ground truth expected response |
| `context` | `string[]?` | Retrieved context documents |
| `toolsCalled` | `ToolCall[]?` | Tools the LLM actually called |
| `expectedTools` | `ToolCall[]?` | Tools the LLM should have called |

## ConversationalTestCase

The input to conversational metrics. Wraps an array of `LLMTestCase` turns.

```typescript
import type { ConversationalTestCase } from "@assay-ai/core";

const testCase: ConversationalTestCase = {
  turns: [
    { input: "Hi, I need help", actualOutput: "How can I help you?" },
    { input: "What's your return policy?", actualOutput: "30 days." },
  ],
};
```

## BaseMetric

The abstract base class for all metrics. Extend this to create custom metrics.

```typescript
import { BaseMetric } from "@assay-ai/core";
import type { MetricResult, MetricConfig } from "@assay-ai/core";

class MyMetric extends BaseMetric {
  readonly name = "MyMetric";

  async measure(testCase: LLMTestCase): Promise<MetricResult> {
    return {
      metric: this.name,
      score: 1.0,
      passed: true,
      reason: "Evaluation complete",
    };
  }
}
```

## MetricResult

The output of every metric evaluation.

```typescript
import type { MetricResult } from "@assay-ai/core";

const result: MetricResult = {
  metric: "Faithfulness", // Metric name
  score: 0.85, // Score between 0 and 1
  passed: true, // Whether score >= threshold
  reason: "All claims supported by context", // Explanation
};
```

## MetricConfig

Configuration options accepted by all metric constructors.

```typescript
import type { MetricConfig } from "@assay-ai/core";

const config: MetricConfig = {
  threshold: 0.7, // Minimum score to pass (default: 0.5)
  model: "gpt-4o", // Override provider model
  verbose: true, // Log LLM reasoning
};
```

## Provider classes

All provider classes extend `BaseLLMProvider`:

```typescript
import {
  BaseLLMProvider,
  OpenAIProvider,
  AnthropicProvider,
  GeminiProvider,
  AzureOpenAIProvider,
  OllamaProvider,
  resolveProvider,
} from "@assay-ai/core";
import type { ProviderConfig, AzureOpenAIConfig } from "@assay-ai/core";
```

### resolveProvider()

Auto-detects and returns a provider based on environment variables:

```typescript
import { resolveProvider } from "@assay-ai/core";

const provider = resolveProvider();
// Returns OpenAIProvider, AnthropicProvider, etc. based on env vars
```

## AssayConfig

Configuration file type for `assay.config.ts`:

```typescript
import type { AssayConfig } from "@assay-ai/core";

const config: AssayConfig = {
  provider: {
    name: "openai",
    model: "gpt-4o-mini",
  },
  defaultThreshold: 0.5,
  concurrency: 10,
  verbose: false,
};
```

## ConsoleReporter

Formats and prints evaluation results to the console:

```typescript
import { ConsoleReporter } from "@assay-ai/core";
import type { EvaluationSummary, TestCaseResult } from "@assay-ai/core";

const reporter = new ConsoleReporter();
reporter.report(results);
```

## Utilities

```typescript
import { parseJson, tryParseJson, createLimiter, ratio } from "@assay-ai/core";

// Parse JSON with error handling
const data = parseJson<{ name: string }>(jsonString);

// Non-throwing JSON parse
const maybeData = tryParseJson(jsonString);

// Concurrency limiter
const limiter = createLimiter(5);
await limiter(() => fetch("..."));

// Scoring utilities
import { ratio, weightedAverage, meanAveragePrecision } from "@assay-ai/core";
```
