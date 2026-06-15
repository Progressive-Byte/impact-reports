# Config

Endpoints that expose server-side configuration and platform settings.

Base path: `/api/config`

---

## Endpoints

| Method  | Path        | Auth          | Description                              |
| ------- | ----------- | ------------- | ---------------------------------------- |
| GET     | `/regions`  | None          | Returns the fixed region taxonomy        |
| GET     | `/settings` | Bearer (any)  | Returns current platform settings        |
| PATCH   | `/settings` | Bearer (superadmin) | Update platform settings           |

---

## `GET /api/config/regions`

Public — no authentication required. Returns the canonical list of regions as defined in `server/config/regions.js`. Used by the frontend to populate region dropdowns without hardcoding values client-side.

### Response `200`

```json
{
  "regions": ["Africa", "Middle East", "South Asia", "Southeast Asia", "Global"]
}
```

---

## `GET /api/config/settings`

Requires `Authorization: Bearer <token>` (any authenticated admin). Returns the current platform-wide settings stored in MongoDB (`PlatformSettings` collection — singleton document).

### Response `200`

```json
{
  "defaultRegion": "South Asia"
}
```

`defaultRegion` is an empty string `""` if no default has been saved yet.

---

## `PATCH /api/config/settings`

Requires `Authorization: Bearer <token>` with **superadmin** role. Updates the platform-wide settings. Uses MongoDB `findOneAndUpdate` with `upsert: true`, so the document is created on first call.

### Request body

| Field           | Type   | Required | Description                                      |
| --------------- | ------ | :------: | ------------------------------------------------ |
| `defaultRegion` | string | No       | Default region pre-filled on new reports. Must be a value from `/api/config/regions`. |

```json
{
  "defaultRegion": "South Asia"
}
```

### Response `200`

Returns the updated settings document fields.

```json
{
  "defaultRegion": "South Asia"
}
```

### Errors

| Status | Condition                              |
| ------ | -------------------------------------- |
| `401`  | Missing or invalid Bearer token        |
| `403`  | Caller is not a `superadmin`           |
| `500`  | Database error                         |

### curl

```bash
# Read current settings
curl http://localhost:5173/api/config/settings \
  -H "Authorization: Bearer $TOKEN"

# Update default region (superadmin only)
curl -X PATCH http://localhost:5173/api/config/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"defaultRegion":"South Asia"}'
```
