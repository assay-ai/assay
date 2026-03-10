export const KnowledgeRetentionTemplate = {
  evaluate(
    conversation: Array<{ role: "user" | "assistant"; content: string }>,
    latestInput: string,
    latestOutput: string,
  ): string {
    const formattedTurns = conversation
      .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join("\n");

    return `You are evaluating whether a chatbot retains and correctly uses knowledge from earlier turns in a conversation. The chatbot should remember facts, preferences, names, and other details mentioned previously and apply them consistently.

Review the full conversation history, then evaluate the LATEST assistant response for knowledge retention.

**Conversation History:**
${formattedTurns}

**Latest User Input:**
${latestInput}

**Latest Assistant Response:**
${latestOutput}

Score the knowledge retention on a scale of 1-5:
- 5: Perfect retention — all previously mentioned facts, preferences, and details are correctly remembered and applied.
- 4: Good retention — most information is remembered, with only minor omissions.
- 3: Moderate retention — some important details from earlier turns are forgotten or misapplied.
- 2: Poor retention — significant information is forgotten, leading to inconsistent or contradictory responses.
- 1: No retention — the assistant appears to have no memory of previous conversation turns.

**
IMPORTANT: Please make sure to only return in valid and parseable JSON format, with the "score" and "reason" keys. No words or explanation outside the JSON.

Example JSON:
{
    "score": 4,
    "reason": "The assistant correctly remembered the user's name and preference for vegetarian food from earlier turns, but forgot the specific restaurant they discussed."
}
**

JSON:
`;
  },

  generateReason(score: number, normalizedScore: number): string {
    return `Given the knowledge retention score of ${score}/5 (normalized: ${normalizedScore}), provide a CONCISE reason for this score. Explain what the chatbot remembered or forgot from earlier conversation turns.

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
