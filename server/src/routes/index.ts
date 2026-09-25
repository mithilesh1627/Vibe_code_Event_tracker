import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import inviteRoutes from './invite.routes.js';
import userRoutes from './user.routes.js';
import calendarRoutes from './calendar.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/invites', inviteRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/calendar', calendarRoutes);

export default apiRouter;
