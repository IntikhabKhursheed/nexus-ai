/**
 * Prompt builder for AI task generation
 * Creates highly specific tasks based on the exact goal.
 */

export function buildTaskPrompt(goal: string, anchorTasks: string[] = []): string {
  const anchorText = anchorTasks.length > 0
    ? `\n\nUse these domain-specific anchor tasks as inspiration, but do not copy them exactly:\n${anchorTasks.map(task => `- ${task}`).join('\n')}`
    : '';

  return `You are a Senior Technical Lead and software architect.

Project goal: "${goal}"

Generate exactly 5 unique, highly specific implementation tasks for this exact project goal.
Do not generate generic or repeated tasks.
Each task must:
- mention the domain or technology implied by the goal
- be directly tied to the user's project
- include a "priority" field with one of: "High", "Medium", "Low"

Return ONLY valid JSON in this exact format, with no markdown or additional explanation:
[
  {
    "title": "string",
    "description": "string",
    "priority": "High" | "Medium" | "Low"
  }
]

${anchorText}
`;
}
