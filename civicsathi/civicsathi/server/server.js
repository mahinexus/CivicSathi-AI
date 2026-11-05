import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import schemeRoutes from './routes/schemes.js';
import appRoutes from './routes/applications.js';
import aiRoutes from './routes/ai.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120 }));

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/ai', rateLimit({ windowMs: 60_000, limit: 20 }), aiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

await connectDB();
app.listen(process.env.PORT || 5000, () => console.log('CivicSathi API running on port', process.env.PORT || 5000));
