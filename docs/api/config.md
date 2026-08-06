# Config API

Endpoints that expose server-side configuration and platform settings.

Base path: `/api/config`

| Method | Path                      | Auth                | Description                                              |
| ------ | ------------------------- | ------------------- | -------------------------------------------------------- |
| GET    | `/regions`                | None                | Returns the active region list                            |
| PUT    | `/regions`                | Bearer (superadmin) | Replace the full region list                              |
| GET    | `/sectors`                | None                | Returns the active sector list                           |
| PUT    | `/sectors`                | Bearer (superadmin) | Replace the full sector list                             |
| GET    | `/departments`            | None                | Returns the active department list                       |
| PUT    | `/departments`            | Bearer (superadmin) | Replace the full department list                         |
| GET    | `/donate`                 | None                | Returns the global donation URL                          |
| GET    | `/social-links`           | None                | Returns footer social media links                        |
| GET    | `/settings`               | Bearer (any)        | Returns current platform settings                        |
| PATCH  | `/settings`               | Bearer (superadmin) | Update platform settings                                 |
| POST   | `/send-weekly-digest`     | Bearer (superadmin) | Manually trigger the weekly digest email                 |

---

## `GET /api/config/regions`

Public — no authentication required. Returns the active region list. Reads from the `PlatformSettings.regions` array in MongoDB.

### Response `200`

```json
{
  "regions": ["Africa", "Middle East", "South Asia", "Southeast Asia", "SWANA", "Global"]
}
```

---

## `PUT /api/config/regions`

Requires **superadmin** role. Replaces the entire region list stored in `PlatformSettings.regions`. After this call, `GET /api/config/regions` returns only the new list. There is no server-side whitelist of allowed values — any non-empty, de-duplicated string is accepted (same as `/sectors` and `/departments`), so keeping the list consistent (e.g. broad regions, not individual countries) is a data-entry discipline enforced by whoever edits it via the Data Management UI, not by validation.

### Request body

| Field     | Type     | Required | Description                                      |
| --------- | -------- | :------: | ------------------------------------------------ |
| `regions` | string[] | Yes      | Non-empty array of region name strings. Blank/empty strings are stripped before saving. |

Example:

```json
{
  "regions": ["Africa", "Middle East", "South Asia", "Southeast Asia", "SWANA", "Global"]
}
```

### Response `200`

```json
{
  "regions": ["Africa", "Middle East", "South Asia", "Southeast Asia", "SWANA", "Global"]
}
```

### Errors

| Status | Condition                                          |
| ------ | -------------------------------------------------- |
| `400`  | `regions` is not an array, is empty, or all entries are blank |
| `401`  | Missing or invalid token                           |
| `403`  | Caller is not `superadmin`                         |
| `500`  | Database error                                     |

### curl

```bash
curl -X PUT http://localhost:5173/api/config/regions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regions":["Africa","Middle East","South Asia","Southeast Asia","SWANA","Global"]}'
```

---

## `GET /api/config/sectors`

Public — no authentication required. Returns the active sector list. Reads from `PlatformSettings.sectors` in MongoDB.

### Response `200`

```json
{
  "sectors": ["Education", "Food Security", "Healthcare", "WASH"]
}
```

---

## `PUT /api/config/sectors`

Requires **superadmin** role. Replaces the entire sector list stored in `PlatformSettings.sectors`.

### Request body

| Field     | Type     | Required | Description                                      |
| --------- | -------- | :------: | ------------------------------------------------ |
| `sectors` | string[] | Yes      | Non-empty array of sector name strings. Blank/empty strings are stripped before saving. |

```json
{
  "sectors": ["Education", "Food Security", "Healthcare", "WASH", "Shelter"]
}
```

### Response `200`

```json
{
  "sectors": ["Education", "Food Security", "Healthcare", "WASH", "Shelter"]
}
```

### Errors

| Status | Condition                                          |
| ------ | -------------------------------------------------- |
| `400`  | `sectors` is not an array, is empty, or all entries are blank |
| `401`  | Missing or invalid token                           |
| `403`  | Caller is not `superadmin`                         |
| `500`  | Database error                                     |

