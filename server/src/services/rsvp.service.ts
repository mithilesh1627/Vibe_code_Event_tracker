import { Types } from 'mongoose';
import { RSVP, IRSVP } from '../models/RSVP.js';
import { InviteService } from './invite.service.js';

export interface CreateRSVPDTO {
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string | Date;
  venue: string;
  eventImage?: string;
  referredByInviteCode?: string;
}

export class RSVPService {
  /**
   * Creates an RSVP record, preventing duplicate attendance
   */
  public static async createRSVP(dto: CreateRSVPDTO): Promise<{ rsvp: IRSVP; inviteCode: string }> {
    const userObjectId = new Types.ObjectId(dto.userId);

    // Check if duplicate RSVP already exists
    const existing = await RSVP.findOne({
      userId: userObjectId,
      eventId: dto.eventId,
    });

    if (existing) {
      const err = new Error('You have already RSVPed to this event.');
      (err as any).statusCode = 409;
      throw err;
    }

    const rsvp = await RSVP.create({
      userId: userObjectId,
      eventId: dto.eventId,
      eventTitle: dto.eventTitle,
      eventDate: new Date(dto.eventDate),
      venue: dto.venue,
      eventImage: dto.eventImage || '',
      referredByInviteCode: dto.referredByInviteCode || '',
      createdAt: new Date(),
    });

    // Auto-generate or retrieve user's invite link for this event
    const invite = await InviteService.getOrCreateInvite(dto.userId, dto.eventId);

    return {
      rsvp,
      inviteCode: invite.inviteCode,
    };
  }

  /**
   * Cancels an existing RSVP
   */
  public static async cancelRSVP(userId: string, eventId: string): Promise<boolean> {
    const userObjectId = new Types.ObjectId(userId);
    const result = await RSVP.findOneAndDelete({
      userId: userObjectId,
      eventId: eventId,
    });

    if (!result) {
      const err = new Error('RSVP not found or already cancelled.');
      (err as any).statusCode = 404;
      throw err;
    }

    return true;
  }

  /**
   * Gets all RSVPs for a user categorized by Upcoming and Past
   */
  public static async getUserRSVPs(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const rsvps = await RSVP.find({ userId: userObjectId }).sort({ eventDate: 1 });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Map through RSVPs and attach user's invite codes and referral stats
    const enriched = await Promise.all(
      rsvps.map(async (item) => {
        const invite = await InviteService.getOrCreateInvite(userId, item.eventId);
        const friendsCount = await InviteService.getFriendsAttendingCount(item.eventId);
        const referredFriendsCount = await RSVP.countDocuments({
          referredByInviteCode: invite.inviteCode,
        });

        return {
          id: item._id.toString(),
          eventId: item.eventId,
          eventTitle: item.eventTitle,
          eventDate: item.eventDate,
          venue: item.venue,
          eventImage: item.eventImage,
          createdAt: item.createdAt,
          inviteCode: invite.inviteCode,
          inviteClicks: invite.clicks,
          referredFriendsCount,
          friendsAttendingCount: friendsCount,
        };
      })
    );

    const upcoming = enriched.filter((r) => new Date(r.eventDate) >= startOfToday);
    const past = enriched.filter((r) => new Date(r.eventDate) < startOfToday);

    return {
      upcoming,
      past,
      total: enriched.length,
    };
  }

  /**
   * Checks if a user has RSVPed to a specific event
   */
  public static async isUserRSVPed(userId: string, eventId: string): Promise<boolean> {
    const userObjectId = new Types.ObjectId(userId);
    const count = await RSVP.countDocuments({ userId: userObjectId, eventId });
    return count > 0;
  }

  /**
   * Counts total RSVPs for an event
   */
  public static async getAttendeeCount(eventId: string): Promise<number> {
    return await RSVP.countDocuments({ eventId });
  }
}
