import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { useCalendarEvents } from '../../hooks/useEvents.js';
import { toISODateString } from '../../utils/date.utils.js';

interface EventCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12

  const { data: calendarData, isLoading } = useCalendarEvents(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const resetToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    onSelectDate(toISODateString(today));
  };

  // Build calendar matrix
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Map events count by date
  const eventsByDate = new Map<string, { count: number; titles: string[] }>();
  if (calendarData?.dates) {
    calendarData.dates.forEach((d) => {
      eventsByDate.set(d.date, { count: d.count, titles: d.titles });
    });
  }

  const todayStr = toISODateString(today);

  return (
    <div id="calendar-section" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-12">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Event Calendar</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pick a date to instantly filter scheduled events happening that day.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetToToday}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 min-w-[140px] text-center px-2">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 py-3 uppercase tracking-wider">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="h-16 sm:h-20 rounded-2xl bg-slate-50/50 border border-transparent"
          />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNum = index + 1;
          const monthStr = currentMonth.toString().padStart(2, '0');
          const dayStr = dayNum.toString().padStart(2, '0');
          const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

          const isSelected = selectedDate === dateStr;
          const isCurrentToday = todayStr === dateStr;
          const eventSummary = eventsByDate.get(dateStr);
          const hasEvents = Boolean(eventSummary && eventSummary.count > 0);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(isSelected ? '' : dateStr)}
              className={`relative h-16 sm:h-20 p-1.5 sm:p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group focus:outline-none ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02] z-10'
                  : hasEvents
                  ? 'bg-indigo-50/50 border-indigo-200/70 hover:border-indigo-400 hover:bg-indigo-50 text-slate-800'
                  : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
              }`}
            >
              {/* Day Number and Today Indicator */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    isSelected
                      ? 'text-white'
                      : isCurrentToday
                      ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center -ml-0.5'
                      : 'text-slate-700'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Event Indicator Dot / Count */}
                {hasEvents && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {eventSummary?.count}
                  </span>
                )}
              </div>

              {/* Event preview snippet on larger screens */}
              {hasEvents && (
                <div className="hidden sm:block truncate w-full">
                  <p
                    className={`text-[10px] font-medium truncate ${
                      isSelected ? 'text-indigo-100' : 'text-indigo-700'
                    }`}
                  >
                    {eventSummary?.titles[0]}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend / Helper */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Dates with active events
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-indigo-600" />
            Today
          </span>
        </div>

        {selectedDate && (
          <button
            onClick={() => onSelectDate('')}
            className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            Clear calendar date filter
          </button>
        )}
      </div>
    </div>
  );
};
