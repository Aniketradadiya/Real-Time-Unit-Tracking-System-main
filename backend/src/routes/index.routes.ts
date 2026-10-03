import { Router } from 'express';
import authRouter from './auth.routes';
import liveDataRouter from './live-data.routes';
import alertRouter from './alert.routes';
import deviceRouter from './device.routes';
import adminRouter from './admin.routes';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const indexRouter = Router();

indexRouter.use('/auth', authRouter);
indexRouter.use('/live-data', liveDataRouter);
indexRouter.use('/alerts', authenticateToken, alertRouter);
indexRouter.use('/devices', authenticateToken, deviceRouter);
indexRouter.use('/admin', authenticateToken, requireAdmin, adminRouter);
export default indexRouter;