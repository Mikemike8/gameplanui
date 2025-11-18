# GamePlan Workspace (Next.js + Auth0 + Render)

GamePlan is a collaborative workspace that combines real‑time chat, calendar/event planning, file sharing, and team health dashboards behind Auth0 authentication. The frontend (this repo) is a Next.js 16 App Router project that talks to a FastAPI backend deployed on Render (`https://ggameplan-backend.onrender.com`) with a managed Postgres database.

This README explains the feature set, the architecture devs depend on, how to work locally vs Render, and which future improvements/security hardening we should tackle next.

---

## 1. Feature Overview

| Surface | Highlights |
| --- | --- |
| **Authentication** | Auth0 login (`/auth/login`) wraps the entire app. `src/app/protected/layout.tsx` guards protected routes, synchronizes an internal “backend user” by calling `/users/me`, and hydrates `UserContext` for client components. |
| **Workspace onboarding** | `/protected/onboarding` lets a user create or join a workspace. Create posts to `/workspaces/create`, join accepts invite codes via `/workspaces/join`. New workspaces redirect straight into chat. |
| **Realtime chat** | `TeamChannelInterface` (in `src/components/Dashboard`) controls 1) workspace switcher + invite modal, 2) channel list + creation dialog, 3) Socket.IO messaging with optimistic sending, file attachments, pinned messages, emoji reactions, and search. |
| **Files** | The “Files” icon loads `<FilePanel>`, which supports uploads (POST `/files/upload`), drag‑and‑drop, sharing modals, and grid/list views. |
| **Calendar + Events** | A rich Team Snapshot + Calendar sits behind the “Users” and “events” icons. We now ship a dedicated `/protected/events` route plus the embedded `<TeamEventsPanel>` (calendar view, list view, event detail pane, RSVP buttons, attendance stats, and a roadmap section for future travel filters/results). |
| **Invite modal** | From the workspace switcher, “Invite teammates” opens a modal with one-click copy links and a “Generate code” option (client-side for now) so admins can send fresh invites right away. |
| **Search modal** | The header search icon now opens a modal to filter the current channel’s messages by content or sender name. Results show message excerpts + timestamps, providing fast catch-up inside chat. |
| **Team dashboard snapshot** | The “Team” icon toggles `<TeamSnapshotPanel>`, summarizing unread items, activity metrics, upcoming events, and recent chat highlights. This is the blueprint for “get caught up fast” dashboards. |

These views reuse a shared UI kit (Cards, Tabs, Dialogs, etc.) located under `src/components/ui`.

---

## 2. Architecture in Practice

```
frontend/next-supa
├── src/app
│   ├── layout.tsx                Root layout, Auth0 provider
│   ├── page.tsx                  Landing/login page
│   └── protected                 Authenticated routes
│       ├── layout.tsx            Guard + backend user bootstrap
│       ├── page.tsx              Protected entry
│       ├── onboarding/page.tsx   Workspace onboarding
│       ├── workspace/[id]/chat   Chat interface (TeamChannelInterface)
│       ├── workspace/[id]/settings Read-only settings + invite code
│       ├── events/page.tsx       Standalone TeamEventsPanel
│       └── …                     (files, calendar, notifications, etc.)
├── src/components
│   ├── Dashboard/TeamChannelInterface.tsx  Main chat/UX surface
│   ├── Events/TeamEventsPanel.tsx          Calendar + RSVP stack
│   ├── Workspace/*                        Forms, switchers, invite UI
│   └── ui/*                               Buttons, cards, dialogs, tabs…
├── src/context/UserContext.tsx             Exposes backend user client-side
├── src/lib/auth0.ts                       Auth0 server helper
└── src/lib/workspaces.ts                  REST client for backend API
```

**Backend summary (for context)**  
The FastAPI service (outside this repo) handles `/users/me`, `/workspaces/*`, `/channels`, `/messages` (plus `/files/upload`, `/reactions`). It lives at `https://ggameplan-backend.onrender.com` and reads credentials from Render’s Postgres (host `dpg-d494dhbipnbc73dr0b0g-a…`). Frontend API calls go through `NEXT_PUBLIC_API_URL` / `API_URL`.

---

## 3. Environment & Configuration

Create `next-supa/.env.local` for local development (the repo now ships `next-supa/.env.local.example`, so run `cp next-supa/.env.local.example next-supa/.env.local` and fill it in). Set the same keys in Render’s frontend service (Environment tab). Minimum keys:

```
AUTH0_SECRET=...
AUTH0_BASE_URL=http://localhost:3000         # or https://gameplanuipro.onrender.com
AUTH0_ISSUER_BASE_URL=https://YOUR-TENANT.us.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000    # override with https://ggameplan-backend.onrender.com in prod
API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # used for invite links during SSR
```

