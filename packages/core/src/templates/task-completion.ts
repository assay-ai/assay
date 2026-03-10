export const TaskCompletionTemplate = {
  evaluate(input: string, actualOutput: string): string {
    return `You are an expert evaluator. Given an input task and the AI agent's actual output, evaluate how well the agent completed the task.

Score the task completion on a scale of 1 to 5:
- 1: The agent completely failed to address the task.
- 2: The agent partially addressed the task but missed critical aspects.
- 3: The agent addressed the main aspects of the task but with notable gaps.
- 4: The agent mostly completed the task with only minor issues.
- 5: The agent fully and correctly completed the task.

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

Actual Output:
${actualOutput}

JSON:
`;
  },
} as const;
