import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { getSessionSecret } from "@/features/auth/session";

const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const expected = getSessionSecret();
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthenticated = Boolean(expected) && Boolean(token) && token === expected;
  const onPublicPath = isPublicPath(pathname);

  if (!isAuthenticated && !onPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname && pathname !== "/" ? `?from=${encodeURIComponent(pathname)}` : "";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && onPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|txt|json)$).*)",
  ],
};
