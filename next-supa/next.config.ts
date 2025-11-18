import type { NextConfig } from "next";

const normalizeUrl = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
};

const normalizePrefix = (value?: string | null): string => {
  const fallback = "/api/auth";
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.replace(/\/+$/, "") || fallback;
};

const resolvedSiteUrl =
  normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
  normalizeUrl(process.env.APP_BASE_URL) ||
  normalizeUrl(process.env.RENDER_EXTERNAL_URL) ||
  (process.env.VERCEL_URL ? normalizeUrl(`https://${process.env.VERCEL_URL}`) : null) ||
  "http://localhost:3000";

const authRoutePrefix = normalizePrefix(
  process.env.NEXT_PUBLIC_AUTH_ROUTE_PREFIX || process.env.AUTH_ROUTE_PREFIX || "/api/auth"
);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: resolvedSiteUrl,
    APP_BASE_URL: normalizeUrl(process.env.APP_BASE_URL) || resolvedSiteUrl,
    NEXT_PUBLIC_AUTH_ROUTE_PREFIX: authRoutePrefix,
    NEXT_PUBLIC_PROFILE_ROUTE: `${authRoutePrefix}/profile`,
  },
};

export default nextConfig;
