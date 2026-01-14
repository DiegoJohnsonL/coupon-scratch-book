"use client";

import { cn } from "@/lib/utils";

interface Coupon {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockTime?: string;
}

interface ScratchCardProps {
  coupon: Coupon;
  variant: string;
  isComplete: boolean;
  isLocked?: boolean;
  unlockDate?: Date | null;
  children: React.ReactNode;
  className?: string;
}

function formatUnlockTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) return "Now";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ScratchCard({
  coupon,
  variant,
  isComplete,
  isLocked = false,
  unlockDate = null,
  children,
  className,
}: ScratchCardProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full",
        className
      )}
    >
      {/* Outer card with dark theme */}
      <div
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1e2a4a 0%, #162035 50%, #1a2744 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Subtle star dots on card */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${5 + (i * 13) % 90}%`,
                opacity: 0.3 + (i % 3) * 0.2,
              }}
            />
          ))}
        </div>

        {/* Decorative border glow */}
        <div className="absolute inset-0 rounded-xl border border-rose-400/20" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />

        {/* Revealed content layer */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500",
            isComplete && "scale-[1.02]"
          )}
        >
          {/* Coupon badge */}
          <div className="absolute top-4 right-4">
            <div className="px-2 py-1 bg-rose-500/20 border border-rose-400/30 rounded text-xs text-rose-300 font-medium">
              ✨ Special
            </div>
          </div>

          {/* Main content */}
          <span className="text-6xl mb-3 drop-shadow-lg">{coupon.emoji}</span>
          <h3
            className="text-xl font-serif font-semibold text-white text-center mb-2 leading-tight"
            style={{ textShadow: "0 2px 10px rgba(255,182,193,0.3)" }}
          >
            {coupon.title}
          </h3>
          <p className="text-sm text-rose-200/70 text-center italic px-4">
            {coupon.description}
          </p>

          {/* Decorative divider */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-8 h-px bg-rose-400/30" />
            <span className="text-rose-400/60 text-sm">♥</span>
            <div className="w-8 h-px bg-rose-400/30" />
          </div>

          {/* Redeem text */}
          <p className="mt-3 text-xs text-white/40 uppercase tracking-wider">
            {isComplete ? "Ready to Redeem" : "Scratch to Reveal"}
          </p>

          {/* Completion glow effect */}
          {isComplete && (
            <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Scratch layer */}
      {!isLocked && (
        <div className="absolute inset-1 overflow-hidden rounded-lg">
          {children}
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div
          className="absolute inset-0 rounded-xl overflow-hidden flex flex-col items-center justify-center z-10"
          style={{
            background: "linear-gradient(145deg, rgba(20,25,45,0.97) 0%, rgba(15,20,35,0.98) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Lock icon */}
          <div className="text-5xl mb-4 opacity-80">🔒</div>

          {/* Unlock info */}
          <p className="text-white/60 text-sm mb-2">Unlocks in</p>
          <p className="text-rose-300 text-2xl font-semibold mb-2">
            {unlockDate ? formatUnlockTime(unlockDate) : "???"}
          </p>
          <p className="text-white/40 text-xs">
            {unlockDate ? formatUnlockDate(unlockDate) : ""}
          </p>

          {/* Decorative stars */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${15 + (i * 11) % 70}%`,
                  top: `${10 + (i * 17) % 80}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type { Coupon };
