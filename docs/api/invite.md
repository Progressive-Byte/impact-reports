# Invite API

Mounted at `/api/invite`.

| Method | Path                      | Auth   | Body                               | Notes                                  |
| ------ | ------------------------- | ------ | ---------------------------------- | -------------------------------------- |
| POST   | `/api/invite`             | Bearer | `email`, `role`, `region?`         | Send invite email to a new user        |
| GET    | `/api/invite/validate`    | Public | —                                  | Validate an invite token (query param) |
| POST   | `/api/invite/register`    | Public | `token`, `username`, `password`    | Complete registration via invite token |

---

## How the invite flow works

1. An authenticated admin calls `POST /api/invite` with the target email, role, and optional region.
2. The server generates a 64-character cryptographically random token, stores its **SHA-256 hash** in the database (the raw token is never stored), and emails the target address a registration link: `{APP_URL}/admin/register?token=<rawToken>`.
3. The invite expires in **48 hours**. If an unused invite already exists for that email it is replaced.
4. The recipient opens the link — the frontend calls `GET /api/invite/validate?token=<rawToken>` to check validity and pre-fill the email/role on the form.
5. On submit, the frontend calls `POST /api/invite/register`. The server creates the admin account from the stored invite data, marks the invite as used, and returns success.

---

## Invite object (internal)

```json
{
  "_id":       "6650a1b2c3d4e5f607a8b9c1",
  "email":     "newuser@example.com",
  "role":      "admin",
  "region":    "south_asia",
  "used":      false,
  "expiresAt": "2026-06-10T10:00:00.000Z",
  "createdAt": "2026-06-08T10:00:00.000Z"
}
```

> `tokenHash` is stored internally and **never** returned in any response.

---

## `POST /api/invite`

Send an invite email to a new user. Only `superadmin` callers can invite another `superadmin`.

### Request body

| Field    | Type   | Required | Validation                  | Description                                          | Example                    |
| -------- | ------ | :------: | --------------------------- | ---------------------------------------------------- | -------------------------- |
| `email`  | string | Yes      | valid email, not existing   | Recipient email — must not already be an admin       | `"newuser@example.com"`    |
| `role`   | string | Yes      | `superadmin` or `admin`     | Role the new admin will receive on registration      | `"admin"`                  |
| `region` | string | No       | free text                   | Assigned region — defaults to `"global"`             | `"south_asia"`             |

Example:

```json
{
  "email":  "newuser@example.com",
  "role":   "admin",
  "region": "south_asia"
}
```

### Response `200`

```json
{ "message": "Invite sent successfully" }
```

### Errors

| Status | Condition                                              |
| ------ | ------------------------------------------------------ |
| `400`  | `email` missing                                        |
| `400`  | `role` is not `superadmin` or `admin`                  |
| `400`  | An admin with that email already exists                |
| `403`  | `admin`-role caller trying to invite a `superadmin`    |

### curl

```bash
curl -X POST http://localhost:5173/api/invite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","role":"admin","region":"global"}'
```

---

## `GET /api/invite/validate`

Check whether an invite token is valid before showing the registration form. Called by the `/admin/register` frontend page on mount.

### Query parameters

| Param   | Type   | Required | Description                                      |
| ------- | ------ | :------: | ------------------------------------------------ |
| `token` | string | Yes      | 64-character raw token from the invite email link |

### Response `200` — token valid and unused

```json
{
  "email":                  "newuser@example.com",
  "role":                   "admin",
  "region":                 "south_asia",
  "enforceStrongPasswords": true
}
```

| Field                    | Description                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `email`                  | Pre-filled on the registration form (read-only)                                                   |
| `role`                   | Role the new account will receive                                                                 |
| `region`                 | Region the new account will be assigned to                                                        |
| `enforceStrongPasswords` | Mirrors the current platform setting. When `true`, the registration form shows a requirements checklist and the submit button is disabled until all checks pass |

### Errors

| Status | Condition                                      |
| ------ | ---------------------------------------------- |
| `400`  | `token` query param missing                    |
| `400`  | Token not found, already used, or expired      |

### curl

```bash
curl "http://localhost:5173/api/invite/validate?token=<64-char-token>"
```

---

## `POST /api/invite/register`

Complete registration using a valid invite token. Creates the admin account and marks the invite consumed. The `email`, `role`, and `region` come from the stored invite — the registrant cannot change them.

### Request body

| Field      | Type   | Required | Validation                                    | Description                           | Example              |
| ---------- | ------ | :------: | --------------------------------------------- | ------------------------------------- | -------------------- |
| `token`    | string | Yes      | non-empty                                     | 64-character raw token from email     | `"<64-char-token>"`  |
| `username` | string | Yes      | min 3 chars, unique                           | Chosen login handle                   | `"my_username"`      |
| `password` | string | Yes      | min 6 chars (min 12 + number + symbol if strong passwords enforced) | Chosen password (bcrypt hashed) | `"welcome99"` |

Example:

```json
{
  "token":    "<64-char-token-from-email-link>",
  "username": "my_username",
  "password": "welcome99"
}
```

### Response `201`

```json
{ "message": "Account created successfully. You can now log in." }
```

### Errors

| Status | Condition                                         |
| ------ | ------------------------------------------------- |
| `400`  | Any of `token`, `username`, or `password` missing                                           |
| `400`  | `username` shorter than 3 characters                                                        |
| `400`  | `password` shorter than 6 characters                                                        |
| `400`  | `password` does not meet strong password requirements (when `enforceStrongPasswords` is on) |
| `400`  | Token not found, already used, or expired                                                   |
| `400`  | `username` already taken                                                                    |
| `400`  | Email already exists (duplicate key on `Admin`)                                             |

### curl

```bash
curl -X POST http://localhost:5173/api/invite/register \
  -H "Content-Type: application/json" \
  -d '{
    "token":    "<64-char-token>",
    "username": "my_username",
    "password": "welcome99"
  }'
```

---

## Email setup (SMTP / Mailtrap)

The mailer uses Nodemailer. Configure SMTP credentials in `server/.env`:

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=<mailtrap_user>
SMTP_PASS=<mailtrap_pass>
SMTP_FROM=noreply@impact-reports.local
APP_URL=http://localhost:5174
```

**Console fallback** — if `SMTP_HOST` is not set the server prints the invite details to the terminal instead of sending an email. Useful for local development:

```
[MAILER] No SMTP configured — printing to console instead
[MAILER] INVITE EMAIL
To:      newuser@example.com
Subject: You're invited to Impact Reports Admin
Link:    http://localhost:5174/admin/register?token=<token>
```
