import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// CORS middleware for Vercel
const corsMiddleware = cors({
  origin: ['https://nexus-ai.vercel.app', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// MongoDB connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.warn('MongoDB connection failed:', error.message);
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply CORS
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route to specific handlers
  const { url, method } = req;
  
  try {
    if (url === '/api/hello' && method === 'GET') {
      return res.json({ message: 'Hello World from Nexus AI Backend!' });
    }
    
    // Import route handlers dynamically
    if (url?.startsWith('/api/auth')) {
      const { handler: authHandler } = await import('./auth.js');
      return authHandler(req, res);
    }
    
    if (url?.startsWith('/api/tasks')) {
      const { handler: taskHandler } = await import('./tasks.js');
      return taskHandler(req, res);
    }
    
    if (url?.startsWith('/api/ai')) {
      const { handler: aiHandler } = await import('./ai.js');
      return aiHandler(req, res);
    }
    
    // 404 for unknown routes
    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
