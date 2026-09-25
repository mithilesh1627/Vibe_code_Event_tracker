export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue: string;
  address: string;
  city: string;
  state?: string;
  category: string;
  genre?: string;
  imageUrl: string;
  ticketUrl: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  status: 'active' | 'cancelled' | 'postponed';
  friendsAttendingCount: number;
  isRSVPed?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface EventsResponse {
  events: EventItem[];
  total: number;
  page: number;
  totalPages: number;
  isMockData: boolean;
}

export interface CalendarDaySummary {
  date: string;
  count: number;
  titles: string[];
}

export interface CalendarResponse {
  year: number;
  month: number;
  dates: CalendarDaySummary[];
}

export interface EventFilterState {
  keyword: string;
  city: string;
  category: string;
  date: string;
}
