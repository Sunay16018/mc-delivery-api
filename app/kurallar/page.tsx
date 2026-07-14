import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Slot } from "@/components/Slot";

const RULES = [
  {
    title: "Saygılı iletişim",
    desc: "Hakaret, ayrımcılık ve taciz içeren mesajlar yasaktır. Tartışmalar sohbeti bozmadan yürütülmelidir.",
  },
  {
    title: "Grief ve hırsızlık yok",
    desc: "Başka oyuncuların arazisine izinsiz müdahale, bina yıkma veya eşya çalma anında banla sonuçlanır.",
  },
  {
    title: "Hile ve exploit kullanımı yasak",
    desc: "X-ray, auto-clicker, dupe bug'ları veya izinsiz mod kullanımı tespit edilirse kalıcı ban uygulanır.",
  },
  {
    title: "Reklam yapma",
    desc: "Başka sunucuların, Discord sunucularının veya ticari ürünlerin reklamı sohbette veya tabelalarda yasaktır.",
  },
  {
    title: "Uygun yapı içeriği",
    desc: "Nefret sembolleri, müstehcen içerik veya rahatsız edici pixel art inşa etmek yasaktır.",
  },
  {
    title: "Personel talimatlarına uy",
    desc: "Moderatör ve adminlerin uyarılarına saygı göster. Anlaşmazlık varsa Discord üzerinden itiraz oluşturabilirsin.",
  },
];

export default function KurallarPage() {
  return (
    <>
      <Nav />

      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <span className="font-mono-slot text-xs uppercase tracking-widest text-[var(--emerald)] mb-4 inline-block">
          Kurallar
        </span>
        <h1 className="font-display font-semibold text-3xl sm:text-5xl tracking-tight mb-4">
          Herkes için adil bir dünya
        </h1>
        <p className="text-base text-[var(--bone-200)] leading-relaxed">
          Bu kurallar herkesin keyifli oynaması için var. İhlaller ciddiyetine
          göre uyarı, geçici veya kalıcı banla sonuçlanabilir.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-24 space-y-4">
        {RULES.map((rule, i) => (
          <div key={rule.title} className="flex gap-5 items-start">
            <Slot size={44} className="shrink-0">
              <span className="font-mono-slot text-sm font-bold text-[var(--emerald)]">
                {String(i + 1).padStart(2, "0")}
              </span>
            </Slot>
            <div className="pt-1.5 pb-5 border-b border-[var(--stone-700)] flex-1">
              <h3 className="font-display font-semibold text-base mb-1.5">
                {rule.title}
              </h3>
              <p className="text-sm text-[var(--stone-400)] leading-relaxed">
                {rule.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </>
  );
}
