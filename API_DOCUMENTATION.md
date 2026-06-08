# Impact Reports — API Documentation

Complete reference for every REST endpoint exposed by the Express backend.

---

## Table of Contents

- [Overview](#overview)
- [Base URL & Setup](#base-url--setup)
- [Authentication](#authentication)
- [Error Format](#error-format)
- [Pagination](#pagination)
- [Data Models](#data-models)
- [Endpoints](#endpoints)
  - [Health](#health)
  - [Auth](#auth)
  - [Admin — Users](#admin--users)
  - [Admin — Settings](#admin--settings)
  - [Admin — Stats](#admin--stats)
  - [Invite](#invite)

---

## Overview

| Property       | Value                        |
| -------------- | ---------------------------- |
| Runtime        | Node.js + Express (ES modules) |
| Database       | MongoDB Atlas (Mongoose)     |
| Auth mechanism | JWT — Bearer token           |
| Token lifetime | 24 hours (`JWT_EXPIRES_IN`)  |
| Content-Type   | `application/json`           |
| CORS origins   | `http://localhost:5173`, `http://localhost:4173` |

---

## Base URL & Setup

### Starting the server

```bash
cd server
npm install
node index.js          # or: nodemon index.js
```

Server starts on **`http://localhost:5000`** by default (`PORT` env var overrides).

### Environment variables (`server/.env`)

| Variable        | Required | Description                              |
| --------------- | -------- | ---------------------------------------- |
| `MONGODB_URI`   | Yes      | MongoDB Atlas connection string          |
| `JWT_SECRET`    | Yes      | Secret key for signing JWTs             |
| `JWT_EXPIRES_IN`| Yes      | JWT lifetime, e.g. `24h`                |
| `PORT`          | No       | HTTP port (default `5000`)              |
| `APP_URL`       | No       | Frontend origin, used in invite emails  |
| `SMTP_HOST`     | No       | SMTP host — omit to use console fallback |
| `SMTP_PORT`     | No       | SMTP port (default `587`)               |
| `SMTP_USER`     | No       | SMTP username / API key                 |
| `SMTP_PASS`     | No       | SMTP password                           |
| `SMTP_FROM`     | No       | From address in outgoing emails         |

### Seed the first superadmin

```bash
node server/scripts/seed.js
```

Creates the default account if it does not already exist:

| Field    | Value                          |
| -------- | ------------------------------ |
| Username | `admin`                        |
| Password | `admin123`                     |
| Email    | `admin@humanconcernusa.org`    |
| Role     | `superadmin`                   |

> **Change the password immediately after first login.**

---

## Authentication

Protected routes require a JWT passed in the `Authorization` header:

```
Authorization: Bearer <token>
```

Obtain a token by calling `POST /api/auth/login`. The token expires after 24 hours. When it expires the server returns `401` and the frontend dispatches an `admin:unauthorized` event to trigger automatic logout.

**Role levels**

| Role         | Permissions                                                    |
| ------------ | -------------------------------------------------------------- |
| `superadmin` | Full access — all endpoints, can manage other admins           |
| `admin`      | Limited access — cannot manage users, settings, or invite superadmins |

---

## Error Format

All error responses follow the same shape:

```json
{
  "message": "Human-readable description of the error"
}
```

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| `400`  | Bad request — missing or invalid fields         |
| `401`  | Unauthorized — no/invalid/expired token         |
| `403`  | Forbidden — authenticated but not permitted     |
| `404`  | Resource not found                              |
| `500`  | Internal server error                           |

---

## Pagination

Endpoints that return lists support server-side pagination via query parameters.

**Query parameters**

| Param   | Type    | Default | Description                       |
| ------- | ------- | ------- | --------------------------------- |
| `page`  | integer | `1`     | Page number (1-based)             |
| `limit` | integer | `10`    | Items per page (max `100`)        |

**Response envelope**

```json
{
  "items": [ /* array of objects */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5,
    "hasPrev": false,
    "hasNext": true
  }
}
```

---

## Data Models

### Admin

```json
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
```

> `password` is **never** returned in any response.

**Role values:** `superadmin` | `admin`

**Region values:** free string, default `"global"`. Common values: `"global"`, `"south_asia"`, `"middle_east"`, `"africa"`, etc.

---

### Invite

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

> `tokenHash` (SHA-256 of the raw token) is stored in the database but never returned in any response.

---

## Endpoints

---

### Health

#### `GET /api/health`

Check that the server is running. No authentication required.

**Response `200`**

```json
{
  "status": "ok",
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

**curl**

```bash
curl http://localhost:5000/api/health
```

---

### Auth

#### `POST /api/auth/login`

Authenticate an admin and receive a JWT.

**Auth required:** No

**Request body**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

| Field      | Type   | Required | Notes                |
| ---------- | ------ | -------- | -------------------- |
| `username` | string | Yes      | Case-sensitive       |
| `password` | string | Yes      | Minimum 6 characters |

**Response `200`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id":       "6650a1b2c3d4e5f607a8b9c0",
    "username":  "admin",
    "email":     "admin@humanconcernusa.org",
    "role":      "superadmin",
    "region":    "global",
    "isActive":  true,
    "lastLogin": "2026-06-08T10:30:00.000Z",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-06-08T10:30:00.000Z"
  }
}
```

**Errors**

| Status | Condition                                      |
| ------ | ---------------------------------------------- |
| `400`  | `username` or `password` missing               |
| `401`  | Wrong credentials, or account is inactive      |

**curl**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

> Save the returned `token` in a variable for subsequent requests:
>
> ```bash
> TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
>   -H "Content-Type: application/json" \
>   -d '{"username":"admin","password":"admin123"}' | jq -r '.token')
> ```

---

#### `GET /api/auth/me`

Return the profile of the currently authenticated admin.

**Auth required:** Yes

**Response `200`**

```json
{
  "admin": {
    "_id":      "6650a1b2c3d4e5f607a8b9c0",
    "username": "admin",
    "email":    "admin@humanconcernusa.org",
    "role":     "superadmin",
    "region":   "global",
    "isActive": true,
    "lastLogin":"2026-06-08T10:30:00.000Z"
  }
}
```

**curl**

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### Admin — Stats

#### `GET /api/admin/stats`

Return high-level admin account counts for the dashboard overview card.

**Auth required:** Yes (any role)

**Response `200`**

```json
{
  "totalAdmins":  5,
  "activeAdmins": 4
}
```

**curl**

```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

### Admin — Users

#### `GET /api/admin/admins`

List all admin accounts with server-side search, status filter, and pagination.

**Auth required:** Yes (any role)

**Query parameters**

| Param    | Type   | Default | Description                                    |
| -------- | ------ | ------- | ---------------------------------------------- |
| `page`   | int    | `1`     | Page number                                    |
| `limit`  | int    | `10`    | Items per page (max 100)                       |
| `q`      | string | —       | Search by `username`, `email`, or `region` (case-insensitive regex) |
| `status` | string | —       | `active` or `inactive` — omit to return all   |

**Response `200`**

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

**curl examples**

```bash
# All users, page 1
curl "http://localhost:5000/api/admin/admins" \
  -H "Authorization: Bearer $TOKEN"

# Search + filter active, page 2
curl "http://localhost:5000/api/admin/admins?q=sadek&status=active&page=2&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

#### `POST /api/admin/admins`

Create a new admin account directly (without invite flow).

**Auth required:** Yes — `superadmin` only

**Request body**

```json
{
  "username": "newadmin",
  "email":    "newadmin@example.com",
  "password": "secure123",
  "role":     "admin"
}
```

| Field      | Type   | Required | Notes                                    |
| ---------- | ------ | -------- | ---------------------------------------- |
| `username` | string | Yes      | Must be unique                           |
| `email`    | string | Yes      | Must be unique, stored lowercase         |
| `password` | string | Yes      | Minimum 6 characters, bcrypt hashed      |
| `role`     | string | No       | `"admin"` (default) or `"superadmin"`   |

**Response `201`** — returns the created admin object (no password field)

**Errors**

| Status | Condition                             |
| ------ | ------------------------------------- |
| `400`  | Missing required fields               |
| `400`  | Username or email already exists      |
| `403`  | Caller is not `superadmin`            |

**curl**

```bash
curl -X POST http://localhost:5000/api/admin/admins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"newadmin","email":"new@example.com","password":"secure123","role":"admin"}'
```

---

#### `PUT /api/admin/admins/:id`

Fully update an admin's profile — username, email, role, and region.

**Auth required:** Yes — `superadmin` only

**URL parameter:** `:id` — MongoDB ObjectId of the target admin

**Request body** (all fields optional; only provided fields are updated)

```json
{
  "username": "updated_name",
  "email":    "updated@example.com",
  "role":     "superadmin",
  "region":   "middle_east"
}
```

| Field      | Type   | Notes                                    |
| ---------- | ------ | ---------------------------------------- |
| `username` | string | Must be unique                           |
| `email`    | string | Stored lowercase, must be unique         |
| `role`     | string | `"admin"` or `"superadmin"`             |
| `region`   | string | Free text, e.g. `"global"`, `"africa"`  |

**Response `200`** — updated admin object

**Errors**

| Status | Condition                            |
| ------ | ------------------------------------ |
| `400`  | Username or email already in use     |
| `403`  | Caller is not `superadmin`           |
| `404`  | Admin not found                      |

**curl**

```bash
curl -X PUT http://localhost:5000/api/admin/admins/6650a1b2c3d4e5f607a8b9c0 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"sadek_updated","role":"superadmin"}'
```

---

#### `PATCH /api/admin/admins/:id/role`

Change only the role of an admin account.

**Auth required:** Yes — `superadmin` only

**URL parameter:** `:id` — MongoDB ObjectId of the target admin

**Request body**

```json
{
  "role": "admin"
}
```

| Field  | Type   | Required | Notes                           |
| ------ | ------ | -------- | ------------------------------- |
| `role` | string | Yes      | `"admin"` or `"superadmin"`    |

**Response `200`** — updated admin object

**Errors**

| Status | Condition                        |
| ------ | -------------------------------- |
| `400`  | Invalid role value               |
| `403`  | Caller is not `superadmin`       |
| `404`  | Admin not found                  |

**curl**

```bash
curl -X PATCH http://localhost:5000/api/admin/admins/6650a1b2c3d4e5f607a8b9c0/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

---

#### `PATCH /api/admin/admins/:id/toggle`

Toggle the `isActive` status of an admin account (active ↔ suspended).

**Auth required:** Yes — `superadmin` only

**URL parameter:** `:id` — MongoDB ObjectId of the target admin

**Request body:** none

**Response `200`** — updated admin object with the new `isActive` value

**Errors**

| Status | Condition                        |
| ------ | -------------------------------- |
| `403`  | Caller is not `superadmin`       |
| `404`  | Admin not found                  |

**curl**

```bash
# Toggles isActive (active → inactive, or vice versa)
curl -X PATCH http://localhost:5000/api/admin/admins/6650a1b2c3d4e5f607a8b9c0/toggle \
  -H "Authorization: Bearer $TOKEN"
```

---

#### `DELETE /api/admin/admins/:id`

Permanently delete an admin account.

**Auth required:** Yes — `superadmin` only

**URL parameter:** `:id` — MongoDB ObjectId of the target admin

> An admin cannot delete their own account — the server will reject it with `400`.

**Response `200`**

```json
{
  "message": "Admin deleted successfully"
}
```

**Errors**

| Status | Condition                               |
| ------ | --------------------------------------- |
| `400`  | Attempting to delete own account        |
| `403`  | Caller is not `superadmin`              |

**curl**

```bash
curl -X DELETE http://localhost:5000/api/admin/admins/6650a1b2c3d4e5f607a8b9c0 \
  -H "Authorization: Bearer $TOKEN"
```

---

### Admin — Settings

#### `PUT /api/admin/settings/password`

Change the password of the currently authenticated admin.

**Auth required:** Yes (any role)

**Request body**

```json
{
  "currentPassword": "admin123",
  "newPassword":     "newSecure456"
}
```

| Field             | Type   | Required | Notes                        |
| ----------------- | ------ | -------- | ---------------------------- |
| `currentPassword` | string | Yes      | Must match the stored hash   |
| `newPassword`     | string | Yes      | Minimum 6 characters         |

**Response `200`**

```json
{
  "message": "Password updated successfully"
}
```

**Errors**

| Status | Condition                              |
| ------ | -------------------------------------- |
| `400`  | Missing fields or `newPassword` too short |
| `400`  | `currentPassword` is incorrect         |

**curl**

```bash
curl -X PUT http://localhost:5000/api/admin/settings/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"newSecure456"}'
```

---

#### `PUT /api/admin/settings/profile`

Update the username and/or email of the currently authenticated admin.

**Auth required:** Yes (any role)

**Request body** (all fields optional)

```json
{
  "username": "new_username",
  "email":    "new@example.com"
}
```

**Response `200`** — updated admin object

**Errors**

| Status | Condition                       |
| ------ | ------------------------------- |
| `400`  | Username or email already in use |

**curl**

```bash
curl -X PUT http://localhost:5000/api/admin/settings/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"updated_me"}'
```

---

### Invite

#### `POST /api/invite`

Send an email invitation to a new user with a time-limited registration link.

**Auth required:** Yes (any role; only `superadmin` can invite another `superadmin`)

**How it works**

1. Generates a cryptographically random 64-character token (`crypto.randomBytes(32)`)
2. Stores a SHA-256 hash of that token in the `invites` collection — the raw token is never stored
3. Sends an email to the target address with a link: `{APP_URL}/admin/register?token={rawToken}`
4. Invite expires after **48 hours**
5. If an unused invite already exists for that email it is replaced

**Request body**

```json
{
  "email":  "newuser@example.com",
  "role":   "admin",
  "region": "south_asia"
}
```

| Field    | Type   | Required | Notes                                              |
| -------- | ------ | -------- | -------------------------------------------------- |
| `email`  | string | Yes      | Target email — must not already exist as an admin  |
| `role`   | string | Yes      | `"admin"` or `"superadmin"`                       |
| `region` | string | No       | Defaults to `"global"`                             |

**Response `200`**

```json
{
  "message": "Invite sent successfully"
}
```

**Errors**

| Status | Condition                                         |
| ------ | ------------------------------------------------- |
| `400`  | `email` missing                                   |
| `400`  | Invalid `role` value                              |
| `400`  | Admin with that email already exists              |
| `403`  | Non-superadmin trying to invite a superadmin      |

**curl**

```bash
curl -X POST http://localhost:5000/api/invite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","role":"admin","region":"global"}'
```

---

#### `GET /api/invite/validate`

Validate an invite token before showing the registration form. Called by the frontend on the `/admin/register` page.

**Auth required:** No

**Query parameters**

| Param   | Type   | Required | Description                        |
| ------- | ------ | -------- | ---------------------------------- |
| `token` | string | Yes      | Raw 64-character token from the email link |

**Response `200`** — token is valid and not yet used

```json
{
  "email":  "newuser@example.com",
  "role":   "admin",
  "region": "global"
}
```

**Errors**

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| `400`  | `token` query param missing                   |
| `400`  | Token not found, already used, or expired     |

**curl**

```bash
curl "http://localhost:5000/api/invite/validate?token=<64-char-token>"
```

---

#### `POST /api/invite/register`

Complete registration using a valid invite token. Creates the admin account and marks the invite as used.

**Auth required:** No

**Request body**

```json
{
  "token":    "<64-char-token-from-email-link>",
  "username": "my_username",
  "password": "secure123"
}
```

| Field      | Type   | Required | Notes                              |
| ---------- | ------ | -------- | ---------------------------------- |
| `token`    | string | Yes      | Raw token from the invite email    |
| `username` | string | Yes      | Minimum 3 characters, must be unique |
| `password` | string | Yes      | Minimum 6 characters               |

The `email`, `role`, and `region` are taken from the stored invite — they cannot be changed by the user.

**Response `201`**

```json
{
  "message": "Account created successfully. You can now log in."
}
```

**Errors**

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| `400`  | Missing required fields                       |
| `400`  | `username` too short (< 3 chars)              |
| `400`  | `password` too short (< 6 chars)              |
| `400`  | Token invalid, already used, or expired       |
| `400`  | Username already taken                        |
| `400`  | Username or email already exists (DB unique)  |

**curl**

```bash
curl -X POST http://localhost:5000/api/invite/register \
  -H "Content-Type: application/json" \
  -d '{
    "token":    "<64-char-token>",
    "username": "my_username",
    "password": "secure123"
  }'
```

---

## Full Flow Example

Below is a complete end-to-end walkthrough using curl.

### 1. Login

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

echo "Token: $TOKEN"
```

### 2. Check who you are

```bash
curl -s http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3. List users (page 1, 10 per page)

```bash
curl -s "http://localhost:5000/api/admin/admins?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Search for a user

```bash
curl -s "http://localhost:5000/api/admin/admins?q=sadek&status=active" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 5. Invite a new admin

```bash
curl -s -X POST http://localhost:5000/api/invite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"colleague@example.com","role":"admin","region":"south_asia"}' | jq
```

### 6. (Recipient) Validate their invite link

```bash
# Token comes from the email link: /admin/register?token=<token>
curl -s "http://localhost:5000/api/invite/validate?token=<token>" | jq
```

### 7. (Recipient) Complete registration

```bash
curl -s -X POST http://localhost:5000/api/invite/register \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>","username":"colleague","password":"welcome99"}' | jq
```

### 8. Toggle a user's active status

```bash
USER_ID="6650a1b2c3d4e5f607a8b9c0"
curl -s -X PATCH "http://localhost:5000/api/admin/admins/$USER_ID/toggle" \
  -H "Authorization: Bearer $TOKEN" | jq '.isActive'
```

### 9. Change your own password

```bash
curl -s -X PUT http://localhost:5000/api/admin/settings/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"strongNew99"}' | jq
```

---

## Testing with Postman

1. Create a new **Collection** named `Impact Reports API`
2. Add a **Collection Variable** `baseUrl` = `http://localhost:5000`
3. Add a **Collection Variable** `token` (leave empty initially)
4. In the **Login** request, add a **Test** script to auto-capture the token:
   ```javascript
   const json = pm.response.json();
   if (json.token) {
     pm.collectionVariables.set('token', json.token);
   }
   ```
5. For all protected requests, set **Authorization** → `Bearer Token` → `{{token}}`

**Import-ready environment** — create `impact-reports.postman_environment.json`:

```json
{
  "name": "Impact Reports",
  "values": [
    { "key": "baseUrl", "value": "http://localhost:5000", "enabled": true },
    { "key": "token",   "value": "",                      "enabled": true }
  ]
}
```

---

## Testing with Mailtrap (Invite Emails)

1. Create a free account at [mailtrap.io](https://mailtrap.io)
2. Go to **Email Testing → Inboxes → SMTP Settings**
3. Copy the credentials into `server/.env`:
   ```env
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=587
   SMTP_USER=<your_mailtrap_user>
   SMTP_PASS=<your_mailtrap_pass>
   SMTP_FROM=noreply@impact-reports.local
   ```
4. Restart the server and send an invite — the email will appear in your Mailtrap inbox within seconds
5. The invite link in the email points to `{APP_URL}/admin/register?token=<token>`; set `APP_URL=http://localhost:5173` in `.env`

**Console fallback** — if `SMTP_HOST` is not set, the server prints the invite token to the terminal instead of sending an email. This is useful for local development without SMTP credentials:

```
[MAILER] No SMTP configured — printing to console instead
[MAILER] INVITE EMAIL
To:      colleague@example.com
Subject: You're invited to Impact Reports Admin
Link:    http://localhost:5173/admin/register?token=<token>
```

---

## Endpoint Summary

| Method   | Path                                  | Auth         | Description                        |
| -------- | ------------------------------------- | ------------ | ---------------------------------- |
| `GET`    | `/api/health`                         | No           | Server health check                |
| `POST`   | `/api/auth/login`                     | No           | Login, receive JWT                 |
| `GET`    | `/api/auth/me`                        | Yes          | Get current admin profile          |
| `GET`    | `/api/admin/stats`                    | Yes          | Total & active admin counts        |
| `GET`    | `/api/admin/admins`                   | Yes          | List admins (search + pagination)  |
| `POST`   | `/api/admin/admins`                   | Superadmin   | Create admin directly              |
| `PUT`    | `/api/admin/admins/:id`               | Superadmin   | Update admin profile               |
| `PATCH`  | `/api/admin/admins/:id/role`          | Superadmin   | Change admin role                  |
| `PATCH`  | `/api/admin/admins/:id/toggle`        | Superadmin   | Toggle active/suspended            |
| `DELETE` | `/api/admin/admins/:id`               | Superadmin   | Delete admin                       |
| `PUT`    | `/api/admin/settings/password`        | Yes          | Change own password                |
| `PUT`    | `/api/admin/settings/profile`         | Yes          | Update own username/email          |
| `POST`   | `/api/invite`                         | Yes          | Send invite email                  |
| `GET`    | `/api/invite/validate`                | No           | Validate invite token              |
| `POST`   | `/api/invite/register`                | No           | Complete registration via invite   |
