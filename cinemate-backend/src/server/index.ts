import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRouter from './api/auth';
import moviesRouter from './api/movies';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (_, res) => {
  res.send('Cinemate backend running!');
});

app.use('/auth', authRouter);
app.use('/movies', moviesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
