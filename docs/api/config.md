# Config API

Endpoints that expose server-side configuration and platform settings.

Base path: `/api/config`

| Method | Path                      | Auth                | Description                                    |
| ------ | ------------------------- | ------------------- | ---------------------------------------------- |
| GET    | `/regions`                | None                | Returns the fixed region taxonomy              |
| GET    | `/settings`               | Bearer (any)        | Returns current platform settings              |
| PATCH  | `/settings`               | Bearer (superadmin) | Update platform settings                       |
| POST   | `/send-weekly-digest`     | Bearer (superadmin) | Manually trigger the weekly digest email       |

---

## `GET /api/config/regions`

Public — no authentication required. Returns the canonical list of regions defined in `server/config/regions.js`.

### Response `200`

```json
{
  "regions": ["Africa", "Middle East", "South Asia", "Southeast Asia", "Global"]
}
```

---

## `GET /api/config/settings`

Requires `Authorization: Bearer <token>` (any authenticated admin). Returns the singleton `PlatformSettings` document from MongoDB.

### Response `200`

```json
{
  "defaultRegion":          "South Asia",
  "sessionTimeoutMinutes":  30,
  "enforceStrongPasswords": false,
  "failedLoginWarnings":    true,
  "weeklyDigest":           false,
  "require2fa":             false
}
```

| Field                    | Type    | Default | Description                                                                 |
| ------------------------ | ------- | :-----: | --------------------------------------------------------------------------- |
| `defaultRegion`          | string  | `""`    | Pre-filled region on new reports and user creation. `""` means none set     |
| `sessionTimeoutMinutes`  | number  | `30`    | Inactivity timeout (minutes) before the admin is auto-logged out            |
| `enforceStrongPasswords` | boolean | `false` | When `true`, invite registration requires min 12 chars + number + symbol    |
| `failedLoginWarnings`    | boolean | `true`  | When `true`, 3 consecutive wrong-password attempts create a notification    |
| `weeklyDigest`           | boolean | `false` | When `true`, a summary email is sent to all superadmins every Monday 08:00  |
| `require2fa`             | boolean | `false` | When `true`, all logins require a 6-digit OTP sent to the admin's email     |

---

## `PATCH /api/config/settings`

Requires **superadmin** role. All fields are optional — only provided fields are updated. Uses MongoDB `upsert`, so the document is created automatically on first call.

### Request body

| Field                    | Type    | Description                                                              |
| ------------------------ | ------- | ------------------------------------------------------------------------ |
| `defaultRegion`          | string  | Must be a value from `GET /api/config/regions` (or `""` to clear)        |
| `sessionTimeoutMinutes`  | number  | Inactivity timeout in minutes                                            |
| `enforceStrongPasswords` | boolean | Toggle strong password requirement on invite registration                |
| `failedLoginWarnings`    | boolean | Toggle failed-login notification creation                                |
| `weeklyDigest`           | boolean | Toggle weekly digest email to superadmins                                |

Example:

```json
{
  "defaultRegion":          "South Asia",
  "sessionTimeoutMinutes":  60,
  "enforceStrongPasswords": true,
  "failedLoginWarnings":    true,
  "weeklyDigest":           true
}
```

### Response `200`

Returns the full updated settings object (same shape as `GET /api/config/settings`).

### Errors

| Status | Condition                    |
| ------ | ---------------------------- |
| `401`  | Missing or invalid token     |
| `403`  | Caller is not `superadmin`   |
| `500`  | Database error               |

### curl

```bash
# Read settings
curl http://localhost:5173/api/config/settings \
  -H "Authorization: Bearer $TOKEN"

# Update — any combination of fields
curl -X PATCH http://localhost:5173/api/config/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultRegion":          "South Asia",
    "sessionTimeoutMinutes":  30,
    "enforceStrongPasswords": true,
    "failedLoginWarnings":    true,
    "weeklyDigest":           true
  }'
```

---

## `POST /api/config/send-weekly-digest`

Requires **superadmin** role. Immediately runs the weekly digest job — queries the last 7 days of published reports and emails all active superadmins. Useful for testing without waiting for the Monday 08:00 cron.

**This endpoint bypasses the `weeklyDigest` toggle** — it always sends regardless of the setting value.

### Response `200`

```json
{ "message": "Weekly digest sent" }
```

### Errors

| Status | Condition                                              |
| ------ | ------------------------------------------------------ |
| `403`  | Caller is not `superadmin`                             |
| `500`  | No active superadmin found, or SMTP delivery failure   |

### curl

```bash
curl -X POST http://localhost:5173/api/config/send-weekly-digest \
  -H "Authorization: Bearer $TOKEN"
```

### What the digest email contains

- **Week range** — date span covered (last 7 days from send time)
- **Reports published** — count of reports with `status: published` and `updatedAt` within the window
- **Lives impacted** — sum of `livesImpacted` across those reports
- **Regions** — tag summary (e.g. `South Asia: 2  Africa: 1`)
- **Report table** — project name / region / lives impacted for each report

If no reports were published that week, the email is still sent with a "No reports published this week" note.

> **SMTP required** — if `SMTP_HOST` is not set in `server/.env`, the server logs `[WEEKLY DIGEST] No SMTP configured` and returns success without sending.
