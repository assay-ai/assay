# Why Assay?

## The problem

You write tests for your code. Why not for your AI?

LLM outputs are non-deterministic. A prompt change that improves one response can silently break ten others. Without evaluation, you are shipping blind.

Manual spot-checking does not scale. Vibes-based QA catches obvious failures but misses subtle regressions in faithfulness, relevancy, and safety.

## TypeScript-first

Most LLM evaluation frameworks are Python-only. If your application is built in TypeScript, that means context-switching between languages, maintaining separate test infrastructure, and losing type safety at the boundary.

Assay is built from the ground up in TypeScript:

- Full type inference from test case to metric result
- Zod-validated configuration files
- Zero `any` across the entire codebase
- Works with your existing `tsconfig.json` and tooling

## Fits your workflow

Assay does not ask you to learn a new test runner. It integrates with Vitest and Jest so you can write evaluations alongside your existing tests using the same `describe` / `it` / `expect` patterns your team already knows.

```typescript
describeEval("RAG Pipeline", () => {
  itEval(
    "answers grounded in context",
    {
      input: "What is the refund window?",
      actualOutput: await myRAG("What is the refund window?"),
      context: retrievedDocs,
    },
    [new FaithfulnessMetric(), new HallucinationMetric()],
  );
});
```

## 18 metrics, zero config

Assay ships with 18 research-backed metrics across six categories:

| Category | Metrics |
|----------|---------|
| **RAG** | Faithfulness, Answer Relevancy, Hallucination, Contextual Precision, Contextual Recall, Contextual Relevancy |
| **Agentic** | Tool Correctness, Task Completion, Goal Accuracy |
| **Conversational** | Knowledge Retention, Conversation Completeness, Role Adherence |
| **Safety** | Bias, Toxicity |
| **Custom** | GEval, Summarization |
| **Non-LLM** | Exact Match, JSON Correctness |

Every metric returns a score between 0 and 1 and a boolean `passed` based on a configurable threshold.

## Provider agnostic

Assay works with OpenAI, Anthropic, Google Gemini, Azure OpenAI, and Ollama out of the box. Set an environment variable and go. You can also bring your own provider by extending `BaseLLMProvider`.
