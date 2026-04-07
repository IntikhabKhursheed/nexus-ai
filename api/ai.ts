import { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import Task from '../server/models/Task.js';
import jwt from 'jsonwebtoken';

const authenticateToken = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
  } catch {
    return null;
  }
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const user = authenticateToken(req);

  try {
    if (url === '/api/ai/analyze' && method === 'POST') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tasks = await Task.find({ userId: user.userId });
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an elite productivity strategist for Nexus AI. Analyze user\'s tasks and provide a 2-sentence tactical summary. Tell them which task to do first and why. Keep it professional, sharp, and motivational.'
          },
          {
            role: 'user',
            content: `Here are my current tasks: ${JSON.stringify(tasks, null, 2)}. Please analyze them and tell me which task to prioritize and provide strategic guidance.`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 150
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Unable to analyze tasks at the moment.';

      return res.json({
        analysis: aiResponse,
        timestamp: new Date().toISOString()
      });
    }

    if (url === '/api/ai/generate-plan' && method === 'POST') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { goal } = req.body;
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Act as a Senior Technical Lead. For the goal "${goal}", generate 5 HIGHLY SPECIFIC implementation tasks.

RULES:
- DO NOT use the word "${goal}" in every task title
- Tasks must be technical (e.g., "Configure WebGL Context" instead of "Research gaming")
- Each task must include an array of 3 "subtasks" which are the actual small steps
- Format: JSON Array with title, description, priority, and subtasks fields
- Priority levels: High, Medium, Low
- Each subtask should be a concrete action item

Example format:
[
  {
    "title": "Set up development environment",
    "description": "Configure the complete development stack including Node.js, TypeScript, and essential tools",
    "priority": "High",
    "subtasks": ["Install Node.js 18+ LTS", "Configure TypeScript compiler", "Set up ESLint and Prettier"]
  }
]`
          },
          {
            role: 'user',
            content: `Generate a project plan for: ${goal}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2000
      });

      let tasks = [];
      try {
        const aiResponse = completion.choices[0]?.message?.content || '[]';
        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        tasks = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedResponse);
      } catch (parseError) {
        console.warn('Failed to parse AI response, using fallback tasks');
        tasks = [
          {
            title: `Plan ${goal} implementation`,
            description: `Create a structured plan for implementing ${goal}`,
            priority: 'High',
            subtasks: ['Research requirements', 'Design architecture', 'Create timeline']
          }
        ];
      }

      return res.json({
        tasks,
        goal,
        timestamp: new Date().toISOString()
      });
    }

    if (url === '/api/ai/generate-subtasks' && method === 'POST') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { taskTitle } = req.body;
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a Senior Technical Lead. For the task "${taskTitle}", generate 3-5 specific technical subtasks.

RULES:
- Subtasks must be concrete implementation steps
- Each subtask should be actionable and specific
- Format: JSON Array with objects containing "title" and "completed" fields
- "completed" should always be false initially
- Focus on technical implementation details

Example format:
[
  {"title": "Configure database connection", "completed": false},
  {"title": "Set up API endpoints", "completed": false}
]`
          },
          {
            role: 'user',
            content: `Generate subtasks for: ${taskTitle}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1000
      });

      let subtasks = [];
      try {
        const aiResponse = completion.choices[0]?.message?.content || '[]';
        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        subtasks = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedResponse);
      } catch (parseError) {
        console.warn('Failed to parse subtasks response, using fallback');
        subtasks = [
          { title: 'Research implementation approach', completed: false },
          { title: 'Set up basic structure', completed: false },
          { title: 'Test functionality', completed: false }
        ];
      }

      return res.json({
        subtasks,
        taskTitle,
        timestamp: new Date().toISOString()
      });
    }

    if (url === '/api/ai/productivity' && method === 'GET') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tasks = await Task.find({ userId: user.userId });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an elite productivity coach for Nexus AI. Based on the user\'s task completion metrics, provide a 2-sentence motivational insight. Be encouraging but realistic. Focus on progress and next steps.'
          },
          {
            role: 'user',
            content: `I have ${totalTasks} tasks total, ${completedTasks} completed (${completionRate}% completion rate). Please provide productivity insights.`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 150
      });

      const insight = completion.choices[0]?.message?.content || 'Keep up the great work! Focus on completing your highest priority tasks first.';

      return res.json({
        totalTasks,
        completedTasks,
        completionRate,
        insight,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(404).json({ error: 'AI route not found' });

  } catch (error: any) {
    console.error('AI error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
