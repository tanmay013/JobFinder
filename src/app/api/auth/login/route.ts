import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_COOKIE_MAX_AGE,
} from "@/features/auth/constants";
import { getAuthCredentials } from "@/features/auth/credentials";
import { getSessionSecret } from "@/features/auth/session";

interface LoginBody {
  id?: string;
  password?: string;
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const creds = getAuthCredentials();
  const sessionSecret = getSessionSecret();

  if (!creds || !sessionSecret) {
    return NextResponse.json(
      { error: "Authentication is not configured on the server" },
      { status: 500 },
    );
  }

  const id = body.id?.trim() ?? "";
  const password = body.password ?? "";

  if (id !== creds.id || password !== creds.password) {
    return NextResponse.json(
      { error: "Invalid ID or password" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(AUTH_COOKIE, sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
