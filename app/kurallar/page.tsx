import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ShieldAlert, Ban, MessageSquare, Lock } from "lucide-react";

const rules = [
  {
    icon: <ShieldAlert size={18} />,
    title: "Hile Kullanımı",
    desc: "X-ray, fly hack, kill aura ve benzeri hile yazılımları kesinlikle yasaktır. Tespit edilen hesaplar kalıcı olarak banlanır.",
  },
  {
    icon: <Ban size={18} />,
    title: "Zarar Verme (Griefing)",
    desc: "Başka oyuncuların yapılarını izinsiz yıkmak, çalmak veya patlatmak yasaktır. Claim sistemi dışındaki alanlar da korunur.",
  },
  {
    icon: <MessageSquare size={18} />,
    title: "Saygılı Davranış",
    desc: "Irkçı, cinsiyetçi, ayrımcı veya hakaret içeren davranışlara tolerans gösterilmez.",
  },
  {
    icon: <Lock size={18} />,
    title: "Reklam",
    desc: "Diğer sunucuların, sitelerin veya Discord sunucularının reklamı yasaktır.",
  },
];

export default function KurallarPage() {
  return (
    <>
      <Nav />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <span className="section-label mb-3 inline-block">Kurallar</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-3 text-frost-100">
          Sunucu Kuralları
        </h1>
        <p className="text-frost-500 text-base mb-10">
          Herkes için adil ve eğlenceli bir ortam sağlamak adına lütfen kurallara uyun.
        </p>

        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className="card-surface p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-ice-300/[0.08] flex items-center justify-center text-ice-300 shrink-0 mt-0.5">
                {rule.icon}
              </div>
              <div>
                <h3 className="font-semibold text-frost-200 text-sm mb-1">
                  {i + 1}. {rule.title}
                </h3>
                <p className="text-frost-500 text-sm leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/10">
          <p className="text-amber-400/80 text-sm">
            <strong className="text-amber-400">Not:</strong> Kuralları ihlal eden oyuncular
            yetkili ekibimiz tarafından uyarı, geçici ban veya kalıcı ban cezaları alabilir.
            Cezaların itirazı için Destek sayfasını kullanabilirsiniz.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
