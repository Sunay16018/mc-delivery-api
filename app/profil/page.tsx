"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Coins,
  ShoppingBag,
  CreditCard,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Loader2,
  Ticket,
  Clock,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; credits: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.loggedIn) {
          router.push("/giris");
        } else {
          setUser({ username: d.username, credits: d.credits });
        }
      })
      .catch(() => router.push("/giris"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/user/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={28} className="text-ice-300 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Nav />
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-frost-500 hover:text-ice-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Ana sayfaya dön
        </Link>

        {/* Profile Header */}
        <div className="card-surface p-6 mb-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-ice-300/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ice-300 to-ice-500 flex items-center justify-center shadow-glow">
              <User size={28} className="text-ice-950" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-frost-100">{user.username}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Coins size={14} className="text-ice-300" />
                <span className="font-mono text-ice-300 font-bold">{user.credits}</span>
                <span className="text-frost-500 text-sm">kredi</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto btn-ghost flex items-center gap-2 text-frost-500 hover:text-red-400"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Store History */}
          <div className="card-surface p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ice-300/8 flex items-center justify-center">
                <ShoppingBag size={18} className="text-ice-300" />
              </div>
              <div>
                <h3 className="font-semibold text-frost-200 text-sm">Mağaza Geçmişi</h3>
                <span className="text-frost-600 text-xs">Son satın alımların</span>
              </div>
            </div>
            <div className="empty-state py-8">
              <ShoppingBag size={24} className="text-frost-800 mb-2" />
              <span className="text-frost-600 text-xs">Henüz satın alma yok</span>
            </div>
          </div>

          {/* Credit History */}
          <div className="card-surface p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ice-300/8 flex items-center justify-center">
                <CreditCard size={18} className="text-ice-300" />
              </div>
              <div>
                <h3 className="font-semibold text-frost-200 text-sm">Kredi Geçmişi</h3>
                <span className="text-frost-600 text-xs">Kredi işlemlerin</span>
              </div>
            </div>
            <div className="empty-state py-8">
              <CreditCard size={24} className="text-frost-800 mb-2" />
              <span className="text-frost-600 text-xs">Henüz işlem yok</span>
            </div>
          </div>

          {/* Support Tickets */}
          <div className="card-surface p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ice-300/8 flex items-center justify-center">
                <Ticket size={18} className="text-ice-300" />
              </div>
              <div>
                <h3 className="font-semibold text-frost-200 text-sm">Destek Ticketlarım</h3>
                <span className="text-frost-600 text-xs">Açtığın ticketlar</span>
              </div>
            </div>
            <div className="empty-state py-8">
              <HelpCircle size={24} className="text-frost-800 mb-2" />
              <span className="text-frost-600 text-xs">Henüz ticket açmadın</span>
            </div>
            <Link
              href="/destek"
              className="mt-4 w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <HelpCircle size={12} /> Destek Al
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
