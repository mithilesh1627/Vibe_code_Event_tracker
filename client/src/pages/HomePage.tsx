import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/events/HeroSection.js';
import { EventCalendar } from '../components/calendar/EventCalendar.js';
import { EventFilters } from '../components/events/EventFilters.js';
import { EventGrid } from '../components/events/EventGrid.js';
import { InviteModal } from '../components/invite/InviteModal.js';
import { useEvents } from '../hooks/useEvents.js';
import { useCreateRSVP } from '../hooks/useRSVP.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { EventItem } from '../types/event.types.js';
import { inviteService } from '../services/invite.service.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  // Search & filter states
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [currentInviteCode, setCurrentInviteCode] = useState<string>('');

  // Fetch events using React Query
  const {
    data: eventsData,
    isLoading,
    refetch,
  } = useEvents({
    keyword: keyword || undefined,
    city: city || undefined,
    category: category || undefined,
    date: selectedDate || undefined,
  });

  const createRSVPMutation = useCreateRSVP();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleRSVP = async (event: EventItem) => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate(`/login?redirect=/events/${event.id}`);
      return;
    }

    try {
      const response = await createRSVPMutation.mutateAsync({
        eventId: event.id,
        payload: {
          eventTitle: event.title,
          eventDate: event.date,
          venue: `${event.venue}, ${event.city}`,
          eventImage: event.imageUrl,
        },
      });

      success('🎉 RSVP Confirmed!', 'Invite your friends now to join you.');

      // Open invite modal with generated code
      setSelectedEvent(event);
      setCurrentInviteCode(response.inviteCode);
      setInviteModalOpen(true);
    } catch (err: any) {
      error(err.message || 'Failed to RSVP. You might already be registered.');
    }
  };

  const handleShare = async (event: EventItem) => {
    if (!isAuthenticated) {
      // If guest user wants to share, we can fetch or create a guest-friendly link or direct to event page
      navigate(`/events/${event.id}`);
      return;
    }

    try {
      // Fetch or create user's invite code for this event
      const res = await inviteService.createInvite(event.id);
      setSelectedEvent(event);
      setCurrentInviteCode(res.inviteCode);
      setInviteModalOpen(true);
    } catch {
      // Fallback
      setSelectedEvent(event);
      setCurrentInviteCode('gp' + event.id.substring(0, 6));
      setInviteModalOpen(true);
    }
  };

  const handleClearFilters = () => {
    setKeyword('');
    setCity('');
    setCategory('');
    setSelectedDate('');
  };

  return (
    <div>
      {/* Hero section */}
      <HeroSection
        keyword={keyword}
        onKeywordChange={setKeyword}
        city={city}
        onCityChange={setCity}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Monthly Interactive Calendar */}
      <EventCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Discovery Section Header & Category Filters */}
      <div id="events-feed" className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Live Events</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated performances, athletic matches, and cultural festivals.
            </p>
          </div>
        </div>

        <EventFilters
          category={category}
          onCategoryChange={setCategory}
          selectedDate={selectedDate}
          onClearDate={() => setSelectedDate('')}
          totalEvents={eventsData?.total || 0}
        />

        {/* Events Grid */}
        <EventGrid
          events={eventsData?.events || []}
          isLoading={isLoading}
          onRSVP={handleRSVP}
          onShare={handleShare}
          rsvpLoadingEventId={createRSVPMutation.isPending ? createRSVPMutation.variables?.eventId : null}
          onResetFilters={handleClearFilters}
        />
      </div>

      {/* Share / Invite Friends Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        event={selectedEvent}
        inviteCode={currentInviteCode}
      />
    </div>
  );
};
