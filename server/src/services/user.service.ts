import { Types } from 'mongoose';
import { User, IUser, IReminderSettings } from '../models/User.js';
import { RSVP } from '../models/RSVP.js';
import { Invite } from '../models/Invite.js';

export interface UpdateProfileDTO {
  name?: string;
  avatar?: string;
}

export class UserService {
  /**
   * Retrieves user profile along with aggregated activity statistics
   */
  public static async getUserProfile(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const user = await User.findById(userObjectId).select('-passwordHash');
    if (!user) {
      const err = new Error('User not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const now = new Date();

    const [upcomingCount, pastCount, totalInvites, totalInviteClicks] = await Promise.all([
      RSVP.countDocuments({ userId: userObjectId, eventDate: { $gte: now } }),
      RSVP.countDocuments({ userId: userObjectId, eventDate: { $lt: now } }),
      Invite.countDocuments({ creatorUserId: userObjectId }),
      Invite.aggregate([
        { $match: { creatorUserId: userObjectId } },
        { $group: { _id: null, totalClicks: { $sum: '$clicks' } } },
      ]),
    ]);

    const clicksCount = totalInviteClicks[0]?.totalClicks || 0;

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        reminderSettings: user.reminderSettings,
        createdAt: user.createdAt,
      },
      stats: {
        upcomingEvents: upcomingCount,
        pastEvents: pastCount,
        totalEvents: upcomingCount + pastCount,
        invitesCreated: totalInvites,
        friendsReferredClicks: clicksCount,
      },
    };
  }

  /**
   * Updates basic user profile info (name, avatar)
   */
  public static async updateProfile(userId: string, dto: UpdateProfileDTO) {
    const userObjectId = new Types.ObjectId(userId);
    const updates: Partial<IUser> = {};

    if (dto.name) updates.name = dto.name.trim();
    if (dto.avatar !== undefined) updates.avatar = dto.avatar.trim();

    const user = await User.findByIdAndUpdate(userObjectId, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      const err = new Error('User not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    return user;
  }

  /**
   * Updates user event reminder preferences
   */
  public static async updateReminderSettings(userId: string, settings: Partial<IReminderSettings>) {
    const userObjectId = new Types.ObjectId(userId);

    const user = await User.findById(userObjectId);
    if (!user) {
      const err = new Error('User not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    if (settings.emailEnabled !== undefined) {
      user.reminderSettings.emailEnabled = settings.emailEnabled;
    }
    if (settings.pushEnabled !== undefined) {
      user.reminderSettings.pushEnabled = settings.pushEnabled;
    }
    if (settings.reminderHoursBefore !== undefined) {
      user.reminderSettings.reminderHoursBefore = settings.reminderHoursBefore;
    }

    await user.save();

    return user.reminderSettings;
  }
}
