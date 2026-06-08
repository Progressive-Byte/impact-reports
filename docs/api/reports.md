# Reports API

Mounted at `/api/reports`. All routes require `Authorization: Bearer <token>`.

| Method | Path                              | Auth        | Body                                 | Notes                                    |
| ------ | --------------------------------- | ----------- | ------------------------------------ | ---------------------------------------- |
| GET    | `/api/reports`                    | Bearer      | —                                    | List reports (role-filtered)             |
| GET    | `/api/reports/search`             | Bearer      | —                                    | Autocomplete project names (query: `q`) |
| POST   | `/api/reports`                    | Superadmin  | `projectName`, `assignedTo[]`        | Create report with status `pending`      |
| GET    | `/api/reports/:id`                | Bearer      | —                                    | Get single report                        |
| PATCH  | `/api/reports/:id/step/:stepName` | Bearer      | step fields (see below)              | Save one wizard step                     |
| DELETE | `/api/reports/:id`                | Superadmin  | —                                    | Permanently delete report                |

**Access rules**
- `superadmin` sees and can act on all reports.
- `admin` sees only reports where their ID is in `assignedTo`. They can edit (save steps) but cannot create or delete.

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
  "livesImpacted":   4800,
  "projectBackground": "...",
  "strategicResponse": "...",
  "children":        40,
  "women":           35,
  "men":             25,
  "deliverables":    [{ "label": "Solar Wells", "count": 12 }],
  "galleryUrl":      "https://...",
  "milestones":      [{ "date": "2025-01", "title": "Phase 1", "notes": "..." }],
  "stepsCompleted":  ["general", "narrative"],
  "createdAt":       "2026-06-08T10:00:00.000Z",
  "updatedAt":       "2026-06-08T12:00:00.000Z"
}
```

**Status values**

| Status      | When set                                               |
| ----------- | ------------------------------------------------------ |
| `pending`   | Just created — no step saved yet                       |
| `draft`     | At least one step saved but not all four               |
| `published` | All four steps saved (after final `media` step submit) |

---

## `GET /api/reports`

List all reports accessible to the caller. Superadmin gets all; admin gets only assigned reports. Results are sorted newest first.

### Query parameters

| Param    | Type   | Required | Description                                                             |
| -------- | ------ | :------: | ----------------------------------------------------------------------- |
| `status` | string | No       | Filter by status: `pending`, `draft`, or `published`. Omit for all.    |

### Response `200`

```json
{
  "reports": [ /* array of Report objects */ ]
}
```

### curl

```bash
# All reports
curl http://localhost:5000/api/reports \
  -H "Authorization: Bearer $TOKEN"

# Only published reports
curl "http://localhost:5000/api/reports?status=published" \
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
curl "http://localhost:5000/api/reports/search?q=winter" \
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
curl -X POST http://localhost:5000/api/reports \
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

| Param      | Values                                    |
| ---------- | ----------------------------------------- |
| `stepName` | `general` \| `narrative` \| `metrics` \| `media` |

### Request bodies per step

**`general`**

| Field           | Type     | Description                         |
| --------------- | -------- | ----------------------------------- |
| `projectName`   | string   | Project name                        |
| `assignedTo`    | string[] | Array of Admin `_id` strings        |
| `projectLead`   | string   | Lead person name                    |
| `fiscalYear`    | string   | e.g. `"FY25"`                       |
| `livesImpacted` | number   | Number of lives impacted            |

**`narrative`**

| Field               | Type   | Description            |
| ------------------- | ------ | ---------------------- |
| `projectBackground` | string | Crisis context         |
| `strategicResponse` | string | Response operations    |

**`metrics`**

| Field          | Type                            | Description                 |
| -------------- | ------------------------------- | --------------------------- |
| `children`     | number                          | Children demographic %      |
| `women`        | number                          | Women demographic %         |
| `men`          | number                          | Men demographic %           |
| `deliverables` | `[{ label: string, count: number }]` | Custom metrics         |

**`media`**

| Field        | Type                                       | Description            |
| ------------ | ------------------------------------------ | ---------------------- |
| `galleryUrl` | string                                     | Cloudinary / S3 URL    |
| `milestones` | `[{ date: string, title: string, notes: string }]` | Timeline entries |

### Response `200`

```json
{ "report": { /* updated Report object */ } }
```

When `media` step is saved and all four steps are complete, `status` becomes `"published"`. Otherwise `"draft"`.

### curl

```bash
# Save general step
curl -X PATCH "http://localhost:5000/api/reports/6650a1b2c3d4e5f607a8b9c2/step/general" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Winter Relief Alpha","assignedTo":["6650a1b2..."],"projectLead":"Ali Hassan","fiscalYear":"FY25","livesImpacted":4800}'

# Submit final step
curl -X PATCH "http://localhost:5000/api/reports/6650a1b2c3d4e5f607a8b9c2/step/media" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"galleryUrl":"https://...","milestones":[{"date":"2025-01","title":"Phase 1","notes":"Delivered"}]}'
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
curl -X DELETE http://localhost:5000/api/reports/6650a1b2c3d4e5f607a8b9c2 \
  -H "Authorization: Bearer $TOKEN"
```
