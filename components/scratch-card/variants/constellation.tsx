"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScratchCard, type Coupon } from "../scratch-card";
import { useScratch } from "@/hooks/use-scratch";

interface ConstellationScratchProps {
  coupon: Coupon;
  isLocked?: boolean;
  unlockDate?: Date | null;
  isScratched?: boolean;
  onScratchComplete?: () => void;
}

interface Star {
  x: number;
  y: number;
  size: number;
  revealed: boolean;
  twinklePhase: number;
}

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  length: number;
  angle: number;
  opacity: number;
}

export function ConstellationScratch({
  coupon,
  isLocked = false,
  unlockDate = null,
  isScratched = false,
  onScratchComplete,
}: ConstellationScratchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>([]);
  const [revealedStars, setRevealedStars] = useState<Set<number>>(new Set());
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const shootingStarId = useRef(0);
  const lastScratchPos = useRef<{ x: number; y: number } | null>(null);

  const { canvasRef, isComplete, progress } = useScratch({
    threshold: 0.5,
    brushSize: 40,
    disabled: isLocked || isScratched,
    onComplete: () => {
      // Reveal all stars on complete
      setRevealedStars(new Set(starsRef.current.map((_, i) => i)));
      onScratchComplete?.();
    },
  });

  const showComplete = isComplete || isScratched;

  // Initialize stars and scratch canvas
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

      // Initialize stars
      starsRef.current = Array.from({ length: 40 }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * 3 + 1,
        revealed: false,
        twinklePhase: Math.random() * Math.PI * 2,
      }));

      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Night sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0F0F23");
      gradient.addColorStop(0.5, "#1A1A3E");
      gradient.addColorStop(1, "#2D1B4E");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle stars to scratch surface
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
        ctx.fill();
      }

    };

    initCanvas();
  }, [canvasRef, isLocked]);

  // Track scratching for shooting stars and star reveals
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      if (e.buttons !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if we revealed any stars
      starsRef.current.forEach((star, index) => {
        const dx = x - star.x;
        const dy = y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) {
          setRevealedStars((prev) => new Set([...prev, index]));
        }
      });

      // Create shooting star trail
      if (lastScratchPos.current) {
        const dx = x - lastScratchPos.current.x;
        const dy = y - lastScratchPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 15) {
          const angle = Math.atan2(dy, dx);
          setShootingStars((prev) => [
            ...prev,
            {
              id: shootingStarId.current++,
              x,
              y,
              length: Math.min(dist, 40),
              angle,
              opacity: 1,
            },
          ]);
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
  }, [canvasRef]);

  // Animate shooting stars
  useEffect(() => {
    const interval = setInterval(() => {
      setShootingStars((prev) =>
        prev
          .map((s) => ({ ...s, opacity: s.opacity - 0.05 }))
          .filter((s) => s.opacity > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Get constellation lines between revealed stars
  const getConstellationLines = useCallback(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const revealedIndices = Array.from(revealedStars);

    for (let i = 0; i < revealedIndices.length; i++) {
      for (let j = i + 1; j < revealedIndices.length; j++) {
        const star1 = starsRef.current[revealedIndices[i]];
        const star2 = starsRef.current[revealedIndices[j]];
        if (!star1 || !star2) continue;

        const dist = Math.sqrt(
          Math.pow(star1.x - star2.x, 2) + Math.pow(star1.y - star2.y, 2)
        );
        if (dist < 80) {
          lines.push({ x1: star1.x, y1: star1.y, x2: star2.x, y2: star2.y });
        }
      }
    }
    return lines;
  }, [revealedStars]);

  return (
    <ScratchCard coupon={coupon} variant="Constellation" isComplete={showComplete} isLocked={isLocked} unlockDate={unlockDate}>
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-pointer"
          style={{
            opacity: showComplete ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        />

        {/* Stars layer */}
        <svg className="absolute inset-0 pointer-events-none">
          {/* Constellation lines */}
          {getConstellationLines().map((line, i) => (
            <line
              key={`line-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#FFD700"
              strokeWidth="1"
              opacity="0.6"
            />
          ))}

          {/* Stars */}
          {starsRef.current.map((star, index) => (
            <circle
              key={index}
              cx={star.x}
              cy={star.y}
              r={star.size + (revealedStars.has(index) ? 2 : 0)}
              fill={revealedStars.has(index) ? "#FFD700" : "white"}
              opacity={revealedStars.has(index) ? 1 : 0.3}
              className="transition-all duration-300"
            >
              {revealedStars.has(index) && (
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}

          {/* Shooting stars */}
          {shootingStars.map((star) => (
            <line
              key={star.id}
              x1={star.x}
              y1={star.y}
              x2={star.x - Math.cos(star.angle) * star.length}
              y2={star.y - Math.sin(star.angle) * star.length}
              stroke="white"
              strokeWidth="2"
              opacity={star.opacity}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Aurora effect on complete */}
        {isComplete && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 animate-pulse"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,255,128,0.2) 0%, rgba(0,128,255,0.2) 50%, rgba(128,0,255,0.2) 100%)",
              }}
            />
          </div>
        )}
      </div>
    </ScratchCard>
  );
}
