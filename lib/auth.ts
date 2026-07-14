import { NextRequest } from "next/server";

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
