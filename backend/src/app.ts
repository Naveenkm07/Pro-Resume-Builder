import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import uploadRoutes from './routes/upload';
import resumeRoutes from './routes/resume';
import brandAnalyzerRoutes from './routes/brand-analyzer';
import projectsExtractorRoutes from './routes/projects-extractor';
import { authenticate } from './middleware/auth';

const app = express();

// Middleware
const allowedOrigins = Array.from(
  new Set(
    [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:7000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:7000',
      'https://proresume-git-main-naveenkm07s-projects.vercel.app',
      'https://pro-resume-builder-rosy.vercel.app',
      'https://proresume.app',
    ].filter(Boolean)
  )
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Resume Builder API is running',
    health: '/health',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
// Authentication is handled entirely by Clerk in the frontend and validated via middleware for these routes
app.use('/api/upload', uploadRoutes); // Upload might be public or protected, leaving as is for now
app.use('/api/resume', authenticate, resumeRoutes);
app.use('/api/brand-analyzer', brandAnalyzerRoutes);
app.use('/api/projects-extractor', projectsExtractorRoutes);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err: Error, _: express.Request, res: express.Response, __: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
