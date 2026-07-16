import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/auth";
import type { CategoryDoc, CategoryInput } from "@/lib/types";

const COLLECTION = "categories";

function validateInput(body: Partial<CategoryInput>): string | null {
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return "name alani zorunlu.";
  }
  return null;
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const db = await getDb();
  const categories = await db
    .collection<CategoryDoc>(COLLECTION)
    .find({})
    .sort({ order: 1 })
    .toArray();

  return NextResponse.json({
    categories: categories.map((c) => ({ ...c, _id: c._id?.toString() })),
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  let body: Partial<CategoryInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz istek govdesi." }, { status: 400 });
  }

  const validationError = validateInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const doc: Omit<CategoryDoc, "_id"> = {
    name: body.name!.trim(),
    order: typeof body.order === "number" ? body.order : 0,
    createdAt: new Date().toISOString(),
  };

  const db = await getDb();
  const result = await db.collection(COLLECTION).insertOne(doc);

  return NextResponse.json(
    { ok: true, id: result.insertedId.toString() },
    { status: 201 }
  );
}
