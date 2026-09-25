import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Layers, Compass } from 'lucide-react';

interface GoogleVenueMapProps {
  venue: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

export const GoogleVenueMap: React.FC<GoogleVenueMapProps> = ({
  venue,
  address,
  city,
  state,
  latitude,
  longitude,
}) => {
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = Roadmap, 'k' = Satellite

  // Build target query string
  const fullAddress = [venue, address, city, state].filter(Boolean).join(', ');
  const query = latitude && longitude ? `${latitude},${longitude}` : fullAddress;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // If a valid Google Maps API Key is provided, use Embed API v1; otherwise use standard Google Maps embed
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
        fullAddress
      )}&maptype=${mapType === 'k' ? 'satellite' : 'roadmap'}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        fullAddress
      )}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`;

  // Directions and Search URLs for Google Maps app/web
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    fullAddress
  )}`;
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress
  )}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{venue}</h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-100/70 text-rose-700 px-2 py-0.5 rounded-full">
                Google Maps
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {[address, city, state].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        {/* Quick Action Links */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMapType(mapType === 'm' ? 'k' : 'm')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Toggle Satellite / Map"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{mapType === 'm' ? 'Satellite' : 'Roadmap'}</span>
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Directions</span>
          </a>

          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Open Maps</span>
          </a>
        </div>
      </div>

      {/* Embedded Google Maps Canvas */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-100">
        <iframe
          title={`Google Map - ${venue}`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Footer info badge */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-slate-500 border border-slate-200/80 shadow-xs pointer-events-none flex items-center gap-1">
          <Compass className="w-3 h-3 text-indigo-500" />
          <span>Interactive Google Maps Venue Preview</span>
        </div>
      </div>
    </div>
  );
};
