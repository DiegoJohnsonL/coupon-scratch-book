"use client";

import { cn } from "@/lib/utils";

interface Coupon {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

interface ScratchCardProps {
  coupon: Coupon;
  variant: string;
  isComplete: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ScratchCard({
  coupon,
  variant,
  isComplete,
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
      {/* Outer card with perforated edge effect */}
      <div className="absolute inset-0 rounded-lg overflow-hidden shadow-lg"
        style={{
          background: "linear-gradient(135deg, #fff9f0 0%, #fff5eb 50%, #fff0e6 100%)",
        }}
      >
        {/* Perforated left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col items-center justify-around py-4">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50"
              style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}
            />
          ))}
        </div>

        {/* Inner coupon content */}
        <div className="absolute left-6 right-0 top-0 bottom-0">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300" />

          {/* Revealed content layer */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center p-6 pt-8 transition-all duration-500",
              isComplete && "scale-[1.02]"
            )}
          >
            {/* Coupon badge */}
            <div className="absolute top-4 right-4">
              <div className="px-2 py-1 bg-rose-100 border border-rose-200 rounded text-xs text-rose-600 font-medium">
                ✨ Special
              </div>
            </div>

            {/* Main content */}
            <span className="text-6xl mb-3 drop-shadow-sm">{coupon.emoji}</span>
            <h3 className="text-xl font-serif font-semibold text-gray-800 text-center mb-2 leading-tight">
              {coupon.title}
            </h3>
            <p className="text-sm text-gray-500 text-center italic px-4">
              {coupon.description}
            </p>

            {/* Decorative divider */}
            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-px bg-rose-200" />
              <span className="text-rose-300 text-sm">♥</span>
              <div className="w-8 h-px bg-rose-200" />
            </div>

            {/* Redeem text */}
            <p className="mt-3 text-xs text-gray-400 uppercase tracking-wider">
              {isComplete ? "Ready to Redeem" : "Scratch to Reveal"}
            </p>

            {/* Completion glow effect */}
            {isComplete && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-100/30 to-transparent animate-pulse rounded-lg" />
              </div>
            )}
          </div>

          {/* Decorative bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300" />
        </div>
      </div>

      {/* Scratch layer - positioned over inner content */}
      <div className="absolute left-6 right-0 top-2 bottom-2 overflow-hidden rounded-r-lg">
        {children}
      </div>
    </div>
  );
}

export type { Coupon };
