import React from 'react';
import { Music, Trophy, Theater, Film, Sparkles, LayoutGrid, Calendar as CalendarIcon, X } from 'lucide-react';
import { formatDate } from '../../utils/date.utils.js';

interface EventFiltersProps {
  category: string;
  onCategoryChange: (category: string) => void;
  selectedDate: string;
  onClearDate: () => void;
  totalEvents: number;
}

const CATEGORIES = [
  { name: 'All', icon: LayoutGrid },
  { name: 'Music', icon: Music },
  { name: 'Sports', icon: Trophy },
  { name: 'Arts & Theatre', icon: Theater },
  { name: 'Film', icon: Film },
  { name: 'Miscellaneous', icon: Sparkles },
];

export const EventFilters: React.FC<EventFiltersProps> = ({
  category,
  onCategoryChange,
  selectedDate,
  onClearDate,
  totalEvents,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Category Pills & Active Date Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = (category || 'All') === cat.name;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onCategoryChange(cat.name === 'All' ? '' : cat.name)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-xs'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Selected Date Tag */}
        {selectedDate && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filtering by date: {formatDate(selectedDate)}</span>
            <button
              onClick={onClearDate}
              className="p-0.5 rounded-md hover:bg-indigo-200/60 text-indigo-700 transition-colors"
              title="Clear date filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <span>
          Showing <strong className="text-slate-900 font-semibold">{totalEvents}</strong> {totalEvents === 1 ? 'event' : 'events'}
        </span>
      </div>
    </div>
  );
};
