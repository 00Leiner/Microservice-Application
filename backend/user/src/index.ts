import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/dbConnection';
import { loggingMiddleware } from './middleware/Logging';
import userRoutes from './routes/userRoute';
import { errorHandler } from './middleware/errorHandler';
import Logging from './utils/Logging';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const startServer = () => {
	// Middleware
	Logging.info('Setting up middleware...');
	app.use(helmet());
	app.use(cors());
	app.use(express.json());
	app.use(loggingMiddleware);

	// Routes
	Logging.info('Setting up routes...');
	app.use('/api/users', userRoutes);

	// Error handling middleware
	app.use(errorHandler);

	// Start listening
	app.listen(port, () => {
		Logging.info(`User Server is running on port ${port}`);
	});

	// Global error handlers
	Logging.info('Setting up global error handlers...');
	process.on('uncaughtException', (error) => {
		Logging.error('Uncaught Exception:');
		Logging.error(error);
		process.exit(1);
	});
	process.on('unhandledRejection', (reason, promise) => {
		Logging.error('Unhandled Rejection at:');
		Logging.error(promise);
		Logging.error('Reason:');
		Logging.error(reason);
		process.exit(1);
	});
}

// Connect to MongoDB and start server
Logging.info('Initiating database connection...');
connectDB(startServer);

