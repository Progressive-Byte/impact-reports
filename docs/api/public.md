# Public API

No authentication required. All endpoints are read-only and return only `published` reports.

Base path: `/api/public`

---

## Endpoints

| Method | Path               | Description                                  |
| ------ | ------------------ | -------------------------------------------- |
| GET    | `/reports`         | Paginated, filterable report list             |
| GET    | `/stats`           | Aggregate counters for the hero metrics strip |
| GET    | `/filters`         | Distinct filter option lists                  |
| GET    | `/search`          | Autocomplete for search modal / search bar    |

---

## Report card shape

All four endpoints that return report data use the same card shape:

```json
{
  "id":       "664abc123...",
  "title":    "Winter Relief Alpha",
  "image":    "https://res.cloudinary.com/dt1oakyjz/image/upload/v.../impact-reports/abc123.jpg",
  "region":   "South Asia",
  "sector":   "WASH",
  "year":     "2025",
  "summary":  "Up to 200 chars of projectBackground…",
  "countries": ["Afghanistan", "Pakistan"],
  "metrics": {
    "beneficiaries": 4200,
    "locations":     6
  }
}
```

**Notes:**
- `year` is converted from the internal `fiscalYear` field (`"FY25"` → `"2025"`).
- `region` is the value set by the admin in the General step. Allowed values: `Africa`, `Middle East`, `South Asia`, `Southeast Asia`, `Global`. Reports saved before the region field was introduced fall back to a value derived from their `countries` list.
- `image` is the report's thumbnail URL if one has been set in the Media step; otherwise falls back to the first image in `images[]`; `""` if none. Always a full Cloudinary CDN URL.
- `summary` is truncated to 200 characters with a trailing `…` if needed.

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
    { "label": "Winter Relief Alpha", "type": "report",  "id": "664abc...", "icon": "FiFileText" },
    { "label": "WASH",                "type": "sector",  "icon": "FiBox"      },
    { "label": "Afghanistan",         "type": "country", "icon": "FiFlag"     },
    { "label": "South Asia",          "type": "region",  "icon": "FiGlobe"    }
  ]
}
```

| Field   | Values                              | Description                                      |
| ------- | ----------------------------------- | ------------------------------------------------ |
| `type`  | `report`, `sector`, `country`, `region` | Determines how the frontend routes the selection |
| `id`    | MongoDB ObjectId string             | Only present when `type === "report"`            |
| `icon`  | Feather icon name string            | Used by `SafeIcon` in the search UI              |

Result breakdown (max 8 total):
- Up to 5 matching report titles
- Up to 3 matching sectors
- Up to 3 matching country names
- Up to 2 matching regions

If `q` is empty, returns `{ "results": [] }`.
