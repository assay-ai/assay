# CLI

The `@assay-ai/cli` package provides a command-line interface for running evaluations without writing test files.

## Installation

```bash
# Global
pnpm add -g @assay-ai/cli

# Or as a dev dependency
pnpm add -D @assay-ai/cli
```

## Commands

### `assay run`

Run evaluations from a configuration file or dataset:

```bash
assay run

# Specify a config file
assay run --config ./assay.config.ts

# Run with verbose output
assay run --verbose
```

### `assay init`

Scaffold a new Assay configuration file in the current directory:

```bash
assay init
```

This creates an `assay.config.ts` with sensible defaults:

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

export default config;
```

### `assay list-metrics`

List all available metrics with their required fields:

```bash
assay list-metrics
```

Output:

```
Available Metrics:

  RAG
    AnswerRelevancy      input, actualOutput
    Faithfulness         input, actualOutput, context
    Hallucination        input, actualOutput, context
    ContextualPrecision  input, actualOutput, expectedOutput, context
    ContextualRecall     input, actualOutput, expectedOutput, context
    ContextualRelevancy  input, actualOutput, context

  Agentic
    ToolCorrectness      input, toolsCalled, expectedTools
    TaskCompletion       input, actualOutput
    GoalAccuracy         input, actualOutput

  Conversational
    KnowledgeRetention          ConversationalTestCase
    ConversationCompleteness    ConversationalTestCase
    RoleAdherence               ConversationalTestCase

  Safety
    Bias                 input, actualOutput
    Toxicity             input, actualOutput

  Custom
    GEval                input, actualOutput (+ custom)
    Summarization        input, actualOutput

  Non-LLM
    ExactMatch           actualOutput, expectedOutput
    JsonCorrectness      actualOutput, expectedOutput
```

## Environment variables

The CLI respects the same environment variables as the core library:

```bash
export OPENAI_API_KEY="sk-..."
assay run
```
