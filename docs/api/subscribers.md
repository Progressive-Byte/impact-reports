# Subscribers API

Mounted at `/api/subscribers`.

| Method | Path                          | Auth                | Body    | Notes                           |
| ------ | ----------------------------- | ------------------- | ------- | ------------------------------- |
| POST   | `/api/subscribers/subscribe`  | Public              | `email` | Subscribe an email address      |
| GET    | `/api/subscribers`            | Bearer (superadmin) | —       | Paginated subscriber list       |
| DELETE | `/api/subscribers/:id`        | Bearer (superadmin) | —       | Remove a subscriber permanently |

---

## Subscriber object

```json
{
  "_id":       "6650a1b2c3d4e5f607a8b9f0",
  "email":     "user@example.com",
  "createdAt": "2026-06-15T10:00:00.000Z",
  "updatedAt": "2026-06-15T10:00:00.000Z"
}
```

---

## `POST /api/subscribers/subscribe`

Public — no authentication required. Adds an email address to the newsletter subscriber list.

Duplicate emails are handled silently: if the email already exists the server returns `200` with an "Already subscribed" message rather than an error, preventing email enumeration.

### Request body

| Field   | Type   | Required | Validation      | Description           |
| ------- | ------ | :------: | --------------- | --------------------- |
| `email` | string | Yes      | valid email format | Email to subscribe |

```json
{ "email": "user@example.com" }
```

### Response `201` — new subscriber

```json
{ "message": "Subscribed successfully." }
```

### Response `200` — already subscribed

```json
{ "message": "Already subscribed." }
```

### Errors

| Status | Condition                             |
| ------ | ------------------------------------- |
| `400`  | Missing email or invalid email format |
| `500`  | Database error                        |

### curl

```bash
curl -X POST http://localhost:5173/api/subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

## `GET /api/subscribers`

Returns a paginated, searchable list of subscribers. Requires **superadmin** role.

### Query parameters

| Param   | Type    | Default | Description                                                 |
| ------- | ------- | :-----: | ----------------------------------------------------------- |
| `q`     | string  | —       | Case-insensitive search on email address                    |
| `page`  | integer | `1`     | Page number (1-based)                                       |
| `limit` | integer | `20`    | Items per page (max `100`)                                  |

### Response `200`

```json
{
  "items": [
    {
      "_id":       "6650a1b2c3d4e5f607a8b9f0",
      "email":     "user@example.com",
      "createdAt": "2026-06-15T10:00:00.000Z",
      "updatedAt": "2026-06-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page":    1,
    "limit":   20,
    "total":   142,
    "pages":   8,
    "hasPrev": false,
    "hasNext": true
  }
}
```

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `401`  | Token missing, invalid, or expired |
| `403`  | Caller is not `superadmin`         |

### curl

```bash
# All subscribers, page 1
curl http://localhost:5173/api/subscribers \
  -H "Authorization: Bearer $TOKEN"

# Search by email
curl "http://localhost:5173/api/subscribers?q=example.com&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

## `DELETE /api/subscribers/:id`

Permanently removes a subscriber from the list. Requires **superadmin** role.

### URL parameter

| Param | Description                        |
| ----- | ---------------------------------- |
| `id`  | MongoDB ObjectId of the subscriber |

### Response `200`

```json
{ "message": "Subscriber removed" }
```

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `401`  | Token missing, invalid, or expired |
| `403`  | Caller is not `superadmin`         |
| `404`  | Subscriber not found               |

### curl

```bash
curl -X DELETE http://localhost:5173/api/subscribers/6650a1b2c3d4e5f607a8b9f0 \
  -H "Authorization: Bearer $TOKEN"
```
