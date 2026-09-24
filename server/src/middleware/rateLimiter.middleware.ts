import rateLimit from 'express-rate-limit';

/**
 * Rate limiter specifically for invite click tracking endpoints
 * Protects against bot spam and DDoS on referral links
 */
export const inviteClickLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 click records per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many invite link interactions from this IP, please try again later.',
  },
});

/**
 * Rate limiter for sensitive auth endpoints (login/register)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limit each IP to 30 authentication attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in a few minutes.',
  },
});
