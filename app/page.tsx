import couponsData from "@/data/coupons.json";
import {
  MetallicScratch,
  RosePetalScratch,
  ConstellationScratch,
  GoldFoilScratch,
  SparklerScratch,
} from "@/components/scratch-card/variants";
import { BookReveal } from "@/components/book-reveal";

const variants = [
  { Component: MetallicScratch },
  { Component: RosePetalScratch },
  { Component: ConstellationScratch },
  { Component: GoldFoilScratch },
  { Component: SparklerScratch },
];

export default function Home() {
  const coupons = couponsData.coupons;

  return (
    <BookReveal>
      {/* Gift header */}
      <header className="py-10 text-center relative z-10">
        <div className="inline-block mb-4">
          <span className="text-5xl">💝</span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-serif text-white mb-2"
          style={{ textShadow: "0 2px 20px rgba(255,182,193,0.5)" }}
        >
          Your Coupons
        </h1>
        <p className="text-rose-200/70 italic">
          Scratch each card to reveal your surprise
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-rose-400 text-sm">✦</span>
          ))}
        </div>
      </header>

      <main className="container mx-auto px-4 pb-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-5xl mx-auto">
          {coupons.map((coupon, index) => {
            const { Component } = variants[index % variants.length];
            return (
              <div key={coupon.id} className="w-[280px] h-[380px]">
                <Component coupon={coupon} />
              </div>
            );
          })}
        </div>
      </main>

      <footer className="py-8 text-center relative z-10">
        <p className="text-white/40 text-sm">
          Made with 💕 for our anniversary
        </p>
      </footer>
    </BookReveal>
  );
}
