# Auth API

Mounted at `/api/auth`.

| Method | Path                          | Auth                | Body                                  | Notes                                                                    |
| ------ | ----------------------------- | ------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| POST   | `/api/auth/login`             | Public              | `username`, `password`                | Returns JWT — or `twoFaRequired: true` + `methods` when 2FA is on        |
| POST   | `/api/auth/verify-2fa`        | Public              | `username`, `code`, `method?`         | Submits email OTP or TOTP code; returns JWT on success                   |
| POST   | `/api/auth/resend-2fa-otp`    | Public              | `username`                            | Re-sends email OTP for an active 2FA session                             |
| POST   | `/api/auth/forgot-password`   | Public              | `email`                               | Sends 6-digit reset OTP to the registered email                          |
| POST   | `/api/auth/verify-reset-otp`  | Public              | `email`, `code`                       | Validates reset OTP; returns a short-lived `resetToken`                  |
| POST   | `/api/auth/reset-password`    | Public              | `resetToken`, `password`              | Consumes reset token and sets a new password                             |
| GET    | `/api/auth/me`                | Bearer              | —                                     | Returns current admin profile                                            |
| POST   | `/api/auth/logout`            | Bearer              | —                                     | Records logout event; session teardown is client-side                    |
| GET    | `/api/auth/logs`              | Bearer              | —                                     | Live events from the last 30 days (max 500), newest first, with `meta`   |
| GET    | `/api/auth/logs/export`       | Bearer (superadmin) | —                                     | Download activity logs as CSV or Excel — 1-year or full-history scope    |

---

## `POST /api/auth/login`

Authenticate with username and password. Returns a signed JWT that must be passed as `Authorization: Bearer <token>` on all protected routes.

On success, a `login` event is written to the `ActivityLog` collection (username, role, client IP, timestamp). This event appears in the System Log on the Admin Dashboard.

### Request body

| Field      | Type   | Required | Validation   | Description             | Example      |
| ---------- | ------ | :------: | ------------ | ----------------------- | ------------ |
| `username` | string | Yes      | non-empty    | Admin username          | `"admin"`    |
| `password` | string | Yes      | non-empty    | Admin password          | `"admin123"` |

Example:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Response `200` — 2FA disabled (default)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id":         "6650a1b2c3d4e5f607a8b9c0",
    "username":    "admin",
    "email":       "admin@humanconcernusa.org",
    "role":        "superadmin",
    "region":      "global",
    "isActive":    true,
    "totpEnabled": false,
    "lastLogin":   "2026-06-08T10:30:00.000Z",
    "createdAt":   "2026-01-15T08:00:00.000Z",
    "updatedAt":   "2026-06-08T10:30:00.000Z"
  },
  "sessionTimeoutMinutes": 30
}
```

### Response `200` — 2FA enabled

When `require2fa` is `true` in platform settings, credentials are accepted but **no JWT is returned yet**. The client must proceed to `POST /api/auth/verify-2fa`.

```json
{
  "twoFaRequired": true,
  "methods": ["totp", "email"]
}
```

`methods` lists which verification methods are available for this account:

| Value   | Condition                                                        |
| ------- | ---------------------------------------------------------------- |
| `email` | Always included. A 6-digit OTP is sent to the admin's email **only if TOTP is not set up**. If TOTP is available, email OTP is sent on demand when the user requests it via `POST /resend-2fa-otp`. |
| `totp`  | Included only when the admin has set up an authenticator app (`totpEnabled: true`). No email is sent automatically in this case. |

> `password` is never included in any response.

### Errors

| Status | Condition                                      |
| ------ | ---------------------------------------------- |
| `400`  | `username` or `password` missing               |
| `401`  | Wrong credentials, or the account is inactive  |

### curl

```bash
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Capture the token into a shell variable for follow-up requests:

```bash
TOKEN=$(curl -s -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')
```

---

## `POST /api/auth/verify-2fa`

Completes login when **Require 2FA** is enabled. Called after a successful `POST /login` that returned `{ twoFaRequired: true }`.

Supports two verification methods selected via the `method` field:

| Method  | How it works                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------- |
| `email` | 6-digit OTP sent to the admin's registered email. Hashed and stored in `Admin.loginOTPCode`, expires in 5 minutes. |
| `totp`  | 6-digit TOTP from an authenticator app (Google Authenticator, Authy, etc.). Verified stateless via RFC 6238 HMAC-SHA1; replay attacks blocked via `Admin.totpLastUsedCode`. In-memory rate limiter: max 5 wrong attempts per 15-minute window. |

### Request body

| Field      | Type   | Required | Description                                                          |
| ---------- | ------ | :------: | -------------------------------------------------------------------- |
| `username` | string | Yes      | The username used in the login attempt                               |
| `code`     | string | Yes      | The 6-digit verification code                                        |
| `method`   | string | No       | `"email"` (default) or `"totp"`                                      |

```json
{ "username": "admin", "code": "482931", "method": "totp" }
```

