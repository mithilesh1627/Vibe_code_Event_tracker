import axios from 'axios';

export interface GoogleCalendarEventPayload {
  title: string;
  description: string;
  venue: string;
  address?: string;
  city?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  durationHours?: number;
  attendeeEmail?: string;
}

export class GoogleCalendarService {
  /**
   * Generates a pre-filled Google Calendar event URL
   */
  public static generateGoogleCalendarUrl(payload: GoogleCalendarEventPayload): string {
    const [year, month, day] = payload.date.split('-').map(Number);
    const [hours, minutes] = (payload.time || '19:00').split(':').map(Number);

    const start = new Date(Date.UTC(year, (month || 1) - 1, day || 1, hours || 19, minutes || 0, 0));
    const duration = (payload.durationHours || 2.5) * 60 * 60 * 1000;
    const end = new Date(start.getTime() + duration);

    const formatUtc = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const locationParts = [payload.venue, payload.address, payload.city].filter(Boolean);
    const location = locationParts.join(', ');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: payload.title,
      dates: `${formatUtc(start)}/${formatUtc(end)}`,
      details: `${payload.description}\n\n🎟️ RSVP Confirmed via GatherPulse Event Discovery Platform.`,
      location,
    });

    if (payload.attendeeEmail) {
      params.append('add', payload.attendeeEmail);
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Directly creates an event in a user's Google Calendar via Google Calendar API v3
   * Requires a valid Google OAuth access token with calendar.events scope
   */
  public static async createGoogleCalendarEvent(
    accessToken: string,
    payload: GoogleCalendarEventPayload
  ): Promise<any> {
    const [year, month, day] = payload.date.split('-').map(Number);
    const [hours, minutes] = (payload.time || '19:00').split(':').map(Number);

    const start = new Date(Date.UTC(year, (month || 1) - 1, day || 1, hours || 19, minutes || 0, 0));
    const duration = (payload.durationHours || 2.5) * 60 * 60 * 1000;
    const end = new Date(start.getTime() + duration);

    const location = [payload.venue, payload.address, payload.city].filter(Boolean).join(', ');

    const eventBody = {
      summary: payload.title,
      location,
      description: `${payload.description}\n\n🎟️ Managed via GatherPulse Platform`,
      start: {
        dateTime: start.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 * 24 }, // 1 day before
          { method: 'popup', minutes: 120 }, // 2 hours before
        ],
      },
    };

    const response = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      eventBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }
}
