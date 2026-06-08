# Settings API

Mounted at `/api/admin/settings`. All routes require `Authorization: Bearer <token>`.  
Any authenticated admin (any role) can update their own account via these endpoints.

| Method | Path                              | Auth   | Body                             | Notes                       |
| ------ | --------------------------------- | ------ | -------------------------------- | --------------------------- |
| PUT    | `/api/admin/settings/password`    | Bearer | `currentPassword`, `newPassword` | Change own password         |
| PUT    | `/api/admin/settings/profile`     | Bearer | `username?`, `email?`            | Update own username / email |

---

## `PUT /api/admin/settings/password`

Change the password of the currently logged-in admin. The caller must supply their current password for verification.

### Request body

| Field             | Type   | Required | Validation       | Description                   | Example          |
| ----------------- | ------ | :------: | ---------------- | ----------------------------- | ---------------- |
| `currentPassword` | string | Yes      | non-empty        | Must match the stored hash    | `"admin123"`     |
| `newPassword`     | string | Yes      | min 6 characters | New password (bcrypt hashed)  | `"newSecure456"` |

Example:

```json
{
  "currentPassword": "admin123",
  "newPassword":     "newSecure456"
}
```

### Response `200`

```json
{ "message": "Password updated successfully" }
```

### Errors

| Status | Condition                                         |
| ------ | ------------------------------------------------- |
| `400`  | `currentPassword` or `newPassword` missing        |
| `400`  | `newPassword` is shorter than 6 characters        |
| `400`  | `currentPassword` does not match stored password  |

### curl

```bash
curl -X PUT http://localhost:5000/api/admin/settings/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"newSecure456"}'
```

---

## `PUT /api/admin/settings/profile`

Update the username and/or email of the currently logged-in admin.  
Both fields are optional — only the fields provided will be updated.

### Request body

| Field      | Type   | Required | Validation               | Description              | Example              |
| ---------- | ------ | :------: | ------------------------ | ------------------------ | -------------------- |
| `username` | string | No       | unique                   | New login handle         | `"new_username"`     |
| `email`    | string | No       | unique, stored lowercase | New contact email        | `"new@example.com"`  |

Example:

```json
{
  "username": "new_username",
  "email":    "new@example.com"
}
```

### Response `200`

Returns the updated admin object (no `password` field).

```json
{
  "_id":       "6650a1b2c3d4e5f607a8b9c0",
  "username":  "new_username",
  "email":     "new@example.com",
  "role":      "superadmin",
  "region":    "global",
  "isActive":  true,
  "lastLogin": "2026-06-08T10:30:00.000Z",
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-06-08T12:00:00.000Z"
}
```

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `400`  | Username or email already in use   |

### curl

```bash
curl -X PUT http://localhost:5000/api/admin/settings/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"new_username"}'
```
