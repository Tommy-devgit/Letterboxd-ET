import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
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
