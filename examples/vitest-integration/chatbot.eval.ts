import { AnswerRelevancyMetric, GEval, HallucinationMetric } from "@assay-ai/core";
import { setupAssayMatchers } from "@assay-ai/vitest";
import { beforeAll, describe, expect, test } from "vitest";

beforeAll(() => {
  setupAssayMatchers();
});

describe("Chatbot Quality Evaluation", () => {
  test("answers are relevant to questions", async () => {
    await expect({
      input: "How do I reset my password?",
      actualOutput: "Go to Settings > Security > Reset Password and follow the steps.",
    }).toBeRelevant({ threshold: 0.8 });
  });

  test("answers do not hallucinate", async () => {
    await expect({
      input: "What is our return policy?",
      actualOutput: "You can return items within 30 days for a full refund.",
      context: [
        "Return Policy: Items can be returned within 30 days of purchase for a full refund.",
      ],
    }).toNotHallucinate({ threshold: 0.3 });
  });

  test("passes multiple quality metrics", async () => {
    await expect({
      input: "Explain quantum computing briefly",
      actualOutput:
        "Quantum computing uses qubits that can exist in superposition, enabling parallel computation.",
      context: [
        "Quantum computing leverages quantum mechanics, including superposition and entanglement.",
      ],
    }).toPassAllMetrics([
      new AnswerRelevancyMetric({ threshold: 0.7 }),
      new HallucinationMetric({ threshold: 0.3 }),
    ]);
  });

  test("custom criteria with GEval", async () => {
    const professionalTone = new GEval({
      name: "Professional Tone",
      criteria:
        "The response uses professional, formal language appropriate for business communication.",
      evaluationParams: ["input", "actualOutput"],
      threshold: 0.7,
    });

    await expect({
      input: "Draft an email about the project delay",
      actualOutput:
        "Dear Client, I wanted to inform you about a timeline adjustment for the project...",
    }).toPassMetric(professionalTone);
  });
});
