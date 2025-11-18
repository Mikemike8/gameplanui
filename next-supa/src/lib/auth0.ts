// src/lib/auth0.ts
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { AUTH_ROUTES } from "./auth-routes";

const normalizeUrl = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const normalized = hasProtocol ? trimmed : `https://${trimmed}`;
  return normalized.replace(/\/+$/, "");
};

const resolveAppBaseUrl = (): string => {
  const explicit =
    normalizeUrl(process.env.APP_BASE_URL) ||
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL);

  const platform =
    normalizeUrl(process.env.RENDER_EXTERNAL_URL) ||
    (process.env.VERCEL_URL ? normalizeUrl(`https://${process.env.VERCEL_URL}`) : null);

  return explicit || platform || "http://localhost:3000";
};

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing ${key}. Provide it in your environment or .env.local so Auth0 can initialize.`
    );
  }
  return value;
};

const appBaseUrl = resolveAppBaseUrl();

if (!process.env.APP_BASE_URL) {
  process.env.APP_BASE_URL = appBaseUrl;
}

export const auth0 = new Auth0Client({
  appBaseUrl,
  domain: requiredEnv("AUTH0_DOMAIN"),
  clientId: requiredEnv("AUTH0_CLIENT_ID"),
  clientSecret: requiredEnv("AUTH0_CLIENT_SECRET"),
  secret: requiredEnv("AUTH0_SECRET"),
  routes: AUTH_ROUTES,
});
