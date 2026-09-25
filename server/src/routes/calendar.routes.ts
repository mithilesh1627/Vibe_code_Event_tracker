import { Router, Request, Response, NextFunction } from 'express';
import { GoogleCalendarService } from '../services/googleCalendar.service.js';

const router = Router();

/**
 * POST /api/calendar/google/url
 * Generates an optimized Google Calendar web sync link
 */
router.post('/google/url', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, venue, address, city, date, time, durationHours } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'title and date are required fields.',
      });
    }

    const url = GoogleCalendarService.generateGoogleCalendarUrl({
      title,
      description: description || 'Live Event Attendance',
      venue: venue || 'Event Venue',
      address,
      city,
      date,
      time,
      durationHours,
    });

    return res.status(200).json({
      success: true,
      data: {
        googleCalendarUrl: url,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/calendar/google/sync
 * Syncs event directly to Google Calendar via Google Calendar API v3
 */
router.post('/google/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, event } = req.body;

    if (!event || !event.title || !event.date) {
      return res.status(400).json({
        success: false,
        message: 'Valid event object with title and date is required.',
      });
    }

    if (!accessToken) {
      // If no OAuth accessToken provided, generate and return the direct 1-click Google Calendar URL
      const url = GoogleCalendarService.generateGoogleCalendarUrl(event);
      return res.status(200).json({
        success: true,
        message: 'Direct Google Calendar URL ready.',
        data: {
          googleCalendarUrl: url,
          mode: 'url_redirect',
        },
      });
    }

    // Call Google Calendar API v3 with the provided token
    const result = await GoogleCalendarService.createGoogleCalendarEvent(accessToken, event);

    return res.status(201).json({
      success: true,
      message: 'Event successfully created in Google Calendar!',
      data: result,
    });
  } catch (err: any) {
    // If Google API returns an error (e.g. 401 Invalid Credentials), handle gracefully
    if (err.response?.data) {
      return res.status(err.response.status || 500).json({
        success: false,
        message: err.response.data.error?.message || 'Google Calendar API error',
        details: err.response.data,
      });
    }
    next(err);
  }
});

export default router;
