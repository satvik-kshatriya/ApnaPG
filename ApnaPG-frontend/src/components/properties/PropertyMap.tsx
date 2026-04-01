import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { MapPin, IndianRupee } from "lucide-react";

// Fix for default marker icons in React-Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Create a custom modern icon if desired instead of default
const createCustomIcon = (price: string) => {
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="bg-white border-2 border-primary-600 text-gray-900 font-bold px-2 py-1 rounded-full shadow-lg text-xs whitespace-nowrap flex items-center">
        ₹${price}
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 24],
    popupAnchor: [0, -24],
  });
};

function MapBoundsUpdater({ properties }: { properties: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!properties || properties.length === 0) return;

    const bounds = L.latLngBounds(
      properties.map((p) => [
        // Using mock coordinates for MVP, assuming locality maps roughly to some bounding box
        // In a real app we'd fetch lat/lng from backend. 
        // For MVP mock purposes, we generate deterministic random coords near a center point (Delhi).
        getMockLat(p.locality, p.id),
        getMockLng(p.locality, p.id)
      ])
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [properties, map]);

  return null;
}

// Deterministic mock coordinate generators based on string hashes
const getMockLat = (locality: string, id: string) => 28.6139 + (locality.length + id.charCodeAt(0) % 10) * 0.01;
const getMockLng = (locality: string, id: string) => 77.2090 + ((locality.length * id.charCodeAt(1)) % 10) * 0.01;

export function PropertyMap({ properties }: { properties: any[] }) {
  if (!properties || properties.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-xl border border-gray-200">
        <div className="text-center text-gray-500">
          <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No properties to map</p>
        </div>
      </div>
    );
  }

  // Fallback center: New Delhi
  const center: [number, number] = [28.6139, 77.2090];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {properties.map((prop) => {
          const lat = getMockLat(prop.locality, prop.id);
          const lng = getMockLng(prop.locality, prop.id);
          const price = (prop.monthly_rent / 1000).toFixed(1) + "k";

          return (
            <Marker 
              key={prop.id} 
              position={[lat, lng]} 
              icon={createCustomIcon(price)}
            >
              <Popup className="custom-popup">
                <div className="w-48 overflow-hidden rounded-md cursor-pointer group">
                   {prop.images && prop.images[0] ? (
                     <div className="h-24 w-full overflow-hidden">
                       <img src={prop.images[0].image_url} alt="" className="object-cover w-full h-full group-hover:scale-105 transition" />
                     </div>
                   ) : (
                     <div className="h-24 w-full bg-gray-200 flex items-center justify-center">
                       <MapPin className="text-gray-400" />
                     </div>
                   )}
                   <div className="p-2">
                     <p className="font-bold text-sm text-gray-900 truncate">{prop.title}</p>
                     <p className="text-xs text-gray-500 truncate">{prop.locality}</p>
                     <p className="font-semibold text-primary-600 mt-1 flex items-center text-sm">
                       <IndianRupee size={12} /> {prop.monthly_rent} <span className="font-normal text-xs text-gray-500 ml-1">/mo</span>
                     </p>
                   </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapBoundsUpdater properties={properties} />
      </MapContainer>
    </div>
  );
}
