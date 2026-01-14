"use client";

import { useState, useEffect, useCallback } from "react";
import type { Coupon } from "./scratch-card";
import {
  MetallicScratch,
  RosePetalScratch,
  ConstellationScratch,
  GoldFoilScratch,
  SparklerScratch,
} from "./variants";

const STORAGE_KEY = "anniversary-scratch-progress";

interface LockableScratchCardProps {
  coupon: Coupon;
  variantIndex: number;
}

const variants = [
  MetallicScratch,
  RosePetalScratch,
  ConstellationScratch,
  GoldFoilScratch,
  SparklerScratch,
];

function getStoredProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveProgress(id: string) {
  if (typeof window === "undefined") return;
  try {
    const progress = getStoredProgress();
    progress[id] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors
  }
}

export function LockableScratchCard({ coupon, variantIndex }: LockableScratchCardProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [unlockDate, setUnlockDate] = useState<Date | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [, setTick] = useState(0);

  const Component = variants[variantIndex % variants.length];

  // Check lock status and hydrate from localStorage
  useEffect(() => {
    const checkLockStatus = () => {
      if (coupon.unlockTime) {
        const unlock = new Date(coupon.unlockTime);
        setUnlockDate(unlock);
        const now = new Date();
        setIsLocked(now < unlock);
      } else {
        setIsLocked(false);
      }

      // Check if already scratched
      const progress = getStoredProgress();
      if (progress[coupon.id]) {
        setIsScratched(true);
      }

      setIsHydrated(true);
    };

    checkLockStatus();

    // Update lock status every minute
    const interval = setInterval(() => {
      checkLockStatus();
      setTick((t) => t + 1); // Force re-render to update countdown
    }, 60000);

    return () => clearInterval(interval);
  }, [coupon.id, coupon.unlockTime]);

  // Handle scratch complete
  const handleScratchComplete = useCallback(() => {
    if (!isScratched) {
      setIsScratched(true);
      saveProgress(coupon.id);
    }
  }, [coupon.id, isScratched]);

  if (!isHydrated) {
    // Return placeholder to avoid hydration mismatch
    return (
      <div className="w-full h-full rounded-xl bg-[#162035] animate-pulse" />
    );
  }

  return (
    <Component
      coupon={coupon}
      isLocked={isLocked}
      unlockDate={unlockDate}
      isScratched={isScratched}
      onScratchComplete={handleScratchComplete}
    />
  );
}
