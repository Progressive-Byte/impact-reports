# QA Testing Guide

Minimal step-by-step test plan for a QA engineer. Covers every major feature area with expected results.

---

## 1. Access

| URL | Purpose |
|-----|---------|
| `https://impact.humanconcernusa.org/` | Public portal |
| `https://impact.humanconcernusa.org/alkabirimpact/login` | Admin login |
| `https://impact.humanconcernusa.org/alkabirimpact/dashboard` | Admin dashboard |

> Obtain valid admin credentials from the project owner before starting. No local setup is required — the site is fully deployed and running.

---

## 2. Public Portal

| # | Steps | Expected |
|---|-------|----------|
| P1 | Visit `/` | Report grid loads; stat bar (total reports, lives impacted) visible. |
| P2 | Use the search box; type a project name | Results filter in real time (~400 ms debounce). |
| P3 | Apply a region and sector filter | Grid updates; URL params reflect the selection. |
| P4 | Click a report card | Navigates to `/report/<slug>`. Hero, brief, stats, map, and media sections render. |
| P5 | On report detail — check a field that was hidden by an editor (see TC R6) | That section is absent from the page. |
| P6 | Enter a valid email in the newsletter subscribe input | Success toast; email stored (verify in Subscribers module). |
| P7 | Submit the same email again | Still shows success (no enumeration error). |

---

## 3. Authentication

### 3.1 Standard Login

| # | Steps | Expected |
|---|-------|----------|
| A1 | Go to `/alkabirimpact/login`, enter valid credentials | Redirects to `/alkabirimpact/dashboard`. |
| A2 | Enter wrong password 3 times | Login fails; a notification is created (visible in the bell icon after a successful login). |
| A3 | After login, wait until the session timeout (default 30 min, configurable in Settings) | Automatically logged out, redirected to login page. |
| A4 | Open browser DevTools → Application → Cookies; verify `adminToken` cookie exists | Cookie is `HttpOnly`-equivalent; JWT present. |

### 3.2 Email OTP Login (if SMTP is configured)

| # | Steps | Expected |
|---|-------|----------|
| A5 | Log in with valid credentials when OTP login is active | Returns to a "Check your email" screen; JWT is not issued yet. |
| A6 | Enter the 6-digit code from the email | JWT issued; redirected to dashboard. |
| A7 | Enter an incorrect OTP | Error message; code still valid. |

### 3.3 Password Reset

| # | Steps | Expected |
|---|-------|----------|
| A8 | Click "Forgot password" on the login page; submit a registered email | 6-digit OTP emailed; 10-minute expiry. |
| A9 | Submit the OTP | Receive a short-lived `resetToken` in the response; UI shows password reset form. |
| A10 | Set a new password | Can log in with the new password; old password rejected. |

### 3.4 TOTP 2FA (optional, settings-level)

| # | Steps | Expected |
|---|-------|----------|
| A11 | In Settings → Security, click "Set up authenticator" | QR code displayed. Scan with an authenticator app. |
| A12 | Submit the 6-digit code from the app to confirm setup | TOTP enabled; next login requires an app code. |
| A13 | Log in with credentials; when prompted, enter a wrong TOTP code 5 times | Rate-limited for 15 minutes (in-memory; resets on server restart). |

---

## 4. Report Creation Wizard

Requires an `editor` or `superadmin` account.

| # | Steps | Expected |
|---|-------|----------|
| R1 | Dashboard → Reports → "New Report" | Modal opens; enter a project name and submit. Report created with `status: pending`. URL gains `?reportId=<id>&step=general`. |
| R2 | **General tab** — fill all required fields (project name, region, sector, lives impacted, fiscal year) and click Next | Step saved via `PATCH .../step/general`; `stepsCompleted` now includes `general`. |
| R3 | **Narrative tab** — fill Project Background, Strategic Response; add at least one testimonial; click Next | `narrative` added to `stepsCompleted`. |
| R4 | **Metrics tab** — add beneficiary counts (children, women, men) and at least one deliverable row; click Next | `metrics` added. |
| R5 | **Media & Timeline tab** — upload a thumbnail, add at least one milestone; click Next | `media` added; image appears in Cloudinary. |
| R6 | **Field visibility** — in any tab, toggle a field's eye icon off (e.g. donation URL or subtitle) | Field marked hidden; saved to `hiddenFields`; hidden on the public detail page (verify via P5). |
| R7 | **Location tab** — select one or more countries; click Save | `location` added. `region` field auto-derived from countries via `regionUtils`. Report status flips to `published` (no approver assigned) or `pending_approval` (approver assigned). |
| R8 | Visit `/report/<slug>` | Report is publicly visible. |

