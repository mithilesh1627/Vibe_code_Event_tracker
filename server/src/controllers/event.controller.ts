import { Request, Response, NextFunction } from 'express';
import { TicketmasterService } from '../services/ticketmaster.service.js';
import { InviteService } from '../services/invite.service.js';
import { RSVPService } from '../services/rsvp.service.js';

export class EventController {
  public static async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keyword, city, category, date, startDate, endDate, page, size } = req.query;

      const results = await TicketmasterService.searchEvents({
        keyword: keyword as string,
        city: city as string,
        category: category as string,
        date: date as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string, 10) : 1,
        size: size ? parseInt(size as string, 10) : 12,
      });

      // Enrich events with Friends Attending count and RSVP status if user is authenticated
      const userId = (req as any).user?.userId;

      const enrichedEvents = await Promise.all(
        results.events.map(async (event) => {
          const friendsAttendingCount = await InviteService.getFriendsAttendingCount(event.id);
          let isRSVPed = false;
          if (userId) {
            isRSVPed = await RSVPService.isUserRSVPed(userId, event.id);
          }
          return {
            ...event,
            friendsAttendingCount,
            isRSVPed,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          events: enrichedEvents,
          total: results.total,
          page: results.page,
          totalPages: results.totalPages,
          isMockData: results.isMockData,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const event = await TicketmasterService.getEventById(id);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found.',
        });
        return;
      }

      const userId = (req as any).user?.userId;
      const [friendsAttendingCount, recentAttendees, isRSVPed] = await Promise.all([
        InviteService.getFriendsAttendingCount(id),
        InviteService.getRecentAttendees(id),
        userId ? RSVPService.isUserRSVPed(userId, id) : Promise.resolve(false),
      ]);

      res.status(200).json({
        success: true,
        data: {
          ...event,
          friendsAttendingCount,
          recentAttendees,
          isRSVPed,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getCalendarEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const now = new Date();
      const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;

      const calendarData = await TicketmasterService.getCalendarEvents(year, month);

      res.status(200).json({
        success: true,
        data: {
          year,
          month,
          dates: calendarData,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
