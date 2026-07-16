import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/auth";
import type { ProductDoc, ProductInput } from "@/lib/types";

const COLLECTION = "products";

function validateInput(body: Partial<ProductInput>): string | null {
  if (!body.category || !["rank", "item"].includes(body.category)) {
    return "category alani 'rank' veya 'item' olmali.";
  }
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return "name alani zorunlu.";
  }
  if (!body.price || typeof body.price !== "string") {
    return "price alani zorunlu.";
  }
  if (!body.color || typeof body.color !== "string") {
    return "color alani zorunlu.";
  }
  if (!body.command || typeof body.command !== "string") {
    return "command alani zorunlu.";
  }
  if (body.perks && !Array.isArray(body.perks)) {
    return "perks alani bir dizi olmali.";
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
  const doc: Omit<ProductDoc, "_id"> = {
    category: body.category!,
    name: body.name!.trim(),
    price: body.price!.trim(),
    color: body.color!.trim(),
    perks: body.perks ?? [],
    featured: Boolean(body.featured),
    command: body.command!.trim(),
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
