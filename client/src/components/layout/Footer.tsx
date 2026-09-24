import React from 'react';
import { Calendar, Heart, ShieldCheck, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">GatherPulse</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 max-w-sm leading-relaxed">
              The modern event discovery and RSVP platform with viral friend referrals. Powered by Ticketmaster Discovery API.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-indigo-500" /> Ticketmaster API
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Deduplicated Clicks
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link to="/" className="hover:text-indigo-600 transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <a href="/#calendar" className="hover:text-indigo-600 transition-colors">
                  Calendar Schedule
                </a>
              </li>
              <li>
                <Link to="/my-events" className="hover:text-indigo-600 transition-colors">
                  My RSVPs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link to="/profile" className="hover:text-indigo-600 transition-colors">
                  Profile & Settings
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-600 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} GatherPulse Inc. Built for seamless event coordination.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for viva excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};
