import { apiClient } from './api.js';
import { InviteDetails, TrackClickResponse, FriendsAttendingResponse } from '../types/invite.types.js';
import { getVisitorIdentifier } from '../utils/visitor.utils.js';

export const inviteService = {
  createInvite: (eventId: string) => {
    return apiClient<{ inviteCode: string; eventId: string; clicks: number }>(`/events/${eventId}/invite`, {
      method: 'POST',
    });
  },

  getInviteByCode: (inviteCode: string) => {
    return apiClient<InviteDetails>(`/invites/${inviteCode}`, {
      method: 'GET',
    });
  },

  trackClick: (inviteCode: string) => {
    const visitorId = getVisitorIdentifier();
    return apiClient<TrackClickResponse>(`/invites/${inviteCode}/click`, {
      method: 'POST',
      body: JSON.stringify({ visitorId }),
    });
  },

  getFriendsAttending: (eventId: string) => {
    return apiClient<FriendsAttendingResponse>(`/events/${eventId}/friends-attending`, {
      method: 'GET',
    });
  },
};
