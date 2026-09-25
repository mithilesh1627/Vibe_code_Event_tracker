import { EventItem } from '../types/event.types';

/**
 * Parses event date and time into start and end Date objects
 */
function getEventDates(event: EventItem): { start: Date; end: Date } {
  const [year, month, day] = event.date.split('-').map(Number);
  const [hours, minutes] = (event.time || '19:00').split(':').map(Number);

  const start = new Date(year, (month || 1) - 1, day || 1, hours || 19, minutes || 0, 0);
  // Default duration: 2.5 hours
  const end = new Date(start.getTime() + 2.5 * 60 * 60 * 1000);

  return { start, end };
}

/**
 * Formats a Date object to iCalendar/Google UTC format: YYYYMMDDTHHMMSSZ
 */
function formatUtcIso(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Generates a pre-filled Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: EventItem): string {
  const { start, end } = getEventDates(event);
  const startStr = formatUtcIso(start);
  const endStr = formatUtcIso(end);

  const location = [event.venue, event.address, event.city, event.state]
    .filter(Boolean)
    .join(', ');

  const details = `${event.description}\n\n🎟️ Category: ${event.category}\n🌐 Discovered on GatherPulse: ${window.location.origin}/events/${event.id}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates a pre-filled Outlook Web Calendar URL
 */
export function generateOutlookCalendarUrl(event: EventItem): string {
  const { start, end } = getEventDates(event);

  const location = [event.venue, event.address, event.city, event.state]
    .filter(Boolean)
    .join(', ');

  const details = `${event.description}\n\n🎟️ Category: ${event.category}\n🌐 Discovered on GatherPulse: ${window.location.origin}/events/${event.id}`;

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: details,
    location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates and downloads a standard RFC 5545 .ics file for Apple Calendar, Outlook, and others
 */
export function downloadIcsFile(event: EventItem): void {
  const { start, end } = getEventDates(event);
  const startStr = formatUtcIso(start);
  const endStr = formatUtcIso(end);
  const nowStr = formatUtcIso(new Date());

  const location = [event.venue, event.address, event.city, event.state]
    .filter(Boolean)
    .join(', ')
    .replace(/,/g, '\\,');

  const cleanDescription = (event.description || '')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GatherPulse//Event Discovery Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:gatherpulse-${event.id}-${Date.now()}@gatherpulse.app`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${cleanDescription}\\n\\nDiscovered on GatherPulse: ${window.location.origin}/events/${event.id}`,
    `LOCATION:${location}`,
    `URL:${window.location.origin}/events/${event.id}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsBlob = new Blob([icsLines.join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  });

  const downloadUrl = URL.createObjectURL(icsBlob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
