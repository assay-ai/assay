import {
  evaluate,
  FaithfulnessMetric,
  ContextualPrecisionMetric,
  ContextualRecallMetric,
  ContextualRelevancyMetric,
} from "@assay-ai/core";

// Simulate a RAG pipeline evaluation
const ragTestCases = [
  {
    name: "Refund policy query",
    input: "What is the refund policy for premium subscriptions?",
    actualOutput:
      "Premium subscriptions can be refunded within 14 days of purchase. After 14 days, a prorated refund is available for the remaining subscription period.",
    expectedOutput:
      "Premium subscriptions have a 14-day full refund window, with prorated refunds available after that period.",
    retrievalContext: [
      "Refund Policy: Premium subscriptions are eligible for a full refund within 14 days of purchase.",
      "After the 14-day window, customers may request a prorated refund based on the remaining subscription period.",
      "Free tier accounts are not eligible for refunds.",
      "Enterprise contracts have separate refund terms outlined in the service agreement.",
    ],
  },
  {
    name: "API rate limits query",
    input: "What are the API rate limits?",
    actualOutput:
      "The API allows 100 requests per minute for free tier and 1000 requests per minute for premium users.",
    expectedOutput:
      "Free tier: 100 req/min. Premium: 1000 req/min.",
    retrievalContext: [
      "API Rate Limits: Free tier accounts are limited to 100 requests per minute.",
      "Premium accounts have a rate limit of 1000 requests per minute.",
      "Rate limit headers are included in all API responses.",
    ],
  },
];

const results = await evaluate(
  ragTestCases,
  [
    new FaithfulnessMetric({ threshold: 0.7 }),
    new ContextualPrecisionMetric({ threshold: 0.6 }),
    new ContextualRecallMetric({ threshold: 0.7 }),
    new ContextualRelevancyMetric({ threshold: 0.6 }),
  ],
  { maxConcurrency: 3, verbose: true },
);

console.log(`\nRAG Pipeline Pass Rate: ${results.summary.passRate.toFixed(1)}%`);
console.log("Average Scores:");
for (const [metric, avg] of Object.entries(results.summary.averageScores)) {
  console.log(`  ${metric}: ${(avg * 100).toFixed(1)}%`);
}
