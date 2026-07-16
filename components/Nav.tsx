"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  ShoppingBag,
  Trophy,
  HelpCircle,
  LogIn,
  Coins,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/magaza", label: "Mağaza", icon: ShoppingBag },
  { href: "/siralama", label: "Sıralama", icon: Trophy },
  { href: "/destek", label: "Destek", icon: HelpCircle },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    credits: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.loggedIn) setUser({ username: d.username, credits: d.credits });
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#070B12]/80 border-b border-[rgba(94,200,242,0.06)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ice-300 to-ice-500 flex items-center justify-center shadow-glow-sm">
              <span className="text-ice-950 font-bold text-sm">Z</span>
            </div>
            <span className="font-display font-bold text-lg text-frost-100 tracking-tight hidden sm:block">
              Zefircraft
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-ice-100 bg-ice-300/[0.08]"
                      : "text-frost-500 hover:text-ice-100 hover:bg-ice-300/[0.05]"
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/profil"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-ice-300/[0.05] border border-ice-300/10 hover:border-ice-300/20 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc-heads.net/avatar/${user.username}/64`}
                  alt={user.username}
                  className="w-8 h-8 rounded-lg object-cover border border-ice-300/[0.15]"
                />
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-frost-200 text-xs font-semibold">{user.username}</span>
                  <span className="text-ice-300 text-[10px] font-mono flex items-center gap-0.5">
                    <Coins size={9} /> {user.credits}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/giris"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-ice-950 bg-gradient-to-r from-ice-300 to-ice-400 hover:shadow-glow-sm transition-all"
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">Giriş Yap</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-frost-400 hover:text-frost-200 hover:bg-ice-300/[0.05] transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(94,200,242,0.06)] bg-[#0B1220]/95 backdrop-blur-xl">
          <div className="px-5 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-ice-100 bg-ice-300/[0.08]"
                      : "text-frost-500 hover:text-ice-100 hover:bg-ice-300/[0.05]"
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