### curl

```bash
curl -X PUT http://localhost:5173/api/config/sectors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sectors":["Education","Healthcare","WASH"]}'
```

---

## `GET /api/config/departments`

Public — no authentication required. Returns the active department list stored in `PlatformSettings.departments`. Used to populate the Department dropdown in the Invite and Edit User modals.

### Response `200`

```json
{
  "departments": ["Finance", "Programmes", "Communications", "Operations"]
}
```

---

## `PUT /api/config/departments`

Requires **superadmin** role. Replaces the entire department list stored in `PlatformSettings.departments`.

### Request body

| Field         | Type     | Required | Description                                                                        |
| ------------- | -------- | :------: | ---------------------------------------------------------------------------------- |
| `departments` | string[] | Yes      | Non-empty array of department name strings. Blank/empty strings are stripped before saving. |

```json
{
  "departments": ["Finance", "Programmes", "Communications", "Operations"]
}
```

### Response `200`

```json
{
  "departments": ["Finance", "Programmes", "Communications", "Operations"]
}
```

### Errors

| Status | Condition                                                  |
| ------ | ---------------------------------------------------------- |
| `400`  | `departments` is not an array, is empty, or all entries are blank |
| `401`  | Missing or invalid token                                   |
| `403`  | Caller is not `superadmin`                                 |
| `500`  | Database error                                             |

### curl

```bash
curl -X PUT http://localhost:5173/api/config/departments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"departments":["Finance","Programmes","Communications"]}'
```

---

## `GET /api/config/donate`

Public — no authentication required. Returns the global donation URL configured by a superadmin in the platform Settings. The public header's "Donate" button uses this URL; the button is hidden when the URL is empty.

### Response `200`

```json
{
  "url": "https://donate.example.com"
}
```

`url` is `""` if no donation URL has been configured.

### curl

```bash
curl http://localhost:5173/api/config/donate
```

---

## `GET /api/config/hero`

Public — no authentication required. Returns the public portal homepage's hero banner title and background photo, configured by a superadmin in the platform Settings ("Hero Section" card). Used by `PortalHero.jsx` on page load.

### Response `200`

```json
{
  "title":           "Global Projects Impact Reports",
  "backgroundImage": "https://res.cloudinary.com/impactreports/image/upload/..."
}
```

Both fields fall back to the original hardcoded copy/photo when unset, so the homepage renders unchanged until a superadmin edits them.

### curl

```bash
curl http://localhost:5173/api/config/hero
```

---

## `GET /api/config/social-links`

Public — no authentication required. Returns the social media URLs configured by admins in the Settings panel. Used by the public footer to render icon links.

Platforms hidden via the **Visible / Hidden** toggle in Settings are returned as `""`, which the footer treats as absent. A platform is only shown in the footer when its URL is non-empty **and** its visibility is enabled.

### Response `200`

```json
{
  "facebook":  "https://facebook.com/humanconcernusa",
  "twitter":   "",
  "instagram": "https://instagram.com/humanconcernusa",
  "linkedin":  "https://linkedin.com/company/humanconcernusa",
  "youtube":   "https://youtube.com/@humanconcernusa"
}
```

All five keys are always present. A key returns `""` when the URL is blank **or** when the platform is toggled hidden by a superadmin.

### curl

```bash
curl http://localhost:5173/api/config/social-links
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
  "require2fa":             false,
  "donationUrl":            "https://donate.example.com",
  "heroTitle":              "Global Projects Impact Reports",
  "heroBackgroundImage":    "https://res.cloudinary.com/impactreports/image/upload/...",
  "socialLinks": {
    "facebook":  "https://facebook.com/humanconcernusa",
    "twitter":   "",
    "instagram": "",
    "linkedin":  "",
    "youtube":   ""
  },
  "socialLinksVisible": {
    "facebook":  true,
    "twitter":   true,
    "instagram": false,
    "linkedin":  true,
    "youtube":   true
  }
}
```

