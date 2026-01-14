"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScratchCard, type Coupon } from "../scratch-card";
import { useScratch } from "@/hooks/use-scratch";

interface GoldFoilScratchProps {
  coupon: Coupon;
}

export function GoldFoilScratch({ coupon }: GoldFoilScratchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [peelProgress, setPeelProgress] = useState(0);
  const [peelCorner, setPeelCorner] = useState<"tl" | "tr" | "bl" | "br">("br");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const lastScratchPos = useRef<{ x: number; y: number } | null>(null);

  const { canvasRef, isComplete, progress } = useScratch({
    threshold: 0.4,
    brushSize: 50,
    onProgress: (p) => {
      setPeelProgress(Math.min(p * 2, 1));
    },
  });

  // Determine peel corner based on first scratch position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleFirstTouch = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (x < centerX && y < centerY) setPeelCorner("tl");
      else if (x >= centerX && y < centerY) setPeelCorner("tr");
      else if (x < centerX && y >= centerY) setPeelCorner("bl");
      else setPeelCorner("br");

      canvas.removeEventListener("pointerdown", handleFirstTouch);
    };

    canvas.addEventListener("pointerdown", handleFirstTouch);
    return () => canvas.removeEventListener("pointerdown", handleFirstTouch);
  }, [canvasRef]);

  // Track mouse for holographic effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };

    canvas.addEventListener("pointermove", handleMove);
    return () => canvas.removeEventListener("pointermove", handleMove);
  }, [canvasRef]);

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

      // Gold foil gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#FFD700");
      gradient.addColorStop(0.2, "#FFC125");
      gradient.addColorStop(0.4, "#FFB90F");
      gradient.addColorStop(0.6, "#FFEC8B");
      gradient.addColorStop(0.8, "#FFC125");
      gradient.addColorStop(1, "#FFD700");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add embossed pattern
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width + canvas.height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(0, i);
        ctx.stroke();
      }

      // Add subtle noise for texture
      if (canvas.width > 0 && canvas.height > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 20;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // Text
      ctx.fillStyle = "rgba(139,69,19,0.4)";
      ctx.font = "bold 14px serif";
      ctx.textAlign = "center";
      ctx.fillText("PEEL TO REVEAL", canvas.width / 2, canvas.height / 2);
    };

    initCanvas();
  }, [canvasRef]);

  const getPeelTransform = useCallback(() => {
    const angle = peelProgress * 180;
    const translate = peelProgress * 50;

    switch (peelCorner) {
      case "tl":
        return {
          origin: "top left",
          transform: `perspective(500px) rotateY(${angle}deg) rotateX(${angle}deg) translate(${translate}%, ${translate}%)`,
        };
      case "tr":
        return {
          origin: "top right",
          transform: `perspective(500px) rotateY(-${angle}deg) rotateX(${angle}deg) translate(-${translate}%, ${translate}%)`,
        };
      case "bl":
        return {
          origin: "bottom left",
          transform: `perspective(500px) rotateY(${angle}deg) rotateX(-${angle}deg) translate(${translate}%, -${translate}%)`,
        };
      case "br":
      default:
        return {
          origin: "bottom right",
          transform: `perspective(500px) rotateY(-${angle}deg) rotateX(-${angle}deg) translate(-${translate}%, -${translate}%)`,
        };
    }
  }, [peelProgress, peelCorner]);

  const holographicGradient = `linear-gradient(
    ${mousePos.x * 360}deg,
    rgba(255,0,0,0.1) 0%,
    rgba(255,127,0,0.1) 14%,
    rgba(255,255,0,0.1) 28%,
    rgba(0,255,0,0.1) 42%,
    rgba(0,0,255,0.1) 57%,
    rgba(75,0,130,0.1) 71%,
    rgba(148,0,211,0.1) 85%,
    rgba(255,0,0,0.1) 100%
  )`;

  return (
    <ScratchCard coupon={coupon} variant="Gold Foil" isComplete={isComplete}>
      <div ref={containerRef} className="absolute inset-0" style={{ perspective: "1000px" }}>
        {/* Foil layer with peel effect */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: getPeelTransform().origin,
            transform: isComplete ? "scale(0)" : getPeelTransform().transform,
            transition: isComplete ? "transform 0.5s ease-out" : "none",
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none cursor-pointer"
          />

          {/* Holographic overlay */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background: holographicGradient,
              opacity: 0.5,
            }}
          />

          {/* Shine effect following mouse */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)",
              left: `${mousePos.x * 100}%`,
              top: `${mousePos.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Peel shadow */}
          {peelProgress > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `inset ${peelCorner.includes("r") ? "-" : ""}${peelProgress * 30}px ${peelCorner.includes("b") ? "-" : ""}${peelProgress * 30}px ${peelProgress * 20}px rgba(0,0,0,0.3)`,
              }}
            />
          )}
        </div>

        {/* Velvet background underneath */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "linear-gradient(135deg, #722F37 0%, #4A0E0E 100%)",
            opacity: isComplete ? 1 : peelProgress,
          }}
        />
      </div>
    </ScratchCard>
  );
}