The backend uses `Backend/.env` (copy from `Backend/.env.example`) to source its Postgres credentials locally and on Render. Minimum keys:

```
DB_HOST=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
# optional DATABASE_URL override
```

### Local stack quickstart (frontend + backend)

1. **Postgres (optional)**: production runs on Postgres, but for quick local smoke tests the backend auto-falls back to `sqlite:///Backend/gameplan.db` when no `DB_*` envs are set. To mirror prod locally, start Postgres (`docker run --name gameplan-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=gameplan -p 5432:5432 -d postgres:15`) and update `Backend/.env`.
2. **Backend API**:
   ```bash
   cd Backend
   python -m venv .venv && source .venv/bin/activate  # or use pyenv/conda
   pip install -r requirements.txt
   cp .env.example .env  # then edit DB_* values
   uvicorn main:fastapi_app --reload --host 0.0.0.0 --port 8000
   ```
3. **Frontend**:
   ```bash
   cd next-supa
   cp .env.local.example .env.local  # plug in Auth0 + API URL
   npm install
   npm run dev
   ```
4. Visit `http://localhost:3000`. Auth0 must have `http://localhost:3000` listed as an allowed callback/logout URL.

### Render deployment recap

- **Frontend**: `NEXT_PUBLIC_API_URL` and `API_URL` must point to the backend Render service (e.g., `https://ggameplan-backend.onrender.com`). Keep `NEXT_PUBLIC_SITE_URL` in sync with your Render custom domain.
- **Backend**: Set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` (or an explicit `DATABASE_URL`) in Render → Environment. The FastAPI service runs via `uvicorn main:fastapi_app --host 0.0.0.0 --port ${PORT}`.
- **Local verification**: before pushing, run through Auth → Onboarding → Chat → Events → Files → Invite flows locally to ensure both services stay in lockstep.

---

## 4. Key Workflows (Developer Notes)

1. **Auth + backend sync**
   - Every protected request starts with `auth0.getSession()`.
   - We immediately POST to `/users/me`, which creates the backend profile if needed. The response is serialized and dropped into `localStorage` (`backendUser`) to hydrate `UserContext`.

2. **Workspace switcher & invites**
   - The switcher fetches `/workspaces/my?user_id=…`.
   - Deleting a workspace calls the backend `DELETE /workspaces/:id?user_id=…`.
   - The new invite modal uses the existing `invite_code` field. “Generate code” currently updates local state only—wire this to a backend endpoint to persist codes across sessions.

3. **Chat UX**
   - Channels are fetched via `/channels?workspace_id=…`.
   - Messages load from `/messages?channel_id=…` and stream via Socket.IO (“new-message”, “message-pinned”, “reaction-added”).
   - File uploads call `/files/upload` (multipart) and render inline cards with download links.
   - The search modal filters in-memory messages; future work should wire a backend query if the channel history is large.

4. **Events + calendar**
   - `<TeamEventsPanel>` currently uses mocked data/state transitions. To make it persistent:
     - Introduce `/events` endpoints (CRUD + RSVP).
     - Wire RSVP buttons to POST/PATCH to update attendance.
     - Replace the mock arrays with SWR/React Query fetching hooks.

5. **Team dashboard & snapshot**
   - `<TeamSnapshotPanel>` surfaces the “next event”, unread counts, activity chips, etc. Use E2E tests to ensure dashboard data stays in sync once wired to backend telemetry.

### Keyboard shortcuts (Cmd on macOS / Ctrl on Windows)

| Shortcut | Action |
| --- | --- |
| `Cmd/Ctrl + B` | Toggle the channel sidebar. |
| `Cmd/Ctrl + K` | Open the conversation search / quick switcher modal. |
| `Cmd/Ctrl + Shift + F` | Toggle the Files panel. |
| `Cmd/Ctrl + Shift + E` | Toggle Team Events. |
| `Cmd/Ctrl + Shift + T` | Toggle the Team Snapshot dashboard. |
| `Cmd/Ctrl + Shift + V` | Open the “Start video huddle” dialog. |
| `Cmd/Ctrl + Shift + M` | Jump focus to the message composer. |

---

## 5. Security & Hardening Suggestions

These items should be prioritized as we productionize:

1. **Invite code persistence & validation**  
   - The current “Generate code” button is client-only. Add backend endpoints to issue/revoke invite codes, store a hash, and expire codes after use.

2. **Role-based access control**  
   - Backend already tracks roles (`owner`, `member`). Surface these in the frontend (UserContext) and gate admin features (channel creation, event creation, invite modal) accordingly.

3. **Input sanitization & rate limiting**  
   - Frontend should escape user content where needed; backend should enforce rate limits on `/messages`, `/files/upload`, and `/events` to prevent abuse.

4. **Secrets storage**  
   - Never commit `.env` files. Use Render environment groups for anything shared across services (Auth0, API, site URL).

5. **Transport security**  
   - Always call the backend over HTTPS (enforced via `NEXT_PUBLIC_API_URL`). For local dev, set `NODE_TLS_REJECT_UNAUTHORIZED=0` only if absolutely necessary.

6. **SSO logout redirect**  
   - The “Sign out” shortcut currently hits `/auth/logout`. Consider passing `returnTo` pointing at the Render frontend (`https://gameplanuipro.onrender.com`) to avoid open redirects.

