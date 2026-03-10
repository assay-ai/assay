export const ConversationCompletenessTemplate = {
  evaluate(
    conversation: Array<{ role: "user" | "assistant"; content: string }>,
    scenario: string,
    expectedOutcome: string,
    latestInput: string,
    latestOutput: string,
  ): string {
    const formattedTurns = conversation
      .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join("\n");

    return `You are evaluating whether a conversation successfully achieved its intended goal. Review the full conversation in the context of the stated scenario and expected outcome.

**Scenario:**
${scenario}

**Expected Outcome:**
${expectedOutcome}

**Conversation History:**
${formattedTurns}

**Latest User Input:**
${latestInput}

**Latest Assistant Response:**
${latestOutput}

Score the conversation completeness on a scale of 1-5:
- 5: Fully complete — the conversation has completely achieved the expected outcome with all goals met.
- 4: Mostly complete — the primary goal is achieved, with minor aspects left unaddressed.
- 3: Partially complete — some progress toward the goal, but significant parts remain unresolved.
- 2: Mostly incomplete — minimal progress toward the expected outcome.
- 1: Not complete — the conversation made no meaningful progress toward the goal.

**
IMPORTANT: Please make sure to only return in valid and parseable JSON format, with the "score" and "reason" keys. No words or explanation outside the JSON.

Example JSON:
{
    "score": 4,
    "reason": "The conversation successfully helped the user book a flight, but did not confirm the seat preference as expected."
}
**

JSON:
`;
  },

  generateReason(score: number, normalizedScore: number): string {
    return `Given the conversation completeness score of ${score}/5 (normalized: ${normalizedScore}), provide a CONCISE reason for this score. Explain how well the conversation achieved its intended goal.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'reason' key providing the reason.
Example JSON:
{
    "reason": "The score is ${normalizedScore} because <your_reason>."
}
**

JSON:
`;
  },
} as const;
