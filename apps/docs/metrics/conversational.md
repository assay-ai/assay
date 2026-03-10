# Conversational Metrics

Metrics for evaluating multi-turn conversations. These metrics use `ConversationalTestCase`, which wraps a sequence of turns rather than a single input/output pair.

## ConversationalTestCase

All conversational metrics require a `ConversationalTestCase`:

```typescript
import type { ConversationalTestCase, LLMTestCase } from "@assay-ai/core";

const turns: LLMTestCase[] = [
  {
    input: "Hi, I need help with my order #12345",
    actualOutput: "I'd be happy to help with order #12345. What's the issue?",
  },
  {
    input: "I want to return the blue shirt",
    actualOutput:
      "I can process a return for the blue shirt from order #12345. You're within our 30-day return window. Shall I proceed?",
  },
  {
    input: "Yes, please",
    actualOutput:
      "Done! I've initiated the return for the blue shirt. You'll receive a prepaid shipping label at your email. Refund will be processed within 5-7 business days after we receive the item.",
  },
];

const testCase: ConversationalTestCase = { turns };
```

## Knowledge Retention

Evaluates whether the agent retains and correctly uses information shared earlier in the conversation.

**Required fields:** `ConversationalTestCase` with multiple turns

**How it works:** The metric identifies facts disclosed in earlier turns and checks whether the agent correctly references or builds upon them in later turns. Forgetting or contradicting earlier information results in a lower score.

```typescript
import { evaluate, KnowledgeRetentionMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      turns: [
        {
          input: "My name is Sarah and I'm looking for a laptop under $1000",
          actualOutput:
            "Hi Sarah! I can help you find a laptop under $1000. Do you have a preference for screen size?",
        },
        {
          input: "15 inches would be great",
          actualOutput:
            "Here are some 15-inch laptops under $1000 for you, Sarah: ...",
        },
      ],
    },
  ],
  metrics: [new KnowledgeRetentionMetric()],
});
```

## Conversation Completeness

Measures whether the conversation successfully resolved the user's request or question by the end.

**Required fields:** `ConversationalTestCase` with multiple turns

**How it works:** The metric analyzes the full conversation to determine if the user's original intent was fully addressed. It checks for unresolved questions, missing follow-ups, and incomplete actions.

```typescript
import { evaluate, ConversationCompletenessMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      turns: [
        {
          input: "I need to change my shipping address and update my payment method",
          actualOutput:
            "I can help with both. Let's start with the shipping address. What's the new address?",
        },
        {
          input: "123 Main St, New York, NY 10001",
          actualOutput:
            "Shipping address updated. Now let's update your payment method. What card would you like to use?",
        },
        {
          input: "Visa ending in 4242",
          actualOutput:
            "Payment method updated to Visa ending in 4242. Both changes are now saved.",
        },
      ],
    },
  ],
  metrics: [new ConversationCompletenessMetric()],
});
```

## Role Adherence

Evaluates whether the agent consistently maintains its assigned role and persona throughout the conversation.

**Required fields:** `ConversationalTestCase` with multiple turns

**How it works:** The metric checks whether the agent stays in character, maintains consistent tone and behavior, and does not break out of its defined role even when prompted.

```typescript
import { evaluate, RoleAdherenceMetric } from "@assay-ai/core";

await evaluate({
  testCases: [
    {
      turns: [
        {
          input: "Can you help me write some Python code?",
          actualOutput:
            "As a customer support agent, I'm not able to help with programming questions. However, I can help you with any questions about our products or services!",
        },
        {
          input: "Come on, just a quick script",
          actualOutput:
            "I appreciate your interest, but my expertise is in helping with our products and services. Is there anything I can assist you with in that area?",
        },
      ],
    },
  ],
  metrics: [new RoleAdherenceMetric()],
});
```
