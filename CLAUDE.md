# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

Two terminals are required simultaneously. **Start the backend first** — Vite defaults to `:5173` and auto-increments to `:5174` only if `:5173` is already occupied. If Vite starts first, it claims `:5173`, the proxy target breaks, and API calls fail silently.

```bash
# Terminal 1 — backend (Express + nodemon on :5173)
npm run server:dev

# Terminal 2 — frontend (Vite dev server on :5174)
npm run dev
```

Vite proxies `/api` and `/uploads` to `:5173` during development, so the frontend always calls relative paths like `/api/...`.

Other commands:

```bash
npm run lint           # ESLint (also runs automatically before build)
npm run lint:error     # ESLint — errors only, no warnings
npm run build          # lint + Vite build → dist/
npm run build:server   # Vite SSR-bundles Express → dist/server/ (uses vite.server.config.js, @server alias)
npm run build:all      # build frontend then server (dist/ + dist/server/)
npm run seed           # seed MongoDB with initial data
npm run server         # start backend without nodemon (no hot-reload)
npm run start          # production mode (NODE_ENV=production, serves dist/ from Express)
npm run preview        # preview the Vite build locally
```

**ESLint notable disabled rules** (`eslint.config.js`): `react-hooks/exhaustive-deps` is off (missing hook deps won't warn), `no-unused-vars` is off, `no-case-declarations` is off, `no-useless-catch` is off, `react-refresh/only-export-components` is off.

There is no test suite configured.

## Deployment

Pushing to the `deploy` branch triggers the GitHub Actions workflow (`.github/workflows/`), which:
1. Installs dependencies and runs `npm run lint:error`
2. Runs `npm run build:all` (frontend + server bundle)
3. SSHs into the production server and runs `git pull`, `npm ci`, `npm run build:all`, then restarts the app via PM2

PM2 configuration is in `ecosystem.config.cjs`. In production, the app runs on **port 3000** (set in `env_production`), which overrides the default 5173. PM2 app name is `impact-reports`; restart command: `pm2 restart impact-reports --update-env`.

## Environment

The backend loads `.env` from the **project root** (not `server/`). This is done by `server/bootstrap.js`, which must be the first import in `server/index.js`. Required variables:

- `MONGODB_URI` — MongoDB connection string. Production runs a self-hosted MongoDB (8.0) directly on the same droplet, bound to `127.0.0.1:27017` with auth enabled (`mongodb://impactReportsApp:***@127.0.0.1:27017/impact-reports?authSource=impact-reports`) — not MongoDB Atlas. Local dev may still point at an Atlas cluster.
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN` — e.g. `1d`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — image uploads
- `CORS_ORIGIN` — comma-separated allowed origins (defaults to `http://localhost:5174`)
- `PORT` — defaults to `5173`
- `APP_URL` — base URL for invite links in emails (defaults to `http://localhost:5174`); set to the real domain in production
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — Nodemailer; if `SMTP_HOST` is absent, emails are silently skipped (dev fallback)

**Production note**: `npm run start` sets `NODE_ENV=production`, which triggers Express to serve the built `dist/` folder as static files and handle the SPA catch-all. Without it (`npm run server`), `GET /` returns 404 — the frontend is never served.

## Architecture

Full-stack Node/React app split into `server/` (Express + MongoDB) and `src/` (React + Vite). In production, Express serves the built frontend from `dist/`.

The entire project uses ES modules (`"type": "module"` in `package.json`). Server-side code uses `import`/`export` — never `require()` or `module.exports`. `__dirname` and `__filename` are not available natively; use the `fileURLToPath` + `dirname` pattern (see `server/index.js` for the canonical example). The only CommonJS file is `ecosystem.config.cjs` (PM2 requires it).

### Backend (`server/`)

**Auth**: JWT Bearer tokens. `server/middleware/auth.js` exports `protect`, which verifies the token and attaches `req.admin`. Admin roles are `superadmin`, `editor`, or `viewer`. Many write operations are superadmin-only; report access is gated by two helpers in `routes/reports.js` — `canEdit` (superadmin or appears in `report.assignedTo`) and `canView` (`canEdit`, plus anyone in `report.approvalAssignedTo`).

**Login flow** (multi-step):
1. `POST /api/auth/login` — validates credentials; if the `require2fa` platform setting is on, returns `{ twoFaRequired: true, methods }` instead of a JWT
2. `POST /api/auth/verify-2fa` — verifies either the emailed OTP or a TOTP code (selected via a `method` field in the body), returns JWT; in-memory rate limiter (5 wrong attempts per 15-minute window — resets on server restart)
3. `POST /api/auth/resend-2fa-otp` — re-sends the email OTP for step 2

**Password reset flow**: `POST /forgot-password` (sends 6-digit OTP, 10-min TTL) → `POST /verify-reset-otp` (validates OTP, returns 15-min `resetToken` with `pendingReset: true` claim) → `POST /reset-password` (consumes reset token, sets new password).

**API routes** (all under `/api`):
- `/auth` — login/logout, `GET /me`, `GET /logs` (last 50 events), `GET /logs/export?format=csv|excel`, `DELETE /logs/purge` (superadmin only); password reset flow above
- `/admin` — `GET /dashboard` (role-scoped stats), `GET /admins?page&limit&q&status&role`, `POST /admins`, `DELETE /admins/:id`, `PATCH /admins/:id/toggle`, `PATCH /admins/:id/role`, `PUT /settings/password`, `PUT /settings/profile`, `POST /backfill-slugs` (superadmin only); TOTP setup routes
- `/invite` — email-based invite flow; tokens are SHA-256-hashed before storage, expire in 48 h
- `/reports` — protected CRUD; per-step wizard saves via `PATCH /reports/:id/step/:stepName`; `PATCH /reports/:id/field-visibility` updates the `hiddenFields` array (see below); `PATCH /reports/:id/approve` publishes a `pending_approval` report (caller must be superadmin or in `approvalAssignedTo`); `GET /reports/counts` returns per-status counts scoped to the caller; `GET /reports/export?format=csv|excel` (registered before `/:id` so the literal string `export` isn't treated as a MongoDB ObjectId)
- `/upload` — Cloudinary image upload (max 2 MB, JPEG/PNG/WebP/GIF only)
- `/public` — unauthenticated: `GET /reports`, `GET /reports/:idOrSlug`, `GET /stats`, `GET /filters`, `GET /search`, `GET /locations-map` (published reports grouped one-per-country, for the `/locations` page's pins + per-country report list)
- `/config` — public taxonomy/content reads (`GET /donate`, `GET /regions`, `GET /sectors`, `GET /departments`, `GET /social-links`); superadmin-only writes (`PUT /sectors`, `PUT /departments` — **not** `/regions`, see below); platform settings (`GET /settings`, `PATCH /settings`, superadmin-only write); `POST /send-weekly-digest` manually triggers the digest cron job
- `/subscribers` — public `POST /subscribe` (email capture); superadmin `GET /` (paginated list), `DELETE /:id`
- `/notifications` — `GET /` returns last 30 + unread count; `PATCH /read-all`, `PATCH /:id/read`; currently only populated by failed-login events
- `/api/health` — liveness check (defined inline in `server/index.js`, not a `routes/` file)

**Models**:
- `Report` — core document; fields grouped by wizard step (see `STEP_FIELDS` in `routes/reports.js`); `stepsCompleted` array drives auto-publish
- `Admin` — username, email, bcrypt password (rounds: 12), role (`superadmin|editor|viewer`), region, `isActive`; `failedLoginAttempts` triggers a notification at threshold 3; `totpSecret` + `totpEnabled` for TOTP 2FA; `resetOTPCode` (SHA-256-hashed) + `resetOTPExpires`; `loginOTPCode` + `loginOTPExpires` for email OTP login
- `Counter` — atomic auto-increment via `Counter.next(name)`; used for sequential `projectId` on report creation
- `PlatformSettings` — singleton (`key: 'platform'`) storing `defaultRegion`, `sessionTimeoutMinutes` (default 30), and the editable `sectors`/`departments` taxonomy arrays. **Regions are not stored here** — they're a fixed, hardcoded list (see below), unlike sectors/departments which superadmins can freely edit via Data Management.
- `Subscriber` — email-only model for newsletter signups; unique index; 11000 duplicate-key errors are silently treated as success to avoid email enumeration
- `Notification` — system alerts (type, title, message, read flag)
- `Invite` — SHA-256-hashed tokens with 48-hour expiry; cleared after registration
- `ActivityLog` — login/logout/purge events (type, username, role, IP)

**Field visibility**: Each report stores a `hiddenFields: [String]` array. Editors toggle individual field visibility per-report via `FieldToggle.jsx` (present in each wizard tab); the result is saved to `PATCH /api/reports/:id/field-visibility`. The public report-detail page converts this array to a `Set` and passes it as `hiddenFields` to every display component, which conditionally omit hidden content.

**Report lifecycle**: Created with `status: 'pending'`, moves to `'draft'` as wizard steps are saved. When all five steps (`general`, `narrative`, `metrics`, `media`, `location`) appear in `stepsCompleted`, status becomes `'pending_approval'` if `approvalAssignedTo` is non-empty (awaiting sign-off from an assigned approver via `PATCH /reports/:id/approve`), otherwise it auto-publishes straight to `'published'`. Only published reports appear in public endpoints. Reports support soft-delete (moved to `status: 'trash'` via `DELETE /api/reports/:id`), restore from trash (`PATCH /api/reports/:id/restore`), and permanent delete (`DELETE /api/reports/:id/permanent`).

**Slugs**: Generated from `projectName` via `toSlug()` + `uniqueSlug()` (appends `-2`, `-3`, … on collision). Public routes accept either a MongoDB ObjectId or a slug.

**Region is a fixed, hardcoded list — not editable data.** `server/config/regions.js` exports the six canonical org regions (`Africa`, `Middle East`, `South Asia`, `Southeast Asia`, `SWANA`, `Global`). `Report.region` is a Mongoose `enum` constrained to this exact list (plus `''` for not-yet-set), and `POST/PATCH` step saves reject anything else (`server/routes/reports.js`, `validateStepPayload`). `GET /api/config/regions` just returns this hardcoded array — there is intentionally no `PUT`. This exists specifically to prevent staff typing a country/city name (e.g. `"Gaza"`) into what should be a controlled region value; to change the list itself, edit `server/config/regions.js` in code, not through the UI. Contrast with `sector`/`department`, which remain freeform, superadmin-editable taxonomy arrays on `PlatformSettings` via Data Management.

**Region auto-derivation** (separate from the above): `server/utils/regionUtils.js` exports `deriveRegion(countries)` — maps ISO country codes to one of the org regions. It is **not** called on step save; it's used only as a read-time fallback in `server/routes/public.js` (`report.region || deriveRegion(report.countries)`) for older reports that predate the `region` field being populated. It never overwrites a stored `region` value.

**Pagination**: `server/utils/pagination.js` exports `parsePagination(query)` and `buildMeta({page, limit, total})` — used by all paginated list endpoints.

**Cron**: `server/cron/weeklyDigest.js` (every Monday at 08:00) and `server/cron/logArchival.js` (1st of every month at 02:00). Both start automatically on server boot.

### Frontend (`src/`)

**Routing** (React Router v7):
- `/` — public portal (browse published reports)
- `/report/:slug` — public report detail
- `/locations` — public "All Locations Map" page (country pins + per-country report grid)
- `/alkabirimpact/login` — credential login (multi-step: login → OTP or TOTP → done)
- `/alkabirimpact/register` — complete registration from invite token
- `/alkabirimpact/dashboard` / `/alkabirimpact/dashboard/:section` — protected admin dashboard

**Admin auth**: JWT stored in an `adminToken` cookie (1-day expiry) with admin profile data mirrored to `localStorage`. `AdminAuthContext` (`src/context/AdminAuthContext.jsx`) provides `login`, `logout`, and `getToken`. A `CustomEvent('admin:unauthorized')` dispatched from `adminApi.js` on any 401 automatically clears the session and triggers the same `clearSession` path used by the inactivity timeout.

Session inactivity timeout: `startWatcher(minutes)` polls every 30 s, comparing `Date.now()` against `adminLastActivity` in `localStorage` (updated by mouse/keyboard/touch/scroll/click events). Timeout value comes from `PlatformSettings` via the login response.

**API layers**:
- `src/services/adminApi.js` — `adminApiRequest()` wraps fetch with Bearer token; reads token from the `adminToken` cookie via `src/utils/cookies.js`; handles 401 by dispatching `admin:unauthorized`
- `src/services/publicApi.js` — `publicApiRequest()` for unauthenticated calls

**Path aliases**: `@` resolves to `./src` (configured in `vite.config.js`). `@server` resolves to `./server` in `vite.server.config.js` for the server SSR bundle.

**Public pages** live under `src/pages/web/`: portal (report grid), report-detail (single-report view), and locations-map (`/locations`, the country pins + grid page). The report-detail page's `components/` directory contains 15 display components (`ReportHero`, `ProjectBrief`, `ProjectMetaCard`, `StatTile`, `DemographicsCard`, `LocationsSection`, `TestimonialSlider`, `TimelineItem`, `MediaLightbox`, `ReportCTAFooter`, etc.) — each accepts a `hiddenFields` Set prop to conditionally suppress content. The locations-map page lazy-loads `LocationsMapCanvas` (React Leaflet) to keep it out of the initial portal bundle, and pairs it with `CountryListPanel` and `CountryReportsGrid`; the portal page teases the same data via `portal/components/LocationsMapTeaser.jsx` and links through to `/locations`.

**Two-tier map architecture**: There are two distinct React Leaflet map components, not one. `LocationsMapCanvas` (locations-map only) plots one pin per **country** from `/api/public/locations-map`. `LocationsImplementedMapCanvas` (`locations-map/components/`) plots individual **project sites** with real/derived GPS coordinates and is shared across pages by direct cross-directory import — both `locations-map/components/LocationsImplementedSection.jsx` and `report-detail/components/LocationsSection.jsx` import it from the same file. Every `react-leaflet` `MapContainer` in the app (`LocationsMapCanvas`, `LocationsImplementedMapCanvas`, `ProjectCountries`, `GpsPickerModal`) follows the same convention: `attributionControl={false}` on `MapContainer` plus an explicit `<AttributionControl position="bottomright" prefix={false} />` — match this when adding a new map view instead of leaving the default (top-left, larger) attribution control.

**Admin dashboard** (`src/pages/admin/dashboard/`): Single `page.jsx` with a sidebar that switches between six modules via the `:section` URL param. Layout primitives (Sidebar, TopBar, PageHeader, Skeleton, etc.) live in `common/`. Module components live in `components/`.

| `:section` | Component | Purpose |
|---|---|---|
| `overview` | `AdminDashboard` | KPI cards and charts |
| `reports` | `ReportsModule` | Report list + five-step wizard |
| `users` | `UserManager` | Admin user CRUD |
| `data` | `DataManagement` | Edit regions & sectors taxonomy |
| `subscribers` | `SubscribersModule` | Newsletter subscriber list |
| `settings` | `Settings` | Password, profile, TOTP, platform settings |

`ReportsModule` (`components/ReportsModule/`) has three subdirectories:
- `reports/` — all module components: `WizardShell.jsx` (step orchestrator), the five wizard tab components (`GeneralTab`, `NarrativeTab`, `MetricsTab`, `MediaTimelineTab`, `CountryLocationTab`), and shared form primitives (`RecordLedger`, `ReportRow`, `BulkActionBar`, `CreateReportModal`, `FormField`, `MultiSelect`, `SearchableSelect`, `IconPicker`, etc.)
- `hooks/` — `useReportData.js` and `useReportFilters.js` for module-level data fetching
- `page.jsx` — the list/ledger entry point; renders `RecordLedger` + `LedgerToolbar`; `WizardShell` is mounted alongside when `?reportId=` is set

Active report ID and current step are tracked in URL search params (`?reportId=&step=`). Each "Next" click saves the current step via `PATCH /api/reports/:id/step/:stepName`.

**Role-based section visibility**: The dashboard's `page.jsx` defines `VALID_SECTIONS` — `superadmin` sees all six sections; `editor` and `viewer` only see `overview`, `reports`, and `settings`. Attempting to navigate to a restricted section silently redirects to `overview`.

**UI stack**: Tailwind CSS, Framer Motion, ECharts (charts), React Leaflet (maps), React Icons, React Hot Toast.

**Frontend hooks** (`src/hooks/`): `usePublicReports` (fetches paginated reports + stats/filterOptions from `/api/public/reports`), `usePortalFilters` (URL-param filter/search/page state, 400 ms debounce), `useLocalStorage` (JSON-serializing wrapper), `usePublicLocationsMap` (fetches `/api/public/locations-map` for the `/locations` page only).

**Shared UI components** (`src/common/`): `AdminProtectedRoute.jsx` — wraps admin routes in `App.jsx` and redirects to `/alkabirimpact/login` if no valid session exists; `RichTextEditor/` — Tiptap **v3** WYSIWYG (`index.jsx`, `EditorToolbar.jsx`, `ToolbarBtn.jsx`) used in `NarrativeTab` and `MediaTimelineTab` (note: v3 API differs from the widely-documented v2); `CustomCursor.jsx` — custom cursor overlay for the public portal; `SafeIcon.jsx` — null-safe wrapper around react-icons to prevent render crashes. The rest (`Header`, `Footer`, `NavigationProgress`, `SearchModal`, `Pagination`, `CollapsibleSection`, `SvgIcon`) are public-portal layout primitives used by `Layout.jsx`.

**Frontend utilities** (`src/utils/`):
- `cookies.js` — `getCookie` / `setCookie` / `deleteCookie` for the `adminToken` JWT cookie
- `location.js` — `cleanCountryName()` normalizes display strings; `getGpsData()` generates deterministic pseudo-coordinates for map pins when no real GPS is stored
- `videoUtils.js` — YouTube/Vimeo URL parsing used in `MediaTimelineTab` for video embeds

**Notable third-party library use**:
- `country-state-city` — used in `CountryLocationTab` and `GpsPickerModal` for country/state/city dropdowns and ISO code lookups
- `xlsx` — powers the CSV/Excel export endpoints in `GET /api/reports/export` and `GET /api/auth/logs/export`
- `otplib` + `qrcode` — handle TOTP secret generation and QR code rendering in the TOTP setup flow
- `date-fns` — date formatting throughout the app

**Note**: `@supabase/supabase-js` and `@questlabs/react-sdk` appear in `package.json` but are not imported anywhere in the current app code.

## API Documentation

Detailed per-route API docs live in `docs/api/` (linked from `docs/api.md`): `system.md`, `auth.md`, `users.md`, `reports.md`, `public.md`, `notifications.md`, `invite.md`, `upload.md`, `config.md`, `subscribers.md`, `settings.md`. These cover request/response shapes, error codes, and pagination envelopes.
