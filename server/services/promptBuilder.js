/**
 * Prompt builder for AI task generation
 * Creates structured prompts for consistent, high-quality AI responses
 */

function buildTaskPrompt(goal, anchorTasks = []) {
  const anchorText = anchorTasks.length > 0
    ? `\n\nUse these domain-specific anchor tasks as inspiration, but do not copy them exactly:\n${anchorTasks.map(task => `- ${task}`).join('\n')}`
    : '';

  return `You are a senior software architect and project manager.

Project goal: "${goal}"

Generate exactly 5 unique, highly specific implementation tasks.
Do not generate generic or repeated tasks.
Each task must:
- reference the domain or technology implied by the goal
- be tailored to this exact project
- include a "priority" field using only "High", "Medium", or "Low"

Return ONLY a valid JSON array in this exact format, with no markdown or extra text:
[
  {
    "title": "string",
    "description": "string",
    "priority": "High|Medium|Low"
  }
]

${anchorText}
`;
}

export { buildTaskPrompt };
