import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = [
  "/watchlist",
  "/lists/new",
  "/journal",
  "/diary",
  "/profile",
  "/activity",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!requiresAuth) return NextResponse.next();

  const hasSession = Boolean(request.cookies.get("lbxd_et_session")?.value);
  if (hasSession) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/watchlist/:path*",
    "/lists/new/:path*",
    "/journal/:path*",
    "/diary/:path*",
    "/profile/:path*",
    "/activity/:path*",
    "/settings/:path*",
  ],
};
