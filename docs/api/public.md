# Public API

No authentication required. All endpoints are read-only and return only `published` reports.

Base path: `/api/public`

---

## Endpoints

| Method | Path               | Description                                  |
| ------ | ------------------ | -------------------------------------------- |
| GET    | `/reports`         | Paginated, filterable report list             |
| GET    | `/reports/:idOrSlug` | Full detail for a single published report   |
| GET    | `/stats`           | Aggregate counters for the hero metrics strip |
| GET    | `/filters`         | Distinct filter option lists                  |
| GET    | `/search`          | Autocomplete for search modal / search bar    |

---

## Report card shape

All four endpoints that return report data use the same card shape:

```json
{
  "id":        "664abc123...",
  "slug":      "winter-relief-alpha",
  "projectId": "BurmaWater-1001",
  "title":     "Winter Relief Alpha",
  "image":     "https://res.cloudinary.com/dt1oakyjz/image/upload/v.../impact-reports/abc123.jpg",
  "region":    "South Asia",
  "sector":    "WASH",
  "year":      "2025",
  "summary":   "Up to 200 chars of projectBackground…",
  "countries": ["Afghanistan", "Pakistan"],
  "metrics": {
    "beneficiaries": 4200,
    "locations":     6
  }
}
```

| Field       | Description                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `id`        | MongoDB ObjectId string — can be used in `GET /api/public/reports/:idOrSlug`                   |
| `slug`      | URL-friendly slug (e.g. `winter-relief-alpha`) — preferred for public links                    |
| `projectId` | Human-readable project ID set by admin (`actualProjectId` or sequential `projectId` fallback). `""` if not set. |

**Notes:**
- `year` is derived from the internal `reportingPeriod` field, taking its first year (e.g. `"2025"` → `"2025"`, `"2025–2027"` → `"2025"`, `"Jan 2025 – Dec 2026"` → `"2025"`). Legacy `"FY25"`-style values are also handled.
- `region` is the value set by the admin in the General step. Allowed values: `Africa`, `Middle East`, `South Asia`, `Southeast Asia`, `Global`. Reports saved before the region field was introduced fall back to a value derived from their `countries` list.
- `image` is the report's thumbnail URL if one has been set in the Media step; otherwise falls back to the first image in `images[]`; `""` if none. Always a full Cloudinary CDN URL.
- `summary` uses the report's `shortSubtitle` field if set; otherwise falls back to a plain-text excerpt of `projectBackground`. Truncated to 200 characters with a trailing `…` if needed.

---

## `GET /api/public/reports`

Returns a paginated list of published reports. Supports full-text search and multi-value filters.

### Query parameters

| Param     | Type    | Default  | Max | Description                                        |
| --------- | ------- | :------: | :-: | -------------------------------------------------- |
| `q`       | string  | —        | —   | Full-text search across title, sector, region, background, countries |
| `region`  | string  | —        | —   | Filter by region — repeatable for OR logic         |
| `sector`  | string  | —        | —   | Filter by sector — repeatable for OR logic         |
| `country` | string  | —        | —   | Filter by country name — repeatable for OR logic   |
| `year`    | string  | —        | —   | Filter by year (e.g. `2025`) — repeatable for OR logic |
| `sort`    | string  | `recent` | —   | `recent` (newest first) or `oldest`                |
| `page`    | integer | `1`      | —   | Page number (1-based)                              |
| `limit`   | integer | `12`     | `48`| Items per page                                     |

Multi-value example: `?country=Afghanistan&country=Somalia` returns reports in either country.

### Response `200`

```json
{
  "reports": [ /* array of card objects */ ],
  "meta": {
    "page":    1,
    "limit":   12,
    "total":   47,
    "pages":   4,
    "hasPrev": false,
    "hasNext": true
  }
}
```

---

## `GET /api/public/stats`

Returns aggregate metrics used by the hero strip on the portal homepage.

### Response `200`

```json
{
  "totalProjects":  47,
  "totalLives":     184300,
  "totalCountries": 22
}
```

| Field            | Description                                        |
| ---------------- | -------------------------------------------------- |
| `totalProjects`  | Count of published reports                         |
| `totalLives`     | Sum of `livesImpacted` across all published reports|
| `totalCountries` | Count of distinct country names across all reports |

---

## `GET /api/public/filters`

Returns all distinct values available for each filter dimension. Use this to populate the filter sidebar options.

### Response `200`

```json
{
  "regions":   ["Africa", "Middle East", "South Asia", "Southeast Asia"],
  "sectors":   ["Education", "Healthcare", "WASH"],
  "countries": ["Afghanistan", "Kenya", "Syria"],
  "years":     ["2025", "2024", "2023"]
}
```

All arrays are alphabetically sorted except `years`, which is newest-first.

**Note:** `regions` reflects the values admins have selected from the fixed taxonomy (`Africa`, `Middle East`, `South Asia`, `Southeast Asia`, `Global`). For reports saved before the region field existed, the endpoint derives the region from the `countries` list as a backward-compatibility fallback.

---

## `GET /api/public/search`

Autocomplete endpoint used by the search modal and inline search bar. Returns up to 8 mixed results across reports, sectors, countries, and regions.

### Query parameters

| Param | Type   | Required | Description              |
| ----- | ------ | :------: | ------------------------ |
| `q`   | string | Yes      | Search term (min 1 char) |

### Response `200`

