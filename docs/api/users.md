# Users API

Mounted at `/api/admin`. All routes require `Authorization: Bearer <token>`.

| Method | Path                                       | Auth        | Body                                      | Notes                                              |
| ------ | ------------------------------------------ | ----------- | ----------------------------------------- | -------------------------------------------------- |
| GET    | `/api/admin/dashboard`                     | Bearer      | —                                         | Role-scoped dashboard stats                        |
| GET    | `/api/admin/stats`                         | Bearer      | —                                         | Total and active admin counts                      |
| GET    | `/api/admin/admins`                        | Bearer      | —                                         | Paginated list with search + filter                |
| POST   | `/api/admin/admins`                        | Superadmin  | `username`, `email`, `password`, `role?`  | Create admin directly                              |
| PUT    | `/api/admin/admins/:id`                    | Superadmin  | `username?`, `email?`, `role?`, `region?`, `department?` | Full profile update                     |
| PATCH  | `/api/admin/admins/:id/role`               | Superadmin  | `role`                                    | Change role only                                   |
| PATCH  | `/api/admin/admins/:id/toggle`             | Superadmin  | —                                         | Toggle active ↔ suspended                          |
| DELETE | `/api/admin/admins/:id`                    | Superadmin  | —                                         | Permanently delete admin                           |
| PUT    | `/api/admin/settings/password`             | Bearer      | `currentPassword`, `newPassword`          | Change own password                                |
| PUT    | `/api/admin/settings/profile`              | Bearer      | `username?`, `email?`                     | Update own profile                                 |
| POST   | `/api/admin/settings/setup-totp`           | Bearer      | —                                         | Begin TOTP setup — returns QR code + secret        |
| POST   | `/api/admin/settings/verify-totp-setup`    | Bearer      | `code`                                    | Confirm first TOTP code and activate authenticator |
| DELETE | `/api/admin/settings/disable-totp`         | Bearer      | —                                         | Remove authenticator app from own account          |
| POST   | `/api/admin/backfill-slugs`                | Superadmin  | —                                         | One-off: generate slugs for reports that lack one  |

> **Superadmin** — endpoints marked `Superadmin` return `403` for `editor` and `viewer` callers.  
> **Self-protection** — an admin cannot edit, toggle, or delete their own account.

---

## Admin object

```json
{
  "_id":         "6650a1b2c3d4e5f607a8b9c0",
  "username":    "sadek",
  "email":       "sadek@example.com",
  "role":        "superadmin",
  "region":      "global",
  "isActive":    true,
  "totpEnabled": false,
  "lastLogin":   "2026-06-08T10:30:00.000Z",
  "createdAt":   "2026-01-15T08:00:00.000Z",
  "updatedAt":   "2026-06-08T10:30:00.000Z"
}
```

**Role values:** `superadmin` | `editor` | `viewer`

| Role          | Dashboard | Reports (assigned) | Users tab | Data Management | Settings |
| ------------- | :-------: | :----------------: | :-------: | :-------------: | :------: |
| `superadmin`  | ✓         | All (read+write)   | ✓         | ✓               | ✓        |
| `editor`      | ✓         | Own (read+write)   | ✗         | ✗               | ✗        |
| `viewer`      | ✓         | Own (read-only)    | ✗         | ✗               | ✗        |

**Region values:** any string from `GET /api/config/regions`. Stored as-is; no server-side enum validation.

**`totpEnabled`** — `true` when the admin has completed authenticator app setup. Clients use this to show/hide the TOTP option in the 2FA login flow and the "Remove" button in Settings.

> The following sensitive fields are **never** returned in any response: `password`, `totpSecret`, `totpLastUsedCode`, `resetOTPCode`, `resetOTPExpires`, `loginOTPCode`, `loginOTPExpires`.

---

## `GET /api/admin/dashboard`

Returns role-scoped statistics used to populate the Admin Dashboard home view.

- **`admin`** — sees only reports assigned to them (`assignedTo: req.admin._id`).
- **`superadmin`** — sees all reports, plus an extra `adminStats` block.

### Response `200`

