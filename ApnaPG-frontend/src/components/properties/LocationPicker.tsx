import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMapEvents, 
  useMap 
} from 'react-leaflet';
import { Search, MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';

interface LocationPickerProps {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

// Child component to handle map centering when searched
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export function LocationPicker({ position, onLocationSelect }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default Delhi
  const markerRef = useRef<L.Marker>(null);

  // Sync internal center with prop position if it exists (for initialization)
  useEffect(() => {
    if (position) {
      setMapCenter(position);
    }
  }, [position]);

  // Click event handler for the map
  function ClickHandler() {
    useMapEvents({
      click(e) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lon = parseFloat(first.lon);
        onLocationSelect(lat, lon);
        setMapCenter([lat, lon]);
      } else {
        alert("Location not found. Please try a different search.");
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          onLocationSelect(latlng.lat, latlng.lng);
        }
      },
    }),
    [onLocationSelect]
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search neighborhood or city..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          {isSearching ? <Loader2 className="animate-spin" size={16} /> : "Search"}
        </button>
      </div>

      <div className="relative h-72 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={12} 
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler />
          <MapUpdater center={mapCenter} />
          
          {position && (
            <Marker 
              position={position} 
              draggable={true}
              eventHandlers={eventHandlers}
              ref={markerRef}
            />
          )}

          {/* Simple Overlay Legend */}
          <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 px-2 py-1 rounded text-[10px] text-gray-500 font-medium border shadow-sm">
            Click to drop pin | Drag to refine
          </div>
        </MapContainer>
      </div>
      
      {!position && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <MapPin size={12} /> Please select the exact location on the map
        </p>
      )}
    </div>
  );
}
