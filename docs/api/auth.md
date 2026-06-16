# Auth API

Mounted at `/api/auth`.

| Method | Path                  | Auth   | Body                   | Notes                                      |
| ------ | --------------------- | ------ | ---------------------- | ------------------------------------------ |
| POST   | `/api/auth/login`     | Public | `username`, `password` | Returns JWT + admin object; writes login log |
| GET    | `/api/auth/me`        | Bearer | —                      | Returns current admin profile              |
| POST   | `/api/auth/logout`    | Bearer | —                      | Records logout event; session teardown is client-side |
| GET    | `/api/auth/logs`      | Bearer | —                      | Last 50 login/logout events, newest first  |

---

## `POST /api/auth/login`

Authenticate with username and password. Returns a signed JWT that must be passed as `Authorization: Bearer <token>` on all protected routes.

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