---

## 6. Future Feature Ideas

1. **Events & travel planning**  
   - Extend `<TeamEventsPanel>` with real filters (date range, location tags) and travel requests (rides, lodging, attachments).
   - Add a “post-event” area for photos, scores, and retrospective notes.

2. **Search index / global command palette**  
   - Replace the simple message filter with a backend search endpoint (Elastic/Lite) and add a command menu (CMD+K) to jump to channels, files, events, or admin settings.

3. **Presence & notifications**  
   - Implement presence via Socket.IO rooms, show who’s typing, and integrate the notifications route with actual unread counts.

4. **Access management**  
   - Build UI + backend endpoints for removing members, promoting/demoting roles, and revoking tokens.

5. **Audit logging**  
   - Instrument key actions (workspace deletion, invite issuance, file upload) and surface them in an admin dashboard.

6. **File retention policies**  
   - Add metadata to uploads, enforce size limits, and give admins a purging workflow.

---

## 7. Testing & Linting

- **Lint**: `npm run lint` (ESLint 9). If you see `structuredClone is not defined`, ensure your Node version is ≥20 or run the lint script via `npx` + Node 20 (Render already does this).  
- **Typecheck**: `npm run typecheck`.  
- **Unit/E2E**: tests are not wired yet—recommended stack: Vitest + Playwright.

When developing new features, verify:

1. Auth flow still redirects correctly when there is no session.
2. Creating a workspace populates channels and routes to chat.
3. File upload + preview + download link works against Render backend.
4. Event creation & RSVP flows behave the same in embedded and page variants.
5. Invite modal displays the Render frontend URL and copy buttons.
6. Search modal updates results dynamically and handles empty states gracefully.

---

## 8. Deployment Notes (Render)

Frontend service:
- Node: 20.11 (set via `NODE_VERSION` env).
- Build command: `npm ci && npm run build`.
- Start command: `npm run start`.
- Env: set `NEXT_PUBLIC_API_URL`, `API_URL`, Auth0 keys, `NEXT_PUBLIC_SITE_URL=https://gameplanuipro.onrender.com`.

Backend service (FastAPI) – summarized for devs:
- Root directory: `Backend`.
- Build: `pip install -r requirements.txt`.
- Start: `uvicorn main:app --host 0.0.0.0 --port ${PORT}` (or `main.fastapi_app` if you prefer the FastAPI instance only).
- Env: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DATABASE_URL` (optional). Make sure these point to the Render Postgres instance: `dpg-d494dhbipnbc73dr0b0g-a.ohio-postgres.render.com`.
- SSL: Postgres requires `sslmode=require`.

Deploy order:
1. Deploy backend (ensuring migrations/tables run).
2. Update frontend `.env` (or Render env) with the backend URL.
3. Deploy frontend. Verify `/protected/workspace/.../chat` loads without ECONNREFUSED errors.

---

## 9. Developer Checklist When Adding Features

1. **Plan**: capture the user story (“As a user/admin, I want…”) before coding. The app’s heartbeat is user stories → features.
2. **Update API client** (`src/lib/workspaces.ts`) or create a new client file if you add endpoints.
3. **Guard**: decide if the route belongs under `/protected` and wire it through `ProtectedLayout`.
4. **UI**: add components to `src/components/...` and lean on the existing UI kit for consistency.
5. **State & UX**: if you add modals or new header icons, keep them in `TeamChannelInterface` (or extract modules) so the chat experience remains cohesive.
6. **Env dependencies**: document new required env vars here and in Render.
7. **Docs**: update this README (and any onboarding doc) to describe new surfaces.
8. **Manual test**: run through Auth → Onboarding → Chat → Events → Files → Invite flows locally and on the Render preview.

---

## 10. Support & References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Auth0 Next.js SDK](https://auth0.github.io/nextjs-auth0/)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Postgres Quickstart](https://render.com/docs/databases)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

If you find a bug or need context on any feature, ping the GamePlan dev chat with the route/component name and the relevant user story. Building forward always starts with “What does the user need to do, and why?”—the rest of the stack is here to make that fast. Happy shipping!
