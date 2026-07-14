import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { getCompletionColor } from "../lib/completionColor";
import type { Site } from "../types/site";
import { Badge } from "./Badge";

const TURKEY_CENTER: [number, number] = [39, 35];
const DEFAULT_ZOOM = 6;

function createSiteDivIcon(percentage: number): L.DivIcon {
  const size = 40;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);
  const color = getCompletionColor(percentage);

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size + 8}px;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"
        style="transform: rotate(-90deg); filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="#0f172a" stroke="#334155" stroke-width="${strokeWidth}" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" />
      </svg>
      <span style="position:absolute; top:0; left:0; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:white; font-family:inherit;">${percentage}%</span>
      <div style="position:absolute; left:50%; bottom:0; width:8px; height:8px; background:${color}; transform: translateX(-50%) rotate(45deg); border-radius:0 0 3px 0; box-shadow:0 1px 2px rgba(0,0,0,0.4);"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

interface SitesMapProps {
  sites: Site[];
}

export function SitesMap({ sites }: SitesMapProps) {
  const sitesWithCoords = sites.filter(
    (site): site is Site & { latitude: number; longitude: number } =>
      site.latitude !== null && site.longitude !== null,
  );

  return (
    <MapContainer
      center={TURKEY_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      style={{ height: 420, width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {sitesWithCoords.map((site) => (
        <Marker
          key={site.id}
          position={[site.latitude, site.longitude]}
          icon={createSiteDivIcon(site.completionPercentage)}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-white">{site.name}</p>
              <p className="mt-1 text-xs text-slate-300">{site.location ?? "—"}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge>{site.status}</Badge>
                <span className="text-xs font-medium text-slate-300">
                  %{site.completionPercentage} tamamlandı
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
