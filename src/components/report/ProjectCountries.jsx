import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import SafeIcon from '../../common/SafeIcon';
import CollapsibleSection from '../CollapsibleSection';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const REGION_MAP_CENTERS = {
  Africa:          [0.0236,   37.9062],
  'Middle East':   [32.0,     35.0],
  'South Asia':    [20.5937,  78.9629],
  'Southeast Asia':[1.3521,   103.8198],
  Global:          [20.0,     0.0],
};

const COUNTRY_COORDS = {
  Kenya:      [1.2921,   36.8219],  Ethiopia:   [9.145,    40.4897],
  Tanzania:   [-6.369,   34.8888],  Uganda:     [1.3733,   32.2903],
  Palestine:  [31.9522,  35.2332],  Lebanon:    [33.8547,  35.8623],
  Syria:      [34.8021,  38.9968],  India:      [20.5937,  78.9629],
  Indonesia:  [-0.7893,  113.9213], Vietnam:    [14.0583,  108.2772],
  Thailand:   [15.87,    100.9925], Cambodia:   [12.5657,  104.991],
  Laos:       [19.8563,  102.4955], Philippines:[12.8797,  121.774],
  Myanmar:    [21.9162,  95.956],
};

const ProjectCountries = ({ countries, region, isOpen, onToggle }) => {
  const center = REGION_MAP_CENTERS[region] || REGION_MAP_CENTERS.Global;

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
              center={center}
              zoom={region === 'Global' ? 2 : 4}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              {countries.map((country) => {
                const pos = COUNTRY_COORDS[country];
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