```json
{
  "results": [
    { "label": "Winter Relief Alpha", "type": "report",  "id": "664abc...", "slug": "winter-relief-alpha", "icon": "FiFileText" },
    { "label": "BurmaWater-1001",     "type": "id",      "id": "664abc...", "slug": "winter-relief-alpha", "subtitle": "BurmaWater-1001", "icon": "FiHash" },
    { "label": "WASH",                "type": "sector",  "icon": "FiBox"   },
    { "label": "Afghanistan",         "type": "country", "icon": "FiFlag"  },
    { "label": "South Asia",          "type": "region",  "icon": "FiGlobe" }
  ]
}
```

| Field      | Values                                      | Description                                                   |
| ---------- | ------------------------------------------- | ------------------------------------------------------------- |
| `type`     | `report`, `id`, `sector`, `country`, `region` | Determines how the frontend routes the selection             |
| `id`       | MongoDB ObjectId string                     | Present when `type === "report"` or `type === "id"`           |
| `slug`     | string                                      | Present when `type === "report"` or `type === "id"` — use for public URLs |
| `subtitle` | string                                      | Present when `type === "id"` — the matching project ID value  |
| `icon`     | Feather icon name string                    | Used by `SafeIcon` in the search UI                           |

**Result breakdown (max 10 total):**
- Up to 5 matching report titles (`type: "report"`)
- Up to 3 matching project IDs (`type: "id"`) — matched against `actualProjectId` or `projectId`; deduplicated with title results
- Up to 3 matching country names (`type: "country"`)
- Up to 2 matching regions (`type: "region"`)
- Up to 2 matching sectors (`type: "sector"`)

If `q` is empty, returns `{ "results": [] }`.

---

## `GET /api/public/reports/:idOrSlug`

Returns the full detail payload for a single published report. Used by the report detail page.

### Path parameters

| Param       | Description                                           |
| ----------- | ----------------------------------------------------- |
| `idOrSlug`  | MongoDB ObjectId **or** URL slug (e.g. `winter-relief-alpha`) |

Returns `404` if the report does not exist or is not `published`.

### Response `200`

```json
{
  "id":                "664abc123...",
  "title":             "Emergency Medical Support",
  "image":             "https://res.cloudinary.com/...",
  "region":            "Middle East",
  "sector":            "Healthcare",
  "year":              "2025",
  "reportingPeriod":   "2025",
  "programLead":          "Dr. Ahmed Hassan",
  "implementingPartner":  "Al-Khair Foundation",
  "partnerOrganizations": "Red Crescent, WFP",
  "shortSubtitle":     "Delivering emergency medical support across conflict-affected communities.",
  "donationUrl":       "https://donate.example.com/project",
  "ctaTitle":          "Support This Mission",
  "ctaDescription":    "Your partnership allows our teams to remain on the ground and expand our reach to those who need it most.",
  "ctaButtonText":     "Donate Now",
  "projectBackground": "Full text of project background...",
  "strategicResponse": "Full text of strategic response...",
  "livesImpacted":     120000,
  "demographicsTitle": "Recipient Demographics",
  "demographics": [
    { "label": "Men",             "percentage": 30,   "icon": "FiUser"   },
    { "label": "Women",           "percentage": 40,   "icon": "FiUsers"  },
    { "label": "Pregnant Women",  "percentage": null, "icon": "FiHeart"  }
  ],
  "deliverables": [
    { "label": "Mobile Clinics Deployed", "count": 5, "icon": "FiTruck", "description": "" }
  ],
  "milestones": [
    { "date": "Jan 2025", "title": "Rapid Deployment", "description": "First mobile clinic operational within 48 hours." }
  ],
  "images":    [{ "url": "https://res.cloudinary.com/..." }],
  "videoUrl":  "",
  "countries": ["Gaza", "Lebanon", "Palestine", "Syria"],
  "locations": [
    { "country": "Palestine", "address": "Gaza (North)", "lat": "31.5326", "lng": "34.4667" }
  ],
  "testimonials": [
    {
      "title":       "A Lifeline in Crisis",
      "body":        "<p>The mobile clinic arrived when we had no other options...</p>",
      "clientImage": "https://res.cloudinary.com/...",
      "name":        "Tariq M.",
      "designation": "Father",
      "address":     "Gaza, Palestine"
    }
  ]
}
```

**Notes:**
- `demographics` is a freeform array of `{ label, percentage, icon }` — categories are defined per-report (not a fixed Men/Women/Children set). `percentage` is `null` when a category was recorded without a numeric value, in which case the UI renders the label with no bar. `demographicsTitle` is the editable heading shown above the section (default `"Recipient Demographics"`).
- `milestones[].description` is mapped from the `notes` field in the database.
- `image` follows the same fallback logic as the card endpoint: `thumbnail` → first `images[].url` → `""`.
- `year` is derived from `reportingPeriod` the same way as the list endpoint (first year found). The detail endpoint also returns the full `reportingPeriod` string (e.g. `"2025–2027"` or `"Jan 2025 – Dec 2026"`) for display on the report page.
- `shortSubtitle` is the plain-text subtitle set in the General wizard step. Displayed in the report hero section and on the report card. Falls back gracefully to the stripped `projectBackground` excerpt in the UI when empty.
- `testimonials` is an array saved in the Narrative wizard step. `body` is rich HTML (Tiptap). An empty array `[]` means none were added. `clientImage` falls back to an initials avatar in the UI when blank.
