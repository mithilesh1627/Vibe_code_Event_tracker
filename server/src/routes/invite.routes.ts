import { Router } from 'express';
import { InviteController } from '../controllers/invite.controller.js';
import { inviteClickLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Public Invite Landing Page data
router.get('/:inviteCode', InviteController.getInvite);

// Public Invite Link Click tracking (Rate limited and duplicate protected)
router.post('/:inviteCode/click', inviteClickLimiter, InviteController.trackClick);

export default router;
