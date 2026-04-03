/**
 * AI Service for calling Groq API
 * Handles API communication with proper error handling and retry logic
 */

import Groq from 'groq-sdk';
import { buildTaskPrompt } from './promptBuilder.js';

class AIService {
  private groq: any;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || ''
    });
  }

  async generateTasks(goal: string, anchorTasks: string[] = []): Promise<string> {
    try {
      const prompt = buildTaskPrompt(goal, anchorTasks);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: `Goal: ${goal}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1000
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }
}

export default AIService;
