import { Country } from 'country-state-city';

// ISO 3166-1 alpha-2 code → organization region
const ISO_TO_REGION = {
  // South Asia
  AF: 'South Asia', BD: 'South Asia', BT: 'South Asia',
  IN: 'South Asia', MV: 'South Asia', NP: 'South Asia',
  PK: 'South Asia', LK: 'South Asia',
  // Middle East / MENA
  AE: 'Middle East', BH: 'Middle East', DZ: 'Middle East',
  EG: 'Middle East', IQ: 'Middle East', IR: 'Middle East',
  JO: 'Middle East', KW: 'Middle East', LB: 'Middle East',
  LY: 'Middle East', MA: 'Middle East', OM: 'Middle East',
  PS: 'Middle East', QA: 'Middle East', SA: 'Middle East',
  SD: 'Middle East', SY: 'Middle East', TN: 'Middle East',
  TR: 'Middle East', YE: 'Middle East',
  // Africa
  AO: 'Africa', BF: 'Africa', BI: 'Africa', BJ: 'Africa',
  BW: 'Africa', CD: 'Africa', CF: 'Africa', CG: 'Africa',
  CI: 'Africa', CM: 'Africa', DJ: 'Africa', ER: 'Africa',
  ET: 'Africa', GA: 'Africa', GH: 'Africa', GM: 'Africa',
  GN: 'Africa', GQ: 'Africa', GW: 'Africa', KE: 'Africa',
  LR: 'Africa', LS: 'Africa', MG: 'Africa', ML: 'Africa',
  MR: 'Africa', MW: 'Africa', MZ: 'Africa', NA: 'Africa',
  NE: 'Africa', NG: 'Africa', RW: 'Africa', SL: 'Africa',
  SN: 'Africa', SO: 'Africa', SS: 'Africa', SZ: 'Africa',
  TD: 'Africa', TG: 'Africa', TZ: 'Africa', UG: 'Africa',
  ZA: 'Africa', ZM: 'Africa', ZW: 'Africa',
  // Southeast Asia
  BN: 'Southeast Asia', ID: 'Southeast Asia', KH: 'Southeast Asia',
  LA: 'Southeast Asia', MM: 'Southeast Asia', MY: 'Southeast Asia',
  PH: 'Southeast Asia', SG: 'Southeast Asia', TH: 'Southeast Asia',
  TL: 'Southeast Asia', VN: 'Southeast Asia',
};

// Build name → ISO lookup from country-state-city data at module load
const NAME_TO_ISO = Object.fromEntries(
  Country.getAllCountries().map(c => [c.name.toLowerCase(), c.isoCode])
);

export function deriveRegion(countries) {
  if (!countries?.length) return 'Global';
  const regions = [...new Set(
    countries.map(name => {
      const iso = NAME_TO_ISO[name.toLowerCase()];
      return (iso && ISO_TO_REGION[iso]) || 'Global';
    })
  )];
  return regions.length === 1 ? regions[0] : 'Global';
}
