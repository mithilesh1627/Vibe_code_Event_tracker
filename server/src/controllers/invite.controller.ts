import { Request, Response, NextFunction } from 'express';
import { InviteService } from '../services/invite.service.js';
import crypto from 'crypto';

export class InviteController {
  /**
   * Generates or fetches user's invite link for an event
   */
  public static async createInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = (req as any).user.userId;

      const invite = await InviteService.getOrCreateInvite(userId, eventId);

      res.status(200).json({
        success: true,
        data: {
          inviteCode: invite.inviteCode,
          eventId: invite.eventId,
          clicks: invite.clicks,
          createdAt: invite.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Gets invite details for the public invite landing page (/invite/:inviteCode)
   */
  public static async getInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { inviteCode } = req.params;
      const inviteData = await InviteService.getInviteByCode(inviteCode);

      res.status(200).json({
        success: true,
        data: inviteData,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Records an invite click with duplicate protection
   */
  public static async trackClick(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { inviteCode } = req.params;

      // Extract or compute a reliable visitor identifier
      // Priority: visitorId from client request header / body, or hash of IP + User-Agent
      let visitorIdentifier = req.body?.visitorId || (req.headers['x-visitor-id'] as string);

      if (!visitorIdentifier) {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
        const userAgent = req.headers['user-agent'] || 'unknown-ua';
        visitorIdentifier = crypto
          .createHash('sha256')
          .update(`${clientIp}-${userAgent}`)
          .digest('hex')
          .slice(0, 24);
      }

      const result = await InviteService.recordClick(inviteCode, visitorIdentifier);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Fetches friends attending count for an event
   */
  public static async getFriendsAttending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const [count, recentAttendees] = await Promise.all([
        InviteService.getFriendsAttendingCount(eventId),
        InviteService.getRecentAttendees(eventId, 5),
      ]);

      res.status(200).json({
        success: true,
        data: {
          eventId,
          friendsAttendingCount: count,
          recentAttendees,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
