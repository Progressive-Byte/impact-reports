import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import SafeIcon from '../../../../common/SafeIcon';
import CollapsibleSection from '../../../../common/CollapsibleSection';
import { getCountryPos } from '../../../../utils/countryCoords';
import '../../../../utils/leafletDefaultIcon';
import { TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION } from '../../../../utils/mapTiles';

// Fits the map viewport to given positions whenever they change
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.flyTo(positions[0], 5, { duration: 0.8 });
    } else {
      map.flyToBounds(L.latLngBounds(positions), { padding: [40, 40], duration: 0.8 });
    }
  }, [positions, map]);
  return null;
};

const ProjectCountries = ({ countries, region, isOpen, onToggle }) => {
  const [selected, setSelected] = useState(null);

  const toggle = (country) => setSelected(prev => prev === country ? null : country);

  const visibleCountries = selected ? [selected] : countries;
  const positions = visibleCountries.map(getCountryPos).filter(Boolean);
  const allPositions = countries.map(getCountryPos).filter(Boolean);

  return (
    <CollapsibleSection
      title="Project Countries"
      subtitle={`Implementation breadth across ${region}.`}
      icon="FiGlobe"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="px-6 sm:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* Country list */}
          <div className="lg:col-span-1 space-y-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Verified Territories
              </p>
              {selected && (
                <button
                  onClick={() => setSelected(null)}
                  className="text-[10px] font-bold text-[#E52321] hover:underline"
                >
                  Show all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {countries.map((country) => {
                const isActive = selected === country;
                return (
                  <button
                    key={country}
                    onClick={() => toggle(country)}
                    className={`w-full flex items-center p-4 rounded-2xl border transition-all text-left ${
                      isActive
                        ? 'bg-[#E52321]/5 border-[#E52321]/40 shadow-sm'
                        : 'bg-gray-50 border-gray-100 hover:border-[#E52321]/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg shadow-sm flex items-center justify-center mr-3 transition-colors ${
                      isActive ? 'bg-[#E52321]' : 'bg-white'
                    }`}>
                      <SafeIcon
                        icon="FiFlag"
                        className={`text-xs transition-colors ${isActive ? 'text-white' : 'text-[#E52321]'}`}
                      />
                    </div>
                    <span className={`font-bold text-sm ${isActive ? 'text-[#E52321]' : 'text-[#0B0D0F]'}`}>
                      {country}
                    </span>
                    {isActive && (
                      <SafeIcon icon="FiMapPin" className="ml-auto text-[#E52321] text-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 relative rounded-[2rem] overflow-hidden shadow-lg min-h-[400px] border border-gray-100">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom={false}
              attributionControl={false}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                url={TILE_LAYER_URL}
                attribution={TILE_LAYER_ATTRIBUTION}
                maxZoom={19}
              />
              <AttributionControl position="bottomright" prefix={false} />
              <FitBounds positions={selected ? positions : allPositions} />
              {visibleCountries.map((country) => {
                const pos = getCountryPos(country);
                if (!pos) return null;
                return (
                  <Marker key={country} position={pos}>
                    <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={!!selected}>
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
                {selected ? `Showing: ${selected}` : 'Interactive Context Map'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ProjectCountries;
