"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BookRevealProps {
  children: React.ReactNode;
  onboardingTexts?: { title: string; subtitle?: string }[];
}

// Pre-computed star positions to avoid hydration mismatch
const STAR_POSITIONS = [
  { left: 12, top: 8 }, { left: 87, top: 23 }, { left: 45, top: 67 }, { left: 23, top: 91 },
  { left: 78, top: 12 }, { left: 34, top: 45 }, { left: 91, top: 78 }, { left: 56, top: 34 },
  { left: 8, top: 56 }, { left: 67, top: 89 }, { left: 43, top: 15 }, { left: 19, top: 72 },
  { left: 82, top: 41 }, { left: 51, top: 93 }, { left: 96, top: 29 }, { left: 28, top: 61 },
  { left: 74, top: 84 }, { left: 15, top: 38 }, { left: 63, top: 52 }, { left: 39, top: 19 },
  { left: 85, top: 67 }, { left: 7, top: 82 }, { left: 52, top: 7 }, { left: 71, top: 48 },
  { left: 31, top: 76 }, { left: 94, top: 15 }, { left: 18, top: 94 }, { left: 59, top: 28 },
  { left: 3, top: 43 }, { left: 88, top: 59 }, { left: 47, top: 81 }, { left: 25, top: 22 },
  { left: 69, top: 36 }, { left: 11, top: 65 }, { left: 79, top: 92 }, { left: 36, top: 54 },
  { left: 92, top: 4 }, { left: 55, top: 71 }, { left: 21, top: 11 }, { left: 64, top: 87 },
  { left: 41, top: 39 }, { left: 97, top: 51 }, { left: 14, top: 27 }, { left: 76, top: 73 },
  { left: 33, top: 96 }, { left: 58, top: 18 }, { left: 84, top: 33 }, { left: 6, top: 69 },
  { left: 49, top: 58 }, { left: 72, top: 5 },
];

const defaultOnboarding = [
  {
    title: "Hey babe 💕",
    subtitle: "Your favorite Peruvian here",
  },
  {
    title: "3 years since that first conversation",
    subtitle: "2 years since you became mine",
  },
  {
    title: "I couldn't buy you the moon",
    subtitle: "So I made this instead",
  },
  {
    title: "This is a book of virtual coupons",
    subtitle: "Things I want to give you, anytime you want",
  },
  {
    title: "Ready?",
    subtitle: "Open it, love 💝",
  },
];

export function BookReveal({
  children,
  onboardingTexts = defaultOnboarding,
}: BookRevealProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isBookOpening, setIsBookOpening] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const isOnboarding = currentStep < onboardingTexts.length;
  const isLastStep = currentStep === onboardingTexts.length - 1;

  // Lock body scroll during onboarding
  useEffect(() => {
    if (!showContent) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [showContent]);

  const handleClick = () => {
    if (isLastStep) {
      // Start book opening animation
      setIsBookOpening(true);
      setCurrentStep(currentStep + 1);

      // Show content after book opens
      setTimeout(() => {
        setShowContent(true);
      }, 1800);
    } else if (isOnboarding) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
      }}
    >
      {/* Stars background for main content */}
      {showContent && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {STAR_POSITIONS.map((pos, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                opacity: 0.3 + (i % 5) * 0.1,
                animationDelay: `${(i % 10) * 0.2}s`,
                animationDuration: `${2 + (i % 5) * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
      <AnimatePresence>
        {!showContent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer touch-none"
            onClick={handleClick}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
              overscrollBehavior: "none",
            }}
          >
            {/* Stars background */}
            <div className="absolute inset-0 overflow-hidden">
              {STAR_POSITIONS.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${pos.left}%`,
                    top: `${pos.top}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + (i % 5) * 0.5,
                    repeat: Infinity,
                    delay: (i % 10) * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Onboarding text */}
            {isOnboarding && !isBookOpening && (
              <div className="relative z-10 max-w-md px-8 text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Main text */}
                    <motion.h1
                      className="text-3xl md:text-4xl font-serif text-white mb-4"
                      style={{ textShadow: "0 2px 20px rgba(255,182,193,0.5)" }}
                    >
                      {onboardingTexts[currentStep].title}
                    </motion.h1>

                    {/* Subtitle */}
                    {onboardingTexts[currentStep].subtitle && (
                      <motion.p
                        className="text-lg text-rose-200/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {onboardingTexts[currentStep].subtitle}
                      </motion.p>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-12">
                  {onboardingTexts.map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentStep ? "bg-rose-400" : "bg-white/30"
                      }`}
                      animate={{
                        scale: i === currentStep ? 1.2 : 1,
                      }}
                    />
                  ))}
                </div>

                {/* Tap hint */}
                <motion.p
                  className="absolute -bottom-16 left-0 right-0 text-sm text-white/40"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isLastStep ? "Tap to open" : "Tap to continue"}
                </motion.p>
              </div>
            )}

            {/* Book opening animation */}
            {isBookOpening && (
              <div
                className="relative flex items-center justify-center"
                style={{ perspective: "1500px", width: "280px", height: "380px" }}
              >
                {/* Book back */}
                <motion.div
                  className="absolute inset-0 rounded-r-lg overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #DC143C 0%, #B22222 50%, #8B0000 100%)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Inner page */}
                  <div className="absolute inset-3 bg-amber-50 rounded flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-rose-500 font-serif text-xl mb-2">Your Coupons</p>
                      <p className="text-gray-500 text-sm">Scratch to reveal!</p>
                    </div>
                  </div>
                </motion.div>

                {/* Book front cover (flips open) */}
                <motion.div
                  className="absolute inset-0 rounded-l-lg overflow-hidden origin-right"
                  style={{
                    background: "linear-gradient(135deg, #DC143C 0%, #B22222 50%, #8B0000 100%)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                  initial={{ rotateY: 0, scale: 0.8, opacity: 0 }}
                  animate={{ rotateY: -170, scale: 1, opacity: 1 }}
                  transition={{
                    rotateY: { duration: 1.2, delay: 0.3, ease: [0.645, 0.045, 0.355, 1] },
                    scale: { duration: 0.3 },
                    opacity: { duration: 0.3 },
                  }}
                >
                  {/* Gold border */}
                  <div className="absolute inset-3 border-4 border-yellow-500/60 rounded-lg" />

                  {/* Cover content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <span className="text-4xl mb-4">💝</span>
                    <h2 className="text-xl font-serif text-yellow-200 text-center">
                      Coupon Book
                    </h2>
                    <p className="text-sm text-yellow-100/70 mt-2">
                      For My Love
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
