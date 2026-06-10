import { useMemo } from 'react';
import { Country, State } from 'country-state-city';
import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';
import MultiSelect from './MultiSelect';
import SearchableSelect from './SearchableSelect';

// Build once at module level — not inside the component
const ALL_COUNTRIES   = Country.getAllCountries();
const COUNTRY_OPTIONS = ALL_COUNTRIES.map(c => ({ value: c.name, label: c.name }));
const ISO_BY_NAME     = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name, c.isoCode]));

function getStateOptions(countryName) {
  const iso = ISO_BY_NAME[countryName];
  if (!iso) return [];
  return State.getStatesOfCountry(iso).map(s => ({ value: s.name, label: s.name }));
}

const CountryLocationTab = ({ form, update, fieldErrors = {} }) => {
  // Pre-compute state options per selected country (memoised on country selection)
  const stateMap = useMemo(() => {
    const map = {};
    form.countries.forEach(c => { map[c] = getStateOptions(c); });
    return map;
  }, [form.countries]);

  const handleCountryChange = (newCountries) => {
    const kept  = form.locations.filter(l => newCountries.includes(l.country));
    const taken = new Set(kept.map(l => l.country));
    const added = newCountries
      .filter(c => !taken.has(c))
      .map(c => ({ id: Date.now() + Math.random(), country: c, address: '' }));
    update('countries', newCountries);
    update('locations', [...kept, ...added]);
  };

  const addLocation = (country) =>
    update('locations', [...form.locations, { id: Date.now(), country, address: '' }]);

  const removeLocation = (id) =>
    update('locations', form.locations.filter(l => l.id !== id));

  const updateLocation = (id, address) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, address } : l));

  return (
    <div className="space-y-5">
      {/* Country multi-selector — all countries from library */}
      <MultiSelect
        label="Project Countries"
        required
        value={form.countries}
        onChange={handleCountryChange}
        options={COUNTRY_OPTIONS}
        placeholder="Search and select countries..."
        error={fieldErrors.countries}
      />

      {/* Per-country location entries */}
      {form.countries.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Locations Implemented <span className="text-[#E52321]">*</span>
          </p>

          {form.countries.map(country => {
            const countryLocs  = form.locations.filter(l => l.country === country);
            const stateOptions = stateMap[country] ?? [];
            const hasStates    = stateOptions.length > 0;
            const locError     = fieldErrors[`loc_${country}`];
            const filledCount  = countryLocs.filter(l => l.address.trim()).length;

            return (
              <div key={country} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                {/* Country header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#E52321]/10 border border-[#E52321]/20 flex items-center justify-center flex-shrink-0">
                      <SafeIcon icon="FiFlag" className="text-[#E52321] text-xs" />
                    </div>
                    <span className="text-sm font-black text-[#0B0D0F]">{country}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {filledCount} location{filledCount !== 1 ? 's' : ''}
                    </span>
                    {hasStates && (
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        · {stateOptions.length} states/provinces
                      </span>
                    )}
                  </div>
                  {locError && (
                    <p className="text-xs text-red-500 font-medium">{locError}</p>
                  )}
                </div>

                {/* Location rows */}
                <div className="space-y-2">
                  {countryLocs.map((loc, idx) => (
                    <div key={loc.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <SafeIcon icon="FiMapPin" className="text-[#E52321] text-xs" />
                      </div>

                      {hasStates ? (
                        <SearchableSelect
                          value={loc.address}
                          onChange={val => updateLocation(loc.id, val)}
                          options={stateOptions}
                          placeholder={`State / Province ${idx + 1}`}
                          className="flex-1"
                        />
                      ) : (
                        <Input
                          placeholder={`Location ${idx + 1} — City, District or Region`}
                          value={loc.address}
                          onChange={e => updateLocation(loc.id, e.target.value)}
                          className="flex-1"
                        />
                      )}

                      <button
                        onClick={() => removeLocation(loc.id)}
                        disabled={countryLocs.length === 1}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <SafeIcon icon="FiTrash2" className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addLocation(country)}
                  className="w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-[#76767e] font-semibold hover:bg-red-50 hover:border-[#E52321] hover:text-[#E52321] transition-colors flex items-center justify-center gap-2"
                >
                  <SafeIcon icon="FiPlus" className="text-xs" />
                  Add {hasStates ? 'state / province' : 'location'} in {country}
</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CountryLocationTab;
