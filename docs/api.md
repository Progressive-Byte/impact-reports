# API Documentation

Welcome to the API documentation for the **Nonprofit Impact Report Portal** admin backend.

## General

- [System](api/system.md) — Base URL, server setup, authentication scheme, error format, and pagination envelope.

## Authentication

- [Auth](api/auth.md) — Login and current-admin profile endpoints.

## Admin — Protected

All endpoints below require a valid `Bearer` token.

- [Users](api/users.md) — Admin account listing, creation, role changes, status toggle, and deletion.
- [Reports](api/reports.md) — Impact report lifecycle: create, step-by-step wizard save, list, and delete.
- [Settings](api/settings.md) — Own password and own profile update.

## Invite Flow

- [Invite](api/invite.md) — Send invite emails, validate invite tokens, and complete registration.
