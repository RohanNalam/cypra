"use client";
import { useEffect, useRef, useState } from "react";
import Btn from "@/components/Btn";

const WORDS = ["Claude Code", "Codex", "your agents", "the AI stack"];

function Typewriter() {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = WORDS[wi];
    const t = setTimeout(() => {
      if (!del && ci <= word.length) {
        setText(word.slice(0, ci)); setCi(c => c + 1);
      } else if (!del && ci > word.length) {
        setTimeout(() => setDel(true), 1600);
      } else if (del && ci >= 0) {
        setText(word.slice(0, ci)); setCi(c => c - 1);
      } else {
        setDel(false); setWi(i => (i + 1) % WORDS.length);
      }
    }, del ? 30 : 60);
    return () => clearTimeout(t);
  }, [ci, del, wi]);

  return (
    <span style={{ color: "#c4b5fd" }}>
      {text}
      <span style={{
        display: "inline-block", width: 3, height: "0.85em",
        background: "#7c3aed", marginLeft: 2, verticalAlign: "middle",
        animation: "blink 1s step-end infinite", borderRadius: 1,
      }} />
    </span>
  );
}

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const start = performance.now();
        const dur = 1400;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return (
    <div ref={ref} className="shimmer-text" style={{
      fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
    }}>
      {n}{suffix}
    </div>
  );
}

function TerminalPreview() {
  return (
    <div className="terminal-card" style={{ maxWidth: 440, width: "100%" }}>
      {/* Title bar */}
      <div className="terminal-titlebar">
        <div className="terminal-dot" style={{ background: "#ff5f57" }} />
        <div className="terminal-dot" style={{ background: "#febc2e" }} />
        <div className="terminal-dot" style={{ background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "#3a3858", fontFamily: "var(--font-mono)" }}>
          incident.capsule.json
        </span>
      </div>

      {/* Code */}
      <div style={{
        padding: "20px 22px",
        fontFamily: "var(--font-mono)",
        fontSize: "11.5px",
        lineHeight: 2,
        position: "relative",
        overflow: "hidden",
      }}>
        <div className="scan-line" />
        <div style={{ color: "#3a3858" }}>{"{"}</div>
        <div style={{ paddingLeft: 20 }}>
          <span style={{ color: "#5a5870" }}>&quot;service&quot;</span>
          <span style={{ color: "#3a3858" }}>: </span>
          <span style={{ color: "#a78bfa" }}>&quot;api&quot;</span>
          <span style={{ color: "#3a3858" }}>,</span>
        </div>
        <div style={{ paddingLeft: 20 }}>
          <span style={{ color: "#5a5870" }}>&quot;compression&quot;</span>
          <span style={{ color: "#3a3858" }}>: </span>
          <span style={{ color: "#c4b5fd", fontWeight: 600 }}>168</span>
          <span style={{ color: "#3a3858" }}>,</span>
        </div>
        <div style={{ paddingLeft: 20 }}>
          <span style={{ color: "#5a5870" }}>&quot;evidence&quot;</span>
          <span style={{ color: "#3a3858" }}>: [</span>
        </div>

        {[
          { role: "root_cause", color: "#f87171", text: "psycopg2.OperationalError: pool exhausted" },
          { role: "trigger", color: "#fbbf24", text: "pool acquire 480ms — threshold exceeded" },
          { role: "consequence", color: "#60a5fa", text: "queue=18, pending requests dropping" },
        ].map((ev, i) => (
          <div key={i} style={{ paddingLeft: 36, marginBottom: 2 }}>
            <span style={{ color: "#3a3858" }}>{"{ "}</span>
            <span style={{ color: "#4a4870" }}>&quot;role&quot;</span>
            <span style={{ color: "#3a3858" }}>: </span>
            <span style={{ color: ev.color, fontWeight: 600 }}>&quot;{ev.role}&quot;</span>
            <span style={{ color: "#3a3858" }}>,</span>
            <br />
            <span style={{ paddingLeft: 20, color: "#4a4870" }}>&quot;text&quot;</span>
            <span style={{ color: "#3a3858" }}>: </span>
            <span style={{ color: "#6b6888" }}>&quot;{ev.text}&quot;</span>
            <span style={{ color: "#3a3858" }}> {"}"}{i < 2 ? "," : ""}</span>
          </div>
        ))}

        <div style={{ paddingLeft: 20, color: "#3a3858" }}>],</div>
        <div style={{ paddingLeft: 20 }}>
          <span style={{ color: "#5a5870" }}>&quot;routine_summary&quot;</span>
          <span style={{ color: "#3a3858" }}>: {"{"} </span>
          <span style={{ color: "#4a4870" }}>&quot;total_lines&quot;</span>
          <span style={{ color: "#3a3858" }}>: </span>
          <span style={{ color: "#34d399" }}>1085399</span>
          <span style={{ color: "#3a3858" }}> {"}"}</span>
        </div>
        <div style={{ color: "#3a3858" }}>{"}"}</div>

        {/* Compression badge */}
        <div style={{
          position: "absolute", top: 18, right: 18,
          background: "#7c3aed18", border: "1px solid #7c3aed33",
          borderRadius: 6, padding: "4px 10px",
          fontSize: "0.65rem", fontWeight: 700, color: "#a78bfa",
          letterSpacing: "0.06em", textTransform: "uppercase",
          fontFamily: "var(--font-mono)",
        }}>
          168× compression
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: "Compress",
    title: "88k lines per second",
    desc: "Drain algorithm groups log templates, strips routine noise, and extracts only the lines that matter. Zero data invented.",
    color: "#a78bfa",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    label: "Analyze",
    title: "Claude tags every line",
    desc: "Claude AI reads the compressed evidence and labels root causes, triggers, and consequences — with a plain-English narrative.",
    color: "#c4b5fd",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
    label: "Integrate",
    title: "MCP · CLI · API",
    desc: "One command installs an MCP server. Works with Claude Code, Codex, Cursor, and any agent that reads logs.",
    color: "#60a5fa",
  },
];

