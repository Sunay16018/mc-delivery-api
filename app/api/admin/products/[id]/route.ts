import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/auth";
import type { ProductDoc, ProductInput } from "@/lib/types";

const COLLECTION = "products";

// Base64 gorsel boyutu icin makul bir ust sinir (yaklasik 3MB ham veri).
// MongoDB dokuman limiti 16MB oldugu icin bunun epey altinda tutuyoruz.
const MAX_IMAGE_BASE64_LENGTH = 4_000_000;

function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

function validateInput(body: Partial<ProductInput>): string | null {
  if (!body.category || !["rank", "item"].includes(body.category)) {
    return "category alani 'rank' veya 'item' olmali.";
  }
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return "name alani zorunlu.";
  }
  if (!body.color || typeof body.color !== "string") {
    return "color alani zorunlu.";
  }
  if (
    body.priceCredits === undefined ||
    typeof body.priceCredits !== "number" ||
    Number.isNaN(body.priceCredits) ||
    body.priceCredits < 0
  ) {
    return "priceCredits alani 0 veya daha buyuk bir sayi olmali.";
  }
  if (!body.commands || !Array.isArray(body.commands) || body.commands.length === 0) {
    return "commands alani en az bir komut icermeli.";
  }
  if (body.commands.some((c) => typeof c !== "string" || c.trim().length === 0)) {
    return "commands dizisindeki her komut bos olmayan bir metin olmali.";
  }
  if (body.perks && !Array.isArray(body.perks)) {
    return "perks alani bir dizi olmali.";
  }
  if (body.imageBase64 && body.imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    return "Görsel çok büyük. Lütfen daha küçük bir görsel yükleyin.";
  }
  return null;
}

/**
 * Var olan bir urunu gunceller. Admin panelindeki "ProductsTab" bileseni
 * duzenleme kaydederken bu endpoint'i cagirir.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Gecersiz urun id." }, { status: 400 });
  }

  let body: Partial<ProductInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const validationError = validateInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const commands = body.commands!.map((c) => c.trim());

  const update: Partial<ProductDoc> = {
    category: body.category!,
    categoryId: body.categoryId ?? undefined,
    name: body.name!.trim(),
    price: `${body.priceCredits} kredi`,
    priceCredits: body.priceCredits!,
    color: body.color!.trim(),
    perks: body.perks ?? [],
    featured: Boolean(body.featured),
    command: commands[0],
    commands,
    imageBase64: body.imageBase64 ?? null,
    description: body.description?.trim() ?? "",
    order: typeof body.order === "number" ? body.order : 0,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    const result = await db
      .collection(COLLECTION)
      .updateOne({ _id: new ObjectId(params.id) }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Urun bulunamadi." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/admin/products/[id] hata:", error);
    return NextResponse.json({ error: "Sunucu hatasi." }, { status: 500 });
  }
}

/**
 * Bir urunu siler. Admin panelindeki "ProductsTab" bileseni silme
 * butonuna basildiginda bu endpoint'i cagirir.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Gecersiz urun id." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Urun bulunamadi." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] hata:", error);
    return NextResponse.json({ error: "Sunucu hatasi." }, { status: 500 });
  }
}
