import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/auth";
import type { CategoryDoc, CategoryInput } from "@/lib/types";

const COLLECTION = "categories";

function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Gecersiz kategori id." }, { status: 400 });
  }

  let body: Partial<CategoryInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const update: Partial<CategoryDoc> = {};
  if (body.name !== undefined) update.name = body.name.trim();
  if (body.order !== undefined) update.order = body.order;

  const db = await getDb();
  const result = await db
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(params.id) }, { $set: update });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Kategori bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Gecersiz kategori id." }, { status: 400 });
  }

  const db = await getDb();

  // Bu kategoriyi kullanan urunler varsa silmeden once uyaralim (sert
  // engelleme yerine, admin'in bilinçli sekilde silmesine izin veriyoruz;
  // urunler kategorisiz kalir, mağaza sayfasi bunu "diger" olarak gosterir).
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(params.id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Kategori bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
