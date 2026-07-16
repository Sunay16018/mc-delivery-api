import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { ProductDoc } from "@/lib/types";

const COLLECTION = "products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const db = await getDb();
  const products = await db
    .collection<ProductDoc>(COLLECTION)
    .find({})
    .sort({ category: 1, order: 1 })
    .toArray();

  // Admin'e ozel alanlari (command sablonu gibi) disariya sizdirmiyoruz;
  // sadece vitrin icin gereken alanlari donduruyoruz.
  const publicProducts = products.map((p) => ({
    id: p._id?.toString(),
    category: p.category,
    name: p.name,
    price: p.price,
    color: p.color,
    perks: p.perks,
    featured: p.featured,
  }));

  return NextResponse.json({ products: publicProducts });
}
