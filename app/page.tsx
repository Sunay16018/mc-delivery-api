import Link from "next/link";
import { ShoppingBag, Trophy, ArrowRight, Shield, Zap, Globe, ChevronRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ServerStatusWidget } from "@/components/ServerStatusWidget";

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(94,200,242,0.08), transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ice-300/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32 relative">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-16 items-center">
            <div>
              <span className="section-label mb-6 inline-block">
                Survival · Ekonomi · Topluluk
              </span>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-balance mb-6 text-frost-100">
                Kendi dünyanı{" "}
                <span className="glow-text-strong text-ice-300">sıfırdan inşa et.</span>
              </h1>
              <p className="text-base sm:text-lg text-frost-400 max-w-lg mb-10 leading-relaxed">
                Zefircraft, işbirlikçi bir survival topluluğu. Arazi koru, ekonomiye
                katıl, ranklarda yüksel ve haftalık etkinliklerle diğer oyuncularla yarış.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <Zap size={16} />
                  Şimdi Oyna
                </a>
                <Link href="/magaza" className="btn-secondary">
                  Mağazayı Gez
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Server IP box */}
              <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-ice-300/[0.05] border border-ice-300/10">
                <Globe size={14} className="text-ice-300" />
                <span className="text-frost-400 text-sm font-mono">zefircraft.mcsh.io</span>
                <span className="w-px h-4 bg-ice-300/10" />
                <span className="flex items-center gap-1.5 text-frost-500 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-ice-300 shadow-[0_0_6px_rgba(94,200,242,0.5)] animate-pulse-slow" />
                  Çevrimiçi
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ServerStatusWidget />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid sm:grid-cols-3 gap-5">
          <QuickLink
            href="/magaza"
            icon={<ShoppingBag size={22} />}
            title="Mağaza"
            desc="Rank, item ve kozmetikler. Kredi ile satın al, anında teslim al."
            accent="#5EC8F2"
          />
          <QuickLink
            href="/siralama"
            icon={<Trophy size={22} />}
            title="Sıralama"
            desc="En iyi oyuncular ve ranklar. Liderlik tablosuna göz at."
            accent="#38BDF8"
          />
          <QuickLink
            href="/kurallar"
            icon={<Shield size={22} />}
            title="Kurallar"
            desc="Sunucuda kalmanın şartları. Herkes için adil bir ortam."
            accent="#0EA5E9"
          />
        </div>
      </section>

      {/* HOW TO START */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="ice-divider mb-20" />
        <div className="grid lg:grid-cols-[300px_1fr] gap-14">
          <div>
            <span className="section-label mb-4 inline-block">Başlangıç</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight mb-3 text-frost-100">
              Nasıl başlanır
            </h2>
            <p className="text-sm text-frost-500 leading-relaxed">
              Java Edition üzerinden üç adımda sunucuya katıl ve maceraya başla.
            </p>
          </div>

          <div className="space-y-5">
            <Step
              n="01"
              title="Minecraft'ı aç"
              desc="Multiplayer sekmesine geç ve 'Sunucu Ekle'ye tıkla."
            />
            <Step
              n="02"
              title="Adresi gir"
              desc="zefircraft.mcsh.io adresini kopyalayıp yapıştır."
            />
            <Step
              n="03"
              title="Katıl ve kur"
              desc="Sunucuya bağlan, /kit komutuyla başlangıç ekipmanını al."
            />
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="ice-divider mb-20" />
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="section-label mb-3 inline-block">Mağaza</span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight mb-2 text-frost-100">
              Öne çıkanlar
            </h2>
            <p className="text-sm text-frost-500">
              Satın alımlar sunucuya anında teslim edilir.
            </p>
          </div>
          <Link
            href="/magaza"
            className="flex items-center gap-1.5 text-sm font-semibold text-ice-300 hover:text-ice-100 hover:gap-2.5 transition-all"
          >
            Tümünü gör <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <ProductPreview name="Zümrüt Rank" price={89} color="#5EC8F2" perks={["/fly yetkisi", "5 ev seti", "Özel prefix"]} />
          <ProductPreview name="Altın Rank" price={149} color="#FBBF24" perks={["Tüm Zümrüt özellikleri", "10 ev seti", "Renkli chat"]} featured />
          <ProductPreview name="Elmas Rank" price={249} color="#38BDF8" perks={["Tüm Altın özellikleri", "Sınırsız ev", "Özel kozmetikler"]} />
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
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="card-surface p-6 group block hover:border-ice-300/10 transition-all"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-105"
        style={{ background: `${accent}12`, color: accent }}
      >
        {icon}
      </div>
      <h3 className="font-display font-bold text-base text-frost-100 mb-1.5 flex items-center gap-2">
        {title}
        <ArrowRight
          size={14}
          className="text-frost-600 group-hover:text-ice-300 group-hover:translate-x-0.5 transition-all"
        />
      </h3>
      <p className="text-frost-500 text-sm leading-relaxed">{desc}</p>
    </Link>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-5 p-5 rounded-2xl bg-frost-900/30 border border-ice-300/[0.04]">
      <span className="font-mono text-ice-300/40 text-xl font-bold shrink-0 w-10">{n}</span>
      <div>
        <h4 className="font-semibold text-frost-200 text-sm mb-1">{title}</h4>
        <p className="text-frost-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ProductPreview({
  name,
  price,
  color,
  perks,
  featured = false,
}: {
  name: string;
  price: number;
  color: string;
  perks: string[];
  featured?: boolean;
}) {
  return (
    <div className="card-surface p-5 relative overflow-hidden group">
      {featured && (
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.15] blur-xl pointer-events-none" style={{ background: color }} />
      )}
      <div className="absolute top-0 left-4 right-4 h-px" style={{ background: color, opacity: 0.2 }} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-frost-100">{name}</h3>
          {featured && <span className="badge badge-ice text-[10px]">POPÜLER</span>}
        </div>

        <ul className="space-y-1.5 mb-5">
          {perks.map((p, i) => (
            <li key={i} className="flex items-center gap-2 text-frost-400 text-xs">
              <span className="w-1 h-1 rounded-full" style={{ background: color }} />
              {p}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-4 border-t border-ice-300/[0.05]">
          <div className="flex items-baseline gap-1">
            <span className="font-display font-bold text-2xl" style={{ color }}>{price}</span>
            <span className="text-frost-500 text-xs">kredi</span>
          </div>
          <Link
            href="/magaza"
            className="text-ice-300 text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
          >
            İncele <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
