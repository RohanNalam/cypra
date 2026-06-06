"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Btn from "./Btn";

export default function Nav() {
  const path = usePathname();
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px",
      height: 57,
      background: "rgba(6,6,9,0.92)",
      backdropFilter: "blur(24px)",
      borderBottom: "1px solid #0e0e1a",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "linear-gradient(135deg, #1a1540, #0e0a2a)",
          border: "1px solid #2a2060",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.7rem", fontWeight: 800, color: "#a78bfa",
          letterSpacing: "-0.02em",
          boxShadow: "0 0 12px #7c3aed22, inset 0 1px 0 #ffffff0a",
        }}>
          C
        </div>
        <span style={{
          fontWeight: 700, fontSize: "0.95rem",
          color: "#e8e4f0", letterSpacing: "-0.04em",
        }}>
          cypra
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[{ href: "/vision", label: "Vision" }, { href: "/compress", label: "Compress" }].map(({ href, label }) => (
          <Link key={href} href={href} style={{
            fontSize: "0.85rem",
            fontWeight: path === href ? 500 : 400,
            color: path === href ? "#c4b5fd" : "#4a4762",
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: 7,
            background: path === href ? "#12103a" : "transparent",
            border: path === href ? "1px solid #1e1840" : "1px solid transparent",
            transition: "all 0.2s",
            letterSpacing: "-0.01em",
          }}>
            {label}
          </Link>
        ))}
      </div>

      <Btn href="/compress" variant="primary" style={{ fontSize: "0.8rem", padding: "7px 18px" }}>
        Try free
      </Btn>
    </nav>
  );
}
