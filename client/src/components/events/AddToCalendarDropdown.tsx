import React, { useState, useRef, useEffect } from 'react';
import { CalendarPlus, Download, ExternalLink, ChevronDown } from 'lucide-react';
import { EventItem } from '../../types/event.types';
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  downloadIcsFile,
} from '../../utils/calendarSync';

interface AddToCalendarDropdownProps {
  event: EventItem;
  variant?: 'primary' | 'secondary' | 'compact';
}

export const AddToCalendarDropdown: React.FC<AddToCalendarDropdownProps> = ({
  event,
  variant = 'secondary',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleOutlookCalendar = () => {
    window.open(generateOutlookCalendarUrl(event), '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleDownloadIcs = () => {
    downloadIcsFile(event);
    setIsOpen(false);
  };

  const getButtonStyles = () => {
    if (variant === 'primary') {
      return 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-100';
    }
    if (variant === 'compact') {
      return 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs py-1.5 px-2.5';
    }
    return 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm';
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${getButtonStyles()}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CalendarPlus className="w-4 h-4 text-indigo-500" />
        <span>Add to Calendar</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sync Event</p>
          </div>

          <button
            onClick={handleGoogleCalendar}
            className="w-full text-left px-3.5 py-2.5 text-sm text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-600 flex items-center justify-between group transition-colors"
          >
            <span className="flex items-center gap-2.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Google Calendar
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </button>

          <button
            onClick={handleDownloadIcs}
            className="w-full text-left px-3.5 py-2.5 text-sm text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-600 flex items-center justify-between group transition-colors"
          >
            <span className="flex items-center gap-2.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              Apple Calendar (.ics)
            </span>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </button>

          <button
            onClick={handleOutlookCalendar}
            className="w-full text-left px-3.5 py-2.5 text-sm text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-600 flex items-center justify-between group transition-colors"
          >
            <span className="flex items-center gap-2.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              Outlook / Office 365
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </button>

          <div className="border-t border-slate-100 my-1"></div>

          <button
            onClick={handleDownloadIcs}
            className="w-full text-left px-3.5 py-2 text-xs text-slate-500 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Download className="w-3 h-3 text-slate-400" />
            Download .ics File
          </button>
        </div>
      )}
    </div>
  );
};
