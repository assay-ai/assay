export const GoalAccuracyTemplate = {
  evaluate(input: string, actualOutput: string, expectedOutput: string): string {
    return `You are an expert evaluator. Given an input task, the AI agent's actual output, and the expected goal/outcome, evaluate how accurately the agent's output achieves the expected goal.

Score the goal accuracy on a scale of 1 to 5:
- 1: The output completely fails to achieve the expected goal.
- 2: The output partially achieves the goal but misses critical elements.
- 3: The output achieves the main goal but with notable inaccuracies or omissions.
- 4: The output mostly achieves the goal with only minor deviations.
- 5: The output fully and accurately achieves the expected goal.

**
IMPORTANT: Please make sure to only return in valid and parseable JSON format, with the "score" and "reason" keys. No words or explanation are needed outside of the JSON. Ensure all strings are properly closed. Repair any invalid JSON before you output it.

Expected JSON format:
{
    "score": <1-5>,
    "reason": "<concise explanation for the score>"
}
**

Input Task:
${input}

Expected Goal/Outcome:
${expectedOutput}

Actual Output:
${actualOutput}

JSON:
`;
  },
} as const;
