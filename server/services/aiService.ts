/**
 * AI Service for calling Groq API
 * Handles API communication with proper error handling and retry logic
 */

import Groq from 'groq-sdk';
import { buildTaskPrompt } from './promptBuilder';

class AIService {
  private groq: any;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || ''
    });
  }

  async generateTasks(goal: string, anchorTasks: string[] = []): Promise<string> {
    try {
      if (!process.env.GROQ_API_KEY) {
        console.warn('⚠️ Groq API key not configured. Skipping AI task generation.');
        return '';
      }

      const prompt = buildTaskPrompt(goal, anchorTasks);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a senior technical lead and task generation expert. Produce unique, goal-specific implementation tasks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.85,
        top_p: 0.95,
        max_tokens: 900
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('AI API call failed:', error.message);
      return '';
    }
  }
}

export default AIService;
