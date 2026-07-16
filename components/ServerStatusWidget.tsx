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
    <div className="card card-highlight rounded-2xl w-full max-w-md p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono-slot text-xs uppercase tracking-widest text-[var(--text-muted)]">
          Sunucu Durumu
        </span>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-[var(--text-muted)]" />
        ) : (
          <span className="flex items-center gap-1.5">
            <span
              className={`status-dot glow-dot w-2 h-2 rounded-full ${
                status?.online ? "bg-ice-400 text-ice-400" : "bg-[var(--danger)] text-[var(--danger)]"
              }`}
            />
            <span
              className={`font-mono-slot text-xs font-semibold ${
                status?.online ? "text-ice-300" : "text-[var(--danger)]"
              }`}
            >
              {status?.online ? "ÇEVRİMİÇİ" : "ÇEVRİMDIŞI"}
            </span>
          </span>
        )}
      </div>

      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-3 rounded-lg bg-[var(--surface-900)] border border-[var(--border-mid)] hover:border-ice-400/50 transition-colors group mb-5"
      >
        <span className="font-mono-slot text-sm text-[var(--text-primary)] truncate">
          {SERVER_ADDRESS}
        </span>
        {copied ? (
          <Check size={15} className="text-ice-400 shrink-0" />
        ) : (
          <Copy
            size={15}
            className="text-[var(--text-muted)] group-hover:text-ice-400 shrink-0"
          />
        )}
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <Users size={16} className="text-ice-400" />
          <span className="font-mono-slot text-sm font-semibold">
            {loading
              ? "—"
              : `${status?.players.online ?? 0} / ${status?.players.max ?? 0}`}
          </span>
          <span className="text-xs text-[var(--text-muted)]">oyuncu</span>
        </div>
        {status?.version && (
          <span className="font-mono-slot text-xs text-[var(--text-muted)]">
            {status.version}
          </span>
        )}
      </div>
    </div>
  );
}
