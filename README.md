# The backend server run
npm run server:dev

  See:
  MongoDB Atlas connected
  Server running on http://localhost:5000

  # The frontend server run
  npm run dev (frontend on :5173)
  
  Then login will work. Need two terminals running simultaneously:

  ┌─────────────────────────────────┬───────────────────────────────────────┐
  │           Terminal 1            │              Terminal 2               │
  ├─────────────────────────────────┼───────────────────────────────────────┤
  │ npm run dev (frontend on :5173) │ npm run server:dev (backend on :5000) │
  └─────────────────────────────────┴───────────────────────────────────────┘
  npm run build:server — builds only the server
  - npm run build:server — builds only the server
  - npm run build:all — builds frontend then server (dist/ + dist/server/)
