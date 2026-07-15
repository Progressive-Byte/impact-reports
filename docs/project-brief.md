# Project Brief — Impact Report Portal

A plain-language overview of what this platform is, who uses it, and what it does for them. For technical/API details see [`docs/api.md`](./api.md); for a hands-on test script see [`docs/qa-testing.md`](./qa-testing.md).

## What it is

The Impact Report Portal is a two-sided web application for a nonprofit to **produce, approve, and publish "impact reports"** — structured write-ups of individual projects (beneficiaries reached, funds deployed, milestones, testimonials, photos, locations) — and to **present them publicly** in a searchable, filterable portal for donors, partners, and the public.

It replaces ad-hoc report writing (Word docs, PDFs, one-off web pages) with a single system where:
- Program staff enter each project once, through a guided wizard, instead of formatting a document by hand.
- A report only goes live once it's complete and (optionally) signed off by a designated approver.
- The public site, exports, and internal dashboards all read from the same record, so there's one source of truth.

## Who uses it

| Audience | What they do here |
|---|---|
| **Public visitors** (donors, partners, general public) | Browse and search published reports, view a country map of where work is happening, read individual project stories, subscribe to updates. No login required. |
| **Editors** (program/field staff) | Create and fill out reports for projects they're assigned to, upload media, decide what's shown or hidden publicly, submit reports for approval. |
| **Approvers** (staff named in a report's approval list) | Review a completed report and approve it for publishing. |
| **Superadmins** (leadership / platform owners) | Everything editors do, plus manage staff accounts and roles, edit the region/sector taxonomy, configure platform-wide security and notification settings, export data, and review the audit log. |

## The public site — what it gives visitors

- **Report grid** on the homepage with a running stat bar (total reports, total lives impacted).
- **Search and filters** — free-text search plus region/sector filters, all reflected in the URL so results are shareable/bookmarkable.
- **Report detail pages** — each published report gets its own page (`/report/<slug>`) built from the same sections editors filled in: hero image, project brief, key stats, beneficiary demographics, country/location map, milestone timeline, testimonials, and a media gallery. Any field an editor marked as hidden simply doesn't appear.
- **Locations map** (`/locations`) — a dedicated page pinning every country with at least one published report, paired with a per-country report list, so visitors can explore geographically instead of by search.
- **Newsletter subscribe** — a simple email capture on the portal; resubmitting an already-subscribed email still shows success (no signal is given about whether an email is already in the system).

## The admin dashboard — what it does for staff

The dashboard is organized into six areas. Which ones a staff member sees depends on their role (see [Roles](#roles--what-each-can-do) below).

### Overview
At-a-glance KPIs (report counts by status, activity trends), a breakdown of active regions, and a live view of recent account activity (logins, logouts, failed attempts) — the first thing a returning admin sees.

### Reports — the core of the platform
A ledger of every report (published, draft, pending approval, trashed) with search, sort, and bulk actions. Opening a report launches a **five-step wizard**:

1. **General** — project name, region, sector, lives impacted, fiscal year, and who should approve it before it goes live.
2. **Narrative** — the story: background, strategic response, and testimonials.
3. **Metrics** — beneficiary counts (children/women/men) and a list of concrete deliverables.
4. **Media & Timeline** — thumbnail and gallery images, plus milestone events.
5. **Location** — the countries the project covers; the organizational "region" (e.g. Africa, South Asia) is derived automatically from the countries chosen, so staff never have to reconcile the two by hand.

At every step, individual fields can be toggled hidden/visible — useful when a figure isn't ready to be public yet, without holding up the rest of the report. A report only appears on the public site once all five steps are done, **and** either no approver was named (it publishes automatically) or the named approver has signed off. Reports can be soft-deleted to a Trash view and restored, or permanently removed. The full list — or the audit log of who did what — can be exported to CSV or Excel for board reports, funder reporting, or offline record-keeping.

### Users
Superadmins invite new staff by email (an invite link that expires after 48 hours), assign a role, deactivate or reactivate accounts, change roles, and delete accounts. This is how access to the reporting workflow is granted or revoked without ever sharing a shared login.

### Data Management
Superadmins maintain the **region and sector taxonomy** — the dropdown lists editors pick from in the General step. Adding a region/sector makes it available platform-wide immediately; removing one doesn't retroactively change reports that already used it.

### Subscribers
A searchable, paginated view of everyone who signed up for updates on the public site, with the ability to remove entries (e.g. for unsubscribe requests).

### Settings
Where superadmins tune how the platform behaves day to day:
- **Security** — require two-factor login platform-wide, let individual staff set up an authenticator app, enforce strong passwords, set how long an idle session stays logged in.
- **General** — default region, timezone, currency used across reports.
- **Notifications** — email alerts, an automated weekly digest, and warnings when an account has repeated failed logins.
- **Donation link & social media links** — the outbound links shown in the public site's footer, editable without a code change.
- **Danger zone** — export all platform data, or purge the audit log.

## Roles — what each can do

| Capability | Viewer | Editor | Superadmin |
|---|---|---|---|
| Browse dashboard Overview, Reports, own Settings | ✅ | ✅ | ✅ |
| Create/edit reports assigned to them | ❌ (read-only) | ✅ | ✅ |
| Approve a report they're named approver on | — | ✅ (if named) | ✅ |
| Manage staff accounts, roles, invites | ❌ | ❌ | ✅ |
| Edit region/sector taxonomy | ❌ | ❌ | ✅ |
| Manage subscribers, platform-wide settings | ❌ | ❌ | ✅ |
| Permanently delete a report | ❌ | ❌ | ✅ |

Editors and viewers who try to open a section they don't have access to are simply redirected back to Overview — no error, no dead end.

## Report lifecycle, in plain terms

`pending` (just created) → `draft` (some steps saved) → once all five steps are done: `pending_approval` (if an approver was named — waiting on their sign-off) or `published` (goes live immediately). Published reports are the only ones visible on the public site. A report can be moved to `trash` at any time and restored later, returning to whatever status it had before.

## Security & accountability

- Staff log in with a username/password; the platform can additionally require a one-time code (emailed, or from an authenticator app) before granting access.
- A forgotten password is reset via an emailed one-time code, not a plain email link.
- Idle sessions log out automatically after a configurable period.
- Every login, logout, and failed attempt is recorded in an activity log, exportable for audits, with repeated failures raising an in-app notification.

## What this saves the organization

- **One data entry pass, not several** — the same information that appears on the public site also drives exports and internal reporting, so there's no re-typing.
- **Controlled publishing** — nothing goes live half-finished or without the required sign-off, without needing a human to manually check each field.
- **Selective transparency** — sensitive or unconfirmed figures can be entered and hidden, rather than delayed out of the whole report.
- **Self-service staff management** — leadership can grant, adjust, or revoke access to reporting without engineering involvement.
- **Audit trail** — who logged in, who changed what, and when, is already recorded rather than needing to be reconstructed after the fact.
