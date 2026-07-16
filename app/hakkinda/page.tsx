import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Shield, Zap, Users, Globe } from "lucide-react";

export default function HakkindaPage() {
  return (
    <>
      <Nav />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <span className="section-label mb-3 inline-block">Hakkında</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-6 text-frost-100">
          Zefircraft Nedir?
        </h1>

        <div className="space-y-6 text-frost-400 leading-relaxed">
          <p>
            Zefircraft, topluluk odaklı bir Minecraft survival sunucusudur. 2024
            yılında kurulan sunucumuz, oyunculara özgür bir inşa deneyimi sunarken
            ekonomi, rank ve etkinlik sistemleriyle derinlik kazandırıyor.
          </p>
          <p>
            Sunucumuzda her oyuncu kendi arazisini koruyabilir, ekonomiye katılabilir
            ve haftalık etkinliklerle diğer oyuncularla rekabet edebilir. Rank sistemi
            sayesinde avantajlar kazanabilir, mağazadan satın alımlarla karakterini
            özelleştirebilirsin.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-12">
          {[
            { icon: <Shield size={20} />, title: "Güvenli Ortam", desc: "Aktif yetkili ekibi ve anti-cheat koruması." },
            { icon: <Zap size={20} />, title: "Düşük Gecikme", desc: "Türkiye merkezli sunucu altyapısı." },
            { icon: <Users size={20} />, title: "Topluluk", desc: "Discord üzerinden aktif topluluk etkileşimi." },
            { icon: <Globe size={20} />, title: "7/24 Açık", desc: "Kesintisiz oyun deneyimi." },
          ].map((item, i) => (
            <div key={i} className="card-surface p-5">
              <div className="w-10 h-10 rounded-xl bg-ice-300/8 flex items-center justify-center text-ice-300 mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold text-frost-200 text-sm mb-1">{item.title}</h3>
              <p className="text-frost-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
