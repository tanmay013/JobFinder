import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/features/auth/constants";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
