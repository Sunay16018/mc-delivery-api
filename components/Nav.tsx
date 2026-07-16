"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";

const LINKS = [
  { href: "/magaza", label: "Mağaza" },
  { href: "/siralama", label: "Sıralama" },
  { href: "/kurallar", label: "Kurallar" },
  { href: "/hakkinda", label: "Hakkında" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setUsername(data.loggedIn ? data.username : null);
        setCheckedSession(true);
      })
      .catch(() => {
        if (!cancelled) setCheckedSession(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/user/logout", { method: "POST" });
    setUsername(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--stone-700)] bg-[var(--stone-950)]/90 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 slot pixel-corners flex items-center justify-center bg-[var(--emerald)]/10">
            <span className="w-3.5 h-3.5 bg-[var(--emerald)]" />
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">
            ZEFIRCRAFT
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--bone-200)] hover:text-[var(--emerald)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold px-4 py-2 rounded-sm bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] transition-colors"
          >
            Discord&apos;a Katıl
          </a>
          {checkedSession && (
            username ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--stone-400)] hover:text-[var(--redstone)] transition-colors"
              >
                <User size={15} className="text-[var(--emerald)]" />
                {username}
                <LogOut size={14} />
              </button>
            ) : (
              <Link
                href="/giris"
                className="text-sm font-medium text-[var(--bone-200)] hover:text-[var(--emerald)] transition-colors"
              >
                Giriş yap
              </Link>
            )
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[var(--bone-100)]"
          aria-label="Menüyü aç/kapat"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-[var(--stone-700)] px-5 py-4 flex flex-col gap-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[var(--bone-200)]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold px-4 py-2.5 rounded-sm bg-[var(--emerald)] text-[var(--stone-950)] text-center"
          >
            Discord&apos;a Katıl
          </a>
          {checkedSession && (
            username ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--stone-400)]"
              >
                <User size={15} className="text-[var(--emerald)]" />
                {username} — Çıkış yap
              </button>
            ) : (
              <Link
                href="/giris"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[var(--bone-200)]"
              >
                Giriş yap
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
