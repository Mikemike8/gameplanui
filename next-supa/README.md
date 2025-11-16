# Gameplan Workspace (Next + Auth0)

Collaborative workspace/chat experience built with the App Router in Next.js 16, Auth0 for authentication, and a custom backend (exposed over `NEXT_PUBLIC_API_URL`) that manages users, workspaces, channels, and messages.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Auth**: Auth0 (`@auth0/nextjs-auth0`)
- **Realtime**: Socket.IO client for live chat updates
- **UI Kit**: Shadcn-inspired primitives (Radix UI + Tailwind utilities)
- **Data Source**: Custom REST API (`/users`, `/workspaces`, `/channels`, `/messages`, `/reactions`)

## Core Functionality

### Authentication & Session Sync

- `src/app/layout.tsx` wraps the entire application in `Auth0Provider` so client components can call `useUser()` without wiring.
- `src/lib/auth0.ts` exposes a single `Auth0Client` used on the server (`auth0.getSession()`).
- `src/app/page.tsx` is the landing/login page. Authenticated sessions immediately redirect into `/protected`.

### Protected Shell

- `src/app/protected/layout.tsx` guards every protected route: verifies Auth0 session, syncs/creates the backend user via `getOrCreateBackendUser()`, drops the serialized backend user into `localStorage`, and renders children inside `UserProvider` for client-side access.
- `src/app/protected/page.tsx` acts as the router: fetches the user’s workspaces, redirects new users into onboarding, otherwise pushes them into `/protected/workspace/[id]`.

### Workspace Onboarding & Management

- `src/app/protected/onboarding/page.tsx` renders `<WorkspaceOnboarding>` with the server-fetched backend `userId`.
- `src/components/Workspace/WorkspaceOnboarding.tsx` provides a welcome screen plus client-side toggles for “Create” and “Join” flows.
- `src/components/Workspace/CreateWorkspaceForm.tsx` calls `createWorkspace()` and redirects to the newly created workspace.
- `src/components/Workspace/JoinWorkspaceForm.tsx` posts invite codes to `/workspaces/join` and routes on success.
- `src/app/protected/workspace/[workspaceId]/settings/page.tsx` fetches workspace details (name/description/invite code) and surfaces basic read-only settings plus placeholders for “Leave/Delete”.

### Realtime Team Chat

- `src/app/protected/workspace/[workspaceId]/chat/page.tsx` validates Auth0 + backend access and renders `<TeamChannelInterface initialWorkspaceId={...} />`.
- `src/components/Dashboard/TeamChannelInterface.tsx` handles virtually all client chat UX:
  - Loads/syncs the current Auth0 user into `/users/me`.
  - Fetches available workspaces and channels, creating a default `general` channel if none exist.
  - Streams messages via HTTP + Socket.IO, implements optimistic sends, pin/unpin, emoji reactions, and pinned-message drawer.
  - Offers workspace switcher, channel creation dialog, sidebar toggling, and quick links to workspace settings.

### Additional Routes & UI

- `src/app/protected/*/page.tsx` contains future dashboard prototypes (calendar, events, files, etc.) built with the shared UI kit.
- `src/components/ui/*` contains reusable primitives (card, button, dialog, select, tabs, etc.) powering the whole interface.
- `src/context/UserContext.tsx` reads `backendUser` from `localStorage` (set by the protected layout) so client components can access roles/IDs without re-fetching.

## Project Structure

```
src/
  app/      insp            App Router entry points
    layout.tsx          Root layout (Auth0 provider)
    page.tsx            Public landing page
    protected/          Authenticated routes (onboarding, chat, settings, etc.)
  components/           Dashboard, workspace, and UI primitives
  context/              Shared React context (backend user)
  lib/                  Auth0 helper, workspace API client, utilities
```

## Getting Started

Install dependencies and run the local dev server:

```bash
npm install
npm run dev
# or: yarn dev / pnpm dev / bun dev
```

Create a `.env.local` with your Auth0 credentials and backend base URL, then visit [http://localhost:3000](http://localhost:3000). The app will redirect to `/protected` after Auth0 login and load workspaces from the API defined in `NEXT_PUBLIC_API_URL`.

## Deployment

The app is a standard Next.js App Router project, so you can deploy to Vercel or any Node runtime that supports Next 16. Ensure all required environment variables (Auth0 client domain/ID/secret plus `NEXT_PUBLIC_API_URL`) are available at build/runtime.
