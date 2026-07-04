import { Country } from 'country-state-city';

const COUNTRY_COORDS_DB = {};
Country.getAllCountries().forEach((c) => {
  if (c.latitude && c.longitude) {
    COUNTRY_COORDS_DB[c.name] = [parseFloat(c.latitude), parseFloat(c.longitude)];
  }
});

export function getCountryPos(name) {
  return COUNTRY_COORDS_DB[name] || null;
}
