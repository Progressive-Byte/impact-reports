// CARTO's free raster basemap tier requires an API key as of Aug 2026 — see
// carto.com/basemaps/apikey. Tiles are unwatermarked only when the key is valid.
const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;

export const TILE_LAYER_URL = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`;

export const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>';
