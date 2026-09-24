import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { RSVPController } from '../controllers/rsvp.controller.js';
import { InviteController } from '../controllers/invite.controller.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Event Discovery
router.get('/', optionalAuthenticateToken, EventController.getEvents);
router.get('/calendar', EventController.getCalendarEvents);
router.get('/:id', optionalAuthenticateToken, EventController.getEventById);

// RSVP on Event
router.post('/:eventId/rsvp', authenticateToken, RSVPController.createRSVP);
router.delete('/:eventId/rsvp', authenticateToken, RSVPController.cancelRSVP);

// Event Invites and Friend Attendance
router.post('/:eventId/invite', authenticateToken, InviteController.createInvite);
router.get('/:eventId/friends-attending', InviteController.getFriendsAttending);

export default router;
