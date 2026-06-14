# Config

Public endpoints that expose server-side configuration to the frontend. No authentication required.

Base path: `/api/config`

---

## Endpoints

| Method | Path       | Description                      |
| ------ | ---------- | -------------------------------- |
| GET    | `/regions` | Returns the fixed region taxonomy |

---

## `GET /api/config/regions`

Returns the canonical list of regions as defined in `server/config/regions.js`. Used by the frontend to populate region dropdowns without hardcoding values client-side.

### Response `200`

```json
{
  "regions": ["Africa", "Middle East", "South Asia", "Southeast Asia", "Global"]
}
```
