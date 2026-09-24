import React from 'react';
import { EventItem } from '../../types/event.types.js';
import { EventCard } from './EventCard.js';
import { EventSkeleton } from './EventSkeleton.js';
import { EmptyState } from '../common/EmptyState.js';

interface EventGridProps {
  events: EventItem[];
  isLoading: boolean;
  onRSVP: (event: EventItem) => void;
  onShare: (event: EventItem) => void;
  rsvpLoadingEventId?: string | null;
  onResetFilters?: () => void;
}

export const EventGrid: React.FC<EventGridProps> = ({
  events,
  isLoading,
  onRSVP,
  onShare,
  rsvpLoadingEventId,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events found"
        description="We couldn't find any events matching your criteria. Try adjusting your search query, location, category, or selected date."
        actionText={onResetFilters ? 'Clear all filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onRSVP={onRSVP}
          onShare={onShare}
          isRSVPing={rsvpLoadingEventId === event.id}
        />
      ))}
    </div>
  );
};
