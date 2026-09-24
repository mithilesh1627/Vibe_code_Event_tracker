import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Share2, Check } from 'lucide-react';
import { EventItem } from '../../types/event.types.js';
import { formatDate, formatTime } from '../../utils/date.utils.js';
import { Badge } from '../common/Badge.js';
import { Button } from '../common/Button.js';

interface EventCardProps {
  event: EventItem;
  onRSVP: (event: EventItem) => void;
  onShare: (event: EventItem) => void;
  isRSVPing?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRSVP,
  onShare,
  isRSVPing = false,
}) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Card Header & Image */}
      <div>
        <div className="relative w-full h-48 overflow-hidden bg-slate-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-white border border-white/10 shadow-sm">
              {event.category}
            </span>
          </div>

          {/* Share Button on Image */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShare(event);
            }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-indigo-600 hover:bg-white shadow-sm transition-all focus:outline-none"
            title="Invite friends"
            aria-label="Share event"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Friends Attending Badge Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>🎉 {event.friendsAttendingCount} friends attending</span>
            </div>

            {event.minPrice && (
              <span className="text-xs font-semibold text-white bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg">
                From ${event.minPrice}
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Date & Time Row */}
          <div className="flex items-center gap-3 text-xs font-medium text-indigo-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(event.date)}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(event.time)}
            </span>
          </div>

          {/* Title */}
          <Link to={`/events/${event.id}`} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug tracking-tight mb-2">
              {event.title}
            </h3>
          </Link>

          {/* Venue & City */}
          <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">
              {event.venue}, {event.city} {event.state ? `(${event.state})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-5 pt-0 border-t border-slate-100 flex items-center gap-2">
        <Link to={`/events/${event.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Details
          </Button>
        </Link>

        {event.isRSVPed ? (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={() => onShare(event)}
          >
            RSVP'd • Share
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            isLoading={isRSVPing}
            onClick={() => onRSVP(event)}
          >
            RSVP / Attend
          </Button>
        )}
      </div>
    </div>
  );
};
