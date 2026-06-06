"use client";
import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const el = document.getElementById("cursor-glow");
    if (!el) return;

    function move(e: MouseEvent) {
      if (!el) return;
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
    }

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return <div id="cursor-glow" aria-hidden="true" />;
}
