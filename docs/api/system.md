# System

## Server

| Property        | Value                                                         |
| --------------- | ------------------------------------------------------------- |
| Runtime         | Node.js + Express (ES modules)                                |
| Database        | MongoDB Atlas via Mongoose                                    |
| Default port    | `5173` — override with `PORT` env var                         |
| CORS origins    | `http://localhost:5174`, `http://localhost:4173`              |
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
| `PORT`           | No       | HTTP port (default `5173`)                               |
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

## Background jobs (cron)

Two cron jobs start automatically when the server boots.

### Weekly digest — every Monday 08:00

```
Schedule: 0 8 * * 1
```

Queries all reports published in the last 7 days and emails a summary to every active `superadmin`. Runs only when the `weeklyDigest` platform setting is `true`.

Can be triggered manually via `POST /api/config/send-weekly-digest` (superadmin only).

### Log archival — 1st of every month at 02:00

```
Schedule: 0 2 1 * *
```

Soft-archives `ActivityLog` records older than 365 days by setting `archivedAt` to the current timestamp. Records are **never permanently deleted**. Archived records are excluded from the `GET /api/auth/logs` display endpoint but remain exportable via `GET /api/auth/logs/export?scope=all`.

---

## Activity log retention policy

| Window       | Behaviour                                                    |
| ------------ | ------------------------------------------------------------ |
| 0 – 30 days  | Displayed in the System Log panel on the Admin Dashboard     |
| 0 – 365 days | Live (`archivedAt: null`); included in `scope=year` export   |
| > 365 days   | Soft-archived monthly; excluded from display and year export |
| All time     | Permanently retained; always included in `scope=all` export  |

Backfill existing records that predate the `archivedAt` field:

```bash
node --input-type=module <<'EOF'
import './server/bootstrap.js';
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI);
const ActivityLog = (await import('./server/models/ActivityLog.js')).default;
const result = await ActivityLog.updateMany(
  { archivedAt: { $exists: false } },
  { $set: { archivedAt: null } }
);
console.log(`Backfilled ${result.modifiedCount} records`);
await mongoose.disconnect();
EOF
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
