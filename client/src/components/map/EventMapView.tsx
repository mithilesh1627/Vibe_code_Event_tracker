import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { EventItem } from '../../types/event.types';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Compass,
  Maximize2,
  X,
  ExternalLink,
} from 'lucide-react';
import { AddToCalendarDropdown } from '../events/AddToCalendarDropdown';

interface EventMapViewProps {
  events: EventItem[];
  selectedCity?: string;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  'new york': [40.7128, -74.006],
  'san francisco': [37.7749, -122.4194],
  chicago: [41.8781, -87.6298],
  austin: [30.2672, -97.7431],
  seattle: [47.6062, -122.3321],
  london: [51.5074, -0.1278],
  'los angeles': [34.0522, -118.2437],
  miami: [25.7617, -80.1918],
  denver: [39.7392, -104.9903],
  boston: [42.3601, -71.0589],
  toronto: [43.6532, -79.3832],
  'las vegas': [36.1699, -115.1398],
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'music':
      return { bg: '#8b5cf6', ring: '#c4b5fd' }; // Violet
    case 'sports':
      return { bg: '#10b981', ring: '#a7f3d0' }; // Emerald
    case 'arts & theatre':
    case 'arts':
      return { bg: '#f59e0b', ring: '#fde68a' }; // Amber
    case 'film':
      return { bg: '#ec4899', ring: '#fbcfe8' }; // Pink
    default:
      return { bg: '#4f46e5', ring: '#c7d2fe' }; // Indigo
  }
};

export const EventMapView: React.FC<EventMapViewProps> = ({ events, selectedCity }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: USA overview or selected city
    const initialCoords: [number, number] = [39.8283, -98.5795]; // Geographical center of USA
    const initialZoom = 4;

    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: initialZoom,
      zoomControl: false,
    });

    // Clean modern OpenStreetMap tile layer (CartoDB Positron / OSM)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update event markers whenever events or selectedCity change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const validBounds: L.LatLngExpression[] = [];

    events.forEach((event, idx) => {
      let lat = event.latitude;
      let lng = event.longitude;

      // Fallback to city coordinates if explicit lat/lng is missing
      if (lat === undefined || lng === undefined) {
        const cityKey = event.city?.toLowerCase().trim() || '';
        const fallback = CITY_COORDINATES[cityKey];
        if (fallback) {
          // Slight jitter to prevent overlapping pins in the exact same spot
          const jitter = (idx % 5) * 0.004 - 0.008;
          lat = fallback[0] + jitter;
          lng = fallback[1] + jitter;
        }
      }

      if (lat !== undefined && lng !== undefined) {
        const position: [number, number] = [lat, lng];
        validBounds.push(position);

        const colors = getCategoryColor(event.category);

        // Custom HTML pin icon
        const pinHtml = `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110" style="background-color: ${colors.bg}; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="w-2.5 h-1 bg-black/30 rounded-full mx-auto -mt-0.5 blur-[1px]"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: pinHtml,
          className: 'custom-event-pin',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        const marker = L.marker(position, { icon });

        marker.on('click', () => {
          setActiveEvent(event);
          map.panTo(position, { animate: true });
        });

        marker.addTo(markersGroup);
      }
    });

    // Center map around city or markers
    if (selectedCity && CITY_COORDINATES[selectedCity.toLowerCase()]) {
      const cityCoords = CITY_COORDINATES[selectedCity.toLowerCase()];
      map.flyTo(cityCoords, 12, { duration: 1.2 });
    } else if (validBounds.length > 0) {
      const bounds = L.latLngBounds(validBounds);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [events, selectedCity]);

  // "Locate Me" Handler using browser Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        // Animate map to user position
        map.flyTo([latitude, longitude], 13, { duration: 1.5 });

        // Add or update user marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userPinHtml = `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
              <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span>
            </div>
          `;
          const userIcon = L.divIcon({
            html: userPinHtml,
            className: 'user-location-pin',
            iconSize: [20, 20],
          });
          const marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
          marker.bindPopup('<b>You are here</b>').openPopup();
          userMarkerRef.current = marker;
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError(`Location access denied or unavailable (${err.message}).`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleResetBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const validBounds: L.LatLngExpression[] = [];
    events.forEach((e) => {
      if (e.latitude && e.longitude) validBounds.push([e.latitude, e.longitude]);
      else if (e.city && CITY_COORDINATES[e.city.toLowerCase()]) {
        validBounds.push(CITY_COORDINATES[e.city.toLowerCase()]);
      }
    });

    if (validBounds.length > 0) {
      map.fitBounds(L.latLngBounds(validBounds), { padding: [50, 50], maxZoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-[580px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur text-slate-800 text-xs font-semibold rounded-xl shadow-md border border-slate-200/80 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-50"
          title="Find events near my current location"
        >
          <Compass className={`w-4 h-4 text-indigo-600 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
        </button>

        <button
          onClick={handleResetBounds}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur text-slate-800 text-xs font-semibold rounded-xl shadow-md border border-slate-200/80 hover:bg-white hover:text-indigo-600 transition-all"
          title="Zoom to fit all events"
        >
          <Maximize2 className="w-4 h-4 text-slate-600" />
          <span>Fit All Pins ({events.length})</span>
        </button>
      </div>

      {/* Geolocation Notice Banner */}
      {geoError && (
        <div className="absolute top-4 right-4 z-10 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
          <span>{geoError}</span>
          <button onClick={() => setGeoError(null)} className="text-amber-500 hover:text-amber-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Event Floating Preview Card */}
      {activeEvent && (
        <div className="absolute bottom-6 inset-x-4 md:inset-x-auto md:left-6 md:w-96 z-10 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={activeEvent.imageUrl}
                  alt={activeEvent.title}
                  className="w-16 h-16 rounded-xl object-cover shadow-sm shrink-0"
                />
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                    {activeEvent.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {activeEvent.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{activeEvent.venue}, {activeEvent.city}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{new Date(activeEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <span>{activeEvent.time}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-indigo-600">
                <Users className="w-3.5 h-3.5" />
                <span>{activeEvent.friendsAttendingCount} attending</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                to={`/events/${activeEvent.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <span>View Event Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <AddToCalendarDropdown event={activeEvent} variant="compact" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
