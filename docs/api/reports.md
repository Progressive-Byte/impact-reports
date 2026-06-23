# Reports API

Mounted at `/api/reports`. All routes require `Authorization: Bearer <token>`.

| Method | Path                              | Auth              | Body                                 | Notes                                    |
| ------ | --------------------------------- | ----------------- | ------------------------------------ | ---------------------------------------- |
| GET    | `/api/reports`                    | Bearer (any)      | —                                    | List reports (role-filtered)             |
| GET    | `/api/reports/search`             | Bearer (any)      | —                                    | Autocomplete project names (query: `q`) |
| GET    | `/api/reports/export`             | Superadmin        | —                                    | Download all reports as CSV or Excel     |
| POST   | `/api/reports`                    | Superadmin        | `projectName`, `assignedTo[]`        | Create report with status `pending`      |
| GET    | `/api/reports/:id`                | Bearer (any)      | —                                    | Get single report                        |
| PATCH  | `/api/reports/:id/step/:stepName` | Editor/Superadmin | step fields (see below)              | Save one wizard step                     |
| DELETE | `/api/reports/:id`                | Superadmin        | —                                    | Permanently delete report                |

**Access rules by role**

| Role          | List / Read               | Save steps | Create | Delete |
| ------------- | ------------------------- | ---------- | ------ | ------ |
| `superadmin`  | All reports               | ✓          | ✓      | ✓      |
| `editor`      | Only assigned (`assignedTo` contains their `_id`) | ✓ | ✗ | ✗ |
| `viewer`      | Only assigned (`assignedTo` contains their `_id`) | ✗ (403) | ✗ | ✗ |

---

## Report object

```json
{
  "_id":             "6650a1b2c3d4e5f607a8b9c2",
  "projectName":     "Winter Relief Alpha",
  "assignedTo":      [{ "_id": "...", "username": "sadek", "email": "sadek@example.com" }],
  "createdBy":       { "_id": "...", "username": "admin" },
  "status":          "draft",
  "projectLead":     "Ali Hassan",
  "fiscalYear":      "FY25",
  "region":          "South Asia",
  "sector":          "Healthcare",
  "livesImpacted":   4800,
  "projectBackground": "...",
  "strategicResponse": "...",
  "children":        40,
  "women":           35,
  "men":             25,
  "deliverables":    [{ "label": "Solar Wells", "count": 12, "icon": "FiSun", "description": "Installed across rural communities" }],
  "images":          [{ "url": "https://res.cloudinary.com/dt1oakyjz/image/upload/v.../photo1.jpg" }, { "url": "https://res.cloudinary.com/dt1oakyjz/image/upload/v.../photo2.jpg" }],
  "thumbnail":       "https://res.cloudinary.com/dt1oakyjz/image/upload/v.../photo1.jpg",
  "videoUrl":        "https://youtube.com/watch?v=abc123",
  "milestones":      [{ "date": "2025-01", "title": "Phase 1", "notes": "..." }],
  "countries":       ["India", "Kenya"],
  "locations":       [{ "country": "India", "address": "Uttar Pradesh" }, { "country": "Kenya", "address": "Nairobi" }],
  "stepsCompleted":  ["general", "narrative"],
  "createdAt":       "2026-06-08T10:00:00.000Z",
  "updatedAt":       "2026-06-08T12:00:00.000Z"
}
```

**Status values**

| Status      | When set                                                    |
| ----------- | ----------------------------------------------------------- |
| `pending`   | Just created — no step saved yet                            |
| `draft`     | At least one step saved but not all five                    |
| `published` | All five steps saved (after final `location` step submit)   |

---

## `GET /api/reports`

List reports accessible to the caller with server-side search, filter, sort, and pagination. Superadmin gets all; editors and viewers get only reports where their ID is in `assignedTo`.

### Query parameters

| Param    | Type    | Default  | Description                                                          |
| -------- | ------- | :------: | -------------------------------------------------------------------- |
| `status` | string  | —        | Filter by status: `pending`, `draft`, or `published`. Omit for all. |
| `q`      | string  | —        | Case-insensitive substring search on `projectName`.                  |
| `sort`   | string  | `recent` | Sort order: `recent` (newest first) or `oldest`.                     |
| `page`   | integer | `1`      | Page number (1-based).                                               |
| `limit`  | integer | `10`     | Items per page (max `100`).                                          |

### Response `200`

```json
{
  "reports": [ /* array of Report objects for this page */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5,
    "hasPrev": false,
    "hasNext": true
  },
  "stats": {
    "totalLives": 128400,
    "count": 42
  }
}
```

`stats` aggregates across **all matching reports** (ignoring pagination), so it stays accurate regardless of which page is shown.

### curl

```bash
# All reports, page 1
curl http://localhost:5173/api/reports \
  -H "Authorization: Bearer $TOKEN"

# Search + status filter + sort
curl "http://localhost:5173/api/reports?q=winter&status=published&sort=oldest&page=2" \
  -H "Authorization: Bearer $TOKEN"
```

