import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_COOKIE_MAX_AGE,
} from "@/features/auth/constants";
import { computeAuthToken, getAuthCredentials } from "@/features/auth/token";

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

  const id = body.id?.trim() ?? "";
  const password = body.password ?? "";
  const creds = getAuthCredentials();

  if (id !== creds.id || password !== creds.password) {
    return NextResponse.json(
      { error: "Invalid ID or password" },
      { status: 401 },
    );
  }

  const token = await computeAuthToken(creds.id, creds.password);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
