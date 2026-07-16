import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/auth";
import type { CreditRequestDoc } from "@/lib/types";

/**
 * Admin panelinden bir oyuncuya manuel kredi ekleme/cikarma/setleme
 * istegi olusturur. Web sitesi burada da krediyi DOGRUDAN GUNCELLEMEZ;
 * "credit_requests" koleksiyonuna "pending" bir kayit dusurur, gercek
 * guncelleme plugin tarafindaki PurchaseProcessor tarafindan yapilir.
 * Boylece TUM kredi islemleri (magaza satin alimlari da dahil) ayni,
 * tutarli kuyruk mekanizmasindan gecer.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  let body: { username?: string; action?: string; amount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  const action = body.action;
  const amount = body.amount;

  if (!username) {
    return NextResponse.json({ error: "username alani zorunlu." }, { status: 400 });
  }
  if (action !== "add" && action !== "subtract" && action !== "set") {
    return NextResponse.json(
      { error: "action alani 'add', 'subtract' veya 'set' olmali." },
      { status: 400 }
    );
  }
  if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: "amount alani 0 veya daha buyuk bir sayi olmali." }, { status: 400 });
  }

  const db = await getDb();

  // Hedef oyuncunun gercekten var olup olmadigini erken kontrol edelim
  // (kullanici deneyimi icin); nihai kontrol yine plugin tarafinda yapilir.
  const usernameLower = username.toLowerCase();
  const targetUser = await db.collection("users").findOne({ username_lower: usernameLower });
  if (!targetUser) {
    return NextResponse.json({ error: "Bu kullanici adiyla kayitli bir oyuncu bulunamadi." }, { status: 404 });
  }

  const doc: Omit<CreditRequestDoc, "_id"> = {
    username: targetUser.username,
    action,
    amount,
    status: "pending",
    createdAt: new Date().toISOString(),
    processedAt: null,
  };

  const result = await db.collection("credit_requests").insertOne(doc);

  return NextResponse.json(
    { ok: true, requestId: result.insertedId.toString() },
    { status: 201 }
  );
}
