export const RoleAdherenceTemplate = {
  evaluate(
    conversation: Array<{ role: "user" | "assistant"; content: string }>,
    chatbotRole: string,
    latestInput: string,
    latestOutput: string,
  ): string {
    const formattedTurns = conversation
      .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join("\n");

    return `You are evaluating whether a chatbot consistently stays in character and adheres to its assigned role throughout a conversation. The chatbot should maintain its persona, tone, expertise level, and behavioral boundaries as defined by its role.

**Assigned Role:**
${chatbotRole}

**Conversation History:**
${formattedTurns}

**Latest User Input:**
${latestInput}

**Latest Assistant Response:**
${latestOutput}

Score the role adherence on a scale of 1-5:
- 5: Perfect adherence — the assistant fully embodies the assigned role in tone, knowledge, boundaries, and behavior throughout.
- 4: Good adherence — the assistant mostly stays in character, with only minor deviations.
- 3: Moderate adherence — the assistant sometimes breaks character or responds in ways inconsistent with the role.
- 2: Poor adherence — the assistant frequently acts outside the defined role, breaking immersion.
- 1: No adherence — the assistant completely ignores the assigned role.

**
IMPORTANT: Please make sure to only return in valid and parseable JSON format, with the "score" and "reason" keys. No words or explanation outside the JSON.

Example JSON:
{
    "score": 4,
    "reason": "The assistant maintained a professional customer service tone throughout, but briefly used technical jargon that a support agent would typically avoid."
}
**

JSON:
`;
  },

  generateReason(score: number, normalizedScore: number): string {
    return `Given the role adherence score of ${score}/5 (normalized: ${normalizedScore}), provide a CONCISE reason for this score. Explain how well the chatbot stayed in its assigned character.

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
