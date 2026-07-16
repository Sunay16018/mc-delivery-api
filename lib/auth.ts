import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "zc_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 saat

const USER_COOKIE_NAME = "zc_user_session";
const USER_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 gun

function getSessionSecret(): Uint8Array {
  // Session imzalama icin SECRET_KEY'i temel alan ayri bir anahtar turetiyoruz
  // (SECRET_KEY'in kendisini JWT secret olarak dogrudan kullanmak yerine).
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error("SECRET_KEY ortam degiskeni tanimli degil.");
  }
  return new TextEncoder().encode(`zefircraft-admin-session:${secret}`);
}

/**
 * Kullanici (oyuncu) session'lari icin admin'den TAMAMEN AYRI bir anahtar
 * turetiyoruz. Boylece kullanici cookie'si asla admin paneline erisim
 * saglayamaz ve tam tersi de gecerlidir.
 */
function getUserSessionSecret(): Uint8Array {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error("SECRET_KEY ortam degiskeni tanimli degil.");
  }
  return new TextEncoder().encode(`zefircraft-user-session:${secret}`);
}

/**
 * Admin girisinde girilen anahtari SECRET_KEY ile sabit-zamanli karsilastirir.
 */
export function isValidAdminSecret(candidate: string): boolean {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    console.error("SECRET_KEY ortam degiskeni tanimli degil.");
    return false;
  }
  return timingSafeEqual(candidate, secret);
}

/**
 * Basarili girişten sonra imzali bir oturum JWT'si uretir.
 */
export async function createAdminSessionToken(): Promise<string> {
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());
}

/**
 * Cookie'deki oturum token'ini dogrular. Gecerliyse true doner.
 */
export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Bir NextRequest icindeki admin oturum cookie'sini dogrular.
 */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export { ADMIN_COOKIE_NAME, SESSION_DURATION_SECONDS };

// ---------------------------------------------------------------------------
// Kullanici (oyuncu) oturumlari - mağaza girisi icin. Kayit SADECE oyun
// icinden yapilir; bu sistem sadece giris dogrulama ve session yonetimi
// icindir.
// ---------------------------------------------------------------------------

export interface UserSessionPayload {
  role: "user";
  username: string; // orijinal (case-sensitive gorunum) kullanici adi
  usernameLower: string;
}

export async function createUserSessionToken(username: string, usernameLower: string): Promise<string> {
  return await new SignJWT({ role: "user", username, usernameLower } satisfies UserSessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${USER_SESSION_DURATION_SECONDS}s`)
    .sign(getUserSessionSecret());
}

/**
 * Cookie'deki kullanici oturum token'ini dogrular. Gecerliyse payload'i,
 * degilse null doner.
 */
export async function verifyUserSessionToken(
  token: string | undefined
): Promise<UserSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getUserSessionSecret());
    if (payload.role !== "user" || typeof payload.username !== "string" || typeof payload.usernameLower !== "string") {
      return null;
    }
    return {
      role: "user",
      username: payload.username,
      usernameLower: payload.usernameLower,
    };
  } catch {
    return null;
  }
}

/**
 * Bir NextRequest icindeki kullanici oturum cookie'sini dogrular ve
 * gecerliyse payload'i (kullanici adi bilgisi) doner.
 */
export async function getUserFromRequest(request: NextRequest): Promise<UserSessionPayload | null> {
  const token = request.cookies.get(USER_COOKIE_NAME)?.value;
  return verifyUserSessionToken(token);
}

export { USER_COOKIE_NAME, USER_SESSION_DURATION_SECONDS };

/**
 * Gelen istegin "Authorization: Bearer <SECRET_KEY>" header'ini dogrular.
 * Basariliysa true, degilse false doner. SECRET_KEY sadece env'den okunur,
 * asla koda gomulmez.
 */
export function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    // Env eksikse guvenlik acigi olusmasin diye her istegi reddediyoruz.
    console.error("SECRET_KEY ortam degiskeni tanimli degil.");
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  // Basit string karsilastirmasi yerine timing-attack'e karsi sabit-zamanli
  // karsilastirma yapiyoruz.
  return timingSafeEqual(token, secret);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export interface CommandDoc {
  _id: string;
  username: string;
  command: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  processedAt?: Date;
}
