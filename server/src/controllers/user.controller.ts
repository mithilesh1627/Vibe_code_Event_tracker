import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const profile = await UserService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { name, avatar } = req.body;

      const updated = await UserService.updateProfile(userId, { name, avatar });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { emailEnabled, pushEnabled, reminderHoursBefore } = req.body;

      const settings = await UserService.updateReminderSettings(userId, {
        emailEnabled,
        pushEnabled,
        reminderHoursBefore,
      });

      res.status(200).json({
        success: true,
        message: 'Reminder preferences updated successfully.',
        data: settings,
      });
    } catch (err) {
      next(err);
    }
  }
}
