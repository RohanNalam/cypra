"use client";
import { useRef, MouseEvent, CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { PulsingBorder } from "@paper-design/shaders-react";

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "ghost" | "text";
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
  type?: "button" | "submit";
}

export default function Btn({
  children, onClick, href,
  variant = "ghost",
  disabled = false,
  style, className, type = "button",
}: BtnProps) {
  const ref = useRef<HTMLElement>(null);

  function addRipple(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    el.appendChild(span);
    span.addEventListener("animationend", () => span.remove());
  }

  const cls = `btn btn-${variant} ${className ?? ""}`;
  const combinedStyle: CSSProperties = {
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    ...style,
  };

  const innerContent = (
    <>
      {/* Animated shader border for primary buttons */}
      {variant === "primary" && (
        <span className="btn-shader-border" aria-hidden="true">
          <PulsingBorder
            colors={["#7c3aed", "#a78bfa", "#c4b5fd", "#818cf8"]}
            colorBack="#07021c"
            speed={0.65}
            roundness={0.45}
            thickness={0.055}
            bloom={0.55}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </span>
      )}
      {/* Shimmer sweep on hover */}
      <span className="btn-shimmer" aria-hidden="true" />
      {/* Actual label sits above everything */}
      <span className="btn-label">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cls}
        style={combinedStyle}
        onMouseDown={addRipple}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      className={cls}
      style={combinedStyle}
      onMouseDown={addRipple}
      onClick={disabled ? undefined : onClick}
    >
      {innerContent}
    </button>
  );
}
