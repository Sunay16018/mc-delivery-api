import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Önce giriş yapmalısınız." }, { status: 401 });
  }
  try {
    const db = await getDb();
    const tickets = await db.collection("support_tickets")
      .find({ username: session.username })
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json({
      tickets: tickets.map((t) => ({
        _id: t._id.toString(),
        subject: t.subject,
        category: t.category,
        status: t.status,
        createdAt: t.createdAt?.toISOString?.() ?? t.createdAt,
        updatedAt: t.updatedAt?.toISOString?.() ?? t.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/support/tickets hata:", error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getUserFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Önce giriş yapmalısınız." }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }
  const subject = (body.subject ?? "").trim();
  const category = (body.category ?? "genel").trim();
  const description = (body.description ?? "").trim();
  if (!subject || subject.length < 3) {
    return NextResponse.json({ error: "Başlık en az 3 karakter olmalı." }, { status: 400 });
  }
  if (!description || description.length < 10) {
    return NextResponse.json({ error: "Açıklama en az 10 karakter olmalı." }, { status: 400 });
  }
  try {
    const db = await getDb();
    const now = new Date();
    const doc = {
      username: session.username,
      subject,
      category,
      messages: [{ sender: session.username, text: description, createdAt: now }],
      status: "open",
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("support_tickets").insertOne(doc);
    return NextResponse.json({ ok: true, ticketId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error("POST /api/support/tickets hata:", error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
