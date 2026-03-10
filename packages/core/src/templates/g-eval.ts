export const GEvalTemplate = {
  generateSteps(criteria: string): string {
    return `Given an evaluation criteria which outlines how you should judge the response, generate 3-4 concise evaluation steps based on the criteria below. You MUST make it clear how to evaluate the parameters in relation to one another.

Evaluation Criteria:
${criteria}

**
IMPORTANT: Please make sure to only return in JSON format, with the "steps" key as a list of strings. No words or explanation is needed.
Example JSON:
{
    "steps": [
        "Step 1: Assess whether...",
        "Step 2: Check if...",
        "Step 3: Evaluate the..."
    ]
}
**

JSON:
`;
  },

  evaluate(criteria: string, steps: string[], testCase: Record<string, string>): string {
    const stepsFormatted = steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    const testCaseFormatted = Object.entries(testCase)
      .map(([key, value]) => `${key}:\n${value}`)
      .join('\n\n');
    const parameters = Object.keys(testCase).join(', ');

    return `You are an evaluator. Given the following evaluation criteria and steps, assess the response below and return a JSON object with two fields:

- "score": an integer between 0 and 10, with 10 indicating strong alignment with the evaluation steps and 0 indicating no alignment.
- "reason": a brief explanation for why the score was given. This must mention specific strengths or shortcomings, referencing relevant details from the input. Do NOT quote the score itself in the explanation.

Your explanation should:
- Be specific and grounded in the evaluation steps.
- Mention key details from the test case parameters (${parameters}).
- Be concise, clear, and focused on the evaluation logic.

Only return valid JSON. Do NOT include any extra commentary or text.

---

Evaluation Criteria:
${criteria}

Evaluation Steps:
${stepsFormatted}

Test Case:
${testCaseFormatted}

---
**Example JSON:**
{
    "reason": "your concise and informative reason here",
    "score": 0
}

JSON:
`;
  },
} as const;
