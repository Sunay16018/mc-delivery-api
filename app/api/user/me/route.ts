import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import type { UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Giris yapmis kullanicinin session bilgisini ve DB'deki GUNCEL kredi
 * bakiyesini dondurur. Magaza sayfasi, satin alma sonrasi bakiyenin
 * guncellenip guncellenmedigini kontrol etmek icin bu endpoint'i
 * polling ile cagirabilir.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) {
    return NextResponse.json({ loggedIn: false }, { status: 200 });
    }

    const db = await getDb();
    const user = await db
    .collection<UserDoc>("users")
    .findOne({ username_lower: session.usernameLower });

    if (!user) {
    // Hesap oyun icinden silinmis olabilir; oturumu artik gecersiz sayalim.
    return NextResponse.json({ loggedIn: false }, { status: 200 });
    }

    return NextResponse.json({
    loggedIn: true,
    username: user.username,
    credits: user.credits,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
