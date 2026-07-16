"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Coins, Clock } from "lucide-react";

interface AdminUser {
  _id: string;
  username: string;
  credits: number;
  registerDate: string;
  ipAddress: string;
}

type CreditAction = "add" | "subtract" | "set";

export function UsersTab() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [creditModalUser, setCreditModalUser] = useState<AdminUser | null>(null);
  const [creditAction, setCreditAction] = useState<CreditAction>("add");
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (q: string) => {
      setLoading(true);
      setError(null);
      try {
        const url = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : "/api/admin/users";
        const res = await fetch(url);
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const data = await res.json();
        setUsers(data.users ?? []);
      } catch {
        setError("Kullanıcılar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadUsers("");
  }, [loadUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => loadUsers(query), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function openCreditModal(user: AdminUser) {
    setCreditModalUser(user);
    setCreditAction("add");
    setCreditAmount(0);
    setSubmitError(null);
    setSubmitSuccess(null);
  }

  function closeCreditModal() {
    setCreditModalUser(null);
  }

  async function handleSubmitCredit() {
    if (!creditModalUser) return;
    setSubmitError(null);
    setSubmitSuccess(null);

    if (creditAmount < 0) {
      setSubmitError("Miktar 0 veya daha büyük olmalıdır.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/credit-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: creditModalUser.username,
          action: creditAction,
          amount: creditAmount,
        }),
      });

      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? "İşlem başarısız.");
        return;
      }

      setSubmitSuccess(
        "İstek oluşturuldu. Oyun sunucusundaki plugin birkaç saniye içinde işleyecek."
      );
      // Kisa bir sure sonra listeyi tazeleyip (kredi henuz guncellenmemis
      // olabilir, plugin taraflı islenmesini bekliyoruz) modali kapatiyoruz.
      setTimeout(() => {
        closeCreditModal();
        loadUsers(query);
      }, 1500);
    } catch {
      setSubmitError("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-display font-semibold text-2xl tracking-tight mb-1">
            Kayıtlı oyuncular
          </h2>
          <p className="text-sm text-[var(--stone-400)]">
            Kredi işlemleri kuyruk üzerinden oyun sunucusundaki plugin tarafından işlenir.
          </p>
        </div>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--stone-400)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kullanıcı ara..."
            className="input-field pl-9 w-56"
          />
        </div>
      </div>

      {error && (
        <div className="slot pixel-corners p-4 mb-6 text-sm text-[var(--redstone)]">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--stone-400)]" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-[var(--stone-400)] slot pixel-corners p-5">
          Hiç kayıtlı oyuncu bulunamadı.
        </p>
      ) : (
        <div className="slot pixel-corners overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--stone-700)] text-left">
                <th className="px-4 py-3 font-mono-slot text-[11px] uppercase tracking-widest text-[var(--stone-400)]">
                  Kullanıcı
                </th>
                <th className="px-4 py-3 font-mono-slot text-[11px] uppercase tracking-widest text-[var(--stone-400)]">
                  Kredi
                </th>
                <th className="px-4 py-3 font-mono-slot text-[11px] uppercase tracking-widest text-[var(--stone-400)] hidden sm:table-cell">
                  Kayıt tarihi
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-[var(--stone-800)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--bone-100)]">{user.username}</td>
                  <td className="px-4 py-3 font-mono-slot text-[var(--gold)]">{user.credits}</td>
                  <td className="px-4 py-3 text-xs text-[var(--stone-400)] hidden sm:table-cell">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(user.registerDate).toLocaleDateString("tr-TR")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openCreditModal(user)}
                      className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-sm text-xs font-semibold border border-[var(--stone-600)] text-[var(--bone-200)] hover:border-[var(--emerald)] hover:text-[var(--emerald)] transition-colors"
                    >
                      <Coins size={13} /> Kredi düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="slot pixel-corners w-full max-w-sm bg-[var(--stone-900)] p-6">
            <h3 className="font-display font-semibold text-lg mb-1">
              {creditModalUser.username}
            </h3>
            <p className="text-xs text-[var(--stone-400)] mb-6">
              Güncel bakiye: <span className="font-mono-slot text-[var(--gold)]">{creditModalUser.credits} kredi</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono-slot uppercase tracking-widest text-[var(--stone-400)] mb-1.5">
                  İşlem
                </label>
                <select
                  value={creditAction}
                  onChange={(e) => setCreditAction(e.target.value as CreditAction)}
                  className="input-field"
                >
                  <option value="add">Kredi ekle</option>
                  <option value="subtract">Kredi çıkar</option>
                  <option value="set">Krediyi şuna eşitle</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono-slot uppercase tracking-widest text-[var(--stone-400)] mb-1.5">
                  Miktar
                </label>
                <input
                  type="number"
                  min={0}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="input-field font-mono-slot"
                  autoFocus
                />
              </div>

              {submitError && <p className="text-sm text-[var(--redstone)] font-medium">{submitError}</p>}
              {submitSuccess && <p className="text-sm text-[var(--emerald)] font-medium">{submitSuccess}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeCreditModal}
                  className="flex-1 py-2.5 rounded-sm text-sm font-medium border border-[var(--stone-600)] text-[var(--bone-200)] hover:border-[var(--stone-400)] transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSubmitCredit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-semibold bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] disabled:opacity-50 transition-colors"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
