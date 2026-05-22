import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config'; 
import { connectDB } from './config/db';
import Routes from './routes/routes';
import { errorHandler } from './middleware/errorHandler';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

connectDB();

app.use('/api', Routes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});