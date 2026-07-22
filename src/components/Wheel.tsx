import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gift, Coins, Trophy, Snowflake, HelpCircle, Check, AlertTriangle, 
  Sparkles, Play, Clock, Volume2, History, TrendingUp, ShieldCheck, Zap
} from "lucide-react";

interface WheelProps {
  user: { username: string; credits: number; lastWheelSpin?: string } | null;
  onUpdateCredits: (newCredits: number, lastWheelSpin?: string) => void;
}

interface Reward {
  type: string;
  value: number;
  label: string;
  color: string;
  bgHex: string;
  gradId: string;
  gradColors: { from: string; to: string };
  desc: string;
}

export default function Wheel({ user, onUpdateCredits }: WheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [winningReward, setWinningReward] = useState<Reward | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [pegClicked, setPegClicked] = useState(false);
  const [ledPulse, setLedPulse] = useState(false);

  // References to keep ticking state current
  const spinningRef = useRef(false);
  spinningRef.current = spinning;

  const rewards: Reward[] = [
    { 
      type: "credits", 
      value: 2, 
      label: "2 Kredi", 
      color: "text-rose-400", 
      bgHex: "#f43f5e",
      gradId: "grad-rose",
      gradColors: { from: "#f43f5e", to: "#be123c" },
      desc: "Başlangıç Şans Ödülü"
    },
    { 
      type: "credits", 
      value: 5, 
      label: "5 Kredi", 
      color: "text-sky-400", 
      bgHex: "#f59e0b",
      gradId: "grad-amber",
      gradColors: { from: "#f59e0b", to: "#b45309" },
      desc: "Yaygın Demir Paket"
    },
    { 
      type: "credits", 
      value: 10, 
      label: "10 Kredi", 
      color: "text-sky-400", 
      bgHex: "#eab308",
      gradId: "grad-yellow",
      gradColors: { from: "#eab308", to: "#854d0e" },
      desc: "Nadir Altın Paket"
    },
    { 
      type: "credits", 
      value: 20, 
      label: "20 Kredi", 
      color: "text-cyan-400", 
      bgHex: "#06b6d4",
      gradId: "grad-cyan",
      gradColors: { from: "#06b6d4", to: "#0e7490" },
      desc: "Epik Elmas Paket"
    },
    { 
      type: "credits", 
      value: 50, 
      label: "50 Kredi!", 
      color: "text-emerald-400", 
      bgHex: "#10b981",
      gradId: "grad-emerald",
      gradColors: { from: "#10b981", to: "#047857" },
      desc: "Efsanevi Zümrüt Paket"
    },
    { 
      type: "credits", 
      value: 100, 
      label: "100 Kredi!", 
      color: "text-purple-400", 
      bgHex: "#a855f7",
      gradId: "grad-purple",
      gradColors: { from: "#a855f7", to: "#6b21a8" },
      desc: "İlahi Netherite Paket!"
    },
  ];

  // Live wins feed loaded dynamically from the database
  const [recentWins, setRecentWins] = useState<{ id?: string; username: string; reward: string; createdAt: string | Date }[]>([]);

  const fetchWheelLogs = async () => {
    try {
      const res = await fetch("/api/lucky-wheel/logs");
      if (res.ok) {
        const data = await res.json();
        setRecentWins(data);
      }
    } catch (err) {
      console.error("Error fetching wheel logs:", err);
    }
  };

  useEffect(() => {
    fetchWheelLogs();
  }, []);

  const getPrizeTypeAndClass = (rewardStr: string) => {
    if (rewardStr.includes("100")) return { name: "İlahi", bg: "bg-purple-950/40 text-purple-400 border border-purple-500/20" };
    if (rewardStr.includes("50")) return { name: "Efsanevi", bg: "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" };
    if (rewardStr.includes("20")) return { name: "Epik", bg: "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20" };
    if (rewardStr.includes("10")) return { name: "Nadir", bg: "bg-sky-950/40 text-sky-400 border border-sky-500/20" };
    if (rewardStr.includes("5")) return { name: "Yaygın", bg: "bg-slate-800/60 text-slate-300 border border-slate-700/30" };
    return { name: "Başlangıç", bg: "bg-rose-950/20 text-rose-400 border border-rose-500/10" };
  };

  const getRelativeTime = (dateStr: string | Date) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Az önce";
    if (diffMins < 60) return `${diffMins} d. önce`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} s. önce`;
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  // LED lights blinking animation during stand-by vs spinning
  useEffect(() => {
    const ledInterval = setInterval(() => {
      setLedPulse(prev => !prev);
    }, spinning ? 150 : 800);
    return () => clearInterval(ledInterval);
  }, [spinning]);

  // Audio synthesizer for premium ticking feedback
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      // high-frequency short metallic tick
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context may be blocked by browser autoplay policy before user interaction
    }
  };

  // Calculate Turkish countdown for next free spin
  useEffect(() => {
    if (!user || !user.lastWheelSpin) {
      setTimeLeft(null);
      return;
    }

    const checkTime = () => {
      const now = new Date();
      const lastSpin = new Date(user.lastWheelSpin!);
      const diffMs = 24 * 60 * 60 * 1000 - (now.getTime() - lastSpin.getTime());

      if (diffMs <= 0) {
        setTimeLeft(null);
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft(`${hours} saat ${minutes} dakika ${seconds} saniye`);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [user, user?.lastWheelSpin]);

  const handleSpin = async () => {
    if (spinning || timeLeft) return;
    if (!user) {
      setError("Çarkıfelek oynamak için önce oyuncu hesabınızla oturum açmalısınız.");
      return;
    }

    setError(null);
    setWinningReward(null);
    setShowCelebration(false);
    setSpinning(true);

    try {
      const token = localStorage.getItem("koli_token") || localStorage.getItem("zefir_token");
      const res = await fetch("/api/lucky-wheel/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Çark çevrilirken bir hata oluştu.");
        setSpinning(false);
        return;
      }

      const wonIndex = data.rewardIndex;
      const finalReward = rewards[wonIndex];

      // Calculate rotation animation
      const segmentAngle = 360 / rewards.length;
      // center offset of segment
      const targetAngle = 360 - (wonIndex * segmentAngle) - (segmentAngle / 2);
      const extraSpins = 360 * 10; // 10 fast full rotations
      const newRotation = extraSpins + targetAngle;

      setRotation(newRotation);

      // Sound ticking feedback cascading system
      let currentTick = 0;
      const totalTicks = 45; // total ticks across 4 seconds
      const triggerTickCascade = () => {
        if (currentTick >= totalTicks || !spinningRef.current) return;

        playTickSound();
        
        // Trigger visual peg bounce
        setPegClicked(true);
        setTimeout(() => setPegClicked(false), 60);

        // Calculate a nice index update as it spins
        setActiveSegmentIndex(prev => {
          if (prev === null) return 0;
          return (prev + 1) % rewards.length;
        });

        currentTick++;
        const progress = currentTick / totalTicks;
        // Exponential deceleration curve
        const nextDelay = 45 + Math.pow(progress, 3) * 520;

        setTimeout(triggerTickCascade, nextDelay);
      };

      // Start the ticking sequence
      setTimeout(triggerTickCascade, 80);

      // Wait 4 seconds for physics animation to complete beautifully
      setTimeout(() => {
        setSpinning(false);
        setActiveSegmentIndex(wonIndex);
        setWinningReward(finalReward);
        setRewardMessage(data.message);
        setShowCelebration(true);
        onUpdateCredits(data.newCredits, data.lastWheelSpin);
        fetchWheelLogs();
      }, 4000);

    } catch (err) {
      setError("Sunucuya bağlanılamadı. Lütfen internetinizi kontrol edin.");
      setSpinning(false);
    }
  };

  const renderWheelSvg = () => {
    const numSegments = rewards.length;
    const radius = 175;
    const center = 200;
    const paths: React.ReactNode[] = [];

    for (let i = 0; i < numSegments; i++) {
      const angleStart = (i * 360) / numSegments;
      const angleEnd = ((i + 1) * 360) / numSegments;

      const radStart = (angleStart * Math.PI) / 180;
      const radEnd = (angleEnd * Math.PI) / 180;

      const x1 = center + radius * Math.cos(radStart);
      const y1 = center + radius * Math.sin(radStart);
      const x2 = center + radius * Math.cos(radEnd);
      const y2 = center + radius * Math.sin(radEnd);

      const labelAngle = angleStart + (angleEnd - angleStart) / 2;
      const labelRad = (labelAngle * Math.PI) / 180;
      const labelX = center + (radius * 0.62) * Math.cos(labelRad);
      const labelY = center + (radius * 0.62) * Math.sin(labelRad);

      const pathData = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 0 1 ${x2} ${y2}
        Z
      `;

      const isCurrentActive = activeSegmentIndex === i;

      paths.push(
        <g key={i} className="cursor-pointer group">
          <path
            d={pathData}
            fill={`url(#${rewards[i].gradId})`}
            opacity={isCurrentActive ? "1" : "0.92"}
            stroke="#121829"
            strokeWidth="4"
            className="transition-all duration-300 group-hover:opacity-100"
          />
          {/* Accent light rim inside wedge */}
          <path
            d={`M ${center} ${center} L ${center + (radius - 10) * Math.cos(radStart)} ${center + (radius - 10) * Math.sin(radStart)} A ${radius - 10} ${radius - 10} 0 0 1 ${center + (radius - 10) * Math.cos(radEnd)} ${center + (radius - 10) * Math.sin(radEnd)} Z`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity={isCurrentActive ? "0.25" : "0.08"}
            className="pointer-events-none"
          />
          <text
            x={labelX}
            y={labelY}
            fill="#ffffff"
            fontSize="13"
            fontWeight="950"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(${labelAngle + 180}, ${labelX}, ${labelY})`}
            className="select-none tracking-tight font-sans"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
          >
            {rewards[i].label}
          </text>
        </g>
      );
    }

    // Outer lights (LED dots) setup (24 LEDs around the rim)
    const leds: React.ReactNode[] = [];
    const numLeds = 24;
    for (let k = 0; k < numLeds; k++) {
      const ledAngle = (k * 360) / numLeds;
      const ledRad = (ledAngle * Math.PI) / 180;
      const ledX = center + 187 * Math.cos(ledRad);
      const ledY = center + 187 * Math.sin(ledRad);
      
      // blinking color sequence
      const isOdd = k % 2 === 0;
      const ledColor = ledPulse 
        ? (isOdd ? "#fbbf24" : "#ffffff") 
        : (isOdd ? "#ffffff" : "#fb7185");

      leds.push(
        <circle 
          key={k} 
          cx={ledX} 
          cy={ledY} 
          r={spinning ? "4.5" : "3.5"} 
          fill={ledColor} 
          className="transition-all duration-150"
          style={{
            filter: `drop-shadow(0 0 ${spinning ? "6px" : "3px"} ${ledColor})`
          }}
        />
      );
    }

    return (
      <svg width="100%" height="100%" viewBox="0 0 400 400" className="drop-shadow-[0_0_35px_rgba(59,130,246,0.25)] select-none">
        <defs>
          {/* Glowing Filter */}
          <filter id="glow-heavy" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Metallic golden stroke pattern */}
          <radialGradient id="gold-metal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          {/* Gradients for each wedge */}
          {rewards.map(rew => (
            <linearGradient key={rew.gradId} id={rew.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={rew.gradColors.from} />
              <stop offset="100%" stopColor={rew.gradColors.to} />
            </linearGradient>
          ))}
        </defs>

        {/* Outer Heavy Ring Shield (3D Style) */}
        <circle cx="200" cy="200" r="195" fill="#0d111d" stroke="url(#gold-metal)" strokeWidth="6" />
        <circle cx="200" cy="200" r="181" fill="#151b2e" stroke="#1e293b" strokeWidth="3" />
        
        {/* LED Lights around the inner golden band */}
        {leds}

        {/* Dynamic Spinning Group */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "200px 200px",
            transition: spinning ? "transform 4s cubic-bezier(0.15, 0.85, 0.35, 1)" : "none"
          }}
        >
          {paths}
        </g>

        {/* Outer Accent Rim Highlights */}
        <circle cx="200" cy="200" r="176" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.1" className="pointer-events-none" />

        {/* Center Golden Dial Anchor */}
        <circle cx="200" cy="200" r="34" fill="#0a0d16" stroke="url(#gold-metal)" strokeWidth="4" />
        <circle cx="200" cy="200" r="26" fill="url(#gold-metal)" />
        <circle cx="200" cy="200" r="16" fill="#0d111d" />
        
        {/* Inner core jewel */}
        <circle 
          cx="200" 
          cy="200" 
          r="8" 
          fill="#3b82f6" 
          style={{ filter: "drop-shadow(0 0 5px #3b82f6)" }}
          className={spinning ? "animate-pulse" : ""}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto px-4">
      
      {/* Header banner - High-end Glassmorphism Design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111625] via-[#141b2f] to-[#0c0f1a] text-white p-6 md:p-10 border border-[#2b3957] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3.5 relative z-10 text-center md:text-left max-w-xl">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md inline-flex items-center gap-1">
              <Zap className="w-3 h-3 text-sky-400" />
              Ücretsiz Çevrim
            </span>
            <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
              Her 24 Saatte Bir
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-sans">
            GÜNLÜK ŞANS ÇARKI
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            ZefirCraft dünyasında her gün tamamen ücretsiz bir çevrim hakkı kazanın! Garanti kredi ödüllerinden birini kaparak hemen mağazadan dilediğiniz VIP rütbelerini veya anahtarları kapın.
          </p>
        </div>
        
        {/* Balance Display */}
        <div className="flex items-center gap-3 bg-[#171e32] px-6 py-4 rounded-2xl border border-[#27355a] text-white shadow-xl shrink-0 relative z-10 hover:border-sky-500/30 transition-all">
          <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20 shadow-inner">
            <Coins className="w-6 h-6 text-sky-400" />
          </div>
          <div className="text-left">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Bakiyeniz</div>
            <div className="font-black text-lg text-sky-400 flex items-center gap-1.5 leading-none mt-1">
              {user ? `${user.credits}` : "Giriş Yok"} 
              <span className="text-[11px] font-bold text-slate-400">Kr.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Wheel Grid area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Dynamic high-fidelity Wheel canvas */}
        <div className="lg:col-span-7 bg-[#111625]/40 border border-[#1e293b] rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative shadow-2xl backdrop-blur-sm overflow-hidden min-h-[460px]">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
          
          {/* Sound Toggle controls */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? "bg-slate-800/80 border-[#27355a] text-cyan-400" 
                  : "bg-slate-900/40 border-[#1e293b] text-slate-500 hover:text-slate-400"
              }`}
              title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            >
              <Volume2 className={`w-4 h-4 ${soundEnabled ? "animate-pulse" : ""}`} />
            </button>
          </div>

          {/* Glowing Indicator Peg / Arrow Clicker */}
          <div className="absolute top-6 z-20 flex flex-col items-center">
            <motion.div 
              animate={{ 
                y: pegClicked ? [0, 4, -2, 0] : 0,
                rotate: pegClicked ? [0, -15, 8, 0] : 0
              }}
              transition={{ duration: 0.15 }}
              className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-sky-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)] cursor-pointer"
            />
            <div className="w-5 h-5 bg-white rounded-full border-[#1b3d54] border-sky-500 -mt-2 shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10" />
          </div>

          {/* Svg Wheel wrapper with floating shine effect */}
          <div className="w-full max-w-[350px] md:max-w-[410px] aspect-square relative mt-6 transform hover:scale-[1.01] transition-transform duration-500">
            {renderWheelSvg()}
          </div>
        </div>

        {/* Right Side: Actions & Information Center */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main spin console panel */}
          <div className="bg-[#111625]/90 border border-[#1e293b] rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Gift className="w-4 h-4 text-sky-400" />
                Şans Masası
              </h2>
              <h3 className="text-xl font-black text-white">ÇARKI ÇEVİR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Her dönüş bir kazançtır! Çarkımızda boş dilim bulunmamaktadır. Kazandığınız krediler anında site bakiyenize eklenerek ZefirCraft mağazasında dilediğiniz gibi kullanılabilir hale gelir.
              </p>
            </div>

            {/* Error messaging */}
            {error && (
              <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-2xl text-red-400 text-xs font-semibold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Spin button / Timeout count */}
            <div className="space-y-3.5 relative z-10">
              {timeLeft ? (
                <div className="w-full py-4.5 bg-[#171e32] border border-[#27355a] text-slate-400 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-inner">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Clock className="w-4 h-4 text-sky-400 animate-pulse" />
                    <span>SÜRE BEKLENİYOR</span>
                  </div>
                  <div className="text-sm font-black text-cyan-400 tracking-tight font-mono">{timeLeft}</div>
                </div>
              ) : (
                <button
                  disabled={spinning || !user}
                  onClick={handleSpin}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-900 text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-widest border-t border-white/20"
                >
                  {spinning ? (
                    <>
                      <Snowflake className="w-5 h-5 animate-spin text-cyan-300" />
                      <span>Çark Çevriliyor...</span>
                    </>
                  ) : !user ? (
                    <span>OTURUM AÇMALISINIZ</span>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-sky-400 fill-sky-400" />
                      <span>BEDAVA ÇEVİR!</span>
                    </>
                  )}
                </button>
              )}
              
              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mekanik %100 adildir. Çevrimler veritabanına loglanır.</span>
              </div>
            </div>

            {/* Premium Interactive Rewards List */}
            <div className="border-t border-[#1e293b]/80 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ÖDÜL HAVUZU VE ORANLAR</span>
                <span className="text-[10px] font-black text-cyan-400">HER DİLİM EŞİT ŞANS</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                {rewards.map((rew, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2.5 bg-[#171e32]/40 border border-[#27355a]/30 px-3.5 py-2.5 rounded-xl transition-all ${
                      activeSegmentIndex === index ? "ring-2 ring-blue-500/50 bg-[#171e32]" : ""
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full shrink-0 shadow-md" 
                      style={{ 
                        background: `linear-gradient(135deg, ${rew.gradColors.from}, ${rew.gradColors.to})`,
                        filter: `drop-shadow(0 0 3px ${rew.bgHex}dd)`
                      }}
                    />
                    <div className="truncate">
                      <div className="font-black text-[11px] text-white leading-none">{rew.label}</div>
                      <div className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">{rew.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Proof / Live wins side panel */}
          <div className="bg-[#111625]/50 border border-[#1e293b]/80 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-[#1b3d54] border-[#1e293b] pb-3">
              <History className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">CANLI KAZANANLAR AKIŞI</span>
            </div>

            <div className="space-y-3.5">
              {recentWins.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-bold text-xs">
                  Henüz kimse çarkı çevirmedi.
                </div>
              ) : (
                recentWins.map((win, i) => {
                  const prize = getPrizeTypeAndClass(win.reward);
                  return (
                    <div key={win.id || i} className="flex items-center justify-between text-xs bg-[#171e32]/30 border border-[#27355a]/10 p-2.5 rounded-xl hover:bg-[#171e32]/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://mc-heads.net/avatar/${win.username}/24`}
                          alt={win.username}
                          className="w-6 h-6 rounded border border-[#27355a]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-extrabold text-slate-200">{win.username}</div>
                          <div className="text-[9px] text-slate-500 font-bold">{getRelativeTime(win.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-cyan-400 text-[11px] block">{win.reward}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase block mt-0.5 text-center tracking-widest ${prize.bg}`}>
                          {prize.name}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Win Celebration Modal with elegant animations */}
      <AnimatePresence>
        {showCelebration && winningReward && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111625] rounded-3xl p-8 border border-sky-500/20 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-[#111625] pointer-events-none" />
              
              {/* Confetti decoration elements */}
              <div className="absolute top-4 left-4 text-sky-400 animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="absolute top-12 right-6 text-purple-400 animate-bounce">
                <Snowflake className="w-5 h-5" />
              </div>
              <div className="absolute bottom-16 left-6 text-cyan-400 animate-bounce">
                <TrendingUp className="w-5 h-5" />
              </div>

              <div className="w-24 h-24 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mx-auto border border-sky-500/30 shadow-inner animate-bounce relative">
                <Trophy className="w-12 h-12 text-sky-400" />
                <div className="absolute inset-0 rounded-full border-[#1b3d54] border-[#1b3d54]ashed border-sky-400 animate-spin opacity-45 duration-1000" />
              </div>

              <div className="space-y-2 relative z-10">
                <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 inline-block">
                  KAZANDINIZ!
                </span>
                
                <h3 className="text-3xl font-black mt-2" style={{ color: winningReward.bgHex }}>
                  +{winningReward.label}
                </h3>
                
                <p className="text-slate-300 text-xs leading-relaxed px-4 pt-2">
                  {rewardMessage}
                </p>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-widest border-t border-white/20 active:scale-98 relative z-10"
              >
                Harika! Hesabıma Aktar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
