"use client";

import { useEffect, useState } from "react";
import { Users, Wifi, WifiOff } from "lucide-react";

interface StatusData {
  online: boolean;
  players: { online: number; max: number };
  version?: string | null;
}

export function ServerStatusWidget() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/server-status")
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => setStatus({ online: false, players: { online: 0, max: 0 } }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-surface p-6 w-full max-w-sm animate-pulse">
        <div className="h-4 bg-ice-300/10 rounded w-3/4 mb-3" />
        <div className="h-3 bg-ice-300/10 rounded w-1/2" />
      </div>
    );
  }

  const isOnline = status?.online ?? false;
  const players = status?.players?.online ?? 0;
  const maxPlayers = status?.players?.max ?? 0;

  return (
    <div className="card-surface p-6 w-full max-w-sm relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-ice-300/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isOnline ? "bg-ice-300/10" : "bg-frost-700/20"
          }`}>
            {isOnline ? (
              <Wifi size={20} className="text-ice-300" />
            ) : (
              <WifiOff size={20} className="text-frost-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-ice-300 shadow-[0_0_8px_rgba(94,200,242,0.5)] animate-pulse-slow" : "bg-frost-600"
              }`} />
              <span className="text-frost-200 font-semibold text-sm">
                {isOnline ? "Çevrimiçi" : "Çevrimdışı"}
              </span>
            </div>
            <span className="text-frost-600 text-xs">zefircraft.mcsh.io</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-frost-900/50 rounded-xl p-3 border border-ice-300/[0.05]">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-ice-300" />
              <span className="text-frost-500 text-xs font-medium">Oyuncular</span>
            </div>
            <span className="text-frost-100 font-display font-bold text-xl">
              {players}
              <span className="text-frost-600 text-sm font-normal"> / {maxPlayers}</span>
            </span>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText("zefircraft.mcsh.io");
            }}
            className="px-4 py-3 rounded-xl bg-ice-300/[0.05] border border-ice-300/10 text-ice-300 text-xs font-semibold hover:bg-ice-300/10 hover:border-ice-300/20 transition-all"
          >
            Kopyala
          </button>
        </div>
      </div>
    </div>
  );
}
