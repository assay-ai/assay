import pc from "picocolors";

interface MetricInfo {
  name: string;
  type: "LLM" | "Non-LLM";
  requiredFields: string[];
}

const METRICS: MetricInfo[] = [
  {
    name: "Answer Relevancy",
    type: "LLM",
    requiredFields: ["input", "actualOutput"],
  },
  {
    name: "Faithfulness",
    type: "LLM",
    requiredFields: ["input", "actualOutput", "retrievalContext"],
  },
  {
    name: "Hallucination",
    type: "LLM",
    requiredFields: ["input", "actualOutput", "context"],
  },
  {
    name: "Contextual Precision",
    type: "LLM",
    requiredFields: ["input", "actualOutput", "expectedOutput", "retrievalContext"],
  },
  {
    name: "Contextual Recall",
    type: "LLM",
    requiredFields: ["input", "actualOutput", "expectedOutput", "retrievalContext"],
  },
  {
    name: "Contextual Relevancy",
    type: "LLM",
    requiredFields: ["input", "actualOutput", "retrievalContext"],
  },
  {
    name: "Bias",
    type: "LLM",
    requiredFields: ["input", "actualOutput"],
  },
  {
    name: "Toxicity",
    type: "LLM",
    requiredFields: ["input", "actualOutput"],
  },
  {
    name: "G-Eval",
    type: "LLM",
    requiredFields: ["input"],
  },
  {
    name: "Summarization",
    type: "LLM",
    requiredFields: ["input", "actualOutput"],
  },
  {
    name: "Task Completion",
    type: "LLM",
    requiredFields: ["input", "actualOutput"],
  },
  {
    name: "Goal Accuracy",
    type: "LLM",
    requiredFields: ["input", "actualOutput", "expectedOutput"],
  },
  {
    name: "Conversation Completeness",
    type: "LLM",
    requiredFields: ["input", "actualOutput"],
  },
  {
    name: "Knowledge Retention",
    type: "LLM",
    requiredFields: ["input", "actualOutput"],
  },
  {
    name: "Role Adherence",
    type: "LLM",
    requiredFields: ["input", "actualOutput"],
  },
  {
    name: "Exact Match",
    type: "Non-LLM",
    requiredFields: ["actualOutput", "expectedOutput"],
  },
  {
    name: "JSON Correctness",
    type: "Non-LLM",
    requiredFields: ["actualOutput"],
  },
  {
    name: "Tool Correctness",
    type: "Non-LLM",
    requiredFields: ["toolsCalled", "expectedTools"],
  },
];

export function listMetrics(): void {
  const nameWidth = 30;
  const typeWidth = 10;
  const fieldsWidth = 50;

  const header = [
    pc.bold(pc.cyan("Metric".padEnd(nameWidth))),
    pc.bold(pc.cyan("Type".padEnd(typeWidth))),
    pc.bold(pc.cyan("Required Fields")),
  ].join("  ");

  const separator = "\u2500".repeat(nameWidth + typeWidth + fieldsWidth + 4);

  console.log();
  console.log(pc.bold("  Available Metrics"));
  console.log(`  ${separator}`);
  console.log(`  ${header}`);
  console.log(`  ${separator}`);

  for (const metric of METRICS) {
    const typeColor = metric.type === "LLM" ? pc.yellow : pc.green;
    const row = [
      metric.name.padEnd(nameWidth),
      typeColor(metric.type.padEnd(typeWidth)),
      pc.dim(metric.requiredFields.join(", ")),
    ].join("  ");

    console.log(`  ${row}`);
  }

  console.log(`  ${separator}`);
  console.log();
  console.log(
    `  ${pc.yellow("LLM")} = requires an LLM provider    ${pc.green("Non-LLM")} = deterministic, no LLM needed`,
  );
  console.log();
}
