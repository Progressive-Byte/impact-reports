# Development

Two terminals are required simultaneously. **Start the backend first** — Vite defaults to `:5173` and auto-increments to `:5174` only if `:5173` is already occupied. If Vite starts first, it claims `:5173`, the proxy target breaks, and API calls fail silently.

| Terminal 1 | Terminal 2 |
|---|---|
| `npm run server:dev` (backend on `:5173`) | `npm run dev` (frontend on `:5174`) |

Vite proxies `/api` and `/uploads` to `:5173` during development, so the frontend always calls relative paths like `/api/...`.

Other commands:

```bash
npm run lint           # ESLint (also runs automatically before build)
npm run lint:error     # ESLint — errors only, no warnings
npm run build          # lint + Vite build → dist/
npm run build:server   # Vite SSR-bundles Express → dist/server/
npm run build:all      # build frontend then server (dist/ + dist/server/)
npm run seed           # seed MongoDB with initial data
npm run server         # start backend without nodemon (no hot-reload)
npm run start          # production mode (NODE_ENV=production, serves dist/ from Express)
npm run preview        # preview the Vite build locally
```

See `CLAUDE.md` for architecture and further details.