### Response `200`

Same shape as the normal `POST /login` success response (`token` + `admin` + `sessionTimeoutMinutes`).

### Errors

| Status | Condition                                                        |
| ------ | ---------------------------------------------------------------- |
| `400`  | `username` or `code` missing                                     |
| `400`  | Email OTP expired, wrong OTP, or no active session               |
| `400`  | TOTP not configured for account (`method: totp`)                 |
| `400`  | Incorrect TOTP code                                              |
| `400`  | TOTP code already used (replay attempt)                          |
| `429`  | Too many TOTP attempts — try again in N minutes                  |

### curl

```bash
# Email OTP
curl -X POST http://localhost:5173/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","code":"482931","method":"email"}'

# Authenticator app
curl -X POST http://localhost:5173/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","code":"482931","method":"totp"}'
```

---

## `POST /api/auth/resend-2fa-otp`

Regenerates and re-sends the login email OTP during an active 2FA session. The previous code is invalidated and a fresh 5-minute window starts. Also used when an admin switches to the Email tab while TOTP is available — the client calls this on tab switch to ensure a fresh code is in the inbox.

Always returns `200` regardless of whether the username is valid, to avoid leaking account existence.

### Request body

| Field      | Type   | Required | Description                            |
| ---------- | ------ | :------: | -------------------------------------- |
| `username` | string | Yes      | The username of the 2FA session owner  |

```json
{ "username": "admin" }
```

### Response `200`

```json
{ "message": "If a 2FA session is active, a new code has been sent." }
```

### curl

```bash
curl -X POST http://localhost:5173/api/auth/resend-2fa-otp \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}'
```

---

## `GET /api/auth/me`

Returns the profile of the currently authenticated admin. Useful for re-hydrating session state after a page refresh.

Headers: `Authorization: Bearer <token>`

### Response `200`

```json
{
  "admin": {
    "_id":         "6650a1b2c3d4e5f607a8b9c0",
    "username":    "admin",
    "email":       "admin@humanconcernusa.org",
    "role":        "superadmin",
    "region":      "global",
    "isActive":    true,
    "totpEnabled": true,
    "lastLogin":   "2026-06-08T10:30:00.000Z",
    "createdAt":   "2026-01-15T08:00:00.000Z",
    "updatedAt":   "2026-06-08T10:30:00.000Z"
  }
}
```

### Errors

| Status | Condition                              |
| ------ | -------------------------------------- |
| `401`  | Token missing, invalid, or expired     |
| `401`  | Account is inactive                    |

### curl

```bash
curl http://localhost:5173/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## `POST /api/auth/logout`

Records a `logout` event in the `ActivityLog` collection. Session teardown (cookie deletion, localStorage clear) is handled client-side — this endpoint only exists to persist the event for the System Log.

Headers: `Authorization: Bearer <token>`

### Response `200`

```json
{ "message": "Logged out" }
```

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `401`  | Token missing, invalid, or expired |

### curl

```bash
curl -X POST http://localhost:5173/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## `GET /api/auth/logs`

Returns live login/logout events from the **last 30 days**, newest first (max 500 rows). Only records where `archivedAt` is `null` are returned — records soft-archived after 1 year are excluded. Used to populate the **System Log** tab on the Admin Dashboard.

Headers: `Authorization: Bearer <token>`

### ActivityLog object

```json
{
  "_id":        "6650a1b2c3d4e5f607a8b9e0",
  "type":       "login",
  "username":   "sadekur",
  "role":       "admin",
  "ip":         "127.0.0.1",
  "archivedAt": null,
  "createdAt":  "2026-06-16T10:45:00.000Z",
  "updatedAt":  "2026-06-16T10:45:00.000Z"
}
```

| Field        | Values                  | Description                                            |
| ------------ | ----------------------- | ------------------------------------------------------ |
| `type`       | `login` / `logout`      | Event type                                             |
| `username`   | string                  | Admin username at time of event                        |
| `role`       | `admin` / `superadmin`  | Role at time of event                                  |
| `ip`         | string                  | Client IP (`x-forwarded-for` header takes precedence)  |
| `archivedAt` | `null` / ISO date       | `null` = live record; date = soft-archived after 1 year |

### Response `200`

```json
{
  "logs": [
    {
      "_id":        "6650a1b2c3d4e5f607a8b9e0",
      "type":       "login",
      "username":   "sadekur",
      "role":       "admin",
      "ip":         "127.0.0.1",
      "archivedAt": null,
      "createdAt":  "2026-06-16T10:45:00.000Z"
    }
  ],
  "meta": {
    "total":      42,
    "windowDays": 30
  }
}
```

| Meta field    | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `total`       | Total event count in the 30-day window (may exceed 500)        |
| `windowDays`  | Always `30` — the display window in days                       |

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `401`  | Token missing, invalid, or expired |
| `500`  | Database error                     |

### curl

```bash
curl http://localhost:5173/api/auth/logs \
  -H "Authorization: Bearer $TOKEN"
```

