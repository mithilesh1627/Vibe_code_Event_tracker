import { Request, Response, NextFunction } from 'express';
import { RSVPService } from '../services/rsvp.service.js';
import { TicketmasterService } from '../services/ticketmaster.service.js';

export class RSVPController {
  public static async createRSVP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = (req as any).user.userId;
      const { eventTitle, eventDate, venue, eventImage } = req.body;

      // If details not fully supplied in body, fetch from Ticketmaster service
      let title = eventTitle;
      let date = eventDate;
      let venueName = venue;
      let image = eventImage;

      if (!title || !date || !venueName) {
        const event = await TicketmasterService.getEventById(eventId);
        if (event) {
          title = title || event.title;
          date = date || event.date;
          venueName = venueName || `${event.venue}, ${event.city}`;
          image = image || event.imageUrl;
        }
      }

      if (!title || !date) {
        res.status(400).json({
          success: false,
          message: 'Event title and event date are required to RSVP.',
        });
        return;
      }

      const result = await RSVPService.createRSVP({
        userId,
        eventId,
        eventTitle: title,
        eventDate: date,
        venue: venueName || 'Venue to be announced',
        eventImage: image,
      });

      res.status(201).json({
        success: true,
        message: 'RSVP confirmed successfully! You can now invite your friends.',
        data: {
          rsvp: result.rsvp,
          inviteCode: result.inviteCode,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async cancelRSVP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = (req as any).user.userId;

      await RSVPService.cancelRSVP(userId, eventId);

      res.status(200).json({
        success: true,
        message: 'RSVP cancelled successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMyRSVPs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const rsvps = await RSVPService.getUserRSVPs(userId);

      res.status(200).json({
        success: true,
        data: rsvps,
      });
    } catch (err) {
      next(err);
    }
  }
}
