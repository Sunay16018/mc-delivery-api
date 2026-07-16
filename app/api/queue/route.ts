import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAuthorized } from "@/lib/auth";


export const runtime = "nodejs"; // MongoDB driver Edge runtime'da calismaz
export const dynamic = "force-dynamic"; // Bu route asla cache'lenmemeli

const DEFAULT_BATCH_SIZE = 50;
const MAX_BATCH_SIZE = 200;

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  try {
    const db = await getDb();
    const collection = db.collection("commands");

    const url = new URL(request.url);
    const limitParam = parseInt(url.searchParams.get("limit") ?? "", 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, MAX_BATCH_SIZE)
      : DEFAULT_BATCH_SIZE;

    // Once en eski "pending" kayitlarin ID'lerini buluyoruz.
    const pendingDocs = await collection
      .find({ status: "pending" })
      .sort({ createdAt: 1 })
      .limit(limit)
      .toArray();

    if (pendingDocs.length === 0) {
      return NextResponse.json({ commands: [] });
    }

    const ids = pendingDocs.map((doc) => doc._id);

    // Race condition onlemi: cektigimiz kayitlari hemen "processing" yapiyoruz.
    // Boylece ayni komut iki farkli plugin dongusunde tekrar cekilemez.
    // updateMany atomic degildir ama status filtresiyle birlikte kullanildiginda
    // ayni anda gelen iki istek arasinda cakismayi buyuk olcude engeller.
    await collection.updateMany(
      { _id: { $in: ids }, status: "pending" },
      { $set: { status: "processing" } }
    );

    const commands = pendingDocs.map((doc) => ({
      id: doc._id.toString(),
      username: doc.username,
      command: doc.command,
    }));

    return NextResponse.json({ commands });
  } catch (error) {
    console.error("GET /api/queue hata:", error);
    return NextResponse.json(
      { error: "Sunucu hatasi. Daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }
}
