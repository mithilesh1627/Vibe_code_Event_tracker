import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/event.service.js';
import { EventFilterState } from '../types/event.types.js';
import { useAuth } from '../context/AuthContext.js';

export const useEvents = (filters: Partial<EventFilterState> & { page?: number; size?: number; startDate?: string; endDate?: string }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['events', filters, user?.id || 'guest'],
    queryFn: () => eventService.getEvents(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useEventDetails = (id?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['event', id, user?.id || 'guest'],
    queryFn: () => eventService.getEventById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
};

export const useCalendarEvents = (year: number, month: number) => {
  return useQuery({
    queryKey: ['calendar-events', year, month],
    queryFn: () => eventService.getCalendarEvents(year, month),
    staleTime: 1000 * 60 * 5,
  });
};
