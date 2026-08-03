# Reports API

Mounted at `/api/reports`. All routes require `Authorization: Bearer <token>`.

| Method | Path                              | Auth              | Body                                 | Notes                                             |
| ------ | --------------------------------- | ----------------- | ------------------------------------ | ------------------------------------------------- |
| GET    | `/api/reports`                    | Bearer (any)      | —                                    | List reports (role-filtered, trash excluded by default) |
| GET    | `/api/reports/search`             | Bearer (any)      | —                                    | Autocomplete project names (query: `q`)           |
| GET    | `/api/reports/export`             | Superadmin        | —                                    | Download all reports as CSV or Excel              |
| POST   | `/api/reports`                    | Superadmin        | `projectName`, `assignedTo[]`, `actualProjectId` | Create report with status `pending`  |
| GET    | `/api/reports/:id`                | Bearer (any)      | —                                    | Get single report                                 |
| PATCH  | `/api/reports/:id/step/:stepName` | Editor/Superadmin | step fields (see below)              | Save one wizard step (blocked if status=`trash`)  |
| PATCH  | `/api/reports/:id/restore`        | Superadmin        | —                                    | Restore a trashed report                          |
| DELETE | `/api/reports/:id`                | Superadmin        | —                                    | Soft-delete: move to trash (`status = "trash"`)   |
| DELETE | `/api/reports/:id/permanent`      | Superadmin        | —                                    | Permanently destroy a trashed report              |

**Access rules by role**

| Role          | List / Read               | Save steps | Create | Trash / Restore / Permanent delete |
| ------------- | ------------------------- | ---------- | ------ | ---------------------------------- |
| `superadmin`  | All reports               | ✓          | ✓      | ✓                                  |
| `editor`      | Assigned (`assignedTo`) or approval reviewer (`approvalAssignedTo`) | ✓ | ✗ | ✗ |
| `viewer`      | Assigned (`assignedTo`) or approval reviewer (`approvalAssignedTo`) | ✗ (403) | ✗ | ✗ |

---

## Report object

```json
{
  "_id":                "6650a1b2c3d4e5f607a8b9c2",
  "projectName":        "Winter Relief Alpha",
  "slug":               "winter-relief-alpha",
  "projectId":          "REP-001",
  "actualProjectId":    "BurmaWater-1001",
  "assignedTo":         [{ "_id": "...", "username": "sadek", "email": "sadek@example.com" }],
  "approvalAssignedTo": [{ "_id": "...", "username": "reviewer1", "email": "reviewer@example.com" }],
  "createdBy":          { "_id": "...", "username": "admin" },
  "status":             "draft",
  "shortSubtitle":      "Bringing reliable solar power to off-grid rural communities across South Asia.",
  "donationUrl":        "https://donate.example.com/project",
  "cost":               15000,
  "projectLead":        "Ali Hassan",
  "reportingPeriod":    "2025",
  "region":             "South Asia",
  "sector":             "Healthcare",
  "livesImpacted":      4800,
  "projectBackground":  "<p><strong>Crisis context...</strong></p>",
  "strategicResponse":  "<p>Response operations...</p>",
  "children":        40,
  "women":           35,
  "men":             25,
  "deliverables":    [{ "label": "Solar Wells", "count": 12, "icon": "FiSun", "description": "Installed across rural communities" }],
  "images":          [{ "url": "https://res.cloudinary.com/.../photo1.jpg" }],
  "thumbnail":       "https://res.cloudinary.com/.../photo1.jpg",
  "videoUrl":        "https://youtube.com/watch?v=abc123",
  "milestones":      [{ "date": "2025-01", "title": "Phase 1", "description": "<p>Completed initial survey</p>" }],
  "countries":       ["India", "Kenya"],
  "locations":       [{ "country": "India", "address": "Uttar Pradesh" }, { "country": "Kenya", "address": "Nairobi" }],
  "stepsCompleted":  ["general", "narrative"],
  "createdAt":       "2026-06-08T10:00:00.000Z",
  "updatedAt":       "2026-06-08T12:00:00.000Z"
}
```

**Status values**

