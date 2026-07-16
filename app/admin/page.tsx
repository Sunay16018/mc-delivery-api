"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Giriş başarısız.");
      } else {
        router.push("/admin/panel");
        router.refresh();
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-5 bg-[#070B12] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ice-300/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-frost-500 hover:text-ice-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Ana sayfaya dön
        </Link>

        <div className="card-surface p-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ice-300 to-ice-500 flex items-center justify-center mb-6 shadow-glow-sm">
            <Shield size={22} className="text-ice-950" />
          </div>

          <h1 className="font-display font-bold text-2xl text-frost-100 mb-2">
            Yetkili Girişi
          </h1>
          <p className="text-frost-500 text-sm mb-8">
            Admin paneline erişmek için secret key girin.
          </p>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15] text-red-400 text-sm mb-6">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-frost-400 text-xs font-medium mb-1.5">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Secret key girin"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-frost-600 hover:text-frost-400 transition-colors"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ice-950/30 border-t-ice-950 rounded-full animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                <>
                  <Shield size={16} />
                  Giriş Yap
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
