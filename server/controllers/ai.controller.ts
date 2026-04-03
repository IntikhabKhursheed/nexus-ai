import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import Groq from 'groq-sdk';
import { ITask } from '../models/Task.js';
import Task from '../models/Task.js';
import TaskOrchestrator from '../services/taskOrchestrator.js';

const taskOrchestrator = new TaskOrchestrator();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export const analyzeTasks = async (req: AuthRequest, res: Response) => {
  try {
    // Get user's tasks from task service (we'll need to import this)
    // For now, let's create a mock task list since we don't have direct access
    const mockTasks = [
      { title: "Complete project documentation", description: "Finish API documentation", priority: "high", status: "pending" },
      { title: "Review pull requests", description: "Check and merge pending PRs", priority: "medium", status: "pending" },
      { title: "Update dependencies", description: "Update npm packages", priority: "low", status: "pending" }
    ];

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an elite productivity strategist for Nexus AI. Analyze user\'s tasks and provide a 2-sentence tactical summary. Tell them which task to do first and why. Keep it professional, sharp, and motivational.'
        },
        {
          role: 'user',
          content: `Here are my current tasks: ${JSON.stringify(mockTasks, null, 2)}. Please analyze them and tell me which task to prioritize and provide strategic guidance.`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Unable to analyze tasks at the moment.';

    res.json({
      analysis: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze tasks' });
  }
};

export const getProductivityInsights = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fetch all tasks for the authenticated user
    console.log('Fetching tasks for userId:', req.user.userId);
    const tasks = await Task.find({ userId: req.user.userId }).exec();
    console.log('Found tasks:', tasks.length);
    console.log('Task IDs:', tasks.map(t => ({ id: t._id, title: t.title, status: t.status })));
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task: ITask) => task.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Generate AI insight based on real data
    let insight;
    if (totalTasks === 0) {
      insight = "No tasks yet. Start by adding or generating tasks to track your productivity!";
    } else if (completionRate === 100) {
      insight = `Perfect! You've completed all ${totalTasks} tasks. Time to celebrate and set new goals! 🎉`;
    } else if (completionRate >= 75) {
      insight = `Excellent progress! You've completed ${completedTasks} out of ${totalTasks} tasks (${completionRate}%). You're almost at the finish line!`;
    } else if (completionRate >= 50) {
      insight = `Good progress! You've completed ${completedTasks} out of ${totalTasks} tasks (${completionRate}%). Keep up the momentum!`;
    } else {
      insight = `You've completed ${completedTasks} out of ${totalTasks} tasks (${completionRate}%). Focus on finishing the next few tasks to build momentum!`;
    }

    res.json({
      totalTasks,
      completedTasks,
      completionRate,
      insight,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Productivity insights error:', error);
    res.status(500).json({ message: 'Failed to generate productivity insights' });
  }
};

export const generateSubtasks = async (req: AuthRequest, res: Response) => {
  try {
    const { taskTitle } = req.body;

    if (!taskTitle) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert project manager. Break down the given task into 3-5 specific, actionable sub-steps. Return ONLY a JSON array of objects with "title" and "completed" (false) fields. Each sub-step should be clear and technical.'
        },
        {
          role: 'user',
          content: `Break down this task into sub-steps: "${taskTitle}"`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 300
    });

    const aiResponse = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    let subtasks;
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      subtasks = JSON.parse(cleanResponse);
    } catch (parseError) {
      // Fallback subtasks if parsing fails
      subtasks = [
        { title: "Research requirements", completed: false },
        { title: "Create basic structure", completed: false },
        { title: "Implement core functionality", completed: false }
      ];
    }

    // Validate and format subtasks
    const formattedSubtasks = subtasks
      .filter((subtask: any) => subtask.title && typeof subtask.title === 'string')
      .slice(0, 5) // Limit to 5 subtasks
      .map((subtask: any) => ({
        title: subtask.title.trim(),
        completed: false
      }));

    res.json({
      subtasks: formattedSubtasks,
      taskTitle,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Subtask generation error:', error);
    res.status(500).json({ message: 'Failed to generate subtasks' });
  }
};

export const generateProjectPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({ message: 'Goal is required' });
    }

    // Use new task orchestrator for reliable task generation
    const result = await taskOrchestrator.generateProjectPlan(goal);
    
    if (!result.success) {
      console.log('Task generation partially failed, using fallback');
    }

    res.json({
      tasks: result.tasks,
      goal: result.goal,
      projectType: result.projectType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Project plan generation error:', error);
    res.status(500).json({ message: 'Failed to generate project plan' });
  }
};
