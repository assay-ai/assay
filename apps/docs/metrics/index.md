# Metrics Overview

Assay ships with 18 evaluation metrics across six categories. Every metric returns a score between 0 and 1 and a boolean `passed` based on a configurable threshold (default: 0.5).

## All metrics

| Metric | Category | Required Fields | LLM Required |
|--------|----------|-----------------|:------------:|
| [AnswerRelevancyMetric](/metrics/rag#answer-relevancy) | RAG | `input`, `actualOutput` | Yes |
| [FaithfulnessMetric](/metrics/rag#faithfulness) | RAG | `input`, `actualOutput`, `context` | Yes |
| [HallucinationMetric](/metrics/rag#hallucination) | RAG | `input`, `actualOutput`, `context` | Yes |
| [ContextualPrecisionMetric](/metrics/rag#contextual-precision) | RAG | `input`, `actualOutput`, `expectedOutput`, `context` | Yes |
| [ContextualRecallMetric](/metrics/rag#contextual-recall) | RAG | `input`, `actualOutput`, `expectedOutput`, `context` | Yes |
| [ContextualRelevancyMetric](/metrics/rag#contextual-relevancy) | RAG | `input`, `actualOutput`, `context` | Yes |
| [ToolCorrectnessMetric](/metrics/agentic#tool-correctness) | Agentic | `input`, `toolsCalled`, `expectedTools` | No |
| [TaskCompletionMetric](/metrics/agentic#task-completion) | Agentic | `input`, `actualOutput` | Yes |
| [GoalAccuracyMetric](/metrics/agentic#goal-accuracy) | Agentic | `input`, `actualOutput` | Yes |
| [KnowledgeRetentionMetric](/metrics/conversational#knowledge-retention) | Conversational | `ConversationalTestCase` | Yes |
| [ConversationCompletenessMetric](/metrics/conversational#conversation-completeness) | Conversational | `ConversationalTestCase` | Yes |
| [RoleAdherenceMetric](/metrics/conversational#role-adherence) | Conversational | `ConversationalTestCase` | Yes |
| [BiasMetric](/metrics/safety#bias) | Safety | `input`, `actualOutput` | Yes |
| [ToxicityMetric](/metrics/safety#toxicity) | Safety | `input`, `actualOutput` | Yes |
| [GEval](/metrics/custom#geval) | Custom | `input`, `actualOutput` (+ custom) | Yes |
| [SummarizationMetric](/metrics/custom#summarization) | Custom | `input`, `actualOutput` | Yes |
| [ExactMatchMetric](/metrics/non-llm#exact-match) | Non-LLM | `actualOutput`, `expectedOutput` | No |
| [JsonCorrectnessMetric](/metrics/non-llm#json-correctness) | Non-LLM | `actualOutput`, `expectedOutput` | No |

## Usage pattern

All metrics follow the same pattern:

```typescript
import { evaluate, FaithfulnessMetric } from "@assay-ai/core";

const results = await evaluate({
  testCases: [
    {
      input: "What is TypeScript?",
      actualOutput: "TypeScript is a typed superset of JavaScript.",
      context: ["TypeScript is a typed superset of JavaScript by Microsoft."],
    },
  ],
  metrics: [new FaithfulnessMetric({ threshold: 0.7 })],
});
```

## Categories

- **[RAG Metrics](/metrics/rag)** -- Evaluate retrieval-augmented generation pipelines for faithfulness, relevancy, and hallucination.
- **[Agentic Metrics](/metrics/agentic)** -- Evaluate AI agent tool usage, task completion, and goal accuracy.
- **[Conversational Metrics](/metrics/conversational)** -- Evaluate multi-turn conversations for knowledge retention, completeness, and role adherence.
- **[Safety Metrics](/metrics/safety)** -- Detect bias and toxicity in LLM outputs.
- **[Custom Metrics](/metrics/custom)** -- Define your own evaluation criteria with GEval or extend BaseMetric.
- **[Non-LLM Metrics](/metrics/non-llm)** -- Deterministic metrics that do not require an LLM API key.