| Status              | When set                                                                        |
| ------------------- | ------------------------------------------------------------------------------- |
| `pending`           | Just created — no step saved yet                                                |
| `draft`             | At least one step saved but not all five                                        |
| `pending_approval`  | All five steps saved and `approvalAssignedTo` is non-empty — awaiting sign-off  |
| `published`         | All five steps saved and no approval reviewers assigned (or approval granted)   |
| `trash`             | Soft-deleted via `DELETE /api/reports/:id` — hidden from all lists except Trash |

Reports with `status: "trash"` are excluded from the public portal and from the admin "All" list view. Only the explicit `?status=trash` filter surfaces them.

---

## `GET /api/reports`

List reports accessible to the caller with server-side search, filter, sort, and pagination. Superadmin gets all; editors and viewers get only reports where their ID is in `assignedTo`.

### Query parameters

| Param    | Type    | Default  | Description                                                                              |
| -------- | ------- | :------: | ---------------------------------------------------------------------------------------- |
| `status` | string  | —        | Filter: `pending`, `draft`, `published`, or `trash`. Omit (or send `all`) to get all non-trash reports. |
| `q`      | string  | —        | Case-insensitive substring search on `projectName`.                                      |
| `sort`   | string  | `recent` | `recent` (newest first), `oldest`, `az` (A → Z by name), `za` (Z → A by name).          |
| `page`   | integer | `1`      | Page number (1-based).                                                                   |
| `limit`  | integer | `10`     | Items per page (max `100`).                                                              |

When `status` is omitted the response excludes trash. Pass `status=trash` explicitly to list trashed reports.

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
# All reports (trash excluded), page 1
curl http://localhost:5173/api/reports \
  -H "Authorization: Bearer $TOKEN"

# Only trashed reports
curl "http://localhost:5173/api/reports?status=trash" \
  -H "Authorization: Bearer $TOKEN"

# Search + status filter + A-Z sort
curl "http://localhost:5173/api/reports?q=winter&status=published&sort=az&page=2" \
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

---

## `POST /api/reports`

Create a new report. Only `superadmin` can call this. The new report gets status `pending`.

### Request body

| Field                | Type     | Required | Description                                       | Example                     |
| -------------------- | -------- | :------: | ------------------------------------------------- | --------------------------- |
| `projectName`        | string   | Yes      | Unique project name                               | `"Winter Relief Alpha"`     |
| `assignedTo`         | string[] | Yes      | Array of Admin `_id` strings (editors)            | `["6650a1...","6650a2..."]` |
| `approvalAssignedTo` | string[] | Yes      | Array of Admin `_id` strings who must approve     | `["6650b1..."]`             |
| `actualProjectId`    | string   | —        | Human-readable project ID set by the creator      | `"BurmaWater-1001"`         |

### Response `201`

Returns the created Report object (with `assignedTo`, `approvalAssignedTo`, and `createdBy` populated).

### Errors

| Status | Condition                                                 |
| ------ | --------------------------------------------------------- |
| `400`  | `projectName` missing or empty                            |
| `400`  | `assignedTo` empty or not an array                        |
| `400`  | `approvalAssignedTo` empty or not an array                |
| `400`  | `assignedTo` or `approvalAssignedTo` contain duplicate IDs|
| `403`  | Caller is not `superadmin`                                |

### curl

```bash
curl -X POST http://localhost:5173/api/reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Winter Relief Alpha","assignedTo":["6650a1b2c3d4e5f607a8b9c0"],"approvalAssignedTo":["6650b1..."],"actualProjectId":"BurmaWater-1001"}'
```

---

## `GET /api/reports/:id`

Get a single report by ID. Caller must be superadmin or listed in `assignedTo`.

### Response `200`

```json
{ "report": { /* Report object */ } }
```

### Errors

| Status | Condition                              |
| ------ | -------------------------------------- |
| `403`  | Caller not assigned and not superadmin |
| `404`  | Report not found                       |

---

## `PATCH /api/reports/:id/step/:stepName`

Save the data for one wizard step. Marks the step complete and updates the report status.

Returns `400` if the report's current status is `"trash"` — restore it first.

### URL parameters

| Param      | Values                                                           |
| ---------- | ---------------------------------------------------------------- |
| `stepName` | `general` \| `narrative` \| `metrics` \| `media` \| `location` |

