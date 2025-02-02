import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = 'edge';

// Define public and protected paths
const PUBLIC_PATHS = new Set(['/', '/login', '/register']);
const IGNORED_PATHS = ['/_next', '/static', '/image', '/favicon.ico', '/api'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for ignored paths
  if (IGNORED_PATHS.some((path: string) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("__session");
  const hasSession = !!sessionCookie?.value;

  // Handle public paths
  if (PUBLIC_PATHS.has(pathname)) {
    return hasSession 
      ? NextResponse.redirect(new URL("/scenarios", request.url))
      : NextResponse.next();
  }

  // Handle protected paths
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Ensure session cookie is cleared
    response.cookies.delete("__session");
    return response;
  }

  // Verify session is still valid
  try {
    const response = NextResponse.next();
    if (!sessionCookie?.value) {
      response.cookies.delete("__session");
    }
    return response;
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("__session");
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
