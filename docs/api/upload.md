# Upload API

Mounted at `/api/upload`. All routes require `Authorization: Bearer <token>`.

| Method | Path          | Auth   | Body                 | Notes                        |
| ------ | ------------- | ------ | -------------------- | ---------------------------- |
| POST   | `/api/upload` | Bearer | `multipart/form-data`| Upload one image; returns URL|

---

## `POST /api/upload`

Upload a single image file. Files are stored on **Cloudinary** and served via Cloudinary's CDN. Used by the report wizard's Media step to attach photos to a report.

### Request

Content-Type: `multipart/form-data`

| Field  | Type | Required | Description          |
| ------ | ---- | :------: | -------------------- |
| `file` | file | Yes      | The image to upload  |

**Constraints:**
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Maximum file size: **2 MB**
- Stored in the `impact-reports/` folder on Cloudinary with `quality: auto` and `fetch_format: auto` transformations applied

### Response `200`

```json
{ "url": "https://res.cloudinary.com/<cloud_name>/image/upload/v.../impact-reports/<id>.jpg" }
```

The returned URL is a full Cloudinary CDN URL. Store it directly — no server prefix needed.

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

---

## Setup

Add the following to `server/.env`:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get these values from your Cloudinary dashboard → **Settings → Access Keys**.

