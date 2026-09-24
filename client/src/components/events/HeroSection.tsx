import React from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

const POPULAR_CITIES = ['All Cities', 'New York', 'San Francisco', 'Chicago', 'Austin', 'London'];

export const HeroSection: React.FC<HeroSectionProps> = ({
  keyword,
  onKeywordChange,
  city,
  onCityChange,
  onSearchSubmit,
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white p-8 sm:p-12 lg:p-16 mb-12 shadow-2xl">
      {/* Background glowing effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          The Live Event Discovery Network
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Discover What's Happening <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Near You</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto font-normal leading-relaxed">
          Find live music, sports, theater and exclusive gatherings. RSVP in one click and invite your crew with viral shareable referral links.
        </p>

        {/* Search Bar Form */}
        <form
          onSubmit={onSearchSubmit}
          className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="Search events, artists, venues..."
              className="w-full bg-transparent text-white placeholder:text-slate-400 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:bg-white/10 transition-colors"
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/20" />

          <div className="relative w-full sm:w-56">
            <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full bg-transparent text-white text-sm pl-11 pr-8 py-3 rounded-xl focus:outline-none focus:bg-white/10 transition-colors appearance-none cursor-pointer"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c === 'All Cities' ? '' : c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
          >
            Find Events
          </button>
        </form>

        {/* Quick Location Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-300">Popular hubs:</span>
          {['New York', 'San Francisco', 'Chicago', 'Austin', 'London'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCityChange(city === c ? '' : c)}
              className={`px-3 py-1 rounded-full border transition-all ${
                city === c
                  ? 'bg-indigo-500/20 border-indigo-400 text-white font-medium'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
