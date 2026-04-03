/**
 * Prompt builder for AI task generation
 * Creates structured prompts for consistent, high-quality AI responses
 */

function buildTaskPrompt(goal, anchorTasks = []) {
  const anchorText = anchorTasks.length > 0 
    ? `\n\nInclude these specific anchor tasks in your response:\n${anchorTasks.map(task => `- ${task}`).join('\n')}`
    : '';

  return `You are a senior software architect and project manager.

Break the following goal into 5-7 specific, actionable, and technical tasks.

CRITICAL RULES:
- Tasks must be highly specific to the goal
- NEVER use generic phrases like "implement core functionality", "setup project", "test and debug"
- Include relevant technologies mentioned or implied in the goal
- Each task should be short, clear, and action-oriented
- Make it feel like a real development roadmap with concrete steps

TASK STRUCTURE:
Each task must have:
- title: Short, action-oriented (e.g. "Build React authentication form")
- description: Specific details about implementation
- priority: "High", "Medium", or "Low" based on development workflow

${anchorText}

Return ONLY a valid JSON array in this exact format:
[
  {
    "title": "string",
    "description": "string", 
    "priority": "High|Medium|Low"
  }
]

Goal: ${goal}`;
}

export { buildTaskPrompt };