```json
{
  "reportStats": {
    "published":   12,
    "pendingDraft": 3,
    "total":       15
  },
  "totalLivesImpacted": 48200,
  "regionData": [
    { "country": "Pakistan",  "livesImpacted": 12000 },
    { "country": "Bangladesh","livesImpacted":  8500 }
  ],
  "recentActivity": [
    { "projectName": "Clean Water Initiative", "status": "published", "updatedAt": "2026-06-20T09:00:00.000Z" }
  ],
  "adminStats": {
    "total":  6,
    "active": 5
  }
}
```

> `adminStats` is **only present** for `superadmin` callers. `regionData` returns up to 6 entries sorted by `livesImpacted` descending; values are estimated by distributing a report's `livesImpacted` evenly across its countries. `recentActivity` returns the 5 most recently updated reports.

### curl

```bash
curl http://localhost:5173/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## `GET /api/admin/stats`

Returns high-level counts for the dashboard overview card.

### Response `200`

```json
{
  "totalAdmins":  5,
  "activeAdmins": 4
}
```

### curl

```bash
curl http://localhost:5173/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## `GET /api/admin/admins`

List admin accounts with server-side search, status filter, and pagination.

### Query parameters

| Param    | Type    | Default | Description                                                         |
| -------- | ------- | :-----: | ------------------------------------------------------------------- |
| `page`   | integer | `1`     | Page number                                                         |
| `limit`  | integer | `10`    | Items per page (max 100)                                            |
| `q`      | string  | —       | Search term — matches `username`, `email`, or `region` (case-insensitive regex) |
| `status` | string  | —       | `active` or `inactive` — omit to return all                         |
| `role`   | string  | —       | `superadmin`, `editor`, or `viewer` — omit to return all roles      |

### Response `200`

```json
{
  "items": [
    {
      "_id":       "6650a1b2c3d4e5f607a8b9c0",
      "username":  "sadek",
      "email":     "sadek@example.com",
      "role":      "superadmin",
      "region":    "global",
      "isActive":  true,
      "lastLogin": "2026-06-08T10:30:00.000Z",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-06-08T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1,
    "hasPrev": false,
    "hasNext": false
  }
}
```

### curl

