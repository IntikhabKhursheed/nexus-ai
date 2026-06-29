import express from 'express';
import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let serverStarted = false;

const startServer = () => {
  if (serverStarted) {
    return;
  }

  serverStarted = true;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World from Nexus AI Backend!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Start the HTTP server immediately so the app stays usable even if Mongo is unavailable.
startServer();

// MongoDB connection is optional for local development.
if (process.env.MONGODB_URI) {
  if (process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }

  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false
  })
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.warn('MongoDB connection failed, continuing without database:', error.message);
    });
} else {
  console.warn('MONGODB_URI not set, running without database.');
}

export default app;
