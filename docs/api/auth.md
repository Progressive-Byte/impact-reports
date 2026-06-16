# Auth API

Mounted at `/api/auth`.

| Method | Path                       | Auth                | Body                   | Notes                                                 |
| ------ | -------------------------- | ------------------- | ---------------------- | ----------------------------------------------------- |
| POST   | `/api/auth/login`          | Public              | `username`, `password` | Returns JWT + admin object; writes login log          |
| GET    | `/api/auth/me`             | Bearer              | —                      | Returns current admin profile                         |
| POST   | `/api/auth/logout`         | Bearer              | —                      | Records logout event; session teardown is client-side |
| GET    | `/api/auth/logs`           | Bearer              | —                      | Last 50 login/logout events, newest first             |
| GET    | `/api/auth/logs/export`    | Bearer (superadmin) | —                      | Download all activity logs as CSV or Excel            |

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

### Response `200`

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

## `GET /api/auth/me`

Returns the profile of the currently authenticated admin. Useful for re-hydrating session state after a page refresh.

Headers: `Authorization: Bearer <token>`

### Response `200`

```json
{
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

Returns the 50 most recent login/logout events across all admin accounts, newest first. Used to populate the **System Log** tab on the Admin Dashboard.

Headers: `Authorization: Bearer <token>`

### ActivityLog object

```json
{
  "_id":       "6650a1b2c3d4e5f607a8b9e0",
  "type":      "login",
  "username":  "sadekur",
  "role":      "admin",
  "ip":        "127.0.0.1",
  "createdAt": "2026-06-16T10:45:00.000Z",
  "updatedAt": "2026-06-16T10:45:00.000Z"
}
```

| Field      | Values              | Description                     |
| ---------- | ------------------- | ------------------------------- |
| `type`     | `login` / `logout`  | Event type                      |
| `username` | string              | Admin username at time of event |
| `role`     | `admin` / `superadmin` | Role at time of event        |
| `ip`       | string              | Client IP (`x-forwarded-for` header takes precedence) |

### Response `200`

```json
{
  "logs": [
    {
      "_id":       "6650a1b2c3d4e5f607a8b9e0",
      "type":      "login",
      "username":  "sadekur",
      "role":      "admin",
      "ip":        "127.0.0.1",
      "createdAt": "2026-06-16T10:45:00.000Z"
    }
  ]
}
```

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
