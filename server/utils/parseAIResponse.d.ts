export function extractJSONFromAIResponse(aiResponse: string): Array<{
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}> | null;
