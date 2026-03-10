export const ContextualRelevancyTemplate = {
  extractStatements(retrievalContext: string[]): string {
    return `Based on the provided retrieval context, extract all high-level statements of information found in EACH context. Each statement should be a self-contained piece of information.

**
IMPORTANT: Please make sure to only return in valid and parseable JSON format, with the "statements" key mapping to a list of JSON objects, each with a 'context_index' (0-based index of the source context) and 'statement' key.

Example Retrieval Context: ["Einstein won the Nobel Prize for his discovery of the photoelectric effect. He won it in 1968.", "There was a cat."]

{
    "statements": [
        {
            "context_index": 0,
            "statement": "Einstein won the Nobel Prize for his discovery of the photoelectric effect."
        },
        {
            "context_index": 0,
            "statement": "Einstein won the Nobel Prize in 1968."
        },
        {
            "context_index": 1,
            "statement": "There was a cat."
        }
    ]
}
===== END OF EXAMPLE ======
**

Retrieval Context:
${JSON.stringify(retrievalContext)}

JSON:
`;
  },

  classifyRelevancy(statements: string[], input: string): string {
    return `Based on the input and the list of statements extracted from retrieval contexts, please generate a JSON object to indicate whether each statement is relevant to the provided input. The JSON will be a list of 'verdicts', with 2 mandatory fields: 'verdict' and 'statement', and 1 optional field: 'reason'.
You should determine whether each statement is relevant to addressing the input.
The 'verdict' key should STRICTLY be either 'yes' or 'no', and states whether the statement is relevant to the input.
Provide a 'reason' ONLY IF verdict is 'no'. You MUST quote the irrelevant parts of the statement to back up your reason.

If provided context contains no actual content or statements then: give "no" as a "verdict", put context into "statement", and "No statements found in provided context." into "reason".

**
IMPORTANT: Please make sure to only return in JSON format.
Example Context: "Einstein won the Nobel Prize for his discovery of the photoelectric effect. He won the Nobel Prize in 1968. There was a cat."
Example Input: "What were some of Einstein's achievements?"

Example:
{
    "verdicts": [
        {
            "statement": "Einstein won the Nobel Prize for his discovery of the photoelectric effect in 1968",
            "verdict": "yes"
        },
        {
            "statement": "There was a cat.",
            "reason": "The retrieval context contained the information 'There was a cat' when it has nothing to do with Einstein's achievements.",
            "verdict": "no"
        }
    ]
}
**

Input:
${input}

Statements:
${JSON.stringify(statements)}

JSON:
`;
  },

  generateReason(score: number, verdicts: Array<{ statement: string; verdict: string }>): string {
    const irrelevant = verdicts.filter((v) => v.verdict === "no").map((v) => v.statement);
    const relevant = verdicts.filter((v) => v.verdict === "yes").map((v) => v.statement);

    return `Based on the given input, reasons for why the retrieval context is irrelevant to the input, the statements in the retrieval context that are actually relevant, and the contextual relevancy score (the closer to 1 the better), please generate a CONCISE reason for the score.
In your reason, you should quote data provided in the irrelevant and relevant statements to support your point.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'reason' key providing the reason.
Example JSON:
{
    "reason": "The score is <contextual_relevancy_score> because <your_reason>."
}

If the score is 1, keep it short and say something positive with an upbeat encouraging tone (but don't overdo it otherwise it gets annoying).
**

Contextual Relevancy Score:
${score}

Irrelevant Statements:
${JSON.stringify(irrelevant)}

Relevant Statements:
${JSON.stringify(relevant)}

JSON:
`;
  },
} as const;
