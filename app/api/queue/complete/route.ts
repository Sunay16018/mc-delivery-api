import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CompletePayload {
  completed?: string[]; // basariyla calisan komut ID'leri
  failed?: string[]; // calistirilamayan komut ID'leri (opsiyonel)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  let body: CompletePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Gecersiz JSON govdesi." },
      { status: 400 }
    );
  }

  const completedIds = Array.isArray(body.completed) ? body.completed : [];
  const failedIds = Array.isArray(body.failed) ? body.failed : [];

  if (completedIds.length === 0 && failedIds.length === 0) {
    return NextResponse.json(
      { error: "En az bir 'completed' veya 'failed' ID gerekli." },
      { status: 400 }
    );
  }

  // Gecersiz ObjectId'leri ayikla, hepsini reddetmek yerine
  // sadece gecerli olanlarla islem yap.
  const toObjectIds = (ids: string[]) =>
    ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));

  const validCompleted = toObjectIds(completedIds);
  const validFailed = toObjectIds(failedIds);

  try {
    const db = await getDb();
    const collection = db.collection("commands");

    const now = new Date();
    const results: { completedCount: number; failedCount: number } = {
      completedCount: 0,
      failedCount: 0,
    };

    if (validCompleted.length > 0) {
      const res = await collection.updateMany(
        { _id: { $in: validCompleted } },
        { $set: { status: "completed", processedAt: now } }
      );
      results.completedCount = res.modifiedCount;
    }

    if (validFailed.length > 0) {
      const res = await collection.updateMany(
        { _id: { $in: validFailed } },
        { $set: { status: "failed", processedAt: now } }
      );
      results.failedCount = res.modifiedCount;
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("POST /api/queue/complete hata:", error);
    return NextResponse.json(
      { error: "Sunucu hatasi. Daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }
}
