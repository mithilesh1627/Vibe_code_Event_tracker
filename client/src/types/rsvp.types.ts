export interface RSVPItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  eventImage?: string;
  createdAt: string;
  inviteCode: string;
  friendsAttendingCount: number;
}

export interface UserRSVPResponse {
  upcoming: RSVPItem[];
  past: RSVPItem[];
  total: number;
}

export interface CreateRSVPResponse {
  rsvp: {
    _id: string;
    userId: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    venue: string;
    eventImage?: string;
    createdAt: string;
  };
  inviteCode: string;
}
