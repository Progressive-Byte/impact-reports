import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SafeIcon from '../../../../common/SafeIcon';
import { getGpsCoords } from '../../../../utils/location';
import '../../../../utils/leafletDefaultIcon';
import { TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION } from '../../../../utils/mapTiles';

// Fits the map viewport to given positions whenever they change
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.flyTo(positions[0], 8, { duration: 0.8 });
    } else {
      map.flyToBounds(L.latLngBounds(positions), { padding: [40, 40], duration: 0.8 });
    }
  }, [positions, map]);
  return null;
};

const LocationsImplementedMapCanvas = ({ sites, activeCountry }) => {
  const pinned = useMemo(
    () => sites.map((site) => {
      const pos = (site.lat && site.lng)
        ? [Number(site.lat), Number(site.lng)]
        : (() => { const c = getGpsCoords(site.address, site.region); return [c.lat, c.lng]; })();
      return { ...site, pos };
    }),
    [sites]
  );

  const positions = pinned.map((s) => s.pos);

  return (
    <div className="relative rounded-[2rem] overflow-hidden shadow-lg min-h-[500px] border border-gray-100">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', minHeight: '500px', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          subdomains="abc"
          maxZoom={19}
        />
        <AttributionControl position="bottomright" prefix={false} />
        <FitBounds positions={positions} />
        {pinned.map((site, idx) => (
          <Marker key={`${site.country}-${site.address}-${idx}`} position={site.pos}>
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <div className="font-sans px-3 py-1">
                <p className="font-black text-[9px] uppercase tracking-widest text-[#E52321] mb-0.5">
                  {site.country}
                </p>
                <p className="font-bold text-gray-900 text-xs mb-0.5">{site.address}</p>
                {site.reportTitle && (
                  <Link to={`/report/${site.reportSlug}`} className="text-[10px] text-gray-500 hover:text-[#E52321] hover:underline">
                    {site.reportTitle}
                  </Link>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute bottom-6 left-6 z-[10] flex items-center space-x-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm pointer-events-none">
        <SafeIcon icon="FiMap" className="text-[#E52321] text-sm" />
        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
          {activeCountry === 'All' ? `${sites.length} Site${sites.length === 1 ? '' : 's'}` : `Showing: ${activeCountry}`}
        </span>
      </div>
    </div>
  );
};

export default LocationsImplementedMapCanvas;
