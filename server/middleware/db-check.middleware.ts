import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const dbCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'The application cannot connect to MongoDB. Please check your connection string and network connectivity.',
      details: 'This usually happens when: 1) MongoDB connection string is invalid, 2) Network is unavailable, 3) IP is not whitelisted in MongoDB Atlas'
    });
  }
  next();
};

export default dbCheckMiddleware;
