"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const path = usePathname();
  // The compress workspace is full-height; no footer there
  if (path === "/compress") return null;

  return (
    <footer style={{
      position: "relative", zIndex: 1,
      borderTop: "1px solid rgba(255,255,255,0.05)",
      background: "linear-gradient(to bottom, transparent, rgba(124,58,237,0.03))",
    }}>
      <div style={{
        maxWidth: 1240, margin: "0 auto",
        padding: "56px 64px 40px",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", gap: 40, flexWrap: "wrap",
          marginBottom: 48,
        }}>
          {/* Brand */}
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: "linear-gradient(135deg, #3d1a7a, #7c3aed)",
                border: "1px solid rgba(167,139,250,0.3)",
                boxShadow: "0 0 14px rgba(124,58,237,0.3)",
              }} />
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8e4f0", letterSpacing: "-0.04em" }}>
                cypra
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#2e2c45", lineHeight: 1.8, margin: 0 }}>
              Log intelligence for AI agents. Millions of lines in, one
              IncidentCapsule out — full debugging signal, a fraction of the tokens.
            </p>
          </div>

          {/* Link columns */}
          <div style={{ display: "flex", gap: 72, flexWrap: "wrap" }}>
            <div>
              <p style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#252338", marginBottom: 16,
              }}>
                Product
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/compress" className="footer-link">Compressor</Link>
                <Link href="/vision" className="footer-link">Vision</Link>
              </div>
            </div>
            <div>
              <p style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#252338", marginBottom: 16,
              }}>
                Works with
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Claude Code", "Codex", "Cursor", "MCP"].map(n => (
                  <span key={n} style={{ fontSize: "0.8rem", color: "#45426a" }}>{n}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom rail */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: 24,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "0.7rem", color: "#1e1d30" }}>
            © {new Date().getFullYear()} Cypra
          </span>
          <span style={{
            fontSize: "0.68rem", color: "#1e1d30",
            fontFamily: "var(--font-mono)", letterSpacing: "0.02em",
          }}>
            built for the agents reading your logs
          </span>
        </div>
      </div>
    </footer>
  );
}
