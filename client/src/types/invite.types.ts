import { EventItem } from './event.types.js';

export interface InviteDetails {
  inviteCode: string;
  eventId: string;
  clicks: number;
  uniqueVisitors: number;
  createdAt: string;
  inviter: {
    id: string;
    name: string;
    avatar: string;
  };
  event: EventItem;
  friendsAttendingCount: number;
}

export interface TrackClickResponse {
  tracked: boolean;
  totalClicks: number;
}

export interface FriendsAttendingResponse {
  eventId: string;
  friendsAttendingCount: number;
  recentAttendees: Array<{
    userId: string;
    name: string;
    avatar?: string;
    rsvpDate: string;
  }>;
}