---

## `GET /api/reports/search?q=`

Search existing project names for autocomplete in the Create modal.

### Query parameters

| Param | Type   | Required | Description                           |
| ----- | ------ | :------: | ------------------------------------- |
| `q`   | string | Yes      | Search term (min 1 char, max 10 hits) |

### Response `200`

```json
{ "suggestions": ["Winter Relief Alpha", "Winter Food Drive"] }
```

### curl

```bash
curl "http://localhost:5173/api/reports/search?q=winter" \
  -H "Authorization: Bearer $TOKEN"
```

---

## `POST /api/reports`

Create a new report. Only `superadmin` can call this. The new report gets status `pending`.

### Request body

| Field        | Type     | Required | Description                               | Example                          |
| ------------ | -------- | :------: | ----------------------------------------- | -------------------------------- |
| `projectName`| string   | Yes      | Unique project name                       | `"Winter Relief Alpha"`          |
| `assignedTo` | string[] | Yes      | Array of Admin `_id` strings (role=admin) | `["6650a1...","6650a2..."]`      |

Example:

```json
{
  "projectName": "Winter Relief Alpha",
  "assignedTo":  ["6650a1b2c3d4e5f607a8b9c0"]
}
```

### Response `201`

Returns the created Report object (with `assignedTo` and `createdBy` populated).

### Errors

| Status | Condition                                         |
| ------ | ------------------------------------------------- |
| `400`  | `projectName` missing or empty                    |
| `400`  | `assignedTo` empty or not an array                |
| `400`  | `assignedTo` contains duplicate admin IDs         |
| `403`  | Caller is not `superadmin`                        |

### curl

```bash
curl -X POST http://localhost:5173/api/reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Winter Relief Alpha","assignedTo":["6650a1b2c3d4e5f607a8b9c0"]}'
```

---

## `GET /api/reports/:id`

Get a single report by ID. Caller must be superadmin or listed in `assignedTo`.

### Response `200`

```json
{ "report": { /* Report object */ } }
```

### Errors

| Status | Condition                             |
| ------ | ------------------------------------- |
| `403`  | Caller not assigned and not superadmin|
| `404`  | Report not found                      |

---

## `PATCH /api/reports/:id/step/:stepName`

Save the data for one wizard step. Marks the step complete and updates the report status.

### URL parameters

| Param      | Values                                                           |
| ---------- | ---------------------------------------------------------------- |
| `stepName` | `general` \| `narrative` \| `metrics` \| `media` \| `location` |

### Request bodies per step

**`general`**

| Field           | Type     | Required      | Description                                                |
| --------------- | -------- | :-----------: | ---------------------------------------------------------- |
| `projectName`   | string   | Superadmin    | Project name                                               |
| `assignedTo`    | string[] | Superadmin    | Array of Admin `_id` strings                               |
| `projectLead`   | string   | Yes           | Lead person name                                           |
| `fiscalYear`    | string   | Yes           | e.g. `"FY25"`                                              |
| `region`        | string   | Yes           | One of: `Africa`, `Middle East`, `South Asia`, `Southeast Asia`, `Global` |
| `sector`        | string   | Yes           | Free-text sector e.g. `"Healthcare"`                       |
| `livesImpacted` | number   | Yes (> 0)     | Number of lives impacted                                   |

**`narrative`**

| Field               | Type   | Description            |
| ------------------- | ------ | ---------------------- |
| `projectBackground` | string | Crisis context         |
| `strategicResponse` | string | Response operations    |

**`metrics`**

| Field          | Type     | Required | Description                    |
| -------------- | -------- | :------: | ------------------------------ |
| `children`     | number   | —        | Children demographic %         |
| `women`        | number   | —        | Women demographic %            |
| `men`          | number   | —        | Men demographic %              |
| `deliverables` | array    | Yes      | At least one item required (see below) |

Each `deliverables` item:

| Field         | Type   | Required | Description                                       |
| ------------- | ------ | :------: | ------------------------------------------------- |
| `label`       | string | Yes      | Metric name (e.g. `"Solar Wells"`)                |
| `count`       | number | Yes      | Verified volume (must be > 0)                     |
| `icon`        | string | —        | Feather icon name (e.g. `"FiSun"`). Defaults to `"FiBox"` in the UI. |
| `description` | string | —        | Short description shown below the label on the public report page |

**`media`**

| Field        | Type     | Required | Description                                               |
| ------------ | -------- | :------: | --------------------------------------------------------- |
| `images`     | array    | Yes      | At least 1, max 10. Each item: `{ url: string }`          |
| `thumbnail`  | string   | —        | Cloudinary URL of the chosen report thumbnail. Must be one of the URLs in `images[]`. Falls back to `images[0].url` in the public API if not set. |
| `videoUrl`   | string   | —        | YouTube / Vimeo / S3 video link (optional)                |
| `milestones` | array    | Yes      | At least one item with `date` + `title` (see below)       |

