// middleware.ts

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
  request,
  });

 const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 getAll() {
 return request.cookies.getAll();
},
  setAll(cookiesToSet) {
 cookiesToSet.forEach(({ name, value, options }) => {
                
                // ✅ FIX 1: Use the object syntax for request.cookies.set()
                // This correctly bundles name, value, and options.
 request.cookies.set({ name, value, ...options }); 
                
                // ✅ FIX 2: Use the object syntax for response.cookies.set()
 response.cookies.set({ name, value, ...options }); 
});
 },
 },
  }
  );

    // ... (rest of your middleware logic remains the same) ...

  // Get user session
 const {
  data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - require authentication
  if (request.nextUrl.pathname.startsWith("/protected") && !user) {
  // Not logged in, redirect to sign-in
   const redirectUrl = new URL("/sign-in", request.url);
  redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

   // Auth routes - redirect to dashboard if already logged in
 if (user && (request.nextUrl.pathname.startsWith("/sign-in") || request.nextUrl.pathname.startsWith("/sign-up"))) {
 return NextResponse.redirect(new URL("/protected", request.url));
 }

 return response;
}

export const config = {
 matcher: [
 "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
 ],
};