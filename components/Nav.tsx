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
      padding: "16px 32px",
      background: "rgba(8,8,16,0.88)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid #10101e",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "#12103a",
          border: "1px solid #2a2060",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: "#a78bfa",
        }}>C</div>
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e4f0", letterSpacing: "-0.03em" }}>
          cypra
        </span>
      </Link>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {[{ href: "/vision", label: "Vision" }, { href: "/compress", label: "Compress" }].map(({ href, label }) => (
          <Link key={href} href={href} className={`nav-link ${path === href ? "active" : ""}`}>
            {label}
          </Link>
        ))}
      </div>

      <Btn href="/compress" variant="primary" style={{ fontSize: "0.82rem", padding: "7px 18px" }}>
        Try free
      </Btn>
    </nav>
  );
}
