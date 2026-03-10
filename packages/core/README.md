# @assay-ai/core

The core evaluation engine for [Assay](https://github.com/assay-ai/assay) -- the TypeScript-native LLM evaluation framework.

[![npm version](https://img.shields.io/npm/v/@assay-ai/core?color=blue)](https://www.npmjs.com/package/@assay-ai/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @assay-ai/core
# or
pnpm add @assay-ai/core
```

## Quick Start

```typescript
import {
  AnswerRelevancyMetric,
  evaluate,
  FaithfulnessMetric,
  HallucinationMetric,
} from "@assay-ai/core";

const results = await evaluate(
  [
    {
      input: "What is the capital of France?",
      actualOutput: "The capital of France is Paris.",
      context: ["France is a country in Europe. Its capital is Paris."],
    },
  ],
  [
    new FaithfulnessMetric({ threshold: 0.7 }),
    new AnswerRelevancyMetric({ threshold: 0.7 }),
    new HallucinationMetric({ threshold: 0.3 }),
  ],
);

console.log(`Pass rate: ${results.summary.passRate.toFixed(1)}%`);
```

## Metrics

Assay ships with 12 evaluation metrics out of the box:

| Metric | Description | Required Fields |
|--------|-------------|-----------------|
| `AnswerRelevancyMetric` | Measures how relevant the output is to the input | `input`, `actualOutput` |
| `FaithfulnessMetric` | Measures whether the output is grounded in context | `input`, `actualOutput`, `retrievalContext` |
| `HallucinationMetric` | Detects claims not supported by context | `input`, `actualOutput`, `context` |
| `ContextualPrecisionMetric` | Measures whether relevant context items are ranked higher | `input`, `expectedOutput`, `retrievalContext` |
| `ContextualRecallMetric` | Measures whether all relevant information is retrieved | `input`, `expectedOutput`, `retrievalContext` |
| `ContextualRelevancyMetric` | Measures whether retrieved context is relevant | `input`, `actualOutput`, `retrievalContext` |
| `BiasMetric` | Detects demographic or ideological bias | `input`, `actualOutput` |
| `ToxicityMetric` | Detects toxic or harmful content | `input`, `actualOutput` |
| `GEval` | Custom LLM-as-judge with user-defined criteria | `input`, `actualOutput` |
| `SummarizationMetric` | Evaluates summary quality | `input`, `actualOutput` |
| `ExactMatchMetric` | Exact string comparison (no LLM needed) | `actualOutput`, `expectedOutput` |
| `JsonCorrectnessMetric` | Validates JSON structure (no LLM needed) | `actualOutput` |

## Configuration

### Provider

Assay auto-detects your LLM provider from environment variables:

```bash
# OpenAI (default)
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Metric Options

Every metric accepts optional configuration:

```typescript
new FaithfulnessMetric({
  threshold: 0.7,       // Minimum score to pass (default: 0.5)
  model: "gpt-4o-mini", // LLM model for evaluation
  verbose: true,        // Log detailed reasoning
});
```

### Custom Metrics with GEval

Define any evaluation criteria in plain English:

```typescript
import { GEval } from "@assay-ai/core";

const politeness = new GEval({
  name: "Politeness",
  criteria: "The response should be polite and professional.",
  evaluationSteps: [
    "Check if the response uses polite phrases",
    "Verify the tone is respectful",
  ],
});
```

## Exports

This package exports:

- **Metrics**: `AnswerRelevancyMetric`, `FaithfulnessMetric`, `HallucinationMetric`, `ContextualPrecisionMetric`, `ContextualRecallMetric`, `ContextualRelevancyMetric`, `BiasMetric`, `ToxicityMetric`, `GEval`, `SummarizationMetric`, `ExactMatchMetric`, `JsonCorrectnessMetric`
- **Evaluation**: `evaluate`, `assertEval`
- **Providers**: `BaseLLMProvider`, `OpenAIProvider`, `AnthropicProvider`, `OllamaProvider`, `resolveProvider`
- **Utilities**: `parseJson`, `tryParseJson`, `createLimiter`, `ConsoleReporter`
- **Types**: `LLMTestCase`, `MetricResult`, `MetricConfig`, `EvaluateConfig`, `EvaluateResult`, `EvaluationDataset`

## License

[MIT](https://github.com/assay-ai/assay/blob/main/LICENSE)