```bash
# First page, all users
curl "http://localhost:5173/api/admin/admins" \
  -H "Authorization: Bearer $TOKEN"

# Search active users, page 2
curl "http://localhost:5173/api/admin/admins?q=sadek&status=active&page=2&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## `POST /api/admin/admins`

Create a new admin account directly without the invite flow.

### Request body

| Field      | Type   | Required | Validation                         | Description                       | Example                  |
| ---------- | ------ | :------: | ---------------------------------- | --------------------------------- | ------------------------ |
| `username` | string | Yes      | unique                             | Login handle                      | `"newadmin"`             |
| `email`    | string | Yes      | unique, stored lowercase           | Contact email                     | `"new@example.com"`      |
| `password` | string | Yes      | min 6 characters                         | Initial password (bcrypt hashed)  | `"secure123"`   |
| `role`     | string | No       | `superadmin`, `editor`, or `viewer`      | Defaults to `"editor"`            | `"editor"`      |

Example:

```json
{
  "username": "newadmin",
  "email":    "new@example.com",
  "password": "secure123",
  "role":     "editor"
}
```

### Response `201`

Returns the created admin object (no `password` field).

### Errors

| Status | Condition                             |
| ------ | ------------------------------------- |
| `400`  | Missing required fields               |
| `400`  | Username or email already exists      |
| `403`  | Caller is not `superadmin`            |

### curl

```bash
curl -X POST http://localhost:5173/api/admin/admins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"newadmin","email":"new@example.com","password":"secure123","role":"admin"}'
```

---

## `PUT /api/admin/admins/:id`

Update an admin's username, email, role, and/or region.

### URL parameter

| Param | Description                   |
| ----- | ----------------------------- |
| `id`  | MongoDB ObjectId of the admin |

### Request body (all fields optional — only provided fields are updated)

| Field      | Type   | Required | Validation                  | Description                        | Example          |
| ---------- | ------ | :------: | --------------------------- | ---------------------------------- | ---------------- |
| `username` | string | No       | unique                      | New login handle                   | `"updated_name"` |
| `email`    | string | No       | unique, stored lowercase    | New contact email                  | `"new@example.com"` |
| `role`     | string | No       | `superadmin`, `editor`, or `viewer` | New role                      | `"superadmin"`   |
| `region`   | string | No       | free text                           | Assigned region               | `"middle_east"`  |

Example:

```json
{
  "username": "updated_name",
  "role":     "superadmin",
  "region":   "middle_east"
}
```

### Response `200`

Returns the updated admin object.

### Errors

| Status | Condition                            |
| ------ | ------------------------------------ |
| `400`  | Username or email already in use     |
| `403`  | Caller is not `superadmin`           |
| `404`  | Admin not found                      |

### curl

```bash
curl -X PUT http://localhost:5173/api/admin/admins/6650a1b2c3d4e5f607a8b9c0 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"sadek_updated","role":"superadmin"}'
```

---

## `PATCH /api/admin/admins/:id/role`

Change only the role of an admin. Lighter alternative to the full `PUT` when only the role needs updating.

### URL parameter

| Param | Description                   |
| ----- | ----------------------------- |
| `id`  | MongoDB ObjectId of the admin |

### Request body

| Field  | Type   | Required | Validation                            | Description | Example      |
| ------ | ------ | :------: | ------------------------------------- | ----------- | ------------ |
| `role` | string | Yes      | `superadmin`, `editor`, or `viewer`   | New role    | `"editor"`   |

Example:

```json
{ "role": "editor" }
```

### Response `200`

Returns the updated admin object.

### Errors

| Status | Condition                                               |
| ------ | ------------------------------------------------------- |
| `400`  | `role` is not `superadmin`, `editor`, or `viewer`       |
| `403`  | Caller is not `superadmin`                              |
| `404`  | Admin not found                                         |

### curl

```bash
curl -X PATCH http://localhost:5173/api/admin/admins/6650a1b2c3d4e5f607a8b9c0/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"editor"}'
```

---

## `PATCH /api/admin/admins/:id/toggle`

Toggle the `isActive` status of an admin account between active and suspended. No request body required.

### URL parameter

| Param | Description                   |
| ----- | ----------------------------- |
| `id`  | MongoDB ObjectId of the admin |

### Response `200`

Returns the updated admin object with the new `isActive` value.

### Errors

| Status | Condition                    |
| ------ | ---------------------------- |
| `403`  | Caller is not `superadmin`   |
| `404`  | Admin not found              |

### curl

```bash
# Toggles isActive: active → suspended or suspended → active
curl -X PATCH http://localhost:5173/api/admin/admins/6650a1b2c3d4e5f607a8b9c0/toggle \
  -H "Authorization: Bearer $TOKEN"
```

---

## `DELETE /api/admin/admins/:id`

Permanently remove an admin account from the database. This action is irreversible.

### URL parameter

| Param | Description                   |
| ----- | ----------------------------- |
| `id`  | MongoDB ObjectId of the admin |

> An admin cannot delete their own account — the server returns `400`.

### Response `200`

```json
{ "message": "Admin deleted successfully" }
```

### Errors

| Status | Condition                              |
| ------ | -------------------------------------- |
| `400`  | Attempting to delete own account       |
| `403`  | Caller is not `superadmin`             |

### curl

```bash
curl -X DELETE http://localhost:5173/api/admin/admins/6650a1b2c3d4e5f607a8b9c0 \
  -H "Authorization: Bearer $TOKEN"