Each `milestones` item:

| Field   | Type   | Required | Description              |
| ------- | ------ | :------: | ------------------------ |
| `date`  | string | Yes      | Date or timeframe label  |
| `title` | string | Yes      | Milestone title          |
| `notes` | string | —        | Additional notes         |

**`location`**

| Field       | Type     | Required | Description                                              |
| ----------- | -------- | :------: | -------------------------------------------------------- |
| `countries` | string[] | Yes      | Clean country names e.g. `["India","Kenya"]`             |
| `locations` | array    | Yes      | Each item: `{ country: string, address: string }`. At least one per selected country. |

### Response `200`

```json
{ "report": { /* updated Report object */ } }
```

When `location` step is saved and all five steps are complete, `status` becomes `"published"`. Otherwise `"draft"`.

### Role protection

When the caller's role is `admin` (not `superadmin`), `projectName` and `assignedTo` are silently ignored on the `general` step — they cannot be changed regardless of what is sent.

### Errors

| Status | Condition                                                                                    |
| ------ | -------------------------------------------------------------------------------------------- |
| `400`  | Invalid `stepName`                                                                           |
| `400`  | Per-step validation failure — missing required field or invalid value (message describes which field) |
| `400`  | `assignedTo` contains duplicate admin IDs (`general` step, superadmin only)                 |
| `403`  | Caller not assigned to report and not superadmin                                             |
| `404`  | Report not found                                                                             |

**Per-step required fields**

| Step        | Required                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| `general`   | `projectLead`, `fiscalYear`, `region`, `sector`, `livesImpacted > 0`; plus `projectName` and `assignedTo` for superadmin |
| `narrative` | `projectBackground`, `strategicResponse`                                 |
| `metrics`   | At least one deliverable with a non-empty `label` and `count > 0`        |
| `media`     | At least one `images[].url`; max 10 images; at least one milestone with `date` and `title` |
| `location`  | At least one country; every selected country must have at least one location entry          |

### curl

```bash
# Save general step
curl -X PATCH "http://localhost:5173/api/reports/6650a1b2c3d4e5f607a8b9c2/step/general" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Winter Relief Alpha","assignedTo":["6650a1b2..."],"projectLead":"Ali Hassan","fiscalYear":"FY25","region":"South Asia","sector":"Healthcare","livesImpacted":4800}'

# Submit final step
curl -X PATCH "http://localhost:5173/api/reports/6650a1b2c3d4e5f607a8b9c2/step/media" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"galleryUrl":"https://...","milestones":[{"date":"2025-01","title":"Phase 1","notes":"Delivered"}]}'
```

---

## `GET /api/reports/export`

Download all reports (all statuses, all regions) as a flat file. Only `superadmin` can call this.

### Query parameters

| Param    | Type   | Default | Description                                          |
| -------- | ------ | :-----: | ---------------------------------------------------- |
| `format` | string | `csv`   | `csv` — plain text CSV; `excel` — `.xlsx` workbook   |

### Response

Returns a file download with the appropriate `Content-Disposition` header.

- **CSV**: `Content-Type: text/csv`, filename `reports-export-YYYY-MM-DD.csv`
- **Excel**: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, filename `reports-export-YYYY-MM-DD.xlsx`

Each row includes: `Project ID`, `Project Name`, `Slug`, `Status`, `Project Lead`, `Fiscal Year`, `Region`, `Sector`, `Lives Impacted`, `Countries`, `Project Background`, `Strategic Response`, `Children`, `Women`, `Men`, `Deliverables`, `Images Count`, `Thumbnail URL`, `Video URL`, `Milestones Count`, `Steps Completed`, `Assigned To`, `Created By`, `Created At`, `Updated At`.

### Errors

| Status | Condition                  |
| ------ | -------------------------- |
| `403`  | Caller is not `superadmin` |
| `500`  | Export generation failed   |

### curl

```bash
# Download as CSV
curl "http://localhost:5173/api/reports/export?format=csv" \
  -H "Authorization: Bearer $TOKEN" \
  -o reports.csv

# Download as Excel
curl "http://localhost:5173/api/reports/export?format=excel" \
  -H "Authorization: Bearer $TOKEN" \
  -o reports.xlsx
```

---

## `DELETE /api/reports/:id`

Permanently delete a report. Only `superadmin` can call this.

### Response `200`

```json
{ "message": "Report deleted successfully" }
```

### Errors

| Status | Condition                   |
| ------ | --------------------------- |
| `403`  | Caller is not `superadmin`  |
| `404`  | Report not found            |

### curl

```bash
curl -X DELETE http://localhost:5173/api/reports/6650a1b2c3d4e5f607a8b9c2 \
  -H "Authorization: Bearer $TOKEN"
```
