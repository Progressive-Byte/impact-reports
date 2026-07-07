import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../../../common/SafeIcon';
import { usePublicLocationsMap } from '../../../hooks/usePublicLocationsMap';
import CountryListPanel from './components/CountryListPanel';
import CountryReportsGrid from './components/CountryReportsGrid';
import LocationsImplementedSection from './components/LocationsImplementedSection';
import MapSkeleton from './components/MapSkeleton';

const LocationsMapCanvas = lazy(() => import('./components/LocationsMapCanvas'));

const LocationsMapPage = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { locations, totalCountries, loading, fetchLocationsMap } = usePublicLocationsMap();
  const reportsSectionRef = useRef(null);

  useEffect(() => {
    fetchLocationsMap();
  }, [fetchLocationsMap]);

  useEffect(() => {
    if (selectedCountry) {
      reportsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCountry]);

  const handleSelectCountry = useCallback((country) => {
    setSelectedCountry((prev) => (prev === country ? null : country));
  }, []);

  const selectedReports = locations.find((l) => l.country === selectedCountry)?.reports || [];

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="bg-[#0B0D0F] pt-32 pb-16 md:pt-40 md:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2000"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D0F] via-transparent to-[#0B0D0F]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/20 px-4 py-2 rounded-full text-[10px] font-black tracking-[0.25em] uppercase mb-6">
            <SafeIcon icon="FiGlobe" className="text-sm" /> All Locations Map
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-[1.1] uppercase">
            Global Footprint
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {totalCountries > 0
              ? `Published reports across ${totalCountries} ${totalCountries === 1 ? 'country' : 'countries'}. Select a pin or country to explore its reports.`
              : 'Explore published reports by country.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 text-[11px] font-bold text-gray-400 hover:text-white transition-colors"
          >
            <SafeIcon icon="FiArrowLeft" className="text-xs" /> Back to all reports
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 items-start">
          <CountryListPanel
            locations={locations}
            loading={loading}
            selectedCountry={selectedCountry}
            onSelectCountry={handleSelectCountry}
          />
          <Suspense fallback={<MapSkeleton />}>
            <LocationsMapCanvas
              locations={locations}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
          </Suspense>
        </div>

        <LocationsImplementedSection locations={locations} loading={loading} />

        <div ref={reportsSectionRef}>
          {selectedCountry && (
            <CountryReportsGrid
              country={selectedCountry}
              reports={selectedReports}
              onClear={() => setSelectedCountry(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationsMapPage;
