"use client";

import { useEffect, useRef, useCallback } from "react";
import { ScratchCard, type Coupon } from "../scratch-card";
import { useScratch } from "@/hooks/use-scratch";

interface MetallicScratchProps {
  coupon: Coupon;
  isLocked?: boolean;
  unlockDate?: Date | null;
  isScratched?: boolean;
  onScratchComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export function MetallicScratch({
  coupon,
  isLocked = false,
  unlockDate = null,
  isScratched = false,
  onScratchComplete,
}: MetallicScratchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrame = useRef<number | undefined>(undefined);
  const lastScratchPos = useRef<{ x: number; y: number } | null>(null);

  const { canvasRef, isComplete, progress } = useScratch({
    threshold: 0.5,
    brushSize: 45,
    disabled: isLocked || isScratched,
    onComplete: () => {
      // Burst of particles on complete
      for (let i = 0; i < 50; i++) {
        const canvas = canvasRef.current;
        if (canvas) {
          particles.current.push(createParticle(
            canvas.width / 2,
            canvas.height / 2,
            true
          ));
        }
      }
      onScratchComplete?.();
    },
  });

  const showComplete = isComplete || isScratched;

  const createParticle = useCallback((x: number, y: number, burst = false): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? Math.random() * 8 + 4 : Math.random() * 3 + 1;
    const colors = ["#8b7ba8", "#a8a4ce", "#f4a7b9", "#ffffff", "#6b5b7a"];
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (burst ? 2 : 0),
      size: Math.random() * 3 + 1,
      alpha: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }, []);

  const emitParticles = useCallback((x: number, y: number) => {
    for (let i = 0; i < 3; i++) {
      particles.current.push(createParticle(x, y));
    }
  }, [createParticle]);

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

      // Create metallic gradient - deep blue/purple theme
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#2d3a5c");
      gradient.addColorStop(0.3, "#4a5580");
      gradient.addColorStop(0.5, "#6b5b7a");
      gradient.addColorStop(0.7, "#4a5580");
      gradient.addColorStop(1, "#2d3a5c");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add noise texture
      if (canvas.width > 0 && canvas.height > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 30;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
      }

    };

    initCanvas();
  }, [canvasRef]);

  // Initialize particle canvas
  useEffect(() => {
    const particleCanvas = particleCanvasRef.current;
    const container = containerRef.current;
    if (!particleCanvas || !container) return;

    const rect = container.getBoundingClientRect();
    particleCanvas.width = rect.width;
    particleCanvas.height = rect.height;
  }, []);

  // Track scratching for particles
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
        if (dist > 5) {
          emitParticles(x, y);
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
  }, [canvasRef, emitParticles]);

  // Animate particles
  useEffect(() => {
    const particleCanvas = particleCanvasRef.current;
    if (!particleCanvas) return;
    const ctx = particleCanvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

      particles.current = particles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= 0.02;

        if (p.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <ScratchCard coupon={coupon} variant="Metallic" isComplete={showComplete} isLocked={isLocked} unlockDate={unlockDate}>
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-pointer"
          style={{
            opacity: showComplete ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        />
        <canvas
          ref={particleCanvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      </div>
    </ScratchCard>
  );
}
