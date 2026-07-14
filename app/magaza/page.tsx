import { Check } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const RANKS = [
  {
    name: "Zümrüt",
    price: "₺89",
    color: "var(--emerald)",
    perks: ["/kit zumrut günlük", "2 ev sınırı", "Renkli sohbet adı", "/hat komutu"],
  },
  {
    name: "Altın",
    price: "₺149",
    color: "var(--gold)",
    perks: [
      "/kit altin günlük",
      "5 ev sınırı",
      "Renkli sohbet adı + rozet",
      "Öncelikli sunucu girişi",
      "/fly (sadece kendi arazinde)",
    ],
    featured: true,
  },
  {
    name: "Elmas",
    price: "₺249",
    color: "#5DD5E8",
    perks: [
      "/kit elmas günlük",
      "10 ev sınırı",
      "Özel sohbet rengi + parlak rozet",
      "Öncelikli sunucu girişi",
      "/fly (tüm dünyada)",
      "Aylık özel kozmetik eşyası",
    ],
  },
];

const ITEMS = [
  { name: "İsim Etiketi Paketi (5x)", price: "₺19" },
  { name: "Ekstra Ev Slotu", price: "₺25" },
  { name: "Parçacık Efekti — Zümrüt İz", price: "₺35" },
  { name: "Sohbet Renk Paketi", price: "₺15" },
  { name: "Ekstra Envanter Sırası", price: "₺29" },
  { name: "Özel Ölüm Mesajı", price: "₺12" },
];

export default function MagazaPage() {
  return (
    <>
      <Nav />

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <span className="font-mono-slot text-xs uppercase tracking-widest text-[var(--emerald)] mb-4 inline-block">
          Mağaza
        </span>
        <h1 className="font-display font-semibold text-3xl sm:text-5xl tracking-tight mb-4">
          Sunucuyu destekle, avantajları kap
        </h1>
        <p className="text-base text-[var(--bone-200)] max-w-xl leading-relaxed">
          Satın alımlar oyun içi avantaj sağlar, oyun dengesini bozmaz. Tüm
          ödemeler karakterine otomatik ve anında teslim edilir.
        </p>

        <div className="mt-4 slot pixel-corners px-4 py-3 inline-block">
          <p className="text-xs text-[var(--stone-400)] font-mono-slot">
            Ödeme sistemi yakında aktif olacak — şu an vitrin önizlemesindesin.
          </p>
        </div>
      </section>

      {/* RANKLAR */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <h2 className="font-display font-semibold text-2xl tracking-tight mb-8">
          Ranklar
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {RANKS.map((rank) => (
            <div
              key={rank.name}
              className={`slot pixel-corners p-7 flex flex-col ${
                rank.featured ? "slot-highlight" : ""
              }`}
            >
              {rank.featured && (
                <span className="font-mono-slot text-[10px] uppercase tracking-widest text-[var(--emerald)] mb-3">
                  En Popüler
                </span>
              )}
              <div
                className="w-12 h-12 pixel-corners flex items-center justify-center mb-5"
                style={{
                  backgroundColor: `${rank.color}1A`,
                  border: `2px solid ${rank.color}`,
                }}
              >
                <span
                  className="w-4 h-4"
                  style={{ backgroundColor: rank.color }}
                />
              </div>
              <h3 className="font-display font-semibold text-xl mb-1">
                {rank.name}
              </h3>
              <p className="font-mono-slot text-2xl font-bold mb-6">
                {rank.price}
                <span className="text-xs font-normal text-[var(--stone-400)] ml-1">
                  / tek seferlik
                </span>
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {rank.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5">
                    <Check
                      size={15}
                      className="text-[var(--emerald)] mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-[var(--bone-200)]">
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="w-full py-3 rounded-sm text-sm font-semibold bg-[var(--stone-800)] text-[var(--stone-400)] cursor-not-allowed border border-[var(--stone-700)]"
              >
                Yakında
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* TEK KULLANIMLIK EŞYALAR */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24 border-t border-[var(--stone-700)] pt-16">
        <h2 className="font-display font-semibold text-2xl tracking-tight mb-8">
          Eşyalar
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ITEMS.map((item) => (
            <div
              key={item.name}
              className="slot pixel-corners p-5 flex items-center justify-between gap-4"
            >
              <span className="text-sm text-[var(--bone-100)]">
                {item.name}
              </span>
              <span className="font-mono-slot text-sm text-[var(--gold)] shrink-0">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
