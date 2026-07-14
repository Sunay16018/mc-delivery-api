import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Slot } from "@/components/Slot";

export default function HakkindaPage() {
  return (
    <>
      <Nav />

      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <span className="font-mono-slot text-xs uppercase tracking-widest text-[var(--emerald)] mb-4 inline-block">
          Hakkında
        </span>
        <h1 className="font-display font-semibold text-3xl sm:text-5xl tracking-tight mb-6">
          Zefircraft nedir?
        </h1>
        <p className="text-base text-[var(--bone-200)] leading-relaxed mb-6">
          Zefircraft, arazi korumasına, ekonomiye ve topluluk etkinliklerine
          dayanan bir Survival sunucusudur. Amacımız oyuncuların uzun vadeli
          projeler inşa edebileceği, adil ve hile içermeyen bir ortam
          sağlamak.
        </p>
        <p className="text-base text-[var(--bone-200)] leading-relaxed">
          Sunucu topluluk geri bildirimleriyle şekilleniyor: yeni özellikler,
          etkinlikler ve dünya sıfırlamaları Discord üzerinden duyurulur ve
          oylamaya açılır.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
        <div className="grid sm:grid-cols-3 gap-5">
          <StatSlot label="Sunucu Tipi" value="Survival" />
          <StatSlot label="Sürüm" value="Java 1.21" />
          <StatSlot label="Dünya Sıfırlama" value="6 ayda bir" />
        </div>
      </section>

      <Footer />
    </>
  );
}

function StatSlot({ label, value }: { label: string; value: string }) {
  return (
    <div className="slot pixel-corners p-6 text-center">
      <Slot size={40} className="mx-auto mb-4">
        <span className="w-2.5 h-2.5 bg-[var(--emerald)]" />
      </Slot>
      <p className="font-display font-semibold text-sm mb-1">{value}</p>
      <p className="text-xs text-[var(--stone-400)]">{label}</p>
    </div>
  );
}
