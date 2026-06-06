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
        setText(word.slice(0, ci));
        setCi(c => c + 1);
      } else if (!del && ci > word.length) {
        setTimeout(() => setDel(true), 1600);
      } else if (del && ci >= 0) {
        setText(word.slice(0, ci));
        setCi(c => c - 1);
      } else {
        setDel(false);
        setWi(i => (i + 1) % WORDS.length);
      }
    }, del ? 30 : 60);
    return () => clearTimeout(t);
  }, [ci, del, wi]);

  return (
    <span style={{ color: "#c4b5fd" }}>
      {text}
      <span style={{
        display: "inline-block", width: 2, height: "0.85em",
        background: "#7c3aed", marginLeft: 1, verticalAlign: "middle",
        animation: "blink 1s step-end infinite",
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
        const dur = 1200;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return (
    <div ref={ref}>
      <div className="shimmer-text" style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
        {n}{suffix}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <section style={{
        minHeight: "90vh", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "0 48px", maxWidth: 860, margin: "0 auto",
      }}>
        <p className="animate-fade-up delay-1" style={{
          fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#3d3a58", marginBottom: 32,
        }}>
          Log intelligence for AI agents
        </p>

        <h1 className="animate-fade-up delay-2" style={{
          fontSize: "clamp(2.8rem, 6vw, 5.2rem)", fontWeight: 800,
          lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 32,
        }}>
          <span style={{ color: "#e8e4f0" }}>Logs rebuilt for</span>
          <br />
          <Typewriter />
        </h1>

        <p className="animate-fade-up delay-3" style={{
          color: "#4e4b65", fontSize: "1.1rem", lineHeight: 1.8,
          maxWidth: 520, marginBottom: 48,
        }}>
          Cypra compresses raw log output into compact IncidentCapsules —
          structured JSON your agent can reason over without burning its
          context budget.
        </p>

        <div className="animate-fade-up delay-4" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Btn href="/compress" variant="primary" style={{ fontSize: "0.9rem", padding: "11px 28px" }}>
            Start compressing
          </Btn>
          <Btn href="/vision" variant="ghost" style={{ fontSize: "0.9rem", padding: "11px 28px" }}>
            Read the vision →
          </Btn>
        </div>
      </section>

      <section style={{
        maxWidth: 860, margin: "0 auto", padding: "0 48px 120px",
        borderTop: "1px solid #12121e",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0", paddingTop: 60 }}>
          {[
            { to: 95, suffix: "%", label: "Fewer tokens" },
            { to: 168, suffix: "×", label: "Line compression" },
            { to: 88, suffix: "k/s", label: "Lines per second" },
          ].map((s, i) => (
            <div key={s.label} style={{
              borderLeft: i > 0 ? "1px solid #12121e" : "none",
              paddingLeft: i > 0 ? 48 : 0,
            }}>
              <Counter to={s.to} suffix={s.suffix} />
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{
          color: "#2e2c40", fontSize: "0.82rem", marginTop: 48,
          letterSpacing: "0.01em", lineHeight: 1.7, maxWidth: 460,
        }}>
          Benchmarked on LogHub-2.0 · 42,000 lines × 14 systems ·{" "}
          +0.146 agent diagnosis score vs raw logs (p &lt; 0.001)
        </p>
      </section>
    </div>
  );
}
