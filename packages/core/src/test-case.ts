export interface ToolCall {
  name: string;
  description?: string;
  reasoning?: string;
  output?: unknown;
  inputParameters?: Record<string, unknown>;
}

export interface LLMTestCase {
  input: string;
  actualOutput?: string;
  expectedOutput?: string;
  context?: string[];
  retrievalContext?: string[];
  toolsCalled?: ToolCall[];
  expectedTools?: ToolCall[];
  tokenCost?: number;
  completionTime?: number;
  name?: string;
  tags?: string[];
  conversation?: ConversationalTestCase;
}

export interface ConversationalTestCase {
  turns: Array<{ role: "user" | "assistant"; content: string }>;
  scenario?: string;
  expectedOutcome?: string;
  chatbotRole?: string;
}
