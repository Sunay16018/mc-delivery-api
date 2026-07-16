"use client";

import { useEffect, useState } from "react";
import { Users, Copy, Check, Loader2 } from "lucide-react";
import type { ServerStatusResult } from "@/app/api/server-status/route";

const SERVER_ADDRESS = "zefircraft.mcsh.io";

export function ServerStatusWidget() {
  const [status, setStatus] = useState<ServerStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/server-status");
        const data = (await res.json()) as ServerStatusResult;
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled)
          setStatus({
            online: false,
            players: { online: 0, max: 0 },
            version: null,
            motd: null,
            icon: null,
            edition: null,
            checkedAt: new Date().toISOString(),
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(SERVER_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="slot pixel-corners w-full max-w-md p-5 sm:p-6 bg-[var(--stone-900)]">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono-slot text-xs uppercase tracking-widest text-[var(--stone-400)]">
          Sunucu Durumu
        </span>
        {loading ? (
          <Loader2
            size={14}
            className="animate-spin text-[var(--stone-400)]"
          />
        ) : (
          <span className="flex items-center gap-1.5">
            <span
              className={`status-dot w-2 h-2 rounded-full ${
                status?.online ? "bg-[var(--emerald)]" : "bg-[var(--redstone)]"
              }`}
            />
            <span
              className={`font-mono-slot text-xs font-medium ${
                status?.online
                  ? "text-[var(--emerald)]"
                  : "text-[var(--redstone)]"
              }`}
            >
              {status?.online ? "ÇEVRİMİÇİ" : "ÇEVRİMDIŞI"}
            </span>
          </span>
        )}
      </div>

      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm bg-[var(--stone-800)] border border-[var(--stone-700)] hover:border-[var(--emerald)] transition-colors group mb-4"
      >
        <span className="font-mono-slot text-sm text-[var(--bone-100)] truncate">
          {SERVER_ADDRESS}
        </span>
        {copied ? (
          <Check size={15} className="text-[var(--emerald)] shrink-0" />
        ) : (
          <Copy
            size={15}
            className="text-[var(--stone-400)] group-hover:text-[var(--emerald)] shrink-0"
          />
        )}
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--bone-200)]">
          <Users size={16} className="text-[var(--stone-400)]" />
          <span className="font-mono-slot text-sm">
            {loading
              ? "—"
              : `${status?.players.online ?? 0} / ${status?.players.max ?? 0}`}
          </span>
          <span className="text-xs text-[var(--stone-400)]">oyuncu</span>
        </div>
        {status?.version && (
          <span className="font-mono-slot text-xs text-[var(--stone-400)]">
            {status.version}
          </span>
        )}
      </div>
    </div>
  );
}