---

## `GET /api/auth/logs/export`

Downloads activity logs as a flat file. Only `superadmin` can call this.

### Log retention policy

| State     | Condition                              | Visible in display | Included in export           |
| --------- | -------------------------------------- | :----------------: | :---------------------------: |
| Live      | `archivedAt: null`, ≤ 365 days old     | Yes (if ≤ 30 days) | `scope=year` and `scope=all` |
| Archived  | `archivedAt` set by monthly cron       | No                 | `scope=all` only             |

Records are **never permanently deleted**. The monthly archival cron (runs 02:00 on 1st of every month) soft-archives records older than 365 days by setting `archivedAt`.

### Query parameters

| Param    | Type   | Default  | Description                                                                |
| -------- | ------ | :------: | -------------------------------------------------------------------------- |
| `format` | string | `csv`    | `csv` — plain text CSV; `excel` — `.xlsx` workbook                         |
| `scope`  | string | `year`   | `year` — live records from the last 365 days; `all` — every record including archived (full audit trail) |

### Response

Returns a file download with the appropriate `Content-Disposition` header.

- **CSV**: `Content-Type: text/csv`, filename `activity-logs-{scope}-YYYY-MM-DD.csv`
- **Excel**: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, filename `activity-logs-{scope}-YYYY-MM-DD.xlsx`

Each row contains: `Type`, `Username`, `Role`, `IP`, `Timestamp`, `Archived`.  
`Archived` is blank for live records and an ISO timestamp for soft-archived records.

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `401`  | Token missing, invalid, or expired |
| `403`  | Caller is not `superadmin`         |
| `500`  | Export generation failed           |

### curl

```bash
# Last 1 year — CSV (default)
curl "http://localhost:5173/api/auth/logs/export?format=csv&scope=year" \
  -H "Authorization: Bearer $TOKEN" \
  -o activity-logs-year.csv

# Full history including archived — Excel
curl "http://localhost:5173/api/auth/logs/export?format=excel&scope=all" \
  -H "Authorization: Bearer $TOKEN" \
  -o activity-logs-all.xlsx
```

---

## `POST /api/auth/forgot-password`

Sends a 6-digit OTP to the admin's registered email to begin the password reset flow. Always returns `200` regardless of whether the email is registered, to prevent account enumeration.

The OTP expires in **10 minutes**. If the admin is found and active, the hashed OTP is stored on the `Admin` document in `resetOTPCode` / `resetOTPExpires` and cleared after successful verification.

### Request body

| Field   | Type   | Required | Description                       |
| ------- | ------ | :------: | --------------------------------- |
| `email` | string | Yes      | The admin's registered email      |

```json
{ "email": "admin@humanconcernusa.org" }
```

### Response `200`

```json
{ "message": "If that email is registered, a verification code has been sent." }
```

### curl

```bash
curl -X POST http://localhost:5173/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@humanconcernusa.org"}'
```

---

## `POST /api/auth/verify-reset-otp`

Validates the 6-digit reset OTP. On success, returns a short-lived `resetToken` (JWT with `pendingReset: true`, valid for **15 minutes**) that must be passed to `POST /reset-password`.

The OTP is cleared from the database immediately after successful verification.

### Request body

| Field   | Type   | Required | Description                    |
| ------- | ------ | :------: | ------------------------------ |
| `email` | string | Yes      | The admin's registered email   |
| `code`  | string | Yes      | The 6-digit OTP from the email |

```json
{ "email": "admin@humanconcernusa.org", "code": "739201" }
```

### Response `200`

```json
{ "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

### Errors

| Status | Condition                                            |
| ------ | ---------------------------------------------------- |
| `400`  | `email` or `code` missing                            |
| `400`  | No OTP found, OTP expired, or incorrect code         |

### curl

```bash
curl -X POST http://localhost:5173/api/auth/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@humanconcernusa.org","code":"739201"}'
```

---

## `POST /api/auth/reset-password`

Sets a new password using the `resetToken` issued by `POST /verify-reset-otp`. The token is a single-use JWT (`pendingReset: true`) valid for 15 minutes.

### Request body

| Field        | Type   | Required | Validation        | Description                              |
| ------------ | ------ | :------: | ----------------- | ---------------------------------------- |
| `resetToken` | string | Yes      | valid JWT         | Token from `POST /verify-reset-otp`      |
| `password`   | string | Yes      | min 6 characters  | The new password (hashed before storage) |

```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password":   "newSecurePass123"
}
```

### Response `200`

```json
{ "message": "Password updated successfully. You can now log in." }
```

### Errors

| Status | Condition                                          |
| ------ | -------------------------------------------------- |
| `400`  | `resetToken` or `password` missing                 |
| `400`  | Password shorter than 6 characters                 |
| `400`  | Token expired, invalid signature, or not a reset token |
| `400`  | Admin not found or inactive                        |

### curl

```bash
curl -X POST http://localhost:5173/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"<token>","password":"newSecurePass123"}'
```
