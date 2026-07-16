"use client";

import { ShoppingCart, Sparkles } from "lucide-react";

interface SlotProps {
  name: string;
  priceCredits: number;
  color: string;
  perks?: string[];
  featured?: boolean;
  imageBase64?: string | null;
  description?: string;
  onPurchase?: () => void;
  disabled?: boolean;
}

export function Slot({
  name,
  priceCredits,
  color,
  perks = [],
  featured = false,
  imageBase64,
  description,
  onPurchase,
  disabled = false,
}: SlotProps) {
  return (
    <div className="card-surface p-5 relative group overflow-hidden">
      {/* Featured glow */}
      {featured && (
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ background: color }} />
      )}

      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-frost-400 mb-2">
                <Sparkles size={10} className="text-ice-300" />
                En Popüler
              </span>
            )}
            <h3 className="font-display font-bold text-lg text-frost-100">{name}</h3>
          </div>
          {imageBase64 && (
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageBase64}
              alt={name}
              className="w-12 h-12 rounded-lg object-cover border border-ice-300/10"
            />
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-frost-500 text-xs leading-relaxed mb-4">{description}</p>
        )}

        {/* Perks */}
        {perks.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-center gap-2 text-frost-400 text-xs">
                <span className="w-1 h-1 rounded-full" style={{ background: color }} />
                {perk}
              </li>
            ))}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-ice-300/5">
          <div>
            <span className="text-frost-600 text-[10px] uppercase tracking-wider font-medium">Fiyat</span>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl" style={{ color }}>
                {priceCredits}
              </span>
              <span className="text-frost-500 text-xs font-medium">kredi</span>
            </div>
          </div>
          <button
            onClick={onPurchase}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: disabled ? "rgba(100,116,139,0.1)" : `${color}15`,
              color: disabled ? "#64748B" : color,
              border: `1px solid ${disabled ? "rgba(100,116,139,0.1)" : `${color}25`}`,
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = `${color}25`;
                e.currentTarget.style.borderColor = `${color}40`;
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = `${color}15`;
                e.currentTarget.style.borderColor = `${color}25`;
              }
            }}
          >
            <ShoppingCart size={14} />
            Satın Al
          </button>
        </div>
      </div>
    </div>
  );
}
