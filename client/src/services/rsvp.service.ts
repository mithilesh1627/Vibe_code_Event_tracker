import { apiClient } from './api.js';
import { CreateRSVPResponse, UserRSVPResponse } from '../types/rsvp.types.js';

export interface CreateRSVPPayload {
  eventTitle?: string;
  eventDate?: string;
  venue?: string;
  eventImage?: string;
}

export const rsvpService = {
  createRSVP: (eventId: string, payload?: CreateRSVPPayload) => {
    return apiClient<CreateRSVPResponse>(`/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  cancelRSVP: (eventId: string) => {
    return apiClient<{ success: boolean; message: string }>(`/events/${eventId}/rsvp`, {
      method: 'DELETE',
    });
  },

  getMyRSVPs: () => {
    return apiClient<UserRSVPResponse>('/users/me/rsvps', {
      method: 'GET',
    });
  },
};
