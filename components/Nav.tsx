"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Btn from "./Btn";
import { LiquidMetal } from "@paper-design/shaders-react";

export default function Nav() {
  const path = usePathname();
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 36px",
      height: 58,
      background: "rgba(5,5,12,0.75)",
      backdropFilter: "blur(32px) saturate(180%)",
      WebkitBackdropFilter: "blur(32px) saturate(180%)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          overflow: "hidden",
          border: "1px solid rgba(167,139,250,0.3)",
          boxShadow: "0 0 16px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          flexShrink: 0,
        }}>
          <LiquidMetal
            colorBack="#3d1a7a"
            colorTint="#c4b5fd"
            speed={0.6}
            distortion={0.12}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <span style={{
          fontWeight: 700, fontSize: "0.95rem",
          color: "#e8e4f0", letterSpacing: "-0.04em",
        }}>
          cypra
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {[{ href: "/vision", label: "Vision" }, { href: "/compress", label: "Compress" }].map(({ href, label }) => (
          <Link key={href} href={href} style={{
            fontSize: "0.85rem",
            fontWeight: path === href ? 500 : 400,
            color: path === href ? "#c4b5fd" : "#3d3a58",
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: 8,
            background: path === href ? "rgba(124,58,237,0.14)" : "transparent",
            border: path === href ? "1px solid rgba(167,139,250,0.2)" : "1px solid transparent",
            backdropFilter: path === href ? "blur(8px)" : "none",
            transition: "all 0.2s",
            letterSpacing: "-0.01em",
          }}>
            {label}
          </Link>
        ))}
      </div>

      <Btn href="/compress" variant="primary" style={{ fontSize: "0.8rem", padding: "7px 20px" }}>
        Try free
      </Btn>
    </nav>
  );
}
