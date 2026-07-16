"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function GirisPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Giriş başarısız.");
      } else {
        router.push("/profil");
        router.refresh();
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-frost-500 hover:text-ice-300 text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Ana sayfaya dön
          </Link>

          <div className="card-surface p-8 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-ice-300/[0.05] rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ice-300 to-ice-500 flex items-center justify-center mb-6 shadow-glow-sm">
                <LogIn size={22} className="text-ice-950" />
              </div>

              <h1 className="font-display font-bold text-2xl text-frost-100 mb-2">
                Oyuncu Girişi
              </h1>
              <p className="text-frost-500 text-sm mb-8">
                Minecraft kullanıcı adın ve şifren ile giriş yap.
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
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Minecraft kullanıcı adın"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-frost-400 text-xs font-medium mb-1.5">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifren"
                      className="input-field pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-frost-600 hover:text-frost-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-ice-950/30 border-t-ice-950 rounded-full animate-spin" />
                      Giriş yapılıyor...
                    </span>
                  ) : (
                    <>
                      <LogIn size={16} />
                      Giriş Yap
                    </>
                  )}
                </button>
              </form>

              <p className="text-frost-600 text-xs text-center mt-6">
                Hesabın yok mu?{" "}
                <span className="text-frost-500">Kayıt oyun içinden yapılır.</span>
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
