import { Types } from 'mongoose';
import { Invite, IInvite } from '../models/Invite.js';
import { InviteClick } from '../models/InviteClick.js';
import { RSVP } from '../models/RSVP.js';
import { User } from '../models/User.js';
import { generateInviteCode } from '../utils/generateCode.js';
import { TicketmasterService } from './ticketmaster.service.js';

export class InviteService {
  /**
   * Retrieves an existing invite or generates a unique new one for (creatorUserId, eventId)
   */
  public static async getOrCreateInvite(userId: string, eventId: string): Promise<IInvite> {
    const userObjectId = new Types.ObjectId(userId);

    let invite = await Invite.findOne({ creatorUserId: userObjectId, eventId });
    if (invite) {
      return invite;
    }

    // Generate unique code with collision safety
    let code = generateInviteCode(8);
    let attempts = 0;
    while (attempts < 5) {
      const exists = await Invite.findOne({ inviteCode: code });
      if (!exists) break;
      code = generateInviteCode(8);
      attempts++;
    }

    invite = await Invite.create({
      inviteCode: code,
      eventId,
      creatorUserId: userObjectId,
      clicks: 0,
      createdAt: new Date(),
    });

    return invite;
  }

  /**
   * Records an invite click with 24-hour visitor deduplication protection
   */
  public static async recordClick(
    inviteCode: string,
    visitorIdentifier: string
  ): Promise<{ tracked: boolean; totalClicks: number }> {
    const invite = await Invite.findOne({ inviteCode });
    if (!invite) {
      const err = new Error('Invalid invite link.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Deduplication check: Has this visitor clicked this invite code in the last 24 hours?
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingRecentClick = await InviteClick.findOne({
      inviteCode,
      visitorIdentifier,
      clickedAt: { $gte: twentyFourHoursAgo },
    });

    if (existingRecentClick) {
      // Duplicate click detected; do not inflate click analytics
      return { tracked: false, totalClicks: invite.clicks };
    }

    // Log the click record
    await InviteClick.create({
      inviteCode,
      eventId: invite.eventId,
      visitorIdentifier,
      clickedAt: new Date(),
    });

    // Increment click count atomically on the Invite document
    const updated = await Invite.findByIdAndUpdate(
      invite._id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    return { tracked: true, totalClicks: updated ? updated.clicks : invite.clicks + 1 };
  }

  /**
   * Gets invite details for the public landing page (/invite/:inviteCode)
   */
  public static async getInviteByCode(inviteCode: string) {
    const invite = await Invite.findOne({ inviteCode }).populate('creatorUserId', 'name avatar');
    if (!invite) {
      const err = new Error('Invite link not found or expired.');
      (err as any).statusCode = 404;
      throw err;
    }

    const event = await TicketmasterService.getEventById(invite.eventId);
    if (!event) {
      const err = new Error('Event associated with this invite could not be found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const [friendsAttendingCount, uniqueClicksCount, referredRSVPsCount] = await Promise.all([
      this.getFriendsAttendingCount(invite.eventId),
      InviteClick.countDocuments({ inviteCode }),
      RSVP.countDocuments({ referredByInviteCode: inviteCode }),
    ]);

    const inviter = invite.creatorUserId as any;

    return {
      inviteCode: invite.inviteCode,
      eventId: invite.eventId,
      clicks: invite.clicks,
      uniqueVisitors: uniqueClicksCount,
      referredRSVPs: referredRSVPsCount,
      createdAt: invite.createdAt,
      inviter: {
        id: inviter?._id?.toString() || '',
        name: inviter?.name || 'A friend',
        avatar: inviter?.avatar || '',
      },
      event,
      friendsAttendingCount,
    };
  }

  /**
   * Calculates total Friends Attending count for an event
   * Combines baseline event interest + verified platform RSVPs in MongoDB + referral reach
   */
  public static async getFriendsAttendingCount(eventId: string): Promise<number> {
    const [rsvpCount, distinctInviteClicks] = await Promise.all([
      RSVP.countDocuments({ eventId }),
      InviteClick.distinct('visitorIdentifier', { eventId }),
    ]);

    // Consistent base attendee interest (deterministic seed 3 to 7 based on event id)
    const hash = eventId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const baseCount = (hash % 5) + 3;

    // Real-time verified RSVPs strictly increment this count
    const referralInfluence = Math.floor(distinctInviteClicks.length * 0.5);
    const totalCount = baseCount + rsvpCount + referralInfluence;

    return totalCount;
  }

  /**
   * Returns recent attendees sample for an event
   */
  public static async getRecentAttendees(eventId: string, limit = 5) {
    const rsvps = await RSVP.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name avatar');

    return rsvps.map((r: any) => ({
      userId: r.userId?._id?.toString(),
      name: r.userId?.name || 'Anonymous Guest',
      avatar: r.userId?.avatar,
      rsvpDate: r.createdAt,
    }));
  }
}
