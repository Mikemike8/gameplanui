# GamePlan Frontend – Local & Deploy QuickStart

Follow these steps to run the GamePlan Next.js app locally and deploy it yourself.

## 1. Prerequisites
- Node.js 20.x
- npm (or pnpm/yarn) installed
- Access to the FastAPI backend (either local 127.0.0.1:8000 or the Render backend https://ggameplan-backend.onrender.com)
- Auth0 tenant/credentials (client ID/secret, domain)

## 2. Clone and install
```bash
git clone https://github.com/Mikemike8/gameplanui.git
cd gameplanui/next-supa
npm install
```

## 3. Environment variables
Create `.env.local` in `next-supa` with:
```
AUTH0_SECRET=...
AUTH0_DOMAIN=YOUR-TENANT.us.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
API_URL=http://127.0.0.1:8000
# NEXT_PUBLIC_SITE_URL / APP_BASE_URL fall back to http://localhost:3000 locally
# and Render's external URL in production. Uncomment to override explicitly.
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# APP_BASE_URL=http://localhost:3000
# Auth routes default to /api/auth. Uncomment if you need to switch to /auth/*
# NEXT_PUBLIC_AUTH_ROUTE_PREFIX=/auth
# AUTH_ROUTE_PREFIX=/auth
```
Adjust `NEXT_PUBLIC_API_URL`/`API_URL` to the Render backend when testing against prod data.

## 4. Run locally
```bash
npm run dev
```
Visit http://localhost:3000, log in via Auth0, and you’ll land in `/protected`. Make sure the Auth0
application allows `http://localhost:3000/api/auth/callback` (plus your production equivalent).

## 5. Deploying the frontend
If you want your own deployment (Vercel, Render, etc.):
1. Ensure the Auth0 application has callback/logout URLs for your domain
   (e.g., `http://localhost:3000/api/auth/callback`, `https://<your-domain>/api/auth/callback`).
2. Set the same environment variables in the hosting platform (especially `NEXT_PUBLIC_API_URL` and any overrides for `NEXT_PUBLIC_SITE_URL`/`APP_BASE_URL` if you use a custom domain).
3. Build/start commands:
   ```bash
   npm run build
   npm run start
   ```

## 6. Backend coordination
- The frontend assumes the backend exposes `/users`, `/workspaces`, `/channels`, `/messages`, `/files/upload`, `/reactions`.
- If you want your own backend, deploy the FastAPI service in the `Backend/` folder (Render instructions in the main README) and set the frontend’s API env vars to that URL.

## 7. Common gotchas
- **Duplicate messages**: already fixed; make sure you’re on the latest commit.
- **Workspace settings scroll**: global CSS now allows scrolling.
- **Invite links**: they rely on the resolved site URL during SSR. It now defaults to Render’s hostname (or `http://localhost:3000` in dev), but override `NEXT_PUBLIC_SITE_URL` if you need a custom domain.
- **Render cold start**: backend sleeps when idle, so first request might take a few seconds.

That’s it! Reach out in the dev Slack if you hit issues.
