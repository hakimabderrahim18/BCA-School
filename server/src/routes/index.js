import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import formationRoutes from './formationRoutes.js';
import prestationRoutes from './prestationRoutes.js';
import articleRoutes from './articleRoutes.js';
import eventRoutes from './eventRoutes.js';
import annonceurRoutes from './annonceurRoutes.js';
import adSlotRoutes from './adSlotRoutes.js';
import galleryRoutes from './galleryRoutes.js';
import contactRoutes from './contactRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/formations', formationRoutes);
apiRouter.use('/prestations', prestationRoutes);
apiRouter.use('/articles', articleRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/annonceurs', annonceurRoutes);
apiRouter.use('/ads', adSlotRoutes);
apiRouter.use('/gallery', galleryRoutes);
apiRouter.use('/albums', galleryRoutes);
apiRouter.use('/contact', contactRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/upload', uploadRoutes);

export default apiRouter;
