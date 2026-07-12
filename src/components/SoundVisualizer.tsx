import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/hooks/usePlayer";

// Indonesia Theme Colors
const THEME = {
  colors: ["#ef4444", "#ffffff", "#fca5a5", "#fee2e2", "#ef4444"],
  gradientStart: "oklch(0.63 0.25 22.2)", // Indonesia Red
  gradientEnd: "oklch(0.98 0.01 20)", // Pure Off-White
  glow: "rgba(239, 68, 68, 0.4)",
};

export function SoundVisualizer() {
  const { isPlaying, isLoading, volume } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Constants
  const sensitivity = 1.5; // Maximum reactivity (150%)
  const speed = 0.8; // Lively speed

  // Animation state tracking for realistic procedural audio-reactive beats
  const animStateRef = useRef({
    phase: 0,
    beatProgress: 0,
    frameCount: 0,
    lastBeatTime: 0,
    bassPeak: 0,
    midPeak: 0,
    treblePeak: 0,
    smoothedVolume: 0.8,
  });

  // Initialize and run Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    const state = animStateRef.current;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };
    resizeCanvas();

    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    // Core Animation Loop
    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      state.frameCount++;

      // Procedural audio engine variables
      state.smoothedVolume += (volume - state.smoothedVolume) * 0.1;
      const activeVolumeMult = isPlaying
        ? isLoading
          ? 0.15
          : state.smoothedVolume * sensitivity
        : 0;

      // Update beat cycle (roughly simulating 133 BPM beat tracking)
      const now = Date.now();
      const timeSinceBeat = now - state.lastBeatTime;
      let isBeat = false;

      // Simulated dynamic transients (snare/kick beats)
      const targetInterval = isLoading ? 150 : 450;
      if (isPlaying && timeSinceBeat > targetInterval) {
        state.lastBeatTime = now;
        isBeat = true;
        state.beatProgress = 1;
      } else {
        state.beatProgress += (0 - state.beatProgress) * 0.1;
      }

      // Procedural dynamic frequencies
      const bassCycle = Math.sin(state.frameCount * 0.12 * speed) * 0.4 + 0.6;
      state.bassPeak = activeVolumeMult * (bassCycle + (isBeat ? 0.7 : 0) + Math.random() * 0.2);
      if (state.bassPeak > 1.2) state.bassPeak = 1.2;

      const midCycle =
        Math.cos(state.frameCount * 0.07 * speed) *
          Math.sin(state.frameCount * 0.03 * speed) *
          0.4 +
        0.6;
      state.midPeak = activeVolumeMult * (midCycle + Math.random() * 0.15);

      const trebleCycle = Math.sin(state.frameCount * 0.3 * speed) * 0.3 + 0.5;
      state.treblePeak =
        activeVolumeMult * (trebleCycle + (Math.random() > 0.8 ? 0.4 : 0) + Math.random() * 0.2);

      state.phase += 0.05 * speed * (1 + state.bassPeak * 0.5);

      // --- CIRCULAR NEON PULSE ---
      const centerX = w / 2;
      const centerY = h / 2;
      const baseRadius = Math.min(w, h) * 0.26;

      // Add subtle rotation
      const baseAngle = state.frameCount * 0.003;

      // Dynamic pulsate factor
      const pulseAmt = 1 + state.bassPeak * 0.18 + state.beatProgress * 0.08;
      const radius =
        baseRadius * (isLoading ? 1 + Math.sin(state.frameCount * 0.1) * 0.04 : pulseAmt);

      // Draw radial glowing aura
      const glowRad = radius * 1.5;
      const radialGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.8,
        centerX,
        centerY,
        glowRad,
      );
      radialGrad.addColorStop(0, "rgba(18, 18, 24, 0)");
      radialGrad.addColorStop(0.4, THEME.glow);
      radialGrad.addColorStop(1, "rgba(18, 18, 24, 0)");

      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRad, 0, Math.PI * 2);
      ctx.fill();

      // Render circular frequency waves
      const totalPoints = 90;
      ctx.beginPath();

      for (let i = 0; i < totalPoints; i++) {
        const angle = (i / totalPoints) * Math.PI * 2 + baseAngle;

        // Audio-reactive distortion mapping
        let sample = 0;
        const mapIdx = i % 30;
        if (isPlaying) {
          if (mapIdx < 8) {
            sample = state.bassPeak * (0.8 + Math.sin(state.frameCount * 0.15 + i) * 0.2);
          } else if (mapIdx < 22) {
            sample = state.midPeak * (0.7 + Math.cos(state.frameCount * 0.1 + i * 0.5) * 0.3);
          } else {
            sample = state.treblePeak * (0.5 + Math.sin(state.frameCount * 0.3 + i * 2) * 0.5);
          }
        } else {
          // Gentle idle breathing
          sample = 0.04 + Math.sin(state.frameCount * 0.04 + i * 0.3) * 0.02;
        }

        if (isLoading) {
          sample = 0.15 + Math.sin(state.frameCount * 0.08 + i * 0.8) * 0.08;
        }

        const waveLen = sample * 35;
        const r = radius + waveLen;
        const px = centerX + Math.cos(angle) * r;
        const py = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = THEME.colors[0];
      ctx.shadowBlur = 12;
      ctx.shadowColor = THEME.colors[0];
      ctx.stroke();

      // Inner orbit rings
      ctx.shadowBlur = 6;
      ctx.shadowColor = THEME.colors[1];
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // Draw active avatar-ring
      ctx.strokeStyle = THEME.colors[1];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.setLineDash([6, 10]);
      ctx.arc(centerX, centerY, radius * 0.7, baseAngle * 2, baseAngle * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // clear

      // Draw glowing center node
      ctx.shadowBlur = 15;
      ctx.shadowColor = THEME.colors[0];
      ctx.fillStyle = "rgba(24, 24, 30, 0.95)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Center antenna symbol
      ctx.fillStyle = isPlaying ? THEME.colors[0] : "#6b7280";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isPlaying ? THEME.colors[1] : "#4b5563";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 11, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 11, Math.PI * 0.7, Math.PI * 1.3);
      ctx.stroke();

      ctx.shadowBlur = 0; // reset

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      observer.disconnect();
    };
  }, [volume, isPlaying, isLoading]);

  return (
    <div className="relative w-[240px] h-[240px] rounded-full overflow-hidden bg-transparent transition-all duration-300">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
