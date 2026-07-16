"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, AlertCircle, User, Coins, Calendar } from "lucide-react";

interface UserEntry {
  _id: string;
  username: string;
  username_lower: string;
  credits: number;
  registerDate: string;
  ipAddress?: string;
}

export function UsersTab() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      setError("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="text-ice-300 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-frost-100">Kullanıcılar</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-frost-600" />
          <input
            type="text"
            placeholder="Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 w-56"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm mb-4">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ice-300/[0.04]">
                <th className="text-left px-5 py-3.5 text-frost-500 font-medium text-xs uppercase tracking-wider">Kullanıcı</th>
                <th className="text-left px-5 py-3.5 text-frost-500 font-medium text-xs uppercase tracking-wider">Kredi</th>
                <th className="text-left px-5 py-3.5 text-frost-500 font-medium text-xs uppercase tracking-wider">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b border-ice-300/[0.02] hover:bg-ice-300/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ice-300/8 flex items-center justify-center">
                        <User size={14} className="text-ice-300" />
                      </div>
                      <span className="font-semibold text-frost-200">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-ice-300 font-bold">{u.credits}</span>
                    <span className="text-frost-600 text-xs ml-1">kredi</span>
                  </td>
                  <td className="px-5 py-3.5 text-frost-500 text-xs">
                    {new Date(u.registerDate).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center">
                    <User size={32} className="text-frost-800 mx-auto mb-3" />
                    <span className="text-frost-600 text-sm">Kullanıcı bulunamadı.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
