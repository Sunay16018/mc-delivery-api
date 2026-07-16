import Link from "next/link";
import { ShoppingBag, Trophy, ScrollText, ArrowRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ServerStatusWidget } from "@/components/ServerStatusWidget";
import { Slot } from "@/components/Slot";

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--stone-700)]">
        <div className="absolute inset-0 terrain-line opacity-40 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 relative">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-14 items-center">
            <div>
              <span className="font-mono-slot text-xs uppercase tracking-widest text-[var(--emerald)] mb-5 inline-block">
                Survival · Ekonomi · Topluluk
              </span>
              <h1 className="font-display font-semibold text-4xl sm:text-6xl leading-[1.05] tracking-tight text-balance mb-6">
                Kendi dünyanı
                <br />
                <span className="text-[var(--emerald)]">sıfırdan inşa et.</span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--bone-200)] max-w-lg mb-9 leading-relaxed">
                Zefircraft, işbirlikçi bir survival topluluğu. Arazi koru, ekonomiye
                katıl, ranklarda yüksel ve haftalık etkinliklerle diğer oyuncularla
                yarış.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sm px-6 py-3.5 rounded-sm bg-[var(--emerald)] text-[var(--stone-950)] hover:bg-[var(--emerald-dim)] transition-colors"
                >
                  Discord&apos;a Katıl
                </a>
                <Link
                  href="/magaza"
                  className="font-semibold text-sm px-6 py-3.5 rounded-sm border border-[var(--stone-600)] text-[var(--bone-100)] hover:border-[var(--emerald)] transition-colors"
                >
                  Mağazayı Gez
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ServerStatusWidget />
            </div>
          </div>
        </div>
      </section>

      {/* HIZLI ERİŞİM SLOTLARI */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid sm:grid-cols-3 gap-5">
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
            href="/kurallar"
            icon={<ScrollText size={20} />}
            title="Kurallar"
            desc="Sunucuda kalmanın şartları"
          />
        </div>
      </section>

      {/* NASIL BAŞLANIR */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 border-t border-[var(--stone-700)]">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          <div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight mb-3">
              Nasıl başlanır
            </h2>
            <p className="text-sm text-[var(--stone-400)] leading-relaxed">
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
              desc="zefircraft.mcsh.io adresini kopyalayıp yapıştır."
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
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 border-t border-[var(--stone-700)]">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl tracking-tight mb-2">
              Mağazadan öne çıkanlar
            </h2>
            <p className="text-sm text-[var(--stone-400)]">
              Satın alımlar sunucuya anında teslim edilir.
            </p>
          </div>
          <Link
            href="/magaza"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--emerald)] hover:gap-2.5 transition-all"
          >
            Tümünü gör <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <ProductPreview name="Zümrüt Rank" price="₺89" color="var(--emerald)" />
          <ProductPreview name="Altın Rank" price="₺149" color="var(--gold)" />
          <ProductPreview name="Elmas Rank" price="₺249" color="#5DD5E8" />
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
      className="slot pixel-corners p-6 flex items-start gap-4 hover:slot-highlight transition-all group"
    >
      <span className="text-[var(--emerald)] mt-0.5">{icon}</span>
      <div>
        <h3 className="font-display font-semibold text-base mb-1 group-hover:text-[var(--emerald)] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[var(--stone-400)]">{desc}</p>
      </div>
    </Link>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5 items-start">
      <Slot size={44} className="shrink-0">
        <span className="font-mono-slot text-sm font-bold text-[var(--emerald)]">
          {n}
        </span>
      </Slot>
      <div className="pt-1.5">
        <h3 className="font-display font-semibold text-base mb-1">{title}</h3>
        <p className="text-sm text-[var(--stone-400)] leading-relaxed">
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
      className="slot pixel-corners p-6 flex flex-col items-center text-center gap-4 hover:slot-highlight transition-all"
    >
      <div
        className="w-14 h-14 pixel-corners flex items-center justify-center"
        style={{ backgroundColor: `${color}1A`, border: `2px solid ${color}` }}
      >
        <span className="w-5 h-5" style={{ backgroundColor: color }} />
      </div>
      <div>
        <h3 className="font-display font-semibold text-sm mb-1">{name}</h3>
        <span className="font-mono-slot text-xs text-[var(--stone-400)]">
          {price}
        </span>
      </div>
    </Link>
  );
}
