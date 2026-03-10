export const SummarizationTemplate = {
  extractTruths(input: string): string {
    return `Based on the given text, please extract a comprehensive list of FACTUAL claims that can be inferred from the provided text.
These claims MUST BE COHERENT and CANNOT be taken out of context.

**
IMPORTANT: Please make sure to only return in JSON format, with the "claims" key as a list of strings. No words or explanation is needed.
Only include claims that are factual. The claims you extract should include the full context they were presented in, NOT cherry-picked facts.

Example:
Example Text: "The Eiffel Tower, located in Paris, was completed in 1889 and stands at 330 meters tall. It was designed by Gustave Eiffel's engineering company."

Example JSON:
{
    "claims": [
        "The Eiffel Tower is located in Paris.",
        "The Eiffel Tower was completed in 1889.",
        "The Eiffel Tower stands at 330 meters tall.",
        "The Eiffel Tower was designed by Gustave Eiffel's engineering company."
    ]
}
===== END OF EXAMPLE ======
**

Text:
${input}

JSON:
`;
  },

  checkContradiction(actualOutput: string, truths: string[]): string {
    return `Based on the given summary claims, which is a list of strings, generate a list of JSON objects to indicate whether EACH piece of information contradicts any facts in the original text. The JSON will have 2 fields: 'verdict' and 'reason'.

The 'verdict' key should STRICTLY be either 'yes', 'no', or 'idk', which states whether the given summary claim agrees with the original text.
Provide a 'reason' ONLY if the answer is 'no' OR 'idk'.
The provided summary claims are drawn from the summary. Try to provide a correction in the reason using the facts in the original text.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'verdicts' key as a list of JSON objects.
Example Original Text Truths: ["Einstein won the Nobel Prize for his discovery of the photoelectric effect.", "Einstein won the Nobel Prize in 1968.", "Einstein is a German Scientist."]
Example Summary Claims: ["Einstein won the Nobel Prize in 1969 for his discovery of the photoelectric effect.", "Einstein was a German chef."]

Example:
{
    "verdicts": [
        {
            "verdict": "no",
            "reason": "The summary claims Einstein won the Nobel Prize in 1969, which is untrue as the original text states it was 1968 instead."
        },
        {
            "verdict": "no",
            "reason": "The summary claims Einstein is a German chef, which is not correct as the original text states he was a German scientist instead."
        }
    ]
}
===== END OF EXAMPLE ======

The length of 'verdicts' SHOULD BE STRICTLY EQUAL to that of summary claims.
You DON'T have to provide a reason if the answer is 'yes'.
ONLY provide a 'no' answer if the summary DIRECTLY CONTRADICTS the claims. YOU SHOULD NEVER USE YOUR PRIOR KNOWLEDGE IN YOUR JUDGEMENT.
Claims made using vague, suggestive, speculative language such as 'may have', 'possibility due to', does NOT count as a contradiction.
Claims that are not backed up due to a lack of information/are not mentioned in the summary MUST be answered 'idk'.
**

Original Text Truths:
${JSON.stringify(truths)}

Summary (Actual Output):
${actualOutput}

JSON:
`;
  },

  generateQuestions(input: string): string {
    return `Based on the given text, generate closed-ended questions that can be answered with either a 'yes' or 'no'.
The questions generated should ALWAYS result in a 'yes' based on the given text.

**
IMPORTANT: Only return a JSON with a 'questions' key, which is a list of strings.
The questions have to be STRICTLY closed-ended.
The given text should be able to answer 'yes' for each question.
Generate between 5 and 10 questions that cover the key information in the text.

Example:
Example Text: "The Eiffel Tower was completed in 1889 in Paris."

{
    "questions": [
        "Was the Eiffel Tower completed in 1889?",
        "Is the Eiffel Tower located in Paris?"
    ]
}
===== END OF EXAMPLE ======
**

Text:
${input}

JSON:
`;
  },

  answerFromText(question: string, text: string): string {
    return `Based on the provided text, determine whether it contains sufficient information to answer the given close-ended question. Answer STRICTLY with 'yes' or 'no'.

Answer 'no' if the provided text does not contain enough information to answer the question.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'answer' key as a string that is strictly 'yes' or 'no'.

Example:
Example Text: "Mario and Luigi were best buds but since Luigi had a crush on Peach Mario ended up fighting him."
Example Question: "Are there enough details about Luigi and Mario?"

{
    "answer": "yes"
}
===== END OF EXAMPLE ======
**

Text:
${text}

Question:
${question}

JSON:
`;
  },

  generateReason(alignmentScore: number, coverageScore: number): string {
    const combinedScore = Math.min(alignmentScore, coverageScore);

    return `You will be given an alignment score and a coverage score for a summarization task. Your task is to explain the quality of the summary.
- The alignment score (0-1) measures whether the summary contains information that contradicts or is not in the original text (higher is better, meaning fewer contradictions).
- The coverage score (0-1) measures whether the summary covers the key information from the original text (higher is better, meaning better coverage).

Given these scores, CONCISELY justify the overall summarization quality.

**
IMPORTANT: Please make sure to only return in JSON format, with the 'reason' key providing the reason.
Example JSON:
{
    "reason": "The score is <summarization_score> because <your_reason>."
}

If both scores are high, offer some praise.
If alignment is low, mention contradictions or extra information not in the original text.
If coverage is low, mention that the summary misses key information from the original text.
**

Alignment Score:
${alignmentScore}

Coverage Score:
${coverageScore}

Overall Score:
${combinedScore}

JSON:
`;
  },
} as const;
