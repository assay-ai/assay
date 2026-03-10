export const HallucinationTemplate = {
  checkContradiction(actualOutput: string, context: string): string {
    return `For the given context, please generate a JSON object to indicate whether the given 'actual output' agrees with the context. The JSON will have 2 fields: 'verdict' and 'reason'.

The 'verdict' key should STRICTLY be either 'yes' or 'no', and states whether the given text agrees with the context.
The 'reason' is the reason for the verdict. When the answer is 'no', try to provide a correction in the reason.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'verdict' and 'reason' keys.
Example context: "Einstein won the Nobel Prize for his discovery of the photoelectric effect."
Example actual output: "Einstein won the Nobel Prize in 1969 for his discovery of the photoelectric effect."

Example:
{
    "reason": "The actual output agrees with the provided context which states that Einstein won the Nobel Prize for his discovery of the photoelectric effect.",
    "verdict": "yes"
}

You should NOT incorporate any prior knowledge you have and take the context at face value.
You should FORGIVE cases where the actual output is lacking in detail, you should ONLY provide a 'no' answer if IT IS A CONTRADICTION.
**

Context:
${context}

Actual Output:
${actualOutput}

JSON:
`;
  },

  generateReason(score: number, verdicts: Array<{ context: string; verdict: string; reason: string }>): string {
    const factualAlignments = verdicts
      .filter((v) => v.verdict === 'yes')
      .map((v) => v.reason);
    const contradictions = verdicts
      .filter((v) => v.verdict === 'no')
      .map((v) => v.reason);

    return `Given a list of factual alignments and contradictions, which highlight alignment/contradictions between the actual output and contexts, use them to provide a reason for the hallucination score CONCISELY. Note that the hallucination score ranges from 0 to 1, and the lower the better.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'reason' key providing the reason.
Example JSON:
{
    "reason": "The score is <hallucination_score> because <your_reason>."
}
**

Factual Alignments:
${JSON.stringify(factualAlignments)}

Contradictions:
${JSON.stringify(contradictions)}

Hallucination Score:
${score}

JSON:
`;
  },
} as const;
