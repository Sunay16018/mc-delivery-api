import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import type { ProductDoc, PurchaseRequestDoc } from "@/lib/types";

/**
 * Magazadan bir urun satin almak icin kullanilir. Bu endpoint KREDIYI
 * ASLA DOGRUDAN GUNCELLEMEZ - sadece "purchase_requests" koleksiyonuna
 * "pending" durumunda bir kayit ekler. Kredi kontrolu, dusme ve komut
 * teslimati TAMAMEN plugin tarafindaki PurchaseProcessor'in
 * sorumlulugundadir. Bu, sitenin (potansiyel olarak ele gecirilebilecek
 * bir HTTP API'nin) DB'ye dogrudan yazarak kredi manipulasyonu
 * yapmasini zorlastirmaya yonelik bilincli bir mimari tercihtir.
 *
 * NOT: MongoDB baglanti bilgisinin (URI) kendisi ele gecirilirse bu
 * koruma asilabilir - bu, mimarinin bilinen bir sinirlamasidir.
 */
export async function POST(request: NextRequest) {
  const session = await getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Once giris yapmalisiniz." }, { status: 401 });
  }

  let body: { productId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const productId = body.productId;
  if (!productId || !ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Gecersiz urun id." }, { status: 400 });
  }

  const db = await getDb();

  // Urunun gercekten var oldugunu burada da dogruluyoruz (kullanici
  // deneyimi icin erken hata mesaji verebilelim diye); asil ve tek
  // gecerli kontrol yine de plugin tarafinda tekrar yapilacaktir.
  const product = await db.collection<ProductDoc>("products").findOne({
    _id: new ObjectId(productId),
  });
  if (!product) {
    return NextResponse.json({ error: "Urun bulunamadi." }, { status: 404 });
  }

  const doc: Omit<PurchaseRequestDoc, "_id"> = {
    username: session.username,
    productId,
    status: "pending",
    createdAt: new Date().toISOString(),
    processedAt: null,
    failReason: null,
  };

  const result = await db.collection("purchase_requests").insertOne(doc);

  return NextResponse.json(
    { ok: true, requestId: result.insertedId.toString() },
    { status: 201 }
  );
}
