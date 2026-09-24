import { apiClient } from './api.js';
import { EventItem, EventsResponse, CalendarResponse, EventFilterState } from '../types/event.types.js';

export const eventService = {
  getEvents: (filters: Partial<EventFilterState> & { page?: number; size?: number; startDate?: string; endDate?: string }) => {
    return apiClient<EventsResponse>('/events', {
      method: 'GET',
      params: {
        keyword: filters.keyword,
        city: filters.city,
        category: filters.category,
        date: filters.date,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page,
        size: filters.size,
      },
    });
  },

  getEventById: (id: string) => {
    return apiClient<EventItem & { recentAttendees?: any[] }>(`/events/${id}`, {
      method: 'GET',
    });
  },

  getCalendarEvents: (year: number, month: number) => {
    return apiClient<CalendarResponse>('/events/calendar', {
      method: 'GET',
      params: { year, month },
    });
  },
};
