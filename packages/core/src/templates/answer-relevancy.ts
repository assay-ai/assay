export const AnswerRelevancyTemplate = {
  extractStatements(actualOutput: string): string {
    return `Given the text, break it down and generate a list of statements presented. Ambiguous statements and single words can be considered as statements, but only if they appear outside of a coherent statement.

Example:
Example text:
Our new laptop model features a high-resolution Retina display for crystal-clear visuals. It also includes a fast-charging battery, giving you up to 12 hours of usage on a single charge. For security, we've added fingerprint authentication and an encrypted SSD. Plus, every purchase comes with a one-year warranty and 24/7 customer support.

{
    "statements": [
        "The new laptop model has a high-resolution Retina display.",
        "It includes a fast-charging battery with up to 12 hours of usage.",
        "Security features include fingerprint authentication and an encrypted SSD.",
        "Every purchase comes with a one-year warranty.",
        "24/7 customer support is included."
    ]
}
===== END OF EXAMPLE ======

**
IMPORTANT: Please make sure to only return in valid and parseable JSON format, with the "statements" key mapping to a list of strings. No words or explanation are needed. Ensure all strings are properly closed. Repair any invalid JSON before you output it.
**

Text:
${actualOutput}

JSON:
`;
  },

  classifyRelevancy(statements: string[], input: string): string {
    return `For the provided list of statements, determine whether each statement is relevant to addressing the input.
Generate JSON objects with 'verdict' and 'reason' fields.
The 'verdict' should be 'yes' (relevant), 'no' (irrelevant), or 'idk' (ambiguous/supporting information).
Provide 'reason' ONLY for 'no' or 'idk' verdicts.
The statements are extracted from an AI's actual output.

**
IMPORTANT: Please make sure to only return in valid and parseable JSON format, with the 'verdicts' key mapping to a list of JSON objects. Ensure all strings are properly closed. Repair any invalid JSON before you output it.

Expected JSON format:
{
    "verdicts": [
        {
            "verdict": "yes"
        },
        {
            "reason": "<explanation_for_irrelevance>",
            "verdict": "no"
        },
        {
            "reason": "<explanation_for_ambiguity>",
            "verdict": "idk"
        }
    ]
}

Generate ONE verdict per statement - number of 'verdicts' MUST equal number of statements.
'verdict' must be STRICTLY 'yes', 'no', or 'idk':
- 'yes': statement is relevant to addressing the input
- 'no': statement is irrelevant to the input
- 'idk': statement is ambiguous (not directly relevant but could be supporting information)
Provide 'reason' ONLY for 'no' or 'idk' verdicts.
**

Input:
${input}

Statements:
${JSON.stringify(statements)}

JSON:
`;
  },

  generateReason(score: number, verdicts: Array<{ statement: string; verdict: string }>): string {
    const irrelevantStatements = verdicts
      .filter((v) => v.verdict !== 'yes')
      .map((v) => v.statement);

    return `Given the answer relevancy score, the list of irrelevant statements made in the actual output, and the input, provide a CONCISE reason for the score. Explain why it is not higher, but also why it is at its current score.
The irrelevant statements represent things in the actual output that are irrelevant to addressing whatever is asked/talked about in the input.
If there are no irrelevant statements, just say something positive with an upbeat encouraging tone (but don't overdo it otherwise it gets annoying).

**
IMPORTANT: Please make sure to only return in JSON format, with the 'reason' key providing the reason. Ensure all strings are properly closed. Repair any invalid JSON before you output it.

Example:
{
    "reason": "The score is <answer_relevancy_score> because <your_reason>."
}
===== END OF EXAMPLE ======
**

Answer Relevancy Score:
${score}

Irrelevant Statements:
${JSON.stringify(irrelevantStatements)}

JSON:
`;
  },
} as const;
