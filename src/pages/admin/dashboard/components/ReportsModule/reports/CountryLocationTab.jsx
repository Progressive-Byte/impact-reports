import { useMemo } from 'react';
import { Country, State } from 'country-state-city';
import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';
import MultiSelect from './MultiSelect';

// Built once at module level
const ALL_COUNTRIES   = Country.getAllCountries();
const COUNTRY_OPTIONS = ALL_COUNTRIES.map(c => ({ value: c.name, label: c.name }));
const ISO_BY_NAME     = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name, c.isoCode]));

function getStateOptions(countryName) {
  const iso = ISO_BY_NAME[countryName];
  if (!iso) return [];
  return State.getStatesOfCountry(iso).map(s => ({ value: s.name, label: s.name }));
}

const CountryLocationTab = ({ form, update, fieldErrors = {} }) => {
  const stateMap = useMemo(() => {
    const map = {};
    form.countries.forEach(c => { map[c] = getStateOptions(c); });
    return map;
  }, [form.countries]);

  // ── Country selection ──────────────────────────────────────────────
  const handleCountryChange = (newCountries) => {
    const kept    = form.locations.filter(l => newCountries.includes(l.country));
    const covered = new Set(kept.map(l => l.country));
    // For newly added countries that have NO state data, seed one blank text row
    const seeds   = newCountries
      .filter(c => !covered.has(c) && getStateOptions(c).length === 0)
      .map(c => ({ id: Date.now() + Math.random(), country: c, address: '' }));
    update('countries', newCountries);
    update('locations', [...kept, ...seeds]);
  };

  // ── Location helpers (used by free-text fallback) ──────────────────
  const addTextLocation = (country) =>
    update('locations', [...form.locations, { id: Date.now(), country, address: '' }]);

  const removeTextLocation = (id) =>
    update('locations', form.locations.filter(l => l.id !== id));

  const updateTextLocation = (id, address) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, address } : l));

  // ── State multi-select helper ──────────────────────────────────────
  const getSelectedStates = (country) =>
    form.locations.filter(l => l.country === country && l.address.trim()).map(l => l.address);

  const handleStateChange = (country, selectedStates) => {
    const others  = form.locations.filter(l => l.country !== country);
    const newLocs = selectedStates.map((address, i) => ({
      id: Date.now() + i + Math.random(),
      country,
      address,
    }));
    update('locations', [...others, ...newLocs]);
  };

  return (
    <div className="space-y-5">
      {/* ── Country multi-selector ──────────────────────────────────── */}
      <MultiSelect
        label="Project Countries"
        required
        value={form.countries}
        onChange={handleCountryChange}
        options={COUNTRY_OPTIONS}
        placeholder="Search and select countries..."
        error={fieldErrors.countries}
      />

      {/* ── Per-country location sections ───────────────────────────── */}
      {form.countries.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Locations Implemented <span className="text-[#E52321]">*</span>
          </p>

          {form.countries.map(country => {
            const stateOptions  = stateMap[country] ?? [];
            const hasStates     = stateOptions.length > 0;
            const selectedStates = getSelectedStates(country);
            const countryLocs   = form.locations.filter(l => l.country === country);
            const locError      = fieldErrors[`loc_${country}`];
            const filledCount   = hasStates
              ? selectedStates.length
              : countryLocs.filter(l => l.address.trim()).length;

            return (
              <div key={country} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Country header bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#E52321]/10 border border-[#E52321]/20 flex items-center justify-center flex-shrink-0">
                      <SafeIcon icon="FiFlag" className="text-[#E52321] text-[10px]" />
                    </div>
                    <span className="text-sm font-black text-[#0B0D0F]">{country}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {filledCount} location{filledCount !== 1 ? 's' : ''}
                    </span>
                    {hasStates && (
                      <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">
                        · {stateOptions.length} available
                      </span>
                    )}
                  </div>
                  {locError && (
                    <p className="text-xs text-red-500 font-medium">{locError}</p>
                  )}
                </div>

                {/* Location body */}
                <div className="p-4">
                  {hasStates ? (
                    /* ── Multi-select for states/provinces ── */
                    <MultiSelect
                      value={selectedStates}
                      onChange={val => handleStateChange(country, val)}
                      options={stateOptions}
                      placeholder={`Select states / provinces in ${country}...`}
                    />
                  ) : (
                    /* ── Free-text rows for countries without state data ── */
                    <div className="space-y-2">
                      {countryLocs.map((loc, idx) => (
                        <div key={loc.id} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <SafeIcon icon="FiMapPin" className="text-[#E52321] text-xs" />
                          </div>
                          <Input
                            placeholder={`Location ${idx + 1} — City, District or Region`}
                            value={loc.address}
                            onChange={e => updateTextLocation(loc.id, e.target.value)}
                            className="flex-1"
                          />
                          <button
                            onClick={() => removeTextLocation(loc.id)}
                            disabled={countryLocs.length === 1}
                            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <SafeIcon icon="FiTrash2" className="text-xs" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addTextLocation(country)}
                        className="mt-1 w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-[#76767e] font-semibold hover:bg-red-50 hover:border-[#E52321] hover:text-[#E52321] transition-colors flex items-center justify-center gap-2"
                      >
                        <SafeIcon icon="FiPlus" className="text-xs" />
                        Add location in {country}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CountryLocationTab;
