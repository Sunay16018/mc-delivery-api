import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/auth";
import type { ProductDoc, ProductInput } from "@/lib/types";

const COLLECTION = "products";

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
    return NextResponse.json({ error: "Gecersiz urun id." }, { status: 400 });
  }

  let body: Partial<ProductInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const update: Partial<ProductDoc> = { updatedAt: new Date().toISOString() };
  if (body.category !== undefined) update.category = body.category;
  if (body.name !== undefined) update.name = body.name.trim();
  if (body.price !== undefined) update.price = body.price.trim();
  if (body.color !== undefined) update.color = body.color.trim();
  if (body.perks !== undefined) update.perks = body.perks;
  if (body.featured !== undefined) update.featured = Boolean(body.featured);
  if (body.command !== undefined) update.command = body.command.trim();
  if (body.order !== undefined) update.order = body.order;

  const db = await getDb();
  const result = await db
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(params.id) }, { $set: update });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Urun bulunamadi." }, { status: 404 });
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
    return NextResponse.json({ error: "Gecersiz urun id." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(params.id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Urun bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
