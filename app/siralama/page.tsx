import { Trophy } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

// NOT: Bu veriler örnektir. Gerçek plugin API'niz hazır olduğunda
// bu diziyi o kaynaktan fetch eden bir server component ile değiştirin.
const PLAYERS = [
  { rank: 1, name: "KayraOfficial", rankName: "Elmas", score: 18420 },
  { rank: 2, name: "zeynepcrafts", rankName: "Elmas", score: 16110 },
  { rank: 3, name: "berat_yildiz", rankName: "Altın", score: 14875 },
  { rank: 4, name: "MiraNova", rankName: "Altın", score: 12980 },
  { rank: 5, name: "eren.build", rankName: "Zümrüt", score: 11540 },
  { rank: 6, name: "sude_kaya", rankName: "Zümrüt", score: 10220 },
  { rank: 7, name: "OzanTheBuilder", rankName: "Üye", score: 9110 },
  { rank: 8, name: "ipek_ates", rankName: "Üye", score: 8340 },
];

const RANK_COLORS: Record<string, string> = {
  Elmas: "#5DD5E8",
  Altın: "var(--gold)",
  Zümrüt: "var(--emerald)",
  Üye: "var(--stone-400)",
};

export default function SiralamaPage() {
  return (
    <>
      <Nav />

      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <span className="font-mono-slot text-xs uppercase tracking-widest text-[var(--emerald)] mb-4 inline-block">
          Sıralama
        </span>
        <h1 className="font-display font-semibold text-3xl sm:text-5xl tracking-tight mb-4">
          En iyi oyuncular
        </h1>
        <p className="text-base text-[var(--bone-200)] max-w-xl leading-relaxed">
          Haftalık aktivite puanına göre sıralanır. Puanlar blok yerleştirme,
          görev tamamlama ve etkinlik katılımından kazanılır.
        </p>

        <div className="mt-4 slot pixel-corners px-4 py-3 inline-block">
          <p className="text-xs text-[var(--stone-400)] font-mono-slot">
            Örnek veri gösteriliyor — canlı skorlar plugin entegrasyonu
            tamamlandığında burada görünecek.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-24">
        <div className="slot pixel-corners overflow-hidden">
          {PLAYERS.map((player, i) => (
            <div
              key={player.name}
              className={`flex items-center gap-4 sm:gap-6 px-5 sm:px-6 py-4 ${
                i !== PLAYERS.length - 1 ? "border-b border-[var(--stone-700)]" : ""
              }`}
            >
              <div className="w-8 flex justify-center shrink-0">
                {player.rank <= 3 ? (
                  <Trophy
                    size={18}
                    className={
                      player.rank === 1
                        ? "text-[var(--gold)]"
                        : player.rank === 2
                        ? "text-[var(--bone-200)]"
                        : "text-[#c2793f]"
                    }
                  />
                ) : (
                  <span className="font-mono-slot text-sm text-[var(--stone-400)]">
                    {player.rank}
                  </span>
                )}
              </div>

              <span className="font-medium text-sm sm:text-base flex-1 truncate">
                {player.name}
              </span>

              <span
                className="font-mono-slot text-[10px] sm:text-xs uppercase tracking-wide px-2.5 py-1 rounded-sm shrink-0"
                style={{
                  color: RANK_COLORS[player.rankName],
                  border: `1px solid ${RANK_COLORS[player.rankName]}`,
                  backgroundColor: `${RANK_COLORS[player.rankName]}14`,
                }}
              >
                {player.rankName}
              </span>

              <span className="font-mono-slot text-sm text-[var(--bone-200)] w-20 text-right shrink-0">
                {player.score.toLocaleString("tr-TR")}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
