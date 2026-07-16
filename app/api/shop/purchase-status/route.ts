import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import type { PurchaseRequestDoc } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Bir satin alma isteginin guncel durumunu sorgular. Mağaza sayfasi,
 * "isteginiz alindi" mesajindan sonra bu endpoint'i birkac saniyede
 * bir cagirarak durumun "completed"/"failed" olup olmadigini kontrol
 * edebilir.
 */
export async function GET(request: NextRequest) {
  const session = await getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Once giris yapmalisiniz." }, { status: 401 });
  }

  const requestId = request.nextUrl.searchParams.get("requestId");
  if (!requestId || !ObjectId.isValid(requestId)) {
    return NextResponse.json({ error: "Gecersiz istek id." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const purchaseRequest = await db
      .collection<PurchaseRequestDoc>("purchase_requests")
      .findOne({ _id: new ObjectId(requestId) });

    if (!purchaseRequest) {
      return NextResponse.json({ error: "Istek bulunamadi." }, { status: 404 });
    }

    // Kullanicinin sadece kendi istegini sorgulayabilmesini garanti ediyoruz.
    if (purchaseRequest.username.toLowerCase() !== session.usernameLower) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    return NextResponse.json({
      status: purchaseRequest.status,
      failReason: purchaseRequest.failReason,
    });
  } catch (error) {
    console.error("GET /api/shop/purchase-status hata:", error);
    return NextResponse.json({ error: "Sunucu hatasi." }, { status: 500 });
  }
}
