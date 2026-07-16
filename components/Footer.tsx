import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-soft)] mt-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br from-ice-400/20 to-ice-600/10 border border-ice-400/30">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-ice-300 to-ice-500" />
          </span>
          <span className="font-display font-bold text-sm tracking-tight text-[var(--text-primary)]">
            ZEFIR<span className="text-ice-400">CRAFT</span>
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center">
          Zefircraft, Mojang AB ile bağlantılı veya onun tarafından onaylanmış
          değildir.
        </p>

        <div className="flex items-center gap-5 text-xs text-[var(--text-body)]">
          <Link href="/kurallar" className="hover:text-ice-400 transition-colors">
            Kurallar
          </Link>
          <Link href="/hakkinda" className="hover:text-ice-400 transition-colors">
            Hakkında
          </Link>
          <Link href="/destek" className="hover:text-ice-400 transition-colors">
            Destek
          </Link>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ice-400 transition-colors"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}
