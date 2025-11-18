// src/lib/auth-routes.ts

type RouteKey =
  | "login"
  | "logout"
  | "callback"
  | "profile"
  | "accessToken"
  | "backChannelLogout"
  | "connectAccount";

const normalizePrefix = (value?: string | null): string => {
  const fallback = "/api/auth";
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, "") || fallback;
};

const AUTH_ROUTE_PREFIX = normalizePrefix(
  process.env.NEXT_PUBLIC_AUTH_ROUTE_PREFIX || process.env.AUTH_ROUTE_PREFIX || "/api/auth"
);

const buildRoute = (suffix: string) => `${AUTH_ROUTE_PREFIX}${suffix}`;

export const AUTH_ROUTES: Record<RouteKey, string> = {
  login: buildRoute("/login"),
  logout: buildRoute("/logout"),
  callback: buildRoute("/callback"),
  profile: buildRoute("/profile"),
  accessToken: buildRoute("/access-token"),
  backChannelLogout: buildRoute("/backchannel-logout"),
  connectAccount: buildRoute("/connect"),
};

type Query = Record<string, string | number | undefined | null | false>;

export const buildAuthRoute = (key: RouteKey, query?: Query): string => {
  const base = AUTH_ROUTES[key];
  if (!query) return base;
  const params = new URLSearchParams();

  Object.entries(query).forEach(([k, v]) => {
    if (v || v === 0) {
      params.append(k, String(v));
    }
  });

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
};

export type AuthRouteKey = RouteKey;
