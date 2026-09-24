import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Share2, Trash2, BookmarkCheck, ArrowRight } from 'lucide-react';
import { useMyRSVPs, useCancelRSVP } from '../hooks/useRSVP.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatDate } from '../utils/date.utils.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { InviteModal } from '../components/invite/InviteModal.js';
import { RSVPItem } from '../types/rsvp.types.js';
import { EventItem } from '../types/event.types.js';

export const MyEventsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [currentInviteCode, setCurrentInviteCode] = useState('');

  const { data, isLoading } = useMyRSVPs();
  const cancelRSVPMutation = useCancelRSVP();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <BookmarkCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to view your RSVPs</h2>
        <p className="text-sm text-slate-500 mb-6">
          Track upcoming performances, manage your RSVP status, and share friend invite links.
        </p>
        <Link to="/login?redirect=/my-events">
          <Button variant="primary">Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  const handleCancel = async (eventId: string, title: string) => {
    if (window.confirm(`Are you sure you want to cancel your RSVP for "${title}"?`)) {
      try {
        await cancelRSVPMutation.mutateAsync(eventId);
        success('RSVP Cancelled', `You are no longer registered for "${title}".`);
      } catch (err: any) {
        error(err.message || 'Could not cancel RSVP.');
      }
    }
  };

  const handleShare = (rsvp: RSVPItem) => {
    const syntheticEvent: EventItem = {
      id: rsvp.eventId,
      title: rsvp.eventTitle,
      description: '',
      date: typeof rsvp.eventDate === 'string' ? rsvp.eventDate.split('T')[0] : '',
      time: '19:00',
      venue: rsvp.venue,
      address: '',
      city: '',
      category: 'Live Event',
      imageUrl: rsvp.eventImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      ticketUrl: '',
      status: 'active',
      friendsAttendingCount: rsvp.friendsAttendingCount,
    };

    setSelectedEvent(syntheticEvent);
    setCurrentInviteCode(rsvp.inviteCode);
    setInviteModalOpen(true);
  };

  const upcoming = data?.upcoming || [];
  const past = data?.past || [];
  const displayList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookmarkCheck className="w-8 h-8 text-indigo-600" />
            My RSVPs & Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your registered events, generate invite links, or cancel reservations.
          </p>
        </div>

        <Link to="/">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Discover More Events
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Upcoming Events</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            {upcoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'past'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Past Events</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {past.length}
          </span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse p-6" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayList.length === 0 && (
        <EmptyState
          title={activeTab === 'upcoming' ? 'No upcoming RSVPs' : 'No past events'}
          description={
            activeTab === 'upcoming'
              ? "You haven't RSVPed to any upcoming events yet. Explore concerts, theater, and sports to get started!"
              : 'You have no recorded event attendance in your history yet.'
          }
          actionText={activeTab === 'upcoming' ? 'Explore Events' : undefined}
          onAction={() => navigate('/')}
        />
      )}

      {/* Events List */}
      {!isLoading && displayList.length > 0 && (
        <div className="space-y-4">
          {displayList.map((rsvp: RSVPItem) => (
            <div
              key={rsvp.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              {/* Event Info */}
              <div className="flex items-start gap-4">
                {rsvp.eventImage ? (
                  <img
                    src={rsvp.eventImage}
                    alt={rsvp.eventTitle}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Calendar className="w-8 h-8" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant={activeTab === 'upcoming' ? 'success' : 'secondary'} size="sm">
                      {activeTab === 'upcoming' ? 'Confirmed RSVP' : 'Attended'}
                    </Badge>

                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {rsvp.friendsAttendingCount} friends attending
                    </span>
                  </div>

                  <Link
                    to={`/events/${rsvp.eventId}`}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                  >
                    {rsvp.eventTitle}
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(rsvp.eventDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {rsvp.venue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                  onClick={() => handleShare(rsvp)}
                >
                  Invite Friends
                </Button>

                {activeTab === 'upcoming' && (
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    isLoading={
                      cancelRSVPMutation.isPending &&
                      cancelRSVPMutation.variables === rsvp.eventId
                    }
                    onClick={() => handleCancel(rsvp.eventId, rsvp.eventTitle)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
