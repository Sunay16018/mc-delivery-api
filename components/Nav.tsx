"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  Home,
  ShoppingBag,
  Trophy,
  LifeBuoy,
  ScrollText,
} from "lucide-react";

const LINKS = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/magaza", label: "Mağaza", icon: ShoppingBag },
  { href: "/siralama", label: "Sıralama", icon: Trophy },
  { href: "/destek", label: "Destek", icon: LifeBuoy },
  { href: "/kurallar", label: "Kurallar", icon: ScrollText },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[var(--bg-950)]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-ice-400/20 to-ice-600/10 border border-ice-400/30">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-ice-300 to-ice-500 shadow-glow" />
          </span>
          <span className="font-display font-bold text-lg tracking-tight">
            ZEFIR<span className="text-ice-400">CRAFT</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm font-semibold px-4 py-2 rounded-lg mr-2"
          >
            Discord
          </a>
          {checkedSession &&
            (username ? (
              <Link
                href="/profil"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg btn-primary"
              >
                <User size={15} />
                {username}
              </Link>
            ) : (
              <Link
                href="/giris"
                className="btn-primary text-sm font-semibold px-5 py-2 rounded-lg"
              >
                Giriş Yap
              </Link>
            ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[var(--text-primary)]"
          aria-label="Menüyü aç/kapat"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Yatay ikon navigasyonu (hero altında sticky hissi veren ikinci sıra) */}
      <div className="hidden md:block border-t border-[var(--border-soft)]">
        <nav className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center gap-1 h-12">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 h-full text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "text-ice-400 border-ice-400"
                    : "text-[var(--text-body)] border-transparent hover:text-ice-300"
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border-soft)] px-5 py-4 flex flex-col gap-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 text-sm font-medium text-[var(--text-body)] py-2.5"
              >
                <Icon size={17} className="text-ice-400" />
                {link.label}
              </Link>
            );
          })}
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm font-semibold px-4 py-2.5 rounded-lg text-center mt-2"
          >
            Discord&apos;a Katıl
          </a>
          {checkedSession &&
            (username ? (
              <>
                <Link
                  href="/profil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 text-sm font-medium text-ice-400 py-2.5"
                >
                  <User size={15} /> {username} — Profilim
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-[var(--danger)] py-2.5"
                >
                  <LogOut size={15} /> Çıkış yap
                </button>
              </>
            ) : (
              <Link
                href="/giris"
                onClick={() => setOpen(false)}
                className="btn-primary text-sm font-semibold px-4 py-2.5 rounded-lg text-center mt-1"
              >
                Giriş Yap
              </Link>
            ))}
        </div>
      )}
    </header>
  );
}
