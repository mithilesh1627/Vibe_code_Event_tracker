import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  ExternalLink,
  ChevronLeft,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { useEventDetails } from '../hooks/useEvents.js';
import { useCreateRSVP, useCancelRSVP } from '../hooks/useRSVP.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatDate, formatTime } from '../utils/date.utils.js';
import { Button } from '../components/common/Button.js';
import { InviteModal } from '../components/invite/InviteModal.js';
import { inviteService } from '../services/invite.service.js';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const { data: event, isLoading, error: queryError } = useEventDetails(id);
  const createRSVPMutation = useCreateRSVP();
  const cancelRSVPMutation = useCancelRSVP();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-8 w-32 bg-slate-200 rounded-xl" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
        <div className="h-10 w-2/3 bg-slate-200 rounded-xl" />
        <div className="h-24 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (queryError || !event) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The event you are looking for does not exist or may have expired.
        </p>
        <Link to="/">
          <Button variant="primary">Back to Discover</Button>
        </Link>
      </div>
    );
  }

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${event.id}`);
      return;
    }

    try {
      const res = await createRSVPMutation.mutateAsync({
        eventId: event.id,
        payload: {
          eventTitle: event.title,
          eventDate: event.date,
          venue: `${event.venue}, ${event.city}`,
          eventImage: event.imageUrl,
        },
      });

      success('🎉 RSVP Confirmed!', "You're registered for this event. Invite friends now!");
      setInviteCode(res.inviteCode);
      setInviteModalOpen(true);
    } catch (err: any) {
      error(err.message || 'Unable to complete RSVP.');
    }
  };

  const handleCancelRSVP = async () => {
    try {
      await cancelRSVPMutation.mutateAsync(event.id);
      success('RSVP Cancelled', 'Your registration has been removed.');
    } catch (err: any) {
      error(err.message || 'Could not cancel RSVP.');
    }
  };

  const handleOpenInvite = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/events/${event.id}`);
      return;
    }

    try {
      const res = await inviteService.createInvite(event.id);
      setInviteCode(res.inviteCode);
      setInviteModalOpen(true);
    } catch {
      setInviteCode('gp' + event.id.substring(0, 6));
      setInviteModalOpen(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to events
      </button>

      {/* Main Event Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
        {/* Hero Image */}
        <div className="relative w-full h-80 sm:h-96 md:h-[420px] bg-slate-900">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Category & Status Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/90 backdrop-blur-md text-slate-900 shadow-sm">
              {event.category}
            </span>
            {event.genre && (
              <span className="px-3 py-1 rounded-xl text-xs font-medium bg-black/60 backdrop-blur-md text-white border border-white/10">
                {event.genre}
              </span>
            )}
          </div>

          {/* Title & Friends Overlay Header */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>🎉 {event.friendsAttendingCount} friends attending</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details & Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Details Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{formatDate(event.date)}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {formatTime(event.time)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{event.venue}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {event.address}, {event.city} {event.state ? `(${event.state})` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">About this Event</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Friends Attending List */}
            {event.recentAttendees && event.recentAttendees.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Recent RSVPs & Friends
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {event.recentAttendees.map((att: any, idx: number) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700"
                    >
                      <img
                        src={
                          att.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(att.name)}`
                        }
                        alt={att.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: RSVP & Invite Action Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100 shadow-sm space-y-5">
              {/* RSVP Status Banner */}
              {event.isRSVPed ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">You're RSVP'd!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your attendance is registered. Ready to bring your friends along?
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Attendance
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">Join this Experience</h3>
                  <p className="text-xs text-slate-500">
                    RSVP to save your spot and unlock your custom invite link.
                  </p>
                </div>
              )}

              {/* Price estimation if present */}
              {event.minPrice && (
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Tickets starting from</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    ${event.minPrice} {event.currency}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {event.isRSVPed ? (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      leftIcon={<Share2 className="w-4 h-4" />}
                      onClick={handleOpenInvite}
                    >
                      Invite Friends
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full"
                      isLoading={cancelRSVPMutation.isPending}
                      onClick={handleCancelRSVP}
                    >
                      Cancel My RSVP
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={createRSVPMutation.isPending}
                      onClick={handleRSVP}
                    >
                      RSVP / Attend Event
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      leftIcon={<Share2 className="w-4 h-4" />}
                      onClick={handleOpenInvite}
                    >
                      Share with Friends
                    </Button>
                  </>
                )}
              </div>

              {/* Ticketmaster external official link */}
              {event.ticketUrl && (
                <div className="pt-4 border-t border-slate-100">
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    View Official Ticketmaster Listing
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Friend Network Callout */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified Attendance Tracking
              </div>
              <p>
                Friends joining via your link will be credited to your group count automatically without inflated duplicate clicks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share / Invite Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        event={event}
        inviteCode={inviteCode}
      />
    </div>
  );
};
