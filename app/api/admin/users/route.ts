import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/auth";
import type { UserDoc } from "@/lib/types";

/**
 * Kayitli oyuncularin listesini dondurur (sifre hash'i HARIC). Admin
 * panelindeki "Kullanicilar" sekmesi bunu kullanir. Basit bir arama
 * parametresi de destekler: /api/admin/users?q=oyuncuadi
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();

  try {
    const db = await getDb();
    const filter = query
      ? { username_lower: { $regex: query.toLowerCase(), $options: "i" } }
      : {};

    const users = await db
      .collection<UserDoc>("users")
      .find(filter, { projection: { password: 0 } })
      .sort({ registerDate: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({
      users: users.map((u) => ({
        _id: u._id?.toString(),
        username: u.username,
        credits: u.credits,
        registerDate: u.registerDate,
        ipAddress: u.ipAddress,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/users hata:", error);
    return NextResponse.json({ users: [], error: "Kullanicilar yuklenemedi." }, { status: 500 });
  }
}
