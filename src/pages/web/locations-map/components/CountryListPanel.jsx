import React from 'react';
import SafeIcon from '../../../../common/SafeIcon';

const CountryListSkeleton = () => (
  <div className="space-y-2.5 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-16 rounded-2xl bg-gray-100" />
    ))}
  </div>
);

const CountryListPanel = ({ locations, loading, selectedCountry, onSelectCountry }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] p-6">
    <div className="flex items-center justify-between mb-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Reporting Countries
      </p>
      {selectedCountry && (
        <button
          type="button"
          onClick={() => onSelectCountry(selectedCountry)}
          className="text-[10px] font-bold text-[#E52321] hover:underline"
        >
          Show all
        </button>
      )}
    </div>

    {loading ? (
      <CountryListSkeleton />
    ) : locations.length === 0 ? (
      <p className="text-sm text-gray-400 py-6 text-center">No published locations yet.</p>
    ) : (
      <div className="grid grid-cols-1 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
        {locations.map(({ country, reportCount }) => {
          const isActive = selectedCountry === country;
          return (
            <button
              key={country}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectCountry(country)}
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
              <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400">
                {reportCount} report{reportCount === 1 ? '' : 's'}
              </span>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

export default CountryListPanel;
