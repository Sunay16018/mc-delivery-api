import { NextRequest, NextResponse } from "next/server";
import {
  isValidAdminSecret,
  createAdminSessionToken,
  ADMIN_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

// Basit bellek-ici rate limit: ayni IP art arda cok fazla yanlis denemede
// kisa sureligine kilitlenir. Serverless ortamda instance'lar arasi
// paylasilmaz ama brute-force'u zorlastirmak icin yine de faydalidir.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 dakika

function getClientKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Cok fazla basarisiz deneme. Birkac dakika sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let body: { secretKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const candidate = body.secretKey;
  if (!candidate || typeof candidate !== "string") {
    return NextResponse.json({ error: "secretKey alani zorunlu." }, { status: 400 });
  }

  if (!isValidAdminSecret(candidate)) {
    recordFailedAttempt(clientKey);
    return NextResponse.json({ error: "Anahtar hatali." }, { status: 401 });
  }

  clearAttempts(clientKey);

  const token = await createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}
