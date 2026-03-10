export const ContextualRecallTemplate = {
  extractSentences(expectedOutput: string): string {
    return `Given the expected output below, break it down into individual sentences. Each sentence should be a self-contained unit of information.

**
IMPORTANT: Please make sure to only return in valid and parseable JSON format, with the "sentences" key mapping to a list of strings. No words or explanation are needed.

Example:
Example Expected Output: "Einstein won the Nobel Prize in 1968 for his discovery of the photoelectric effect. The photoelectric effect laid the foundation for quantum mechanics."

{
    "sentences": [
        "Einstein won the Nobel Prize in 1968 for his discovery of the photoelectric effect.",
        "The photoelectric effect laid the foundation for quantum mechanics."
    ]
}
===== END OF EXAMPLE ======
**

Expected Output:
${expectedOutput}

JSON:
`;
  },

  classifyAttribution(sentences: string[], retrievalContext: string[]): string {
    const numberedContext = retrievalContext.map((ctx, i) => `Node ${i + 1}: ${ctx}`).join("\n");

    return `For EACH sentence in the given list below, determine whether the sentence can be attributed to the nodes of the retrieval context. Please generate a list of JSON objects with two keys: 'verdict' and 'reason'.
The 'verdict' key should STRICTLY be either 'yes' or 'no'. Answer 'yes' if the sentence can be attributed to any parts of the retrieval context, else answer 'no'.
The 'reason' key should provide a reason for the verdict. In the reason, you should aim to include the node(s) count in the retrieval context (e.g., 1st node, 2nd node in the retrieval context) that is attributed to said sentence. You should also aim to quote the specific part of the retrieval context to justify your verdict, but keep it extremely concise and cut short the quote with an ellipsis if possible.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'verdicts' key as a list of JSON objects, each with two keys: 'verdict' and 'reason'.

{
    "verdicts": [
        {
            "reason": "...",
            "verdict": "yes"
        },
        ...
    ]
}

Since you are going to generate a verdict for each sentence, the number of 'verdicts' SHOULD BE STRICTLY EQUAL to the number of sentences.
**

Sentences:
${JSON.stringify(sentences)}

Retrieval Context:
${numberedContext}

JSON:
`;
  },

  generateReason(score: number, verdicts: Array<{ sentence: string; verdict: string }>): string {
    const supportive = verdicts.filter((v) => v.verdict === "yes").map((v) => v.sentence);
    const unsupportive = verdicts.filter((v) => v.verdict === "no").map((v) => v.sentence);

    return `Given the original expected output, a list of supportive sentences, and a list of unsupportive sentences (which are deduced directly from the original expected output), and a contextual recall score (closer to 1 the better), summarize a CONCISE reason for the score.
A supportive sentence is one that can be attributed to a node in the retrieval context.
An unsupportive sentence is one that cannot be attributed to anything in the retrieval context.
In your reason, you should relate supportive/unsupportive sentences to the sentence number in expected output, and include info regarding the node number in retrieval context to support your final reason. The first mention of "node(s)" should specify "node(s) in retrieval context".

**
IMPORTANT: Please make sure to only return in JSON format, with the 'reason' key providing the reason.
Example JSON:
{
    "reason": "The score is <contextual_recall_score> because <your_reason>."
}

DO NOT mention 'supportive' and 'unsupportive' in your reason, these terms are just here for you to understand the broader scope of things.
If the score is 1, keep it short and say something positive with an upbeat encouraging tone (but don't overdo it otherwise it gets annoying).
**

Contextual Recall Score:
${score}

Supportive Sentences:
${JSON.stringify(supportive)}

Unsupportive Sentences:
${JSON.stringify(unsupportive)}

JSON:
`;
  },
} as const;
