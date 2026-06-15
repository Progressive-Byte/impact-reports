# Notifications API

Mounted at `/api/notifications`. All routes require `Authorization: Bearer <token>`.

Notifications are created automatically by the server (e.g. failed-login warnings). They are global — any authenticated admin can read and mark them.

| Method | Path                          | Auth   | Description                        |
| ------ | ----------------------------- | ------ | ---------------------------------- |
| GET    | `/api/notifications`          | Bearer | List recent notifications          |
| PATCH  | `/api/notifications/read-all` | Bearer | Mark all notifications as read     |
| PATCH  | `/api/notifications/:id/read` | Bearer | Mark a single notification as read |

---

## Notification object

```json
{
  "_id":       "6650a1b2c3d4e5f607a8b9d0",
  "type":      "failed_login",
  "title":     "Failed-login warning",
  "message":   "3 consecutive failed login attempts detected for account \"admin\".",
  "read":      false,
  "createdAt": "2026-06-15T10:30:00.000Z",
  "updatedAt": "2026-06-15T10:30:00.000Z"
}
```

| Field       | Description                                                          |
| ----------- | -------------------------------------------------------------------- |
| `type`      | Currently only `failed_login`. More types may be added in the future |
| `title`     | Short heading for display in the notification panel                  |
| `message`   | Full human-readable description                                      |
| `read`      | `false` = unread (shown with orange background + red dot in UI)      |

---

## When notifications are created

| Event | Trigger | Setting required |
| ----- | ------- | ---------------- |
| `failed_login` | 3 consecutive wrong-password attempts on an existing account | **Failed-login warnings** toggle ON in Settings |

The counter resets to 0 after the notification fires and also on any successful login.

---

## `GET /api/notifications`

Returns the 30 most recent notifications (newest first) and the total unread count.

### Response `200`

```json
{
  "notifications": [
    {
      "_id":       "6650a1b2c3d4e5f607a8b9d0",
      "type":      "failed_login",
      "title":     "Failed-login warning",
      "message":   "3 consecutive failed login attempts detected for account \"admin\".",
      "read":      false,
      "createdAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "unreadCount": 1
}
```

### curl

```bash
curl http://localhost:5173/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

---

## `PATCH /api/notifications/read-all`

Marks **all** unread notifications as read in a single operation.

### Response `200`

```json
{ "message": "All notifications marked as read" }
```

### curl

```bash
curl -X PATCH http://localhost:5173/api/notifications/read-all \
  -H "Authorization: Bearer $TOKEN"
```

---

## `PATCH /api/notifications/:id/read`

Marks a single notification as read. Clicking a notification row in the UI calls this automatically.

### Response `200`

Returns the updated notification object.

```json
{
  "_id":   "6650a1b2c3d4e5f607a8b9d0",
  "read":  true,
  ...
}
```

### Errors

| Status | Condition               |
| ------ | ----------------------- |
| `404`  | Notification not found  |

### curl

```bash
curl -X PATCH http://localhost:5173/api/notifications/6650a1b2c3d4e5f607a8b9d0/read \
  -H "Authorization: Bearer $TOKEN"
```
