import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import branchRoutes from './routes/branchRoutes';
import reservationRoutes from './routes/reservationRoutes';
import cartRoutes from './routes/cartRoutes';
import systemRoutes from './routes/systemRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import globalMenuRoutes from './routes/globalMenuRoutes';
import branchOrdersAndReservationsRoutes from './routes/branchOrdersAndReservationsRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
import { seedAdminUser } from './utils/seedAdmin';
import { seedBranches } from './utils/seedBranches';
import { seedSystemSettings } from './utils/seedSystemSettings';

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://myapp-frontend.onrender.com'
})); // Add CORS support
app.use(express.json());

// Homepage route
app.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to Steakz Restaurant API!');
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/system', systemRoutes);
app.use('/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/global-menu', globalMenuRoutes);
app.use('/api/branch', branchOrdersAndReservationsRoutes);

// Start the server
app.listen(port, async () => {
    await seedAdminUser();
    await seedBranches();
    await seedSystemSettings();
    console.log(`Server is running on http://localhost:${port}`);
});