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

// Create a professional, dynamic price-pin marker
const createCustomIcon = (price: string) => {
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="group relative flex flex-col items-center">
        <div class="bg-slate-900 text-white font-black px-3 py-1.5 rounded-full shadow-2xl text-[13px] whitespace-nowrap flex items-center gap-1 transition-transform group-hover:scale-110 border border-white/20">
          <span class="text-primary-400">₹</span>${price}
        </div>
        <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-white/10"></div>
      </div>
    `,
    iconSize: [60, 36],
    iconAnchor: [30, 36],
    popupAnchor: [0, -36],
  });
};

function MapBoundsUpdater({ properties }: { properties: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!properties || properties.length === 0) return;

    const bounds = L.latLngBounds(
      properties.map((p) => [
        p.location.coordinates[1], // Latitude
        p.location.coordinates[0]  // Longitude
      ])
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [properties, map]);

  return null;
}

// No longer using mock generators as backend provides real coordinates via GeoJSON Point.


export function PropertyMap({ properties, onSelect }: { properties: any[]; onSelect?: (property: any) => void }) {
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
        className="saturate-[0.85] contrast-[1.05]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {properties.map((prop) => {
          const lat = prop.location.coordinates[1];
          const lng = prop.location.coordinates[0];
          const price = (prop.monthly_rent / 1000).toFixed(1) + "k";

          return (
            <Marker
              key={prop._id}
              position={[lat, lng]}
              icon={createCustomIcon(price)}
            >
              <Popup className="custom-popup">
                <div
                  onClick={() => onSelect?.(prop)}
                  className="w-48 overflow-hidden rounded-md cursor-pointer group"
                >
                  {prop.images && prop.images[0] ? (
                    <div className="h-24 w-full overflow-hidden">
                      <img src={prop.images[0].url} alt="" className="object-cover w-full h-full group-hover:scale-105 transition" />
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
