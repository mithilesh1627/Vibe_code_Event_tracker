import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useInviteDetails, useTrackInviteClick } from '../hooks/useInvite.js';
import { useCreateRSVP } from '../hooks/useRSVP.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatDate, formatTime } from '../utils/date.utils.js';
import { Button } from '../components/common/Button.js';

export const InviteLandingPage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { success, error } = useToast();

  const [rsvpCompleted, setRsvpCompleted] = useState(false);

  const { data: invite, isLoading, error: inviteError } = useInviteDetails(inviteCode);
  const trackClickMutation = useTrackInviteClick();
  const createRSVPMutation = useCreateRSVP();

  // Deduplicated click tracking: fired once per visitor session on landing
  useEffect(() => {
    if (inviteCode) {
      trackClickMutation.mutate(inviteCode);
    }
  }, [inviteCode]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-16 animate-pulse space-y-6">
        <div className="h-10 w-3/4 mx-auto bg-slate-200 rounded-xl" />
        <div className="h-80 bg-slate-200 rounded-3xl" />
        <div className="h-12 w-full bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (inviteError || !invite) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Invite Link Invalid or Expired</h2>
        <p className="text-sm text-slate-500 mb-6">
          We couldn't locate an active event for this invite code. Check the link or discover upcoming events!
        </p>
        <Link to="/">
          <Button variant="primary">Browse Live Events</Button>
        </Link>
      </div>
    );
  }

  const { event, inviter, friendsAttendingCount, clicks } = invite;

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      // Redirect to sign in / register, preserving this invite URL
      navigate(`/login?redirect=/invite/${inviteCode}`);
      return;
    }

    try {
      await createRSVPMutation.mutateAsync({
        eventId: event.id,
        payload: {
          eventTitle: event.title,
          eventDate: event.date,
          venue: `${event.venue}, ${event.city}`,
          eventImage: event.imageUrl,
          referredByInviteCode: inviteCode,
          inviteCode: inviteCode,
        },
      });

      setRsvpCompleted(true);
      success("🎉 You're in!", `RSVP confirmed for "${event.title}". See you there!`);
    } catch (err: any) {
      if (err.message?.includes('already RSVPed')) {
        setRsvpCompleted(true);
        success("You're already registered!", "You have already RSVP'd to this event.");
      } else {
        error(err.message || 'Could not complete RSVP.');
      }
    }
  };

  const isSelfInvite = isAuthenticated && user && user.id === inviter.id;

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12">
      {/* Personalized Inviter Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/80 mb-4 shadow-sm">
          <img
            src={
              inviter.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(inviter.name)}`
            }
            alt={inviter.name}
            className="w-6 h-6 rounded-full object-cover border border-indigo-200"
          />
          <span className="text-xs sm:text-sm font-semibold text-indigo-900">
            {isSelfInvite ? (
              <span><strong>You</strong> created this invite link!</span>
            ) : (
              <span><strong>{inviter.name}</strong> invited you to join them!</span>
            )}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {isSelfInvite ? "Your Shareable Event Invite" : "You've been invited to attend"}
        </h1>
      </div>

      {/* Main Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden mb-8">
        {/* Event Hero Image */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-900">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Category */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/90 backdrop-blur-md text-slate-900 shadow-sm">
              {event.category}
            </span>
          </div>

          {/* Social Proof Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>🎉 {friendsAttendingCount} friends attending</span>
            </div>

            <div className="flex items-center gap-2">
              {typeof invite.referredRSVPs === 'number' && invite.referredRSVPs > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-900/80 backdrop-blur-md border border-emerald-500/20 text-emerald-200 text-xs font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{invite.referredRSVPs} joined via link</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-medium">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>{clicks} link views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Body Info */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {event.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold">{formatDate(event.date)}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{formatTime(event.time)}</span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {event.venue}, {event.city}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {event.description}
          </p>

          {/* CTA Box */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            {isSelfInvite ? (
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-indigo-950">
                    This is your personal invite link!
                  </h3>
                  <p className="text-xs text-indigo-700 mt-1 max-w-sm mx-auto">
                    Share this URL with friends. When they RSVP through it, they will be counted towards your group.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      success('Link copied to clipboard!');
                    }}
                  >
                    Copy Invite Link
                  </Button>
                  <Link to="/my-events">
                    <Button variant="outline" size="sm">
                      View My RSVPs
                    </Button>
                  </Link>
                </div>
              </div>
            ) : rsvpCompleted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-900">
                  You're officially on the guest list!
                </h3>
                <p className="text-xs text-emerald-700">
                  We've linked your RSVP with {inviter.name}'s friend group.
                </p>
                <div className="pt-2">
                  <Link to="/my-events">
                    <Button variant="secondary" size="sm">
                      View in My Events
                    </Button>
                  </Link>
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-base font-bold shadow-md shadow-indigo-600/30"
                  isLoading={createRSVPMutation.isPending}
                  onClick={handleRSVP}
                >
                  I'm Interested — Count Me In!
                </Button>
                <p className="text-center text-xs text-slate-400">
                  Signed in as <strong>{user?.name}</strong>. Clicking confirms your RSVP instantly.
                </p>
              </div>
            ) : (
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Ready to attend with {inviter.name}?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Sign in or create a quick account to RSVP. You'll be returned right back to this event.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to={`/register?redirect=/invite/${inviteCode}`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full sm:w-auto"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Create Account to RSVP
                    </Button>
                  </Link>

                  <Link
                    to={`/login?redirect=/invite/${inviteCode}`}
                    className="w-full sm:w-auto"
                  >
                    <Button variant="outline" size="md" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified RSVP & duplicate click protection
              </span>
              <Link to={`/events/${event.id}`} className="hover:text-indigo-600 font-medium">
                View Full Event Page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