### Request bodies per step

**`general`**

| Field                | Type     | Required      | Description                                                                           |
| -------------------- | -------- | :-----------: | ------------------------------------------------------------------------------------- |
| `projectName`        | string   | Superadmin    | Project name                                                                          |
| `assignedTo`         | string[] | Superadmin    | Array of Admin `_id` strings (editors assigned to this report)                        |
| `approvalAssignedTo` | string[] | Superadmin    | Array of Admin `_id` strings who must approve before publishing                       |
| `actualProjectId`    | string   | —             | Human-readable project ID (e.g. `"BurmaWater-1001"`)                                 |
| `shortSubtitle`      | string   | —             | Short plain-text description shown on the report card and report detail hero section  |
| `donationUrl`        | string   | —             | Per-report donation link shown on the public report page's "Donate Now" button        |
| `cost`               | number   | —             | Project cost (stored for internal use; not yet surfaced on the public portal)         |
| `projectLead`        | string   | Yes           | Lead person / partner name                                                            |
| `reportingPeriod`    | string   | Yes           | Single year (`"2025"`), multi-year range (`"2025–2027"`), or date range (`"Jan 2025 – Dec 2026"`) |
| `region`             | string   | Yes           | One of: `Africa`, `Middle East`, `South Asia`, `Southeast Asia`, `Global`             |
| `sector`             | string   | Yes           | Free-text sector e.g. `"Healthcare"`                                                  |
| `livesImpacted`      | number   | Yes (> 0)     | Number of lives impacted                                                              |

**`narrative`**

`projectBackground` and `strategicResponse` accept rich HTML from the Tiptap editor. `testimonials` is an optional array of client testimonials displayed in the public report sidebar.

| Field               | Type   | Required | Description                                     |
| ------------------- | ------ | :------: | ----------------------------------------------- |
| `projectBackground` | string | Yes      | Crisis context (rich HTML)                      |
| `strategicResponse` | string | Yes      | Response operations (rich HTML)                 |
| `testimonials`      | array  | —        | Array of testimonial objects (see below)        |

Each `testimonials` item:

| Field         | Type   | Required | Description                                                               |
| ------------- | ------ | :------: | ------------------------------------------------------------------------- |
| `stars`       | number | —        | Rating 1–5 (default `5`)                                                  |
| `body`        | string | —        | Quote text as rich HTML (Tiptap). Rendered with `dangerouslySetInnerHTML` |
| `clientImage` | string | —        | Cloudinary URL of the client's photo. Falls back to initials avatar       |
| `name`        | string | —        | Client full name                                                           |
| `designation` | string | —        | Role or title (e.g. `"CEO"`)                                              |
| `address`     | string | —        | Location (e.g. `"Dhaka, Bangladesh"`)                                     |

**`metrics`**

`children + women + men` must not exceed 100 — validated client-side with a live progress bar; the server does not enforce the cap.

| Field          | Type     | Required | Description                              |
| -------------- | -------- | :------: | ---------------------------------------- |
| `children`     | number   | —        | Children demographic %                   |
| `women`        | number   | —        | Women demographic %                      |
| `men`          | number   | —        | Men demographic %                        |
| `deliverables` | array    | Yes      | At least one item required (see below)   |

Each `deliverables` item:

| Field         | Type   | Required | Description                                       |
| ------------- | ------ | :------: | ------------------------------------------------- |
| `label`       | string | Yes      | Metric name (e.g. `"Solar Wells"`)                |
| `count`       | number | Yes      | Verified volume (must be > 0)                     |
| `icon`        | string | —        | Feather icon name (e.g. `"FiSun"`)                |
| `description` | string | —        | Short description shown on the public report page |

**`media`**

| Field        | Type     | Required | Description                                               |
| ------------ | -------- | :------: | --------------------------------------------------------- |
| `images`     | array    | Yes      | At least 1, max 10. Each item: `{ url: string }`          |
| `thumbnail`  | string   | —        | Cloudinary URL of the chosen thumbnail                    |
| `videoUrl`   | string   | —        | YouTube / Vimeo / S3 video link (optional)                |
| `milestones` | array    | Yes      | At least one item with `date` + `title` (see below)       |

Each `milestones` item:

