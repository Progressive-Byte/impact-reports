import { Country } from 'country-state-city';
import { AFRICA, MIDDLE_EAST, SOUTH_ASIA, SOUTHEAST_ASIA, GLOBAL } from '../config/regions.js';

// ISO 3166-1 alpha-2 code → organization region
const ISO_TO_REGION = {
  // South Asia
  AF: SOUTH_ASIA,  BD: SOUTH_ASIA,  BT: SOUTH_ASIA,
  IN: SOUTH_ASIA,  MV: SOUTH_ASIA,  NP: SOUTH_ASIA,
  PK: SOUTH_ASIA,  LK: SOUTH_ASIA,
  // Middle East / MENA
  AE: MIDDLE_EAST, BH: MIDDLE_EAST, DZ: MIDDLE_EAST,
  EG: MIDDLE_EAST, IQ: MIDDLE_EAST, IR: MIDDLE_EAST,
  JO: MIDDLE_EAST, KW: MIDDLE_EAST, LB: MIDDLE_EAST,
  LY: MIDDLE_EAST, MA: MIDDLE_EAST, OM: MIDDLE_EAST,
  PS: MIDDLE_EAST, QA: MIDDLE_EAST, SA: MIDDLE_EAST,
  SD: MIDDLE_EAST, SY: MIDDLE_EAST, TN: MIDDLE_EAST,
  TR: MIDDLE_EAST, YE: MIDDLE_EAST,
  // Africa
  AO: AFRICA, BF: AFRICA, BI: AFRICA, BJ: AFRICA,
  BW: AFRICA, CD: AFRICA, CF: AFRICA, CG: AFRICA,
  CI: AFRICA, CM: AFRICA, DJ: AFRICA, ER: AFRICA,
  ET: AFRICA, GA: AFRICA, GH: AFRICA, GM: AFRICA,
  GN: AFRICA, GQ: AFRICA, GW: AFRICA, KE: AFRICA,
  LR: AFRICA, LS: AFRICA, MG: AFRICA, ML: AFRICA,
  MR: AFRICA, MW: AFRICA, MZ: AFRICA, NA: AFRICA,
  NE: AFRICA, NG: AFRICA, RW: AFRICA, SL: AFRICA,
  SN: AFRICA, SO: AFRICA, SS: AFRICA, SZ: AFRICA,
  TD: AFRICA, TG: AFRICA, TZ: AFRICA, UG: AFRICA,
  ZA: AFRICA, ZM: AFRICA, ZW: AFRICA,
  // Southeast Asia
  BN: SOUTHEAST_ASIA, ID: SOUTHEAST_ASIA, KH: SOUTHEAST_ASIA,
  LA: SOUTHEAST_ASIA, MM: SOUTHEAST_ASIA, MY: SOUTHEAST_ASIA,
  PH: SOUTHEAST_ASIA, SG: SOUTHEAST_ASIA, TH: SOUTHEAST_ASIA,
  TL: SOUTHEAST_ASIA, VN: SOUTHEAST_ASIA,
};

// Build name → ISO lookup from country-state-city data at module load
const NAME_TO_ISO = Object.fromEntries(
  Country.getAllCountries().map(c => [c.name.toLowerCase(), c.isoCode])
);

export function deriveRegion(countries) {
  if (!countries?.length) return GLOBAL;
  const regions = [...new Set(
    countries.map(name => {
      const iso = NAME_TO_ISO[name.toLowerCase()];
      return (iso && ISO_TO_REGION[iso]) || GLOBAL;
    })
  )];
  return regions.length === 1 ? regions[0] : GLOBAL;
}
