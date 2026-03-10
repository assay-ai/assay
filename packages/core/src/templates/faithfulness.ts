export const FaithfulnessTemplate = {
  extractTruths(retrievalContext: string[]): string {
    return `Based on the given text, please generate a comprehensive list of FACTUAL, undisputed truths that can be inferred from the provided text.
These truths MUST BE COHERENT. They must NOT be taken out of context.

Example:
Example Text:
"Albert Einstein, the genius often associated with wild hair and mind-bending theories, famously won the Nobel Prize in Physics—though not for his groundbreaking work on relativity, as many assume. Instead, in 1968, he was honored for his discovery of the photoelectric effect, a phenomenon that laid the foundation for quantum mechanics."

Example JSON:
{
    "truths": [
        "Einstein won the Nobel Prize for his discovery of the photoelectric effect in 1968.",
        "The photoelectric effect is a phenomenon that laid the foundation for quantum mechanics."
    ]
}
===== END OF EXAMPLE ======

**
IMPORTANT: Please make sure to only return in JSON format, with the "truths" key as a list of strings. No words or explanation is needed.
Only include truths that are factual, BUT IT DOESN'T MATTER IF THEY ARE FACTUALLY CORRECT.
**

Text:
${JSON.stringify(retrievalContext)}

JSON:
`;
  },

  extractClaims(actualOutput: string): string {
    return `Based on the given text, please extract a comprehensive list of FACTUAL, undisputed claims that can be inferred from the provided actual AI output.
These claims MUST BE COHERENT, and CANNOT be taken out of context.

Example:
Example Text:
"Albert Einstein, the genius often associated with wild hair and mind-bending theories, famously won the Nobel Prize in Physics—though not for his groundbreaking work on relativity, as many assume. Instead, in 1968, he was honored for his discovery of the photoelectric effect, a phenomenon that laid the foundation for quantum mechanics."

Example JSON:
{
    "claims": [
        "Einstein won the Nobel Prize for his discovery of the photoelectric effect in 1968.",
        "The photoelectric effect is a phenomenon that laid the foundation for quantum mechanics."
    ]
}
===== END OF EXAMPLE ======

**
IMPORTANT: Please make sure to only return in JSON format, with the "claims" key as a list of strings. No words or explanation is needed.
Only include claims that are factual, BUT IT DOESN'T MATTER IF THEY ARE FACTUALLY CORRECT. The claims you extract should include the full context they were presented in, NOT cherry-picked facts.
You should NOT include any prior knowledge, and take the text at face value when extracting claims.
You should be aware that it is an AI that is outputting these claims.
**

AI Output:
${actualOutput}

JSON:
`;
  },

  classifyClaims(claims: string[], truths: string[]): string {
    return `Based on the given claims, which is a list of strings, generate a list of JSON objects to indicate whether EACH claim contradicts any facts in the retrieval context. The JSON will have 2 fields: 'verdict' and 'reason'.
The 'verdict' key should STRICTLY be either 'yes', 'no', or 'idk', which states whether the given claim agrees with the context.
Provide a 'reason' ONLY if the answer is 'no' or 'idk'.
The provided claims are drawn from the actual output. Try to provide a correction in the reason using the facts in the retrieval context.

Expected JSON format:
{
    "verdicts": [
        {
            "verdict": "yes"
        },
        {
            "reason": "<explanation_for_contradiction>",
            "verdict": "no"
        },
        {
            "reason": "<explanation_for_uncertainty>",
            "verdict": "idk"
        }
    ]
}

**
IMPORTANT: Please make sure to only return in JSON format, with the 'verdicts' key as a list of JSON objects.
Generate ONE verdict per claim - length of 'verdicts' MUST equal number of claims.
No 'reason' needed for 'yes' verdicts.
Only use 'no' if retrieval context DIRECTLY CONTRADICTS the claim - never use prior knowledge.
Use 'idk' for claims not backed up by context OR factually incorrect but non-contradictory - do not assume your knowledge.
Vague/speculative language in claims (e.g. 'may have', 'possibility') does NOT count as contradiction.
**

Retrieval Context Truths:
${JSON.stringify(truths)}

Claims:
${JSON.stringify(claims)}

JSON:
`;
  },

  generateReason(score: number, verdicts: Array<{ claim: string; verdict: string; reason: string }>): string {
    const contradictions = verdicts
      .filter((v) => v.verdict === 'no')
      .map((v) => v.reason);

    return `Below is a list of contradictions. It is a list of strings explaining why the 'actual output' does not align with the information presented in the 'retrieval context'. Contradictions happen in the 'actual output', NOT the 'retrieval context'.
Given the faithfulness score, which is a 0-1 score indicating how faithful the actual output is to the retrieval context (higher the better), CONCISELY summarize the contradictions to justify the score.

Expected JSON format:
{
    "reason": "The score is <faithfulness_score> because <your_reason>."
}

**
IMPORTANT: Please make sure to only return in JSON format, with the 'reason' key providing the reason.
If there are no contradictions, just say something positive with an upbeat encouraging tone (but don't overdo it otherwise it gets annoying).
Your reason MUST use information in the contradictions in your reason.
Be sure in your reason, as if you know what the actual output is from the contradictions.
**

Faithfulness Score:
${score}

Contradictions:
${JSON.stringify(contradictions)}

JSON:
`;
  },
} as const;
