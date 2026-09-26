import axios from 'axios';
import { config } from '../config/index.js';
import { getMockEvents, NormalizedEvent } from '../utils/mockEvents.js';

const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

export interface EventSearchParams {
  keyword?: string;
  city?: string;
  category?: string;
  date?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface EventsResponse {
  events: NormalizedEvent[];
  total: number;
  page: number;
  totalPages: number;
  isMockData: boolean;
}

export class TicketmasterService {
  /**
   * Normalizes raw Ticketmaster API event into the application's clean schema
   */
  private static normalizeTicketmasterEvent(raw: any): NormalizedEvent {
    // Pick the best quality image (prefer 16_9 ratio with highest width)
    let bestImage = '';
    if (raw.images && Array.isArray(raw.images) && raw.images.length > 0) {
      const sorted = [...raw.images].sort((a, b) => (b.width || 0) - (a.width || 0));
      bestImage = sorted[0]?.url || raw.images[0]?.url;
    }

    const venueObj = raw._embedded?.venues?.[0];
    const priceRange = raw.priceRanges?.[0];

    return {
      id: raw.id,
      title: raw.name || 'Untitled Event',
      description:
        raw.description ||
        raw.info ||
        raw.pleaseNote ||
        `Join us for ${raw.name} live! Check ticket options and details for this special performance.`,
      date: raw.dates?.start?.localDate || '',
      time: raw.dates?.start?.localTime ? raw.dates.start.localTime.substring(0, 5) : '19:00',
      venue: venueObj?.name || 'Main Arena',
      address: venueObj?.address?.line1 || 'General Venue Address',
      city: venueObj?.city?.name || 'Local City',
      state: venueObj?.state?.stateCode || '',
      category: raw.classifications?.[0]?.segment?.name || 'General',
      genre: raw.classifications?.[0]?.genre?.name || '',
      imageUrl: bestImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      ticketUrl: raw.url || 'https://www.ticketmaster.com',
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      currency: priceRange?.currency || 'USD',
      status: raw.dates?.status?.code === 'cancelled' ? 'cancelled' : 'active',
      latitude: venueObj?.location?.latitude ? parseFloat(venueObj.location.latitude) : undefined,
      longitude: venueObj?.location?.longitude ? parseFloat(venueObj.location.longitude) : undefined,
    };
  }

  /**
   * Filter local mock events according to query parameters
   */
  private static filterMockEvents(params: EventSearchParams): EventsResponse {
    let results = getMockEvents();

    if (params.keyword) {
      const q = params.keyword.toLowerCase().trim();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    if (params.city) {
      const cityLower = params.city.toLowerCase().trim();
      results = results.filter((e) => e.city.toLowerCase().includes(cityLower));
    }

    if (params.category && params.category !== 'All') {
      const catLower = params.category.toLowerCase().trim();
      results = results.filter((e) => e.category.toLowerCase().includes(catLower));
    }

    if (params.date) {
      results = results.filter((e) => e.date === params.date);
    } else {
      if (params.startDate) {
        results = results.filter((e) => e.date >= params.startDate!);
      }
      if (params.endDate) {
        results = results.filter((e) => e.date <= params.endDate!);
      }
    }

    // Sort by date ascending
    results.sort((a, b) => a.date.localeCompare(b.date));

    const page = params.page || 1;
    const size = params.size || 12;
    const startIndex = (page - 1) * size;
    const paginated = results.slice(startIndex, startIndex + size);

    return {
      events: paginated,
      total: results.length,
      page,
      totalPages: Math.ceil(results.length / size) || 1,
      isMockData: true,
    };
  }

  /**
   * Search events via Ticketmaster API, with graceful fallback to mock data
   */
  public static async searchEvents(params: EventSearchParams): Promise<EventsResponse> {
    const apiKey = config.ticketmasterApiKey;

    // If no API key configured, use mock events immediately
    if (!apiKey || apiKey.trim() === '') {
      return this.filterMockEvents(params);
    }

    try {
      const queryParams: Record<string, any> = {
        apikey: apiKey,
        size: params.size || 12,
        page: (params.page || 1) - 1, // Ticketmaster is 0-indexed
        sort: 'date,asc',
      };

      if (params.keyword) {
        queryParams.keyword = params.keyword;
      }
      if (params.city) {
        queryParams.city = params.city;
      }
      if (params.category && params.category !== 'All') {
        queryParams.classificationName = params.category;
      }
      if (params.date) {
        queryParams.startDateTime = `${params.date}T00:00:00Z`;
        queryParams.endDateTime = `${params.date}T23:59:59Z`;
      } else {
        if (params.startDate) {
          queryParams.startDateTime = `${params.startDate}T00:00:00Z`;
        }
        if (params.endDate) {
          queryParams.endDateTime = `${params.endDate}T23:59:59Z`;
        }
      }

      const response = await axios.get(`${TICKETMASTER_BASE_URL}/events.json`, {
        params: queryParams,
        timeout: 5000,
      });

      const rawEvents = response.data?._embedded?.events || [];
      const pageInfo = response.data?.page || {};

      const normalized = rawEvents.map(this.normalizeTicketmasterEvent);

      return {
        events: normalized,
        total: pageInfo.totalElements || normalized.length,
        page: (pageInfo.number || 0) + 1,
        totalPages: pageInfo.totalPages || 1,
        isMockData: false,
      };
    } catch (error: any) {
      console.warn(`Ticketmaster API request failed (${error.message}). Falling back to internal mock dataset.`);
      return this.filterMockEvents(params);
    }
  }

  /**
   * Fetch single event details by ID
   */
  public static async getEventById(id: string): Promise<NormalizedEvent | null> {
    // Check mock data first if id matches mock pattern
    if (id.startsWith('mock-')) {
      const found = getMockEvents().find((e) => e.id === id);
      return found || null;
    }

    const apiKey = config.ticketmasterApiKey;
    if (!apiKey) {
      const found = getMockEvents().find((e) => e.id === id);
      return found || null;
    }

    try {
      const response = await axios.get(`${TICKETMASTER_BASE_URL}/events/${id}.json`, {
        params: { apikey: apiKey },
        timeout: 5000,
      });

      if (!response.data) return null;
      return this.normalizeTicketmasterEvent(response.data);
    } catch (error: any) {
      console.warn(`Ticketmaster fetch by ID failed (${error.message}). Searching mock list...`);
      return getMockEvents().find((e) => e.id === id) || null;
    }
  }

  /**
   * Fetch events summary for the calendar (dates containing events)
   */
  public static async getCalendarEvents(year: number, month: number): Promise<{ date: string; count: number; titles: string[] }[]> {
    // Month is 1-indexed (1 to 12)
    const monthStr = month.toString().padStart(2, '0');
    const startOfMonth = `${year}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endOfMonth = `${year}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;

    const searchRes = await this.searchEvents({
      startDate: startOfMonth,
      endDate: endOfMonth,
      size: 50,
    });

    const dateMap: Record<string, { count: number; titles: string[] }> = {};

    searchRes.events.forEach((evt) => {
      if (!evt.date) return;
      if (!dateMap[evt.date]) {
        dateMap[evt.date] = { count: 0, titles: [] };
      }
      dateMap[evt.date].count += 1;
      if (dateMap[evt.date].titles.length < 3) {
        dateMap[evt.date].titles.push(evt.title);
      }
    });

    return Object.keys(dateMap).map((date) => ({
      date,
      count: dateMap[date].count,
      titles: dateMap[date].titles,
    }));
  }
}
