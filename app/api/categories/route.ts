import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { CategoryDoc } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const db = await getDb();
  const categories = await db
    .collection<CategoryDoc>("categories")
    .find({})
    .sort({ order: 1 })
    .toArray();

  return NextResponse.json({
    categories: categories.map((c) => ({ id: c._id?.toString(), name: c.name })),
  });
}
