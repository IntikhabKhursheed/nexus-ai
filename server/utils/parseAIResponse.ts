/**
 * Utility to extract and parse JSON array from AI response
 * Safely handles malformed responses and returns null if invalid
 */

interface Task {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

function normalizeTasks(input: any[]): Task[] {
  return input
    .map((task: any) => ({
      title: typeof task?.title === 'string' ? task.title.trim() : '',
      description: typeof task?.description === 'string' ? task.description.trim() : '',
      priority: task?.priority
    }))
    .filter((task: Task) =>
      task.title.length > 0 &&
      task.description.length > 0 &&
      ['High', 'Medium', 'Low'].includes(task.priority)
    );
}

export function extractJSONFromAIResponse(aiResponse: string): Task[] | null {
  if (!aiResponse || typeof aiResponse !== 'string') {
    return null;
  }

  try {
    // Remove any markdown code blocks
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON array in the response
    const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }

    // Parse the JSON
    const parsed = JSON.parse(cleanResponse);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeTasks(parsed);
    }

    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        return normalizeTasks(parsed.tasks);
      }

      if (parsed.title && parsed.description && parsed.priority) {
        const singleTask = normalizeTasks([parsed]);
        return singleTask.length > 0 ? singleTask : null;
      }
    }

    return null;
  } catch (error: any) {
    console.error('JSON parsing failed:', error.message);
    return null;
  }
}
