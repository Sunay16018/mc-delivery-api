"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey }),
      });

      if (res.ok) {
        router.push("/admin/panel");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Giris basarisiz.");
    } catch {
      setError("Baglanti hatasi olustu. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--stone-950)]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 slot pixel-corners flex items-center justify-center mb-4 bg-[var(--emerald)]/10">
            <Lock size={22} className="text-[var(--emerald)]" />
          </div>
          <h1 className="font-display font-semibold text-2xl tracking-tight">
            Admin Girişi
          </h1>
          <p className="text-sm text-[var(--stone-400)] mt-1">
            Zefircraft yönetim paneli
          </p>
        </div>

        <form onSubmit={handleSubmit} className="slot pixel-corners p-6 space-y-4">
          <div>
            <label
              htmlFor="secretKey"
              className="block text-xs font-mono-slot uppercase tracking-widest text-[var(--stone-400)] mb-2"
            >
              Secret Key
            </label>
            <input
              id="secretKey"
              type="password"
              autoFocus
              autoComplete="off"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2.5 rounded-sm bg-[var(--stone-800)] border border-[var(--stone-700)] text-[var(--bone-100)] font-mono-slot text-sm focus:outline-none focus:border-[var(--emerald)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--redstone)] font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || secretKey.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Giriş yap
          </button>
        </form>

        <p className="text-xs text-[var(--stone-400)] text-center mt-6">
          Bu anahtar sunucunuzdaki SECRET_KEY ortam değişkeniyle aynıdır.
        </p>
      </div>
    </div>
  );
}