```

---

## `PUT /api/admin/settings/password`

Change the authenticated admin's own password.

### Request body

| Field             | Type   | Required | Validation       | Description            |
| ----------------- | ------ | :------: | ---------------- | ---------------------- |
| `currentPassword` | string | Yes      | non-empty        | Existing password      |
| `newPassword`     | string | Yes      | min 6 characters | Replacement password   |

```json
{ "currentPassword": "old123", "newPassword": "newSecure456" }
```

### Response `200`

```json
{ "message": "Password updated successfully" }
```

### Errors

| Status | Condition                                   |
| ------ | ------------------------------------------- |
| `400`  | Missing fields or new password too short    |
| `400`  | `currentPassword` is incorrect              |

### curl

```bash
curl -X PUT http://localhost:5173/api/admin/settings/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"old123","newPassword":"newSecure456"}'
```

---

## `PUT /api/admin/settings/profile`

Update the authenticated admin's own username and/or email.

### Request body (all fields optional)

| Field      | Type   | Required | Description           |
| ---------- | ------ | :------: | --------------------- |
| `username` | string | No       | New login handle      |
| `email`    | string | No       | New contact email     |

### Response `200`

Returns the updated admin object (safe — no sensitive fields).

### Errors

| Status | Condition                            |
| ------ | ------------------------------------ |
| `400`  | Username or email already in use     |

### curl

```bash
curl -X PUT http://localhost:5173/api/admin/settings/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"new_handle"}'
```

---

## `POST /api/admin/settings/setup-totp`

Begins authenticator app setup for the signed-in admin. Generates a new TOTP secret, stores it (unactivated — `totpEnabled: false`) on the Admin document, and returns a QR code to scan.

The setup is **not active** until the admin completes `POST /verify-totp-setup` with a valid code. Calling this endpoint again before verifying will overwrite the previous secret.

### Response `200`

```json
{
  "qrDataUrl": "data:image/png;base64,iVBORw0KGgoAAAA...",
  "secret":    "JBSWY3DPEHPK3PXP"
}
```

| Field       | Description                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| `qrDataUrl` | Base64 PNG data URL — render directly in an `<img>` tag for the admin to scan with their authenticator |
| `secret`    | Plain-text Base32 secret — shown as fallback for manual entry if camera is unavailable                 |

> The `secret` must be treated as sensitive. It is returned only at setup time and is never returned again — it is stripped from all other API responses.

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `401`  | Token missing, invalid, or expired |
| `500`  | Secret generation or QR render failed |

### curl

```bash
curl -X POST http://localhost:5173/api/admin/settings/setup-totp \
  -H "Authorization: Bearer $TOKEN"
```

---

## `POST /api/admin/settings/verify-totp-setup`

Confirms that the admin successfully scanned the QR code by submitting the first valid TOTP code from their authenticator app. On success, sets `totpEnabled: true` on the Admin document.

### Request body

| Field  | Type   | Required | Description                                     |
| ------ | ------ | :------: | ----------------------------------------------- |
| `code` | string | Yes      | 6-digit code currently shown in authenticator   |

```json
{ "code": "482931" }
```

### Response `200`

```json
{
  "message": "Authenticator app enabled successfully",
  "admin": { ...adminObject }
}
```

Returns the full updated admin object. The client should update its local session with the new `totpEnabled: true` value.

### Errors

| Status | Condition                                              |
| ------ | ------------------------------------------------------ |
| `400`  | `code` missing                                         |
| `400`  | No setup in progress (call `setup-totp` first)         |
| `400`  | Incorrect code                                         |

### curl

```bash
curl -X POST http://localhost:5173/api/admin/settings/verify-totp-setup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"482931"}'
```

---

## `DELETE /api/admin/settings/disable-totp`

Removes the authenticator app from the signed-in admin's account. Clears `totpSecret`, sets `totpEnabled: false`, and clears `totpLastUsedCode`. After this, if 2FA is required platform-wide, the admin will fall back to email OTP at next login.

### Response `200`

```json
{
  "message": "Authenticator app removed",
  "admin": { ...adminObject }
}
```

Returns the full updated admin object (`totpEnabled: false`).

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `401`  | Token missing, invalid, or expired |

### curl

```bash
curl -X DELETE http://localhost:5173/api/admin/settings/disable-totp \
  -H "Authorization: Bearer $TOKEN"
```

---

## `POST /api/admin/backfill-slugs`

One-off maintenance endpoint. Iterates all `Report` documents that have no `slug` field and generates one from their `projectName` using the same `toSlug()` + `uniqueSlug()` logic used at creation time. Safe to run multiple times — reports with an existing slug are skipped.

Requires **superadmin** role. Also available as `npm run backfill:slugs` from the CLI.

### Response `200`

```json
{
  "fixed": 7,
  "reports": [
    { "id": "6650a1b2c3d4e5f607a8b9c2", "name": "Winter Relief Alpha", "slug": "winter-relief-alpha" }
  ]
}
```

| Field     | Description                                              |
| --------- | -------------------------------------------------------- |
| `fixed`   | Number of reports that received a new slug               |
| `reports` | Array of `{ id, name, slug }` for each updated report    |

### Errors

| Status | Condition                   |
| ------ | --------------------------- |
| `403`  | Caller is not `superadmin`  |
| `500`  | Database error              |

### curl

```bash
curl -X POST http://localhost:5173/api/admin/backfill-slugs \
  -H "Authorization: Bearer $TOKEN"
```
