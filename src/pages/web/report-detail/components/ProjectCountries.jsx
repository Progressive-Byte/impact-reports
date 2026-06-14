import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Country } from 'country-state-city';
import SafeIcon from '../../../../common/SafeIcon';
import CollapsibleSection from '../../../../common/CollapsibleSection';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Build a name→[lat,lng] lookup from the full country-state-city dataset
const COUNTRY_COORDS_DB = {};
Country.getAllCountries().forEach((c) => {
  if (c.latitude && c.longitude) {
    COUNTRY_COORDS_DB[c.name] = [parseFloat(c.latitude), parseFloat(c.longitude)];
  }
});

function getCountryPos(name) {
  return COUNTRY_COORDS_DB[name] || null;
}

// Fits the map viewport to all markers after render
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.setView(positions[0], 5);
    } else {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
};

const ProjectCountries = ({ countries, region, isOpen, onToggle }) => {
  const positions = countries.map(getCountryPos).filter(Boolean);

  return (
    <CollapsibleSection
      title="Project Countries"
      subtitle={`Implementation breadth across ${region}.`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="px-6 sm:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-1 space-y-4 text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Verified Territories
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {countries.map((country) => (
                <div
                  key={country}
                  className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#E52321]/30 transition-all"
                >
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center mr-3 group-hover:bg-[#E52321] transition-colors">
                    <SafeIcon icon="FiFlag" className="text-[#E52321] group-hover:text-white transition-colors text-xs" />
                  </div>
                  <span className="font-bold text-[#0B0D0F] text-sm">{country}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 relative rounded-[2rem] overflow-hidden shadow-lg min-h-[400px] border border-gray-100">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              <FitBounds positions={positions} />
              {countries.map((country) => {
                const pos = getCountryPos(country);
                if (!pos) return null;
                return (
                  <Marker key={country} position={pos}>
                    <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                      <div className="font-sans px-3 py-1">
                        <p className="font-black text-[9px] uppercase tracking-widest text-[#E52321] mb-0.5">
                          Project Country
                        </p>
                        <p className="font-bold text-gray-900 text-xs">{country}</p>
                      </div>
                    </Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
            <div className="absolute bottom-6 left-6 z-[10] flex items-center space-x-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <SafeIcon icon="FiMap" className="text-[#E52321] text-sm" />
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                Interactive Context Map
              </span>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ProjectCountries;
