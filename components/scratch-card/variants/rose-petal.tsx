"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScratchCard, type Coupon } from "../scratch-card";
import { useScratch } from "@/hooks/use-scratch";

interface RosePetalScratchProps {
  coupon: Coupon;
  isLocked?: boolean;
  unlockDate?: Date | null;
  isScratched?: boolean;
  onScratchComplete?: () => void;
}

interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  vx: number;
  vy: number;
  vr: number;
}

export function RosePetalScratch({
  coupon,
  isLocked = false,
  unlockDate = null,
  isScratched = false,
  onScratchComplete,
}: RosePetalScratchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [petals, setPetals] = useState<Petal[]>([]);
  const petalIdRef = useRef(0);
  const lastScratchPos = useRef<{ x: number; y: number } | null>(null);

  const { canvasRef, isComplete, progress } = useScratch({
    threshold: 0.5,
    brushSize: 50,
    disabled: isLocked || isScratched,
    onComplete: () => {
      // Burst of petals on complete
      const canvas = canvasRef.current;
      if (canvas) {
        const newPetals: Petal[] = [];
        for (let i = 0; i < 30; i++) {
          newPetals.push(createPetal(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            true
          ));
        }
        setPetals((prev) => [...prev, ...newPetals]);
      }
      onScratchComplete?.();
    },
  });

  const showComplete = isComplete || isScratched;

  const createPetal = useCallback((x: number, y: number, burst = false): Petal => {
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? Math.random() * 6 + 3 : Math.random() * 2 + 1;
    return {
      id: petalIdRef.current++,
      x,
      y,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      opacity: 1,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + (burst ? -3 : 1),
      vr: (Math.random() - 0.5) * 10,
    };
  }, []);

  // Initialize scratch canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const initCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(initCanvas);
        return;
      }

      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Deep rose/magenta gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#3d2645");
      gradient.addColorStop(0.5, "#5c3d5e");
      gradient.addColorStop(1, "#4a3050");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add heart pattern watermark
      ctx.fillStyle = "rgba(244,167,185,0.15)";
      ctx.font = "20px sans-serif";
      for (let x = 20; x < canvas.width; x += 50) {
        for (let y = 30; y < canvas.height; y += 50) {
          ctx.fillText("♥", x, y);
        }
      }

    };

    initCanvas();
  }, [canvasRef]);

  // Track scratching for petals
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      if (e.buttons !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastScratchPos.current) {
        const dx = x - lastScratchPos.current.x;
        const dy = y - lastScratchPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) {
          setPetals((prev) => [...prev, createPetal(x, y)]);
          lastScratchPos.current = { x, y };
        }
      } else {
        lastScratchPos.current = { x, y };
      }
    };

    const handleUp = () => {
      lastScratchPos.current = null;
    };

    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointerleave", handleUp);

    return () => {
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointerleave", handleUp);
    };
  }, [canvasRef, createPetal]);

  // Animate petals
  useEffect(() => {
    const interval = setInterval(() => {
      setPetals((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            rotation: p.rotation + p.vr,
            opacity: p.opacity - 0.015,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScratchCard coupon={coupon} variant="Rose Petal" isComplete={showComplete} isLocked={isLocked} unlockDate={unlockDate}>
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-pointer"
          style={{
            opacity: showComplete ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        />
        {/* Petals */}
        {petals.map((petal) => (
          <svg
            key={petal.id}
            className="absolute pointer-events-none"
            style={{
              left: petal.x - 15,
              top: petal.y - 15,
              transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
              opacity: petal.opacity,
            }}
            width="30"
            height="30"
            viewBox="0 0 30 30"
          >
            <path
              d="M15 2 Q20 8, 25 15 Q20 22, 15 28 Q10 22, 5 15 Q10 8, 15 2"
              fill="url(#petalGradient)"
            />
            <defs>
              <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB6C1" />
                <stop offset="100%" stopColor="#FF69B4" />
              </linearGradient>
            </defs>
          </svg>
        ))}
        {/* Pink mist overlay */}
        <div
          className="absolute inset-0 pointer-events-none bg-pink-200/20 backdrop-blur-[1px]"
          style={{
            opacity: isComplete ? 0 : progress * 0.3,
            transition: "opacity 0.3s",
          }}
        />
      </div>
    </ScratchCard>
  );
}
