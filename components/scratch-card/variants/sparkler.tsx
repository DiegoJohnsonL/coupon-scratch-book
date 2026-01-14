"use client";

import { useEffect, useRef } from "react";
import { ScratchCard, type Coupon } from "../scratch-card";
import { useScratch } from "@/hooks/use-scratch";

interface SparklerScratchProps {
  coupon: Coupon;
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function SparklerScratch({ coupon }: SparklerScratchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const lastScratchPos = useRef<{ x: number; y: number } | null>(null);
  const animationFrame = useRef<number>();

  const { canvasRef, isComplete, progress } = useScratch({
    threshold: 0.5,
    brushSize: 30,
    onComplete: () => {
      // Final firework burst
      const canvas = canvasRef.current;
      if (canvas) {
        for (let i = 0; i < 100; i++) {
          const angle = (i / 100) * Math.PI * 2;
          const speed = Math.random() * 8 + 4;
          sparksRef.current.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            maxLife: 0.5 + Math.random() * 0.5,
          });
        }
      }
    },
  });

  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const trailCanvas = trailCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !trailCanvas || !container) return;

    const initCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(initCanvas);
        return;
      }

      canvas.width = rect.width;
      canvas.height = rect.height;
      trailCanvas.width = rect.width;
      trailCanvas.height = rect.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark night sky
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0a0a1a");
      gradient.addColorStop(1, "#1a1a2e");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some stars
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 1,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DRAW WITH LIGHT", canvas.width / 2, canvas.height / 2);
    };

    initCanvas();
  }, [canvasRef]);

  // Track scratching for sparkler trail
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      if (e.buttons !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Add to trail
      trailRef.current.push({ x, y, age: 0 });

      // Emit sparks
      if (lastScratchPos.current) {
        const dx = x - lastScratchPos.current.x;
        const dy = y - lastScratchPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
          // Emit sparks perpendicular to movement
          const perpX = -dy / dist;
          const perpY = dx / dist;

          for (let i = 0; i < 2; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const speed = Math.random() * 3 + 1;
            sparksRef.current.push({
              x,
              y,
              vx: perpX * side * speed + (Math.random() - 0.5) * 2,
              vy: perpY * side * speed + (Math.random() - 0.5) * 2,
              life: 1,
              maxLife: 0.3 + Math.random() * 0.3,
            });
          }
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
    canvas.addEventListener("pointerdown", handleMove);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointerleave", handleUp);

    return () => {
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerdown", handleMove);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointerleave", handleUp);
    };
  }, [canvasRef]);

  // Animation loop
  useEffect(() => {
    const trailCanvas = trailCanvasRef.current;
    if (!trailCanvas) return;
    const ctx = trailCanvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

      // Update and render trail points
      trailRef.current = trailRef.current
        .map((p) => ({ ...p, age: p.age + 0.02 }))
        .filter((p) => p.age < 1);

      trailRef.current.forEach((point) => {
        const alpha = 1 - point.age;
        const size = (1 - point.age) * 8;

        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFD700";

        // Core
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(255, 215, 0, ${alpha * 0.8})`);
        gradient.addColorStop(0.7, `rgba(255, 140, 0, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      ctx.shadowBlur = 0;

      // Update and render sparks
      sparksRef.current = sparksRef.current
        .map((s) => ({
          ...s,
          x: s.x + s.vx,
          y: s.y + s.vy,
          vy: s.vy + 0.1,
          life: s.life - 0.03 / s.maxLife,
        }))
        .filter((s) => s.life > 0);

      sparksRef.current.forEach((spark) => {
        const alpha = spark.life;
        const color = `rgba(255, ${Math.floor(200 * spark.life)}, ${Math.floor(100 * spark.life)}, ${alpha})`;

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      animationFrame.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <ScratchCard coupon={coupon} variant="Sparkler" isComplete={isComplete}>
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-crosshair"
          style={{
            opacity: isComplete ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        />
        <canvas
          ref={trailCanvasRef}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Firework celebration on complete */}
        {isComplete && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-6xl animate-bounce">✨</div>
          </div>
        )}
      </div>
    </ScratchCard>
  );
}
