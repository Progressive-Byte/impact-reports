# System

## Server

| Property        | Value                                                         |
| --------------- | ------------------------------------------------------------- |
| Runtime         | Node.js + Express (ES modules)                                |
| Database        | MongoDB Atlas via Mongoose                                    |
| Default port    | `5000` — override with `PORT` env var                         |
| CORS origins    | `http://localhost:5173`, `http://localhost:4173`              |
| Content-Type    | `application/json`                                            |

### Start

```bash
cd server
node index.js
```

### Seed default superadmin

```bash
node server/scripts/seed.js
```

Creates one account if none exists yet:

| Field    | Value                       |
| -------- | --------------------------- |
| username | `admin`                     |
| password | `admin123`                  |
| email    | `admin@humanconcernusa.org` |
| role     | `superadmin`                |

> Change the default password immediately after first login.

### Environment variables

| Variable         | Required | Description                                              |
| ---------------- | :------: | -------------------------------------------------------- |
| `MONGODB_URI`    | Yes      | MongoDB Atlas connection string                          |
| `JWT_SECRET`     | Yes      | Secret used to sign JWTs                                 |
| `JWT_EXPIRES_IN` | Yes      | Token lifetime — e.g. `24h`                              |
| `PORT`           | No       | HTTP port (default `5000`)                               |
| `APP_URL`        | No       | Frontend origin — used in invite email links             |
| `SMTP_HOST`      | No       | SMTP host — omit to use console fallback                 |
| `SMTP_PORT`      | No       | SMTP port (default `587`)                                |
| `SMTP_SECURE`    | No       | Set `true` for TLS on port 465 (default `false`)         |
| `SMTP_USER`      | No       | SMTP username / API key                                  |
| `SMTP_PASS`      | No       | SMTP password                                            |
| `SMTP_FROM`               | No       | From address on outgoing emails                     |
| `CLOUDINARY_CLOUD_NAME`   | Yes*     | Cloudinary cloud name (`*` required for image uploads) |
| `CLOUDINARY_API_KEY`      | Yes*     | Cloudinary API key                                  |
| `CLOUDINARY_API_SECRET`   | Yes*     | Cloudinary API secret                               |

---

## Authentication

Protected routes require the JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained from `POST /api/auth/login` and expire after 24 hours.  
When a token expires the server returns `401`. The frontend listens for this and dispatches `admin:unauthorized` to auto-logout the session.

### Role permissions

| Role         | Can access                                              |
| ------------ | ------------------------------------------------------- |
| `admin`      | Own profile/password, overview, reports                 |
| `superadmin` | Everything — full user management, invite other admins  |

---

## Error format

All error responses use the same shape:

```json
{ "message": "Human-readable description of the error" }
```

| Status | Meaning                                      |
| ------ | -------------------------------------------- |
| `400`  | Bad request — missing or invalid input       |
| `401`  | Unauthorized — no token, invalid, or expired |
| `403`  | Forbidden — authenticated but not permitted  |
| `404`  | Resource not found                           |
| `500`  | Internal server error                        |

---

## Pagination

List endpoints that support pagination accept these query parameters:

| Param   | Type    | Default | Max   | Description          |
| ------- | ------- | :-----: | :---: | -------------------- |
| `page`  | integer | `1`     | —     | Page number (1-based)|
| `limit` | integer | `10`    | `100` | Items per page       |

### Response envelope

```json
{
  "items": [ ],
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

## System endpoints

| Method | Path          | Auth   | Notes                                |
| ------ | ------------- | ------ | ------------------------------------ |
| GET    | `/api/health` | Public | Returns `{ status, timestamp }`      |

### `GET /api/health`

No authentication required.

Response `200`:

```json
{
  "status": "ok",
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```
