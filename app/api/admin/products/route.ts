import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/auth";
import type { ProductDoc, ProductInput } from "@/lib/types";

const COLLECTION = "products";

// Base64 gorsel boyutu icin makul bir ust sinir (yaklasik 3MB ham veri).
// MongoDB dokuman limiti 16MB oldugu icin bunun epey altinda tutuyoruz.
const MAX_IMAGE_BASE64_LENGTH = 4_000_000;

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

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const db = await getDb();
  const products = await db
    .collection<ProductDoc>(COLLECTION)
    .find({})
    .sort({ category: 1, order: 1 })
    .toArray();

  return NextResponse.json({
    products: products.map((p) => ({ ...p, _id: p._id?.toString() })),
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
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

  const now = new Date().toISOString();
  const commands = body.commands!.map((c) => c.trim());

  const doc: Omit<ProductDoc, "_id"> = {
    category: body.category!,
    categoryId: body.categoryId ?? undefined,
    name: body.name!.trim(),
    // "price" (gosterim metni) artik "priceCredits + kredi" seklinde
    // otomatik uretilir; admin panelinde ayrica girilmesine gerek yok,
    // ama eski entegrasyonlarla uyumluluk icin alan hala dolduruluyor.
    price: `${body.priceCredits} kredi`,
    priceCredits: body.priceCredits!,
    color: body.color!.trim(),
    perks: body.perks ?? [],
    featured: Boolean(body.featured),
    // Geriye donuk uyumluluk icin ilk komutu "command" alanina da yaziyoruz.
    command: commands[0],
    commands,
    imageBase64: body.imageBase64 ?? null,
    description: body.description?.trim() ?? "",
    order: typeof body.order === "number" ? body.order : 0,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  const result = await db.collection(COLLECTION).insertOne(doc);

  return NextResponse.json(
    { ok: true, id: result.insertedId.toString() },
    { status: 201 }
  );
}
