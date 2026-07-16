import Link from "next/link";
import { Heart, MessageCircle, ShoppingBag, Trophy, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(94,200,242,0.06)] bg-[#0A0F18]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ice-300 to-ice-500 flex items-center justify-center shadow-glow-sm">
                <span className="text-ice-950 font-bold text-sm">Z</span>
              </div>
              <span className="font-display font-bold text-lg text-frost-100">Zefircraft</span>
            </div>
            <p className="text-frost-500 text-sm leading-relaxed max-w-xs">
              Hayatta kal. İnşa et. Zirveye çık. Topluluk odaklı survival deneyimi.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-frost-200 font-semibold text-sm mb-4">Sayfalar</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/magaza" className="text-frost-500 hover:text-ice-300 text-sm transition-colors flex items-center gap-2">
                  <ShoppingBag size={14} /> Mağaza
                </Link>
              </li>
              <li>
                <Link href="/siralama" className="text-frost-500 hover:text-ice-300 text-sm transition-colors flex items-center gap-2">
                  <Trophy size={14} /> Sıralama
                </Link>
              </li>
              <li>
                <Link href="/kurallar" className="text-frost-500 hover:text-ice-300 text-sm transition-colors flex items-center gap-2">
                  <Shield size={14} /> Kurallar
                </Link>
              </li>
              <li>
                <Link href="/destek" className="text-frost-500 hover:text-ice-300 text-sm transition-colors flex items-center gap-2">
                  <MessageCircle size={14} /> Destek
                </Link>
              </li>
            </ul>
          </div>

          {/* Server info */}
          <div>
            <h4 className="text-frost-200 font-semibold text-sm mb-4">Sunucu</h4>
            <ul className="space-y-2.5 text-frost-500 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ice-300 shadow-[0_0_6px_rgba(94,200,242,0.5)]" />
                Java Edition 1.20+
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ice-300 shadow-[0_0_6px_rgba(94,200,242,0.5)]" />
                zefircraft.mcsh.io
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ice-300 shadow-[0_0_6px_rgba(94,200,242,0.5)]" />
                Survival + Ekonomi
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-frost-200 font-semibold text-sm mb-4">Topluluk</h4>
            <div className="flex gap-3">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-ice-300/5 border border-ice-300/10 flex items-center justify-center text-frost-400 hover:text-ice-300 hover:border-ice-300/25 hover:bg-ice-300/8 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="ice-divider mt-12 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-frost-600 text-xs">
          <span>© 2026 Zefircraft. Tüm hakları saklıdır.</span>
          <span className="flex items-center gap-1">
            <Heart size={12} className="text-ice-300" /> ile yapıldı
          </span>
        </div>
      </div>
    </footer>
  );
}
