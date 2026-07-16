"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Ticket,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  Send,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

interface TicketDoc {
  _id: string;
  subject: string;
  category: string;
  status: "open" | "replied" | "closed";
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

export default function DestekPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("genel");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/support/tickets");
      if (res.status === 401) {
        router.push("/giris");
        return;
      }
      const data = await res.json();
      setTickets(data.tickets ?? []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ticket oluşturulamadı.");
      } else {
        setCreating(false);
        setSubject("");
        setDescription("");
        load();
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="ticket-status status-open">Açık</span>;
      case "replied":
        return <span className="ticket-status status-replied">Yanıtlandı</span>;
      case "closed":
        return <span className="ticket-status status-closed">Kapalı</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <Nav />
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-frost-500 hover:text-ice-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Ana sayfaya dön
        </Link>

        <div className="mb-10">
          <span className="section-label mb-3 inline-block">Destek</span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-2 text-frost-100">
                Destek Sistemi
              </h1>
              <p className="text-frost-500 text-base">
                Sorun bildir, yardım al ve ticket takibi yap.
              </p>
            </div>
            <button
              onClick={() => setCreating(!creating)}
              className="btn-primary text-sm py-2 px-4"
            >
              {creating ? <X size={15} /> : <Plus size={15} />}
              {creating ? "İptal" : "Yeni Ticket"}
            </button>
          </div>
        </div>

        {creating && (
          <div className="card-surface p-6 mb-8">
            <h3 className="font-semibold text-frost-200 mb-4">Yeni Ticket Oluştur</h3>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm mb-4">
                <AlertCircle size={15} /> {error}
              </div>
            )}
            <form onSubmit={createTicket} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-frost-500 text-xs font-medium mb-1.5 block">Başlık</label>
                  <input
                    className="input-field"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Kısa bir başlık girin"
                    required
                  />
                </div>
                <div>
                  <label className="text-frost-500 text-xs font-medium mb-1.5 block">Kategori</label>
                  <select
                    className="input-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="genel">Genel</option>
                    <option value="teknik">Teknik Sorun</option>
                    <option value="magaza">Mağaza / Satın Alma</option>
                    <option value="ban">Ban / Cezai İşlem</option>
                    <option value="oneri">Öneri / Şikayet</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-frost-500 text-xs font-medium mb-1.5 block">Açıklama</label>
                <textarea
                  className="input-field min-h-[120px] resize-y"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sorununuzu detaylıca açıklayın..."
                  required
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-ice-950/30 border-t-ice-950 rounded-full animate-spin" />
                    Gönderiliyor...
                  </span>
                ) : (
                  <>
                    <Send size={14} /> Ticket Oluştur
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-ice-300 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="card-surface p-12">
            <div className="empty-state">
              <HelpCircle size={40} className="text-frost-800 mb-4" />
              <span className="text-frost-600 text-base font-medium">Henüz ticket açmadın</span>
              <span className="text-frost-700 text-sm mt-1">Yukarıdaki butondan yeni ticket oluşturabilirsin.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t._id} className="ticket-row">
                <div className="w-9 h-9 rounded-xl bg-ice-300/8 flex items-center justify-center shrink-0">
                  <Ticket size={16} className="text-ice-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-frost-200 text-sm truncate">{t.subject}</span>
                    <span className="badge badge-muted text-[10px] capitalize">{t.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-frost-600 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(t.updatedAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
                {statusBadge(t.status)}
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
