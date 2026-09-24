import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Twitter, Mail, Users, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { EventItem } from '../../types/event.types.js';
import { useToast } from '../../context/ToastContext.js';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  inviteCode: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  event,
  inviteCode,
}) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  if (!event || !inviteCode) return null;

  const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
  const shareMessage = `Hey! I'm going to "${event.title}" on ${event.date}. Join me and RSVP here: ${inviteUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      success('Link copied to clipboard!', 'Share it with your friends via chat or socials.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join me at ${event.title}`,
          text: `Check out ${event.title} at ${event.venue}!`,
          url: inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Your Friends"
      description="Share your unique referral link to bring your crew together!"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Event Preview Pill */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{event.title}</h4>
            <p className="text-xs text-slate-500 truncate">
              {event.venue} • {event.city}
            </p>
          </div>
        </div>

        {/* Feature Callout */}
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Friend Referral Tracker
            </h5>
            <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
              Every friend who opens this link contributes to the <strong>Friends Attending</strong> counter with deduplicated visitor analytics.
            </p>
          </div>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Your Unique Shareable Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none select-all"
            />
            <Button
              variant={copied ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Quick Share
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-medium transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp
            </a>

            {/* X / Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-medium transition-all"
            >
              <Twitter className="w-4 h-4 text-sky-500" />
              Twitter / X
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(`Join me at ${event.title}!`)}&body=${encodeURIComponent(shareMessage)}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              Email
            </a>
          </div>
        </div>

        {/* Native mobile share if supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            variant="outline"
            size="md"
            className="w-full"
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={handleNativeShare}
          >
            More Share Options
          </Button>
        )}
      </div>
    </Modal>
  );
};