export default function Home() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── Hero ── */}
      <section style={{
        minHeight: "92vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        alignItems: "center",
        padding: "0 64px",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {/* Left */}
        <div>
          <div className="animate-fade-up delay-1" style={{ marginBottom: 28 }}>
            <span className="badge badge-purple">Log intelligence for AI agents</span>
          </div>

          <h1 className="animate-fade-up delay-2" style={{
            fontSize: "clamp(2.6rem, 5.5vw, 4.8rem)",
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            marginBottom: 28,
          }}>
            <span style={{ color: "#e8e4f0" }}>Logs rebuilt<br />for </span>
            <Typewriter />
          </h1>

          <p className="animate-fade-up delay-3" style={{
            color: "#4a4762", fontSize: "1.05rem", lineHeight: 1.85,
            maxWidth: 460, marginBottom: 40,
          }}>
            Cypra compresses raw log output into compact IncidentCapsules —
            structured JSON your agent reasons over without burning its
            context budget.
          </p>

          <div className="animate-fade-up delay-4" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Btn href="/compress" variant="primary" style={{ fontSize: "0.92rem", padding: "12px 28px" }}>
              Start compressing
            </Btn>
            <Btn href="/vision" variant="ghost" style={{ fontSize: "0.92rem", padding: "12px 28px" }}>
              Read the vision →
            </Btn>
          </div>

          {/* Integrations row */}
          <div className="animate-fade-up delay-5" style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 48 }}>
            <span style={{ fontSize: "0.7rem", color: "#2e2c45", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Works with
            </span>
            {["Claude Code", "Codex", "Cursor", "MCP"].map(name => (
              <span key={name} style={{
                fontSize: "0.72rem", color: "#3d3a58", fontWeight: 500,
                borderLeft: "1px solid #1a1a2e", paddingLeft: 20,
              }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Right — terminal preview */}
        <div className="animate-fade-up delay-3" style={{
          display: "flex", justifyContent: "center",
          animation: "float 6s ease-in-out infinite",
        }}>
          <TerminalPreview />
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{
        borderTop: "1px solid #10101e",
        borderBottom: "1px solid #10101e",
        background: "#07070d",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "52px 64px",
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: 0,
        }}>
          {[
            { to: 95, suffix: "%", label: "Fewer tokens sent to agent" },
            { to: 168, suffix: "×", label: "Average line compression" },
            { to: 88, suffix: "k/s", label: "Lines processed per second" },
          ].map((s, i) => (
            <div key={s.label} style={{
              borderLeft: i > 0 ? "1px solid #12121e" : "none",
              paddingLeft: i > 0 ? 56 : 0,
            }}>
              <Counter to={s.to} suffix={s.suffix} />
              <div className="stat-label" style={{ marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 64px 40px" }}>
          <p style={{ color: "#22213a", fontSize: "0.78rem", letterSpacing: "0.01em" }}>
            Benchmarked on LogHub-2.0 · 42,000 lines × 14 systems ·
            +0.146 agent diagnosis accuracy vs raw logs (p &lt; 0.001)
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 64px 120px" }}>
        <div style={{ marginBottom: 56 }}>
          <p style={{
            fontSize: "0.72rem", color: "#3d3a58", textTransform: "uppercase",
            letterSpacing: "0.12em", fontWeight: 600, marginBottom: 16,
          }}>
            How it works
          </p>
          <h2 style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1, color: "#e8e4f0", maxWidth: 480,
          }}>
            Three steps from logs<br />
            <span style={{ color: "#5a5870" }}>to a clean capsule</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={f.label} className="feature-card">
              {/* Step + icon */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: f.color,
                }}>
                  {f.icon}
                </div>
                <span style={{
                  fontSize: "2rem", fontWeight: 800, color: "#12121e",
                  letterSpacing: "-0.05em", lineHeight: 1,
                }}>
                  0{i + 1}
                </span>
              </div>

              <div style={{ marginBottom: 8 }}>
                <span className="badge" style={{
                  background: `${f.color}18`, color: f.color,
                  borderColor: `${f.color}30`, marginBottom: 12, display: "inline-flex",
                }}>
                  {f.label}
                </span>
              </div>

              <h3 style={{
                fontSize: "1.1rem", fontWeight: 700, color: "#e8e4f0",
                letterSpacing: "-0.02em", marginBottom: 12,
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#4a4762", lineHeight: 1.75 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{
          marginTop: 72,
          padding: "40px 48px",
          background: "#09090f",
          border: "1px solid #16162a",
          borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 24,
        }}>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#e8e4f0", letterSpacing: "-0.02em", marginBottom: 6 }}>
              See it on your own logs
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#3d3a58" }}>
              No signup. No account. Paste logs, get a capsule in seconds.
            </p>
          </div>
          <Btn href="/compress" variant="primary" style={{ fontSize: "0.92rem", padding: "12px 28px", whiteSpace: "nowrap" }}>
            Try the compressor →
          </Btn>
        </div>
      </section>
    </div>
  );
}
