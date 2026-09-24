import { Router } from 'express';
import { z } from 'zod';
import { UserController } from '../controllers/user.controller.js';
import { RSVPController } from '../controllers/rsvp.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().optional(),
});

const updateRemindersSchema = z.object({
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  reminderHoursBefore: z.number().min(1).max(168).optional(),
});

// All user routes require authentication
router.use(authenticateToken);

// User profile and activity statistics
router.get('/me', UserController.getProfile);
router.patch('/me', validateBody(updateProfileSchema), UserController.updateProfile);
router.patch('/me/reminders', validateBody(updateRemindersSchema), UserController.updateReminders);

// My Events / RSVPs dashboard
router.get('/me/rsvps', RSVPController.getMyRSVPs);

export default router;
