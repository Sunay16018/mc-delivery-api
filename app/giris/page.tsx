"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Info } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function UserLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/magaza");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Giriş başarısız.");
    } catch {
      setError("Bağlantı hatası oluştu. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-16 bg-[var(--stone-950)]">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 slot pixel-corners flex items-center justify-center mb-4 bg-[var(--emerald)]/10">
              <KeyRound size={22} className="text-[var(--emerald)]" />
            </div>
            <h1 className="font-display font-semibold text-2xl tracking-tight">
              Hesabına Giriş Yap
            </h1>
            <p className="text-sm text-[var(--stone-400)] mt-1 text-center">
              Mağazadan alışveriş yapmak için oyun hesabınla giriş yap
            </p>
          </div>

          <form onSubmit={handleSubmit} className="slot pixel-corners p-6 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-mono-slot uppercase tracking-widest text-[var(--stone-400)] mb-2"
              >
                Minecraft Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Steve"
                className="input-field font-mono-slot"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono-slot uppercase tracking-widest text-[var(--stone-400)] mb-2"
              >
                Şifre
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field font-mono-slot"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--redstone)] font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Giriş yap
            </button>
          </form>

          <div className="mt-6 slot pixel-corners p-4 flex gap-3">
            <Info size={16} className="text-[var(--gold)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--stone-400)] leading-relaxed">
              Henüz hesabın yok mu? Kayıt burada değil,{" "}
              <span className="text-[var(--bone-200)] font-medium">oyun içinden</span>{" "}
              yapılır. Sunucuya ilk katıldığında{" "}
              <code className="font-mono-slot text-[var(--gold)]">/kayitol</code>{" "}
              komutuyla otomatik olarak yönlendirilirsin.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
