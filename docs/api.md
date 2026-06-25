# API Documentation

Welcome to the API documentation for the **Nonprofit Impact Report Portal** admin backend.

## General

- [System](api/system.md) — Base URL, server setup, authentication scheme, error format, pagination envelope, background cron jobs, and activity log retention policy.

## Public — No Authentication Required

- [Public](api/public.md) — Published report listing (search + filter + pagination), single report detail, aggregate stats, filter option lists, and autocomplete search. All endpoints are read-only and only surface `published` reports.

## Authentication

- [Auth](api/auth.md) — Login, 2FA (email OTP + TOTP authenticator app), password reset flow, current-admin profile, logout, activity log display (30-day window), activity log export (year / all / custom date range), and audit log purge.

## Admin — Protected

All endpoints below require a valid `Bearer` token.

- [Users](api/users.md) — Dashboard stats, admin account listing (with role filter), creation, role changes, status toggle, deletion, own password/profile update, TOTP authenticator app setup/verify/disable, and slug backfill.
- [Reports](api/reports.md) — Impact report lifecycle: create, step-by-step wizard save, list (with A→Z/Z→A sort), export (CSV/Excel), soft-delete to Trash, restore from Trash, and permanent delete.
- [Notifications](api/notifications.md) — In-app security notifications (failed-login warnings): list, mark one read, mark all read.
- [Subscribers](api/subscribers.md) — Newsletter subscriber list: public subscribe endpoint, superadmin paginated listing with email search, and subscriber deletion.

## Invite Flow

- [Invite](api/invite.md) — Send invite emails, validate invite tokens, and complete registration.

## File Uploads

- [Upload](api/upload.md) — Upload report images (used by the Media wizard step).

## Configuration

- [Config](api/config.md) — Region and sector taxonomy (public read / superadmin write), social media links (public read / superadmin write via platform settings), platform settings (default region, session timeout, strong passwords, failed-login warnings, weekly digest, require 2FA), and manual weekly digest trigger.
