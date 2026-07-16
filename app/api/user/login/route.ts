import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { createUserSessionToken, USER_COOKIE_NAME, USER_SESSION_DURATION_SECONDS } from "@/lib/auth";
import type { UserDoc } from "@/lib/types";

// Admin login'deki ile ayni basit bellek-ici rate limit deseni: ayni IP
// art arda cok fazla yanlis denemede kisa sureligine kilitlenir.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
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
  if (!entry || now > entry.resetAt) return false;
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

/**
 * Oyuncu girisi. Kayit BURADA YAPILMAZ - sadece oyun icinden (/kayitol ile)
 * zaten olusturulmus bir hesapla giris yapilabilir. Sifre, plugin
 * tarafinda jBCrypt ile hashlenmis olarak "users" koleksiyonunda saklanir;
 * burada bcryptjs ile karsilastiriyoruz (bcrypt hash formati standart
 * oldugu icin iki kutuphane birbirinin uzerinde calisabilir).
 */
export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Çok fazla başarısız deneme. Birkaç dakika sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Kullanici adi ve sifre zorunlu." }, { status: 400 });
  }

  const db = await getDb();
  const usernameLower = username.toLowerCase();
  const user = await db.collection<UserDoc>("users").findOne({ username_lower: usernameLower });

  if (!user) {
    // "Kullanici bulunamadi" ile "sifre yanlis" mesajlarini ayni tutuyoruz
    // ki hesap varligini test edebilecek bir kullanici enumeration'i
    // engellenmis olsun.
    recordFailedAttempt(clientKey);
    return NextResponse.json({ error: "Kullanici adi veya sifre hatali." }, { status: 401 });
  }

  let passwordOk = false;
  try {
    passwordOk = await bcrypt.compare(password, user.password);
  } catch {
    passwordOk = false;
  }

  if (!passwordOk) {
    recordFailedAttempt(clientKey);
    return NextResponse.json({ error: "Kullanici adi veya sifre hatali." }, { status: 401 });
  }

  clearAttempts(clientKey);

  const token = await createUserSessionToken(user.username, usernameLower);

  const response = NextResponse.json({
    ok: true,
    username: user.username,
    credits: user.credits,
  });
  response.cookies.set(USER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: USER_SESSION_DURATION_SECONDS,
  });
  return response;
}