### 4.1 Approval Workflow (when `approvalAssignedTo` is set in General tab)

| # | Steps | Expected |
|---|-------|----------|
| R9 | Complete all 5 steps with an approver assigned | Report status becomes `pending_approval`, not `published`. |
| R10 | Log in as the assigned approver; open the report | "Approve" button visible. |
| R11 | Click Approve | Status changes to `published`; report appears on public portal. |

---

## 5. Admin User Management

Requires `superadmin`.

| # | Steps | Expected |
|---|-------|----------|
| U1 | Dashboard → Users → "Invite User" | Enter an email; 48-hour invite token emailed. |
| U2 | Open the invite link in a private window | Registration form with username + password fields. |
| U3 | Complete registration | Account created; token consumed; can log in. |
| U4 | Back in Users — toggle a user's Active switch | User immediately cannot log in (401). |
| U5 | Change a user's role (e.g. editor → viewer) | On next action, the viewer cannot save reports (403). |
| U6 | Delete a user | User removed from list; their JWT invalidated on next request. |

---

## 6. Role Access Gates

| # | Role | Action | Expected |
|---|------|--------|----------|
| G1 | `viewer` | Try to save a wizard step | 403 error toast. |
| G2 | `editor` | Navigate to `/alkabirimpact/dashboard/users` | Silently redirected to `overview`. |
| G3 | `editor` | Try to access a report not assigned to them | 403. |
| G4 | `viewer` | Navigate to Settings → Platform | Platform settings tab not rendered. |

---

## 7. Trash & Recovery

| # | Steps | Expected |
|---|-------|----------|
| T1 | In the report list, delete a report | Moves to Trash (`status: trash`); disappears from public portal. |
| T2 | Switch the list filter to "Trash"; restore the report (superadmin) | Status reverts to previous value; report reappears publicly if it was published. |
| T3 | Permanently delete a report from Trash (superadmin) | Record gone from DB; slug reusable. |

---

## 8. Platform Settings

Requires `superadmin`. Dashboard → Settings → Platform.

| # | Steps | Expected |
|---|-------|----------|
| S1 | Change Session Timeout to 1 minute; save | Wait ~90 s idle in another tab; session expires automatically. |
| S2 | Add a new Region in Data Management | New region appears in the General tab's region dropdown when editing a report. |
| S3 | Edit/remove a Sector | Sector no longer selectable in the wizard; existing reports retain the old value. |

---

## 9. Exports

| # | Steps | Expected |
|---|-------|----------|
| E1 | Reports list → Export → CSV | `.csv` downloads; rows match the visible list. |
| E2 | Reports list → Export → Excel | `.xlsx` downloads with all columns. |
| E3 | Activity Logs → Export (superadmin, Settings or Logs page) | Log entries exported in chosen format. |

---

## 10. Notifications

| # | Steps | Expected |
|---|-------|----------|
| N1 | Trigger 3 failed logins for any user (see A2) | Bell icon shows an unread badge after next successful login. |
| N2 | Click "Mark all read" | Badge clears; notifications still listed. |

---

## Known Behaviours / Non-bugs

- Subscribing with a duplicate email always returns success (intentional — prevents enumeration).
- TOTP rate-limit resets on server restart (in-memory; expected in dev).
- The `@supabase/supabase-js` and `@questlabs/react-sdk` packages are installed but unused — no features to test.
- Navigating to a restricted dashboard section redirects silently to `overview` (no error shown).
