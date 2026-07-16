"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, ArrowUpDown, Loader2 } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

interface LeaderboardEntry {
  username: string;
  credits: number;
  rank?: string;
}

export default function SiralamaPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"credits" | "username">("credits");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        const users = (d.users ?? []).map((u: { username: string; credits?: number }) => ({
          username: u.username,
          credits: u.credits ?? 0,
        }));
        users.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.credits - a.credits);
        setData(users);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...data].sort((a, b) => {
    if (sortBy === "credits") return b.credits - a.credits;
    return a.username.localeCompare(b.username);
  });

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown size={18} className="text-amber-400" />;
    if (i === 1) return <Medal size={18} className="text-frost-400" />;
    if (i === 2) return <Medal size={18} className="text-amber-700" />;
    return <span className="text-frost-600 font-mono text-xs w-[18px] text-center">{i + 1}</span>;
  };

  return (
    <>
      <Nav />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="mb-10">
          <span className="section-label mb-3 inline-block">Sıralama</span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-2 text-frost-100">
                Liderlik Tablosu
              </h1>
              <p className="text-frost-500 text-base">
                En yüksek kredi bakiyesine sahip oyuncular.
              </p>
            </div>
            <button
              onClick={() => setSortBy(sortBy === "credits" ? "username" : "credits")}
              className="btn-ghost flex items-center gap-2"
            >
              <ArrowUpDown size={14} />
              {sortBy === "credits" ? "Krediye göre" : "İsme göre"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-ice-300 animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-state py-20">
            <Trophy size={40} className="text-frost-700 mb-4" />
            <span className="text-frost-500 text-base font-medium">Henüz veri yok</span>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((entry, i) => (
              <div
                key={entry.username}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${
                  i < 3
                    ? "bg-gradient-to-r from-ice-300/[0.03] to-transparent border-ice-300/8"
                    : "bg-frost-900/20 border-ice-300/[0.03] hover:border-ice-300/6"
                }`}
              >
                <div className="w-8 flex justify-center">{rankIcon(i)}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-frost-200 font-semibold text-sm truncate block">
                    {entry.username}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-ice-300 font-bold text-sm">{entry.credits}</span>
                  <span className="text-frost-600 text-xs">kredi</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
