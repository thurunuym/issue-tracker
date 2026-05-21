import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config'; 
import { connectDB } from './config/db';
import Routes from './routes/routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

connectDB();

app.use('/api', Routes);

app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});