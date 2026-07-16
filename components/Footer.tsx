import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--stone-700)] mt-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 slot pixel-corners flex items-center justify-center bg-[var(--emerald)]/10">
            <span className="w-2.5 h-2.5 bg-[var(--emerald)]" />
          </span>
          <span className="font-display font-semibold text-sm tracking-tight text-[var(--bone-200)]">
            ZEFIRCRAFT
          </span>
        </div>

        <p className="text-xs text-[var(--stone-400)] text-center">
          Zefircraft, Mojang AB ile bağlantılı veya onun tarafından onaylanmış
          değildir.
        </p>

        <div className="flex items-center gap-5 text-xs text-[var(--stone-400)]">
          <Link href="/kurallar" className="hover:text-[var(--emerald)]">
            Kurallar
          </Link>
          <Link href="/hakkinda" className="hover:text-[var(--emerald)]">
            Hakkında
          </Link>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--emerald)]"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}
