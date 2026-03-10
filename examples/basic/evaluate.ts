import {
  evaluate,
  AnswerRelevancyMetric,
  FaithfulnessMetric,
  HallucinationMetric,
} from "@assay-ai/core";

const results = await evaluate(
  [
    {
      input: "What is the refund policy?",
      actualOutput: "You can request a full refund within 30 days of purchase.",
      retrievalContext: [
        "Refund Policy: Customers may request a full refund within 30 days of purchase date.",
        "Contact support@company.com for refund requests.",
      ],
      context: [
        "Our refund policy allows returns within 30 days for a full refund.",
      ],
    },
    {
      input: "How do I reset my password?",
      actualOutput:
        "Navigate to Settings > Security > Reset Password and follow the on-screen instructions.",
      retrievalContext: [
        "To reset your password, go to Settings, then Security, and click Reset Password.",
      ],
      context: [
        "Users can reset their password from the Security section in Settings.",
      ],
    },
  ],
  [
    new AnswerRelevancyMetric({ threshold: 0.7 }),
    new FaithfulnessMetric({ threshold: 0.7 }),
    new HallucinationMetric({ threshold: 0.3 }),
  ],
  { maxConcurrency: 5 },
);

console.log(`\nPass rate: ${results.summary.passRate.toFixed(1)}%`);