| Field         | Type   | Required | Description                                                          |
| ------------- | ------ | :------: | -------------------------------------------------------------------- |
| `date`        | string | Yes      | Date or timeframe label                                              |
| `title`       | string | Yes      | Milestone title                                                      |
| `description` | string | —        | Rich HTML notes (Tiptap). Rendered with `dangerouslySetInnerHTML` on the public timeline. |

**`location`**

| Field       | Type     | Required | Description                                                            |
| ----------- | -------- | :------: | ---------------------------------------------------------------------- |
| `countries` | string[] | Yes      | Clean country names e.g. `["India","Kenya"]`                           |
| `locations` | array    | Yes      | Each item: `{ country, address }`. At least one per selected country.  |

### Response `200`

```json
{ "report": { /* updated Report object */ } }
```

When the `location` step is saved and all five steps are complete, `status` becomes `"pending_approval"` if `approvalAssignedTo` is non-empty, otherwise `"published"`. Otherwise `"draft"`.

### Role protection

- **`viewer`** — always blocked with `403 Viewers have read-only access`.
- **`editor`** — `projectName` and `assignedTo` are stripped from `general` step body silently.
- **`superadmin`** — no restrictions.

### Errors

| Status | Condition                                                                                    |
| ------ | -------------------------------------------------------------------------------------------- |
| `400`  | Report status is `"trash"` — restore it before editing                                       |
| `400`  | Invalid `stepName`                                                                           |
| `400`  | Per-step validation failure (message describes which field)                                  |
| `400`  | `assignedTo` contains duplicate IDs (`general` step, superadmin only)                       |
| `403`  | Caller is `viewer` or not assigned to report                                                 |
| `404`  | Report not found                                                                             |

---

## `GET /api/reports/export`

Download all reports as a flat file. Only `superadmin` can call this.

### Query parameters

| Param    | Type   | Default | Description                                        |
| -------- | ------ | :-----: | -------------------------------------------------- |
| `format` | string | `csv`   | `csv` — plain text; `excel` — `.xlsx` workbook     |

Each row includes: `Project ID`, `Project Name`, `Slug`, `Status`, `Project Lead`, `Fiscal Year`, `Region`, `Sector`, `Lives Impacted`, `Countries`, `Project Background`, `Strategic Response`, `Children`, `Women`, `Men`, `Deliverables`, `Images Count`, `Thumbnail URL`, `Video URL`, `Milestones Count`, `Steps Completed`, `Assigned To`, `Created By`, `Created At`, `Updated At`.

### curl

```bash
curl "http://localhost:5173/api/reports/export?format=csv" \
  -H "Authorization: Bearer $TOKEN" -o reports.csv
```

---

## `PATCH /api/reports/:id/restore`

Restore a trashed report. Sets `status` back to `"published"` (if all five steps are complete) or `"draft"`. Only `superadmin` can call this.

### Response `200`

```json
{ "message": "Report restored" }
```

### Errors

| Status | Condition                          |
| ------ | ---------------------------------- |
| `400`  | Report is not currently in trash   |
| `403`  | Caller is not `superadmin`         |
| `404`  | Report not found                   |

### curl

```bash
curl -X PATCH http://localhost:5173/api/reports/6650a1b2c3d4e5f607a8b9c2/restore \
  -H "Authorization: Bearer $TOKEN"
```

---

## `DELETE /api/reports/:id`

**Soft-delete** — moves the report to trash by setting `status = "trash"`. The record is preserved and can be restored. Only `superadmin` can call this.

### Response `200`

```json
{ "message": "Report moved to trash" }
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

---

## `DELETE /api/reports/:id/permanent`

**Permanently destroy** a report. This is irreversible — the document is removed from the database. Intended for reports already in trash. Only `superadmin` can call this.

### Response `200`

```json
{ "message": "Report permanently deleted" }
```

### Errors

| Status | Condition                   |
| ------ | --------------------------- |
| `403`  | Caller is not `superadmin`  |
| `404`  | Report not found            |

### curl

```bash
curl -X DELETE http://localhost:5173/api/reports/6650a1b2c3d4e5f607a8b9c2/permanent \
  -H "Authorization: Bearer $TOKEN"
```
