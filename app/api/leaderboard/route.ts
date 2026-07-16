import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Herkese acik siralama (leaderboard) listesini dondurur. "/api/admin/users"
 * ile karistirilmamali: bu endpoint kimlik dogrulama GEREKTIRMEZ, sadece
 * vitrin icin gereken (kullanici adi + kredi) alanlarini dondurur; sifre
 * hash'i ve IP adresi gibi hassas alanlar asla sizdirilmaz.
 */
export async function GET() {
  try {
    const db = await getDb();
    const users = await db
      .collection<UserDoc>("users")
      .find({}, { projection: { username: 1, credits: 1 } })
      .sort({ credits: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      users: users.map((u) => ({
        username: u.username,
        credits: u.credits,
      })),
    });
  } catch (error) {
    console.error("GET /api/leaderboard hata:", error);
    return NextResponse.json({ users: [], error: "Siralama yuklenemedi." }, { status: 500 });
  }
}
