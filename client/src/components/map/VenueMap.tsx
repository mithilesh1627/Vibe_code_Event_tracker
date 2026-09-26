import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, Layers, Compass, Maximize2 } from 'lucide-react';

interface VenueMapProps {
  venue: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
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

const TILE_PROVIDERS = {
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  hot: {
    name: 'OSM Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Humanitarian OpenStreetMap Team',
  },
  voyager: {
    name: 'OSM Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
  },
};

export const VenueMap: React.FC<VenueMapProps> = ({
  venue,
  address,
  city,
  state,
  latitude,
  longitude,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [activeTile, setActiveTile] = useState<keyof typeof TILE_PROVIDERS>('osm');

  // Determine best coordinates
  let lat = latitude;
  let lng = longitude;
  if (lat === undefined || lng === undefined) {
    const cityKey = city?.toLowerCase().trim() || '';
    const fallback = CITY_COORDINATES[cityKey] || [40.7128, -74.006]; // default to NY if completely unknown
    lat = fallback[0];
    lng = fallback[1];
  }

  const coordinates: [number, number] = [lat, lng];
  const fullAddress = [venue, address, city, state].filter(Boolean).join(', ');

  // Free Web Directions Link (Never uses paid API)
  const freeDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    fullAddress
  )}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    fullAddress
  )}`;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: coordinates,
      zoom: 15,
      zoomControl: false,
    });

    const tileConfig = TILE_PROVIDERS[activeTile];
    const tiles = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tiles;

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Custom Glowing Venue Pin
    const pinHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-indigo-400 opacity-60"></span>
        <div class="relative w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 border-3 border-white shadow-xl flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: pinHtml,
      className: 'venue-location-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker(coordinates, { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: inherit; padding: 4px;">
        <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #0f172a; font-size: 14px;">${venue}</h4>
        <p style="margin: 0; color: #64748b; font-size: 12px;">${fullAddress}</p>
      </div>
    `);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map center when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView(coordinates, 15);
      markerRef.current.setLatLng(coordinates);
    }
  }, [lat, lng]);

  // Switch tile provider (100% free OpenStreetMap layers)
  const handleTileChange = () => {
    const keys: (keyof typeof TILE_PROVIDERS)[] = ['osm', 'hot', 'voyager'];
    const nextIndex = (keys.indexOf(activeTile) + 1) % keys.length;
    const nextKey = keys[nextIndex];
    setActiveTile(nextKey);

    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const nextConfig = TILE_PROVIDERS[nextKey];
      const newTiles = L.tileLayer(nextConfig.url, {
        attribution: nextConfig.attribution,
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTiles;
    }
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coordinates, 15, { duration: 1 });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{venue}</h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                OpenStreetMap
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{fullAddress}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleTileChange}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Cycle Map Style (Free OpenStreetMap / Carto)"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{TILE_PROVIDERS[activeTile].name}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Recenter on venue"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Recenter</span>
          </button>

          <a
            href={freeDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </a>

          <a
            href={openStreetMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="View on OpenStreetMap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>OSM</span>
          </a>
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Footer info banner */}
        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-slate-600 border border-slate-200/80 shadow-xs pointer-events-none flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-indigo-600" />
          <span>Powered by OpenStreetMap & Leaflet • Zero API keys or billing required</span>
        </div>
      </div>
    </div>
  );
};
