import express from 'express';
import env, { isTestEnv } from '../env.ts';
import { errorHandler, notFound } from './middleware/errorHandler.ts';

// Middlewares
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dns from 'dns';

// Routes
import authRoutes from './routes/authRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import noteRoutes from './routes/noteRoutes.ts';
import tagRoutes from './routes/tagRoutes.ts';

const app = express();
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS

app.use(helmet());
app.use(
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	morgan('dev', {
		skip: () => isTestEnv(),
	}),
);

// Health checkpoint - for monitoring
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		service: 'Notes Taking API',
	});
});

// AP Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tags', tagRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
