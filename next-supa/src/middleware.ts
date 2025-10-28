// middleware.ts
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  // Just pass everything through
  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"],
};
