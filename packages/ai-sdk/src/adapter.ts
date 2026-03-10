import type { LLMTestCase } from "@assay-ai/core";

/**
 * A duck-typed interface matching the result of `generateText()` from the
 * Vercel AI SDK. We use structural typing so users don't need to install
 * a specific version of the AI SDK.
 */
interface GenerateTextResultLike {
  text: string;
  usage?: {
    totalTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
  };
  finishReason?: string;
}

/**
 * A duck-typed interface matching the result of `streamText()` from the
 * Vercel AI SDK. The `text` and `usage` properties may be promises that
 * resolve once the stream completes.
 */
interface StreamTextResultLike {
  text: Promise<string> | string;
  usage?:
    | Promise<{ totalTokens?: number; promptTokens?: number; completionTokens?: number }>
    | { totalTokens?: number; promptTokens?: number; completionTokens?: number };
}

interface AdapterOptions {
  /** Expected output for comparison-based metrics. */
  expectedOutput?: string;
  /** Context passages for retrieval-based metrics (e.g., RAG). */
  context?: string[];
  /** Retrieved context for faithfulness/hallucination evaluation. */
  retrievalContext?: string[];
  /** Human-readable name for the test case. */
  name?: string;
  /** Tags for filtering/grouping test cases. */
  tags?: string[];
}

/**
 * Convert a `generateText()` result into an `LLMTestCase` for evaluation.
 *
 * @param result - The result from Vercel AI SDK's `generateText()`.
 * @param input - The original prompt/input that was sent to the model.
 * @param options - Additional fields for the test case.
 * @returns A fully populated `LLMTestCase`.
 *
 * @example
 * ```ts
 * import { generateText } from "ai";
 * import { fromGenerateText } from "@assay-ai/ai-sdk";
 *
 * const result = await generateText({ model, prompt: "What is 2+2?" });
 * const testCase = fromGenerateText(result, "What is 2+2?", {
 *   expectedOutput: "4",
 * });
 * ```
 */
export function fromGenerateText(
  result: GenerateTextResultLike,
  input: string,
  options?: AdapterOptions,
): LLMTestCase {
  const testCase: LLMTestCase = {
    input,
    actualOutput: result.text,
  };

  if (result.usage?.totalTokens != null) {
    testCase.tokenCost = result.usage.totalTokens;
  }

  if (options?.expectedOutput != null) {
    testCase.expectedOutput = options.expectedOutput;
  }
  if (options?.context != null) {
    testCase.context = options.context;
  }
  if (options?.retrievalContext != null) {
    testCase.retrievalContext = options.retrievalContext;
  }
  if (options?.name != null) {
    testCase.name = options.name;
  }
  if (options?.tags != null) {
    testCase.tags = options.tags;
  }

  return testCase;
}

/**
 * Convert a `streamText()` result into an `LLMTestCase` for evaluation.
 * This awaits the streamed text and usage before building the test case.
 *
 * @param result - The result from Vercel AI SDK's `streamText()`.
 * @param input - The original prompt/input that was sent to the model.
 * @param options - Additional fields for the test case.
 * @returns A promise that resolves to a fully populated `LLMTestCase`.
 *
 * @example
 * ```ts
 * import { streamText } from "ai";
 * import { fromStreamText } from "@assay-ai/ai-sdk";
 *
 * const result = streamText({ model, prompt: "Explain gravity." });
 * const testCase = await fromStreamText(result, "Explain gravity.");
 * ```
 */
export async function fromStreamText(
  result: StreamTextResultLike,
  input: string,
  options?: AdapterOptions,
): Promise<LLMTestCase> {
  const [text, usage] = await Promise.all([
    Promise.resolve(result.text),
    result.usage != null ? Promise.resolve(result.usage) : Promise.resolve(undefined),
  ]);

  const testCase: LLMTestCase = {
    input,
    actualOutput: text,
  };

  if (usage?.totalTokens != null) {
    testCase.tokenCost = usage.totalTokens;
  }

  if (options?.expectedOutput != null) {
    testCase.expectedOutput = options.expectedOutput;
  }
  if (options?.context != null) {
    testCase.context = options.context;
  }
  if (options?.retrievalContext != null) {
    testCase.retrievalContext = options.retrievalContext;
  }
  if (options?.name != null) {
    testCase.name = options.name;
  }
  if (options?.tags != null) {
    testCase.tags = options.tags;
  }

  return testCase;
}

/**
 * Convert an array of chat messages into an `LLMTestCase`.
 * The last assistant message is treated as `actualOutput`, and the last
 * user message is treated as `input`. Earlier messages are combined into
 * context for reference.
 *
 * @param messages - Array of chat messages with role and content.
 * @param options - Additional fields for the test case.
 * @returns A fully populated `LLMTestCase`.
 *
 * @example
 * ```ts
 * import { fromMessages } from "@assay-ai/ai-sdk";
 *
 * const testCase = fromMessages([
 *   { role: "user", content: "What is the capital of France?" },
 *   { role: "assistant", content: "The capital of France is Paris." },
 * ]);
 * ```
 */
export function fromMessages(
  messages: Array<{ role: string; content: string }>,
  options?: AdapterOptions,
): LLMTestCase {
  if (messages.length === 0) {
    throw new Error("fromMessages requires at least one message");
  }

  // Find the last user message and last assistant message
  let lastUserMessage: string | undefined;
  let lastAssistantMessage: string | undefined;
  const contextParts: string[] = [];

  // Walk backward to find the last assistant and user messages
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!;
    if (msg.role === "assistant" && lastAssistantMessage == null) {
      lastAssistantMessage = msg.content;
    } else if (msg.role === "user" && lastUserMessage == null) {
      lastUserMessage = msg.content;
    }
    if (lastUserMessage != null && lastAssistantMessage != null) {
      break;
    }
  }

  // Build conversation context from all messages except the ones we extracted
  // as input/output
  let foundLastUser = false;
  let foundLastAssistant = false;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!;
    if (msg.role === "user" && msg.content === lastUserMessage && !foundLastUser) {
      foundLastUser = true;
      continue;
    }
    if (msg.role === "assistant" && msg.content === lastAssistantMessage && !foundLastAssistant) {
      foundLastAssistant = true;
      continue;
    }
    contextParts.unshift(`[${msg.role}]: ${msg.content}`);
  }

  const input = lastUserMessage ?? messages[0]!.content;

  const testCase: LLMTestCase = {
    input,
  };

  if (lastAssistantMessage != null) {
    testCase.actualOutput = lastAssistantMessage;
  }

  // Merge conversation context with any user-provided context
  const allContext = [
    ...(contextParts.length > 0 ? contextParts : []),
    ...(options?.context ?? []),
  ];
  if (allContext.length > 0) {
    testCase.context = allContext;
  }

  if (options?.expectedOutput != null) {
    testCase.expectedOutput = options.expectedOutput;
  }
  if (options?.retrievalContext != null) {
    testCase.retrievalContext = options.retrievalContext;
  }
  if (options?.name != null) {
    testCase.name = options.name;
  }
  if (options?.tags != null) {
    testCase.tags = options.tags;
  }

  return testCase;
}
