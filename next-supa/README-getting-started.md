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
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR-TENANT.us.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Adjust `NEXT_PUBLIC_API_URL`/`API_URL` to the Render backend when testing against prod data.

## 4. Run locally
```bash
npm run dev
```
Visit http://localhost:3000, log in via Auth0, and you’ll land in `/protected`.

## 5. Deploying the frontend
If you want your own deployment (Vercel, Render, etc.):
1. Ensure the Auth0 application has callback/logout URLs for your domain.
2. Set the same environment variables in the hosting platform (especially `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`).
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
- **Invite links**: they rely on `NEXT_PUBLIC_SITE_URL` during SSR; set it to your public domain before deploying.
- **Render cold start**: backend sleeps when idle, so first request might take a few seconds.

That’s it! Reach out in the dev Slack if you hit issues.
