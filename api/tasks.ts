import { VercelRequest, VercelResponse } from '@vercel/node';
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
    if (url === '/api/tasks' && method === 'GET') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tasks = await Task.find({ userId: user.userId });
      return res.json(tasks);
    }

    if (url === '/api/tasks' && method === 'POST') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, description, priority, subtasks } = req.body;
      const task = new Task({
        title,
        description,
        priority,
        subtasks: subtasks || [],
        userId: user.userId
      });

      await task.save();
      return res.status(201).json(task);
    }

    if (url?.startsWith('/api/tasks/') && method === 'PUT') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const taskId = url.split('/').pop();
      const { title, description, priority, status, subtasks } = req.body;

      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId: user.userId },
        { title, description, priority, status, subtasks },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.json(task);
    }

    if (url?.startsWith('/api/tasks/') && method === 'DELETE') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const taskId = url.split('/').pop();
      const task = await Task.findOneAndDelete({ _id: taskId, userId: user.userId });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.json({ message: 'Task deleted successfully' });
    }

    return res.status(404).json({ error: 'Task route not found' });

  } catch (error: any) {
    console.error('Task error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
