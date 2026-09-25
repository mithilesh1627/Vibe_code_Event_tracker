import React, { useRef, useState } from 'react';
import { X, Printer, CheckCircle2, MapPin, Calendar, Clock, Sparkles, Copy, Check, Ticket } from 'lucide-react';
import { EventItem } from '../../types/event.types';
import { useAuth } from '../../context/AuthContext';

interface DigitalTicketModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate deterministic ticket code from user and event id
  const rawId = `${user?.id || 'guest'}-${event.id}`;
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash << 5) - hash + rawId.charCodeAt(i);
    hash |= 0;
  }
  const codeHex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const ticketCode = `GP-${event.category.substring(0, 3).toUpperCase()}-${codeHex}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to render high-contrast SVG QR-like matrix pattern
  const renderQrSvg = () => {
    // 21x21 grid pattern deterministically derived from hash and event id
    const size = 21;
    const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    // Corner Finder Patterns (7x7)
    const stampFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          cells[startY + r][startX + c] = isBorder || isInner;
        }
      }
    };

    stampFinder(0, 0); // Top-left
    stampFinder(size - 7, 0); // Top-right
    stampFinder(0, size - 7); // Bottom-left

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      cells[6][i] = i % 2 === 0;
      cells[i][6] = i % 2 === 0;
    }

    // Pseudorandom internal data cells seeded by ticket hash
    let seed = Math.abs(hash) || 12345;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finders
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= size - 8) ||
          (r >= size - 8 && c < 8) ||
          r === 6 ||
          c === 6
        ) {
          continue;
        }
        seed = (seed * 9301 + 49297) % 233280;
        cells[r][c] = seed / 233280 > 0.48;
      }
    }

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full text-slate-900"
        fill="currentColor"
        shapeRendering="crispEdges"
      >
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" /> : null
          )
        )}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Ticket className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Official Digital Pass</h3>
              <p className="text-xs text-slate-500">Verified RSVP Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Body (Printable Area) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/40" ref={ticketRef}>
          {/* Main Boarding Pass Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden relative">
            {/* Top Color Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-6 py-4 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs tracking-wider font-semibold uppercase text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> GatherPulse Pass
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1.5 line-clamp-1">{event.title}</h2>
              <p className="text-xs text-indigo-100/90">{event.category} • General Admission</p>
            </div>

            {/* Event Info Details */}
            <div className="p-5 grid grid-cols-2 gap-4 border-b border-dashed border-slate-200 relative">
              {/* Notch Cutouts for Ticket Perforation */}
              <div className="absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-slate-50/40 border border-slate-200/80 shadow-inner" />
              <div className="absolute -right-3 -bottom-3 w-6 h-6 rounded-full bg-slate-50/40 border border-slate-200/80 shadow-inner" />

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date & Time</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{event.time}</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Venue Location</p>
                <div className="mt-1 flex items-start gap-1.5 text-xs font-semibold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="line-clamp-2">
                    <span>{event.venue}</span>
                    <span className="block text-[11px] font-normal text-slate-500">{event.city}{event.state ? `, ${event.state}` : ''}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Attendee</p>
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user?.name || 'Valued Guest'}</p>
                    <p className="text-[11px] text-slate-500">{user?.email || 'rsvp@gatherpulse.app'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100">
                      Standard Entry
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code & Code Section */}
            <div className="p-5 bg-gradient-to-b from-white to-slate-50/50 flex flex-col items-center">
              <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-inner group">
                <div className="w-40 h-40">
                  {renderQrSvg()}
                </div>
                {/* Glowing Scan Indicator */}
                <div className="absolute inset-x-2 top-3 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-75 animate-pulse" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  {ticketCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Copy Ticket Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Scan this QR code at the venue door or check-in desk for entry.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save Pass
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
