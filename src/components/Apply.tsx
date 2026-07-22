import React, { useState } from "react";
import { UserCheck, CheckCircle, Send, AlertCircle, Snowflake } from "lucide-react";
import { motion } from "motion/react";

export default function Apply() {
  const [formData, setFormData] = useState({
    username: "",
    realName: "",
    age: "",
    discord: "",
    experience: "",
    reason: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { username, realName, age, discord, experience, reason } = formData;
    if (!username || !realName || !age || !discord || !experience || !reason) {
      setError("Lütfen tüm başvuru alanlarını doldurun.");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 12 || ageNum > 60) {
      setError("Lütfen geçerli bir yaş değeri girin (12 - 60 arası).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          realName,
          age: ageNum,
          discord,
          experience,
          reason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Başvuru gönderilirken hata oluştu.");
      }

      setSubmitted(true);
      setFormData({
        username: "",
        realName: "",
        age: "",
        discord: "",
        experience: "",
        reason: ""
      });
    } catch (err: any) {
      setError(err.message || "Başvurunuz kaydedilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 py-4 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12192c] to-[#0c101e] border border-[#22304d] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,#3b82f615,transparent_50%)]"></div>
        <div className="space-y-3 relative z-10 text-center md:text-left">
          <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md inline-block">
            EKİBE KATIL
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-sans">Yetkili Başvurusu</h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-md leading-relaxed mx-auto md:mx-0">
            ZefirCraft ekibine katılarak düzeni sağlamamıza, oyunculara rehberlik etmemize ve sunucumuzu büyütmemize yardımcı olabilirsiniz!
          </p>
        </div>
        <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20 text-sky-400 animate-pulse shrink-0 shadow-lg">
          <UserCheck className="w-8 h-8 text-sky-400" />
        </div>
      </div>

      <div className="bg-[#111625]/75 rounded-3xl border border-[#1e2a40] p-6 md:p-8 shadow-lg space-y-6">
        <div className="flex items-center gap-2 border-[#1b3d54] border-[#1e2a40]/55 pb-4">
          <UserCheck className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-black text-white uppercase tracking-tight">
            Aday Başvuru Bilgileri
          </h2>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2.5 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12 space-y-5 text-emerald-400"
          >
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl text-white">
                Başvurunuz Başarıyla Gönderildi!
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Yetkili ekibimiz başvurunuzu detaylıca inceleyecektir. Olumlu bulunması durumunda Discord üzerinden sizinle iletişime geçeceğiz. İlginiz için teşekkür ederiz!
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-[#1b2236] hover:bg-[#25324e] text-slate-300 border border-[#2b3957]/55 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Yeni Bir Başvuru Gönder
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Minecraft Kullanıcı Adınız</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="örn: ZefirPlayer"
                  className="w-full text-xs p-3 bg-[#182035] border border-[#2b3957] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Gerçek Adınız Soyadınız</label>
                <input
                  type="text"
                  name="realName"
                  required
                  value={formData.realName}
                  onChange={handleInputChange}
                  placeholder="örn: Ahmet Yılmaz"
                  className="w-full text-xs p-3 bg-[#182035] border border-[#2b3957] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Yaşınız</label>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="örn: 17"
                  className="w-full text-xs p-3 bg-[#182035] border border-[#2b3957] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Discord Kullanıcı Adınız</label>
                <input
                  type="text"
                  name="discord"
                  required
                  value={formData.discord}
                  onChange={handleInputChange}
                  placeholder="örn: zefircraft#1234 veya zefir_admin"
                  className="w-full text-xs p-3 bg-[#182035] border border-[#2b3957] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Geçmiş Deneyimleriniz (Başka Sunucularda Görev Aldınız Mı? Detaylandırın)</label>
              <textarea
                name="experience"
                required
                rows={5}
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Daha önce çalışmış olduğunuz sunucuların adlarını, aldığınız görevleri ve ayrılma nedenlerinizi yazın..."
                className="w-full text-xs p-3 bg-[#182035] border border-[#2b3957] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Neden Sizi ZefirCraft Ekibine Kabul Etmeliyiz? Kendinizden Bahsedin</label>
              <textarea
                name="reason"
                required
                rows={5}
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Karakterinizi, sunucuya katabileceğiniz faydaları, aktiflik sürelerinizi ve hedeflerinizi detaylandırın..."
                className="w-full text-xs p-3 bg-[#182035] border border-[#2b3957] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-900 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-sky-500/10"
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-[#1b3d54] border-white border-t-transparent rounded-full"
                  />
                  <span>Başvuru Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Başvuru Formunu Gönder</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
