/**
 * Utility to extract and parse JSON array from AI response
 * Safely handles malformed responses and returns null if invalid
 */

interface Task {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
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
    
    // Validate it's an array with proper structure
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((task: any) => 
        task.title && 
        task.description && 
        ['High', 'Medium', 'Low'].includes(task.priority)
      );
    }
    
    return null;
  } catch (error: any) {
    console.error('JSON parsing failed:', error.message);
    return null;
  }
}
