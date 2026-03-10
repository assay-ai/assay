# RAG Metrics

Metrics for evaluating Retrieval-Augmented Generation pipelines. These metrics assess whether your LLM's output is faithful to the retrieved context, relevant to the user's question, and free of hallucinations.

## Answer Relevancy

Measures how relevant the LLM output is to the input question.

**Required fields:** `input`, `actualOutput`

**How it works:** The metric generates questions from the actual output using an LLM, then computes the semantic similarity between those generated questions and the original input. A higher similarity means the output is more relevant to what was asked.

```typescript
import { evaluate, AnswerRelevancyMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "What are the benefits of TypeScript?",
      actualOutput:
        "TypeScript adds static typing to JavaScript, catching errors at compile time and improving IDE support.",
    },
  ],
  metrics: [new AnswerRelevancyMetric({ threshold: 0.7 })],
});
```

## Faithfulness

Measures whether the output is grounded in the provided context. A faithful output only makes claims that are supported by the context.

**Required fields:** `input`, `actualOutput`, `context`

**How it works:** The metric extracts claims from the actual output, then checks each claim against the provided context. The score is the ratio of supported claims to total claims.

```typescript
import { evaluate, FaithfulnessMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "What is the return policy?",
      actualOutput: "You can return items within 30 days.",
      context: [
        "Our return policy allows returns within 30 days of purchase.",
      ],
    },
  ],
  metrics: [new FaithfulnessMetric()],
});
```

## Hallucination

Detects claims in the output that are not supported by the provided context.

**Required fields:** `input`, `actualOutput`, `context`

**How it works:** The metric identifies factual claims in the output and checks whether each claim contradicts or is unsupported by the context. The score represents the proportion of non-hallucinated content (higher is better).

```typescript
import { evaluate, HallucinationMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "What programming languages does the company use?",
      actualOutput: "The company uses TypeScript and Python.",
      context: ["The engineering team primarily uses TypeScript and Go."],
    },
  ],
  metrics: [new HallucinationMetric()],
});
```

## Contextual Precision

Measures whether the relevant context items are ranked higher than irrelevant ones in the retrieved context list.

**Required fields:** `input`, `actualOutput`, `expectedOutput`, `context`

**How it works:** The metric uses the expected output as ground truth to determine which context items are relevant. It then computes a precision score based on the ranking of relevant items, rewarding retrieval systems that surface the most relevant documents first.

```typescript
import { evaluate, ContextualPrecisionMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "What is the capital of France?",
      actualOutput: "Paris is the capital of France.",
      expectedOutput: "Paris",
      context: [
        "Paris is the capital and largest city of France.",
        "France is known for its cuisine.",
        "The Eiffel Tower is in Paris.",
      ],
    },
  ],
  metrics: [new ContextualPrecisionMetric()],
});
```

## Contextual Recall

Measures whether all relevant information needed to produce the expected output is present in the retrieved context.

**Required fields:** `input`, `actualOutput`, `expectedOutput`, `context`

**How it works:** The metric breaks the expected output into individual claims, then checks what proportion of those claims can be attributed to the retrieved context. A high score means the retrieval step captured all the information needed.

```typescript
import { evaluate, ContextualRecallMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "Describe the return policy",
      actualOutput: "Returns within 30 days, items must be unopened.",
      expectedOutput:
        "Customers can return items within 30 days. Items must be in original packaging.",
      context: [
        "Return policy: 30-day window. Items must be unopened and in original packaging.",
      ],
    },
  ],
  metrics: [new ContextualRecallMetric()],
});
```

## Contextual Relevancy

Measures whether the retrieved context is relevant to the input question.

**Required fields:** `input`, `actualOutput`, `context`

**How it works:** The metric evaluates each sentence in the retrieved context for relevance to the input question. The score is the ratio of relevant sentences to total sentences in the context.

```typescript
import { evaluate, ContextualRelevancyMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      input: "How do I reset my password?",
      actualOutput: "Go to Settings > Security > Reset Password.",
      context: [
        "To reset your password, navigate to Settings, then Security, and click Reset Password.",
        "Our company was founded in 2020.",
      ],
    },
  ],
  metrics: [new ContextualRelevancyMetric()],
});
```
