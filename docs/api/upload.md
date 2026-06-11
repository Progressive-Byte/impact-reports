# Upload API

Mounted at `/api/upload`. All routes require `Authorization: Bearer <token>`.

| Method | Path          | Auth   | Body                 | Notes                        |
| ------ | ------------- | ------ | -------------------- | ---------------------------- |
| POST   | `/api/upload` | Bearer | `multipart/form-data`| Upload one image; returns URL|

---

## `POST /api/upload`

Upload a single image file. Used by the report wizard's Media step to attach photos to a report.

### Request

Content-Type: `multipart/form-data`

| Field  | Type | Required | Description          |
| ------ | ---- | :------: | -------------------- |
| `file` | file | Yes      | The image to upload  |

**Constraints:**
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Maximum file size: **2 MB**

### Response `200`

```json
{ "url": "/uploads/1781083833558-401384.jpeg" }
```

The returned URL is relative. Prepend the server origin to get the full URL (e.g. `http://localhost:5000/uploads/...`). Files are served as static assets from `server/uploads/`.

### Errors

| Status | Condition                                    |
| ------ | -------------------------------------------- |
| `400`  | No file field in request                     |
| `400`  | File exceeds 2 MB limit                      |
| `400`  | File type not allowed                        |
| `401`  | Missing or invalid Bearer token              |

### curl

```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/photo.jpg"
```
