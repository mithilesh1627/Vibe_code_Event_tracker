import crypto from 'crypto';

/**
 * Generates a clean, URL-safe random alphanumeric invite code
 * e.g., "7f9a2b4c"
 */
export const generateInviteCode = (length = 8): string => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};
