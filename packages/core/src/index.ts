// Core types
export type {
  ToolCall,
  LLMTestCase,
  ConversationalTestCase,
} from "./test-case.js";

// Dataset
export type { Golden, EvaluationDataset } from "./dataset.js";

// Metric base
export { BaseMetric } from "./metric.js";
export type { MetricResult, MetricConfig } from "./metric.js";

// Metrics
export {
  AnswerRelevancyMetric,
  FaithfulnessMetric,
  HallucinationMetric,
  ContextualPrecisionMetric,
  ContextualRecallMetric,
  ContextualRelevancyMetric,
  BiasMetric,
  ToxicityMetric,
  GEval,
  SummarizationMetric,
  ExactMatchMetric,
  JsonCorrectnessMetric,
  ToolCorrectnessMetric,
  TaskCompletionMetric,
  GoalAccuracyMetric,
  ConversationCompletenessMetric,
  KnowledgeRetentionMetric,
  RoleAdherenceMetric,
} from "./metrics/index.js";
export type {
  GEvalConfig,
  ExactMatchConfig,
  JsonCorrectnessConfig,
  ToolCorrectnessConfig,
} from "./metrics/index.js";

// Providers
export {
  BaseLLMProvider,
  OpenAIProvider,
  AnthropicProvider,
  OllamaProvider,
  GeminiProvider,
  AzureOpenAIProvider,
  resolveProvider,
} from "./providers/index.js";
export type { ProviderConfig, AzureOpenAIConfig } from "./providers/index.js";

// Config
export { resolveConfig, resetConfigCache } from "./config.js";
export type { AssayConfig } from "./config.js";

// Evaluate
export { evaluate } from "./evaluate.js";
export type { EvaluateConfig, EvaluateResult } from "./evaluate.js";

// Assert
export { assertEval } from "./assert.js";
export type { AssertEvalOptions, AssertEvalResult } from "./assert.js";

// Reporter
export { ConsoleReporter } from "./reporter.js";
export type { EvaluationSummary, TestCaseResult } from "./reporter.js";

// Utilities
export { parseJson, tryParseJson } from "./utils/json-parser.js";
export type { ParseJsonOptions } from "./utils/json-parser.js";
export { createLimiter } from "./utils/concurrency.js";
export type { Limiter } from "./utils/concurrency.js";
export { ratio, weightedAverage, meanAveragePrecision } from "./utils/scoring.js";
