import Link from "next/link";
import { ShoppingBag, Trophy, ScrollText, ArrowRight, LifeBuoy } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ServerStatusWidget } from "@/components/ServerStatusWidget";
import { Slot } from "@/components/Slot";

const SERVER_ADDRESS = "zefircraft.mcsh.io";

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--border-soft)]">
        <div className="absolute inset-0 grid-lines opacity-60 pointer-events-none" />
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(94,200,242,0.20) 0%, rgba(94,200,242,0.05) 45%, transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32 relative text-center">
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-ice-400/15 to-ice-600/5 border border-ice-400/25 shadow-glow-lg">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-ice-200 via-ice-400 to-ice-600" />
            </div>
          </div>

          <span className="font-mono-slot text-xs uppercase tracking-[0.25em] text-ice-400 mb-5 inline-block">
            Survival · Ekonomi · Topluluk
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-6xl leading-[1.05] tracking-tight text-balance mb-5">
            Kendi dünyanı
            <br />
            <span className="text-ice-400">sıfırdan inşa et.</span>
          </h1>
          <div className="frost-divider mx-auto mb-6" />
          <p className="text-base sm:text-lg text-[var(--text-body)] max-w-xl mx-auto mb-10 leading-relaxed">
            Zefircraft, işbirlikçi bir survival topluluğu. Arazi koru, ekonomiye
            katıl, ranklarda yüksel ve haftalık etkinliklerle diğer oyuncularla
            yarış.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-900)] border border-[var(--border-mid)] font-mono-slot text-sm text-ice-200 mb-8">
            SUNUCU ADRESİ: <span className="text-ice-400 font-semibold">{SERVER_ADDRESS}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary font-semibold text-sm px-7 py-3.5 rounded-xl"
            >
              Şimdi Oyna
            </a>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary font-semibold text-sm px-7 py-3.5 rounded-xl"
            >
              Discord
            </a>
          </div>

          <div className="flex justify-center">
            <ServerStatusWidget />
          </div>
        </div>
      </section>

      {/* HIZLI ERİŞİM SLOTLARI */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid sm:grid-cols-4 gap-5">
          <QuickLink
            href="/magaza"
            icon={<ShoppingBag size={20} />}
            title="Mağaza"
            desc="Rank, item ve kozmetikler"
          />
          <QuickLink
            href="/siralama"
            icon={<Trophy size={20} />}
            title="Sıralama"
            desc="En iyi oyuncular ve ranklar"
          />
          <QuickLink
            href="/destek"
            icon={<LifeBuoy size={20} />}
            title="Destek"
            desc="Sorun bildir, yardım al"
          />
          <QuickLink
            href="/kurallar"
            icon={<ScrollText size={20} />}
            title="Kurallar"
            desc="Sunucuda kalmanın şartları"
          />
        </div>
      </section>

      {/* NASIL BAŞLANIR */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 border-t border-[var(--border-soft)]">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight mb-3">
              Nasıl başlanır
            </h2>
            <div className="frost-divider mb-4" />
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Java Edition üzerinden üç adımda sunucuya katıl.
            </p>
          </div>

          <div className="space-y-6">
            <Step
              n="1"
              title="Minecraft'ı aç"
              desc="Multiplayer sekmesine geç ve 'Sunucu Ekle'ye tıkla."
            />
            <Step
              n="2"
              title="Adresi gir"
              desc={`${SERVER_ADDRESS} adresini kopyalayıp yapıştır.`}
            />
            <Step
              n="3"
              title="Katıl ve kur"
              desc="Sunucuya bağlan, /kit komutuyla başlangıç ekipmanını al."
            />
          </div>
        </div>
      </section>

      {/* MAĞAZA ÖNİZLEME */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 border-t border-[var(--border-soft)]">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight mb-2">
              Mağazadan öne çıkanlar
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Satın alımlar sunucuya anında teslim edilir.
            </p>
          </div>
          <Link
            href="/magaza"
            className="flex items-center gap-1.5 text-sm font-semibold text-ice-400 hover:gap-2.5 transition-all"
          >
            Tümünü gör <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <ProductPreview name="Zümrüt Rank" price="₺89" color="#5EC8F2" />
          <ProductPreview name="Altın Rank" price="₺149" color="#BAE6FD" />
          <ProductPreview name="Elmas Rank" price="₺249" color="#93D8FB" />
        </div>
      </section>

      <Footer />
    </>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card rounded-xl p-6 flex flex-col items-start gap-3 hover:card-highlight transition-all group"
    >
      <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-ice-400/10 border border-ice-400/20 text-ice-400">
        {icon}
      </span>
      <div>
        <h3 className="font-display font-semibold text-base mb-1 group-hover:text-ice-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-muted)]">{desc}</p>
      </div>
    </Link>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5 items-start">
      <Slot size={44} className="shrink-0">
        <span className="font-mono-slot text-sm font-bold text-ice-400">
          {n}
        </span>
      </Slot>
      <div className="pt-1.5">
        <h3 className="font-display font-semibold text-base mb-1">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function ProductPreview({
  name,
  price,
  color,
}: {
  name: string;
  price: string;
  color: string;
}) {
  return (
    <Link
      href="/magaza"
      className="card rounded-xl p-6 flex flex-col items-center text-center gap-4 hover:card-highlight transition-all"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}1A`, border: `1px solid ${color}66` }}
      >
        <span className="w-5 h-5 rounded" style={{ backgroundColor: color }} />
      </div>
      <div>
        <h3 className="font-display font-semibold text-sm mb-1">{name}</h3>
        <span className="font-mono-slot text-xs text-[var(--text-muted)]">
          {price}
        </span>
      </div>
    </Link>
  );
}
