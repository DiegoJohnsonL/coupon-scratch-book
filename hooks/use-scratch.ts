"use client";

import { useRef, useCallback, useState, useEffect } from "react";

interface UseScratchOptions {
  threshold?: number; // % scratched to trigger complete (0-1)
  brushSize?: number;
  onProgress?: (percent: number) => void;
  onComplete?: () => void;
}

interface UseScratchReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isComplete: boolean;
  progress: number;
  reset: () => void;
}

export function useScratch(options: UseScratchOptions = {}): UseScratchReturn {
  const { threshold = 0.5, brushSize = 40, onProgress, onComplete } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const hasCompleted = useRef(false);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d", { willReadFrequently: true });
  }, []);

  const getPointerPosition = useCallback(
    (e: PointerEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const scratch = useCallback(
    (x: number, y: number) => {
      const ctx = getContext();
      if (!ctx) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw line from last point for smooth scratching
      if (lastPoint.current) {
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      lastPoint.current = { x, y };
    },
    [getContext, brushSize]
  );

  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    return transparent / total;
  }, [getContext]);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (isComplete) return;
      isDrawing.current = true;
      const pos = getPointerPosition(e);
      scratch(pos.x, pos.y);
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    },
    [getPointerPosition, scratch, isComplete]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawing.current || isComplete) return;
      const pos = getPointerPosition(e);
      scratch(pos.x, pos.y);
    },
    [getPointerPosition, scratch, isComplete]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;

    const newProgress = calculateProgress();
    setProgress(newProgress);
    onProgress?.(newProgress);

    if (newProgress >= threshold && !hasCompleted.current) {
      hasCompleted.current = true;
      setIsComplete(true);
      onComplete?.();
    }
  }, [calculateProgress, threshold, onProgress, onComplete]);

  const reset = useCallback(() => {
    setIsComplete(false);
    setProgress(0);
    hasCompleted.current = false;
    lastPoint.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return { canvasRef, isComplete, progress, reset };
}