| Field                    | Type    | Default | Description                                                                 |
| ------------------------ | ------- | :-----: | --------------------------------------------------------------------------- |
| `defaultRegion`          | string  | `""`    | Pre-filled region on new reports and user creation. `""` means none set     |
| `sessionTimeoutMinutes`  | number  | `30`    | Inactivity timeout (minutes) before the admin is auto-logged out            |
| `enforceStrongPasswords` | boolean | `false` | When `true`, invite registration requires min 12 chars + number + symbol    |
| `failedLoginWarnings`    | boolean | `true`  | When `true`, 3 consecutive wrong-password attempts create a notification    |
| `weeklyDigest`           | boolean | `false` | When `true`, a summary email is sent to all superadmins every Monday 08:00  |
| `require2fa`             | boolean | `false` | When `true`, all logins require 2FA. Admins with TOTP set up choose between their authenticator app or email OTP; others receive email OTP automatically. |
| `donationUrl`            | string  | `""`    | URL for the "Donate" button in the public site header. When empty, the button is hidden. Also available unauthenticated via `GET /api/config/donate`. |
| `heroTitle`              | string  | `"Global Projects Impact Reports"` | Headline on the public portal homepage banner. Also available unauthenticated via `GET /api/config/hero`. |
| `heroBackgroundImage`    | string  | stock photo URL | Background photo behind the homepage banner title. Uploaded via `POST /api/upload` (Cloudinary) or pasted as a URL. Also available unauthenticated via `GET /api/config/hero`. |
| `socialLinks`            | object  | `{}`    | Social media URLs — see `GET /api/config/social-links`.                     |
| `socialLinksVisible`     | object  | all `true` | Per-platform visibility flags. When `false`, the platform is omitted from the public footer even if a URL is set. |

---

## `PATCH /api/config/settings`

Requires **superadmin** role. All fields are optional — only provided fields are updated. Uses MongoDB `upsert`, so the document is created automatically on first call.

### Request body

All fields are optional — only provided fields are updated.

| Field                    | Type    | Description                                                              |
| ------------------------ | ------- | ------------------------------------------------------------------------ |
| `defaultRegion`          | string  | Must be a value from `GET /api/config/regions` (or `""` to clear)        |
| `sessionTimeoutMinutes`  | number  | Inactivity timeout in minutes                                            |
| `enforceStrongPasswords` | boolean | Toggle strong password requirement on invite registration                |
| `failedLoginWarnings`    | boolean | Toggle failed-login notification creation                                |
| `weeklyDigest`           | boolean | Toggle weekly digest email to superadmins                                |
| `require2fa`             | boolean | When `true`, all logins require 2FA (email OTP or TOTP)                  |
| `donationUrl`            | string  | URL for the public "Donate" button. Send `""` to hide the button.        |
| `socialLinks`            | object  | Social media URLs — only keys provided are updated (partial update supported) |
| `socialLinksVisible`     | object  | Per-platform visibility flags — only keys provided are updated               |

`socialLinks` sub-fields (all optional strings):

| Sub-field   | Description                          |
| ----------- | ------------------------------------ |
| `facebook`  | Facebook page URL                    |
| `twitter`   | X (Twitter) profile URL              |
| `instagram` | Instagram profile URL                |
| `linkedin`  | LinkedIn company page URL            |
| `youtube`   | YouTube channel URL                  |

`socialLinksVisible` sub-fields (all optional booleans, default `true`):

| Sub-field   | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| `facebook`  | `false` hides the Facebook icon from the public footer even if a URL is set     |
| `twitter`   | Same for X (Twitter)                                                             |
| `instagram` | Same for Instagram                                                               |
| `linkedin`  | Same for LinkedIn                                                                |
| `youtube`   | Same for YouTube                                                                 |

Example:

```json
{
  "defaultRegion":          "South Asia",
  "sessionTimeoutMinutes":  60,
  "enforceStrongPasswords": true,
  "failedLoginWarnings":    true,
  "weeklyDigest":           true,
  "require2fa":             true,
  "socialLinks": {
    "facebook":  "https://facebook.com/humanconcernusa",
    "instagram": "https://instagram.com/humanconcernusa"
  },
  "socialLinksVisible": {
    "twitter": false,
    "linkedin": false
  }
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
