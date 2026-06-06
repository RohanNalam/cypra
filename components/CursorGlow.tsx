"use client";
import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -400, y: -400 });
  const current = useRef({ x: -400, y: -400 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      target.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf: number;
    function tick() {
      // Smooth lerp — follows cursor with a slight lag
      current.current.x += (target.current.x - current.current.x) * 0.1;
      current.current.y += (target.current.y - current.current.y) * 0.1;

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate(${current.current.x - 80}px, ${current.current.y - 80}px)`;
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 160,
        height: 160,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.30) 0%, rgba(124,58,237,0.10) 45%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 9998,
        willChange: "transform",
        // start offscreen
        transform: "translate(-9999px, -9999px)",
      }}
    />
  );
}
