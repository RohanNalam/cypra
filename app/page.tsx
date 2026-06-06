"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Btn from "@/components/Btn";
import { MeshGradient, NeuroNoise, LiquidMetal } from "@paper-design/shaders-react";

const HeroGradient = dynamic(() => import("@/components/HeroGradient"), { ssr: false });
const FloatingTorus = dynamic(() => import("@/components/FloatingTorus"), { ssr: false });

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
        setTimeout(() => setDel(true), 1800);
      } else if (del && ci >= 0) {
        setText(word.slice(0, ci)); setCi(c => c - 1);
      } else {
        setDel(false); setWi(i => (i + 1) % WORDS.length);
      }
    }, del ? 28 : 60);
    return () => clearTimeout(t);
  }, [ci, del, wi]);

  return (
    <span style={{ color: "#c4b5fd" }}>
      {text}
      <span style={{
        display: "inline-block", width: 3, height: "0.85em",
        background: "#a78bfa", marginLeft: 2, verticalAlign: "middle",
        animation: "blink 1s step-end infinite", borderRadius: 2,
        boxShadow: "0 0 8px #7c3aed",
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
        const dur = 1600;
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
      fontSize: "3.2rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
    }}>
      {n}{suffix}
    </div>
  );
}

function TerminalPreview() {
  return (
    <div className="terminal-card" style={{ width: "100%", maxWidth: 440 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dot" style={{ background: "#ff5f57" }} />
        <div className="terminal-dot" style={{ background: "#febc2e" }} />
        <div className="terminal-dot" style={{ background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "#3a3858", fontFamily: "var(--font-mono)" }}>
          incident.capsule.json
        </span>
        <span style={{ marginLeft: "auto", fontSize: "0.62rem", color: "#2a2050" }}>168×</span>
      </div>

      <div style={{
        padding: "20px 22px",
        fontFamily: "var(--font-mono)",
        fontSize: "11.5px",
        lineHeight: 2,
        position: "relative",
        overflow: "hidden",
      }}>
        <div className="scan-line" />
        <div style={{ color: "#2e2c45" }}>{"{"}</div>
        <div style={{ paddingLeft: 20 }}>
          <span style={{ color: "#4a4870" }}>"service"</span><span style={{ color: "#2e2c45" }}>: </span>
          <span style={{ color: "#a78bfa" }}>"api"</span><span style={{ color: "#2e2c45" }}>,</span>
        </div>
        <div style={{ paddingLeft: 20 }}>
          <span style={{ color: "#4a4870" }}>"compression"</span><span style={{ color: "#2e2c45" }}>: </span>
          <span style={{ color: "#c4b5fd", fontWeight: 600 }}>168</span><span style={{ color: "#2e2c45" }}>,</span>
        </div>
        <div style={{ paddingLeft: 20 }}>
          <span style={{ color: "#4a4870" }}>"evidence"</span><span style={{ color: "#2e2c45" }}>: [</span>
        </div>

        {[
          { role: "root_cause", color: "#f87171", text: "psycopg2.OperationalError: pool exhausted" },
          { role: "trigger",    color: "#fbbf24", text: "pool acquire 480ms — threshold exceeded" },
          { role: "consequence",color: "#60a5fa", text: "queue=18, pending requests dropping" },
        ].map((ev, i) => (
          <div key={i} style={{ paddingLeft: 36, marginBottom: 2 }}>
            <span style={{ color: "#2e2c45" }}>{"{ "}</span>
            <span style={{ color: "#3a3860" }}>"role"</span>
            <span style={{ color: "#2e2c45" }}>: </span>
            <span style={{ color: ev.color, fontWeight: 600 }}>"{ev.role}"</span>
            <span style={{ color: "#2e2c45" }}>,</span>
            <br />
            <span style={{ paddingLeft: 20, color: "#3a3860" }}>"text"</span>
            <span style={{ color: "#2e2c45" }}>: </span>
            <span style={{ color: "#5a5870" }}>"{ev.text}"</span>
            <span style={{ color: "#2e2c45" }}>{" }"}{i < 2 ? "," : ""}</span>
          </div>
        ))}

        <div style={{ paddingLeft: 20, color: "#2e2c45" }}>],</div>
        <div style={{ paddingLeft: 20 }}>
          <span style={{ color: "#4a4870" }}>"routine_summary"</span>
          <span style={{ color: "#2e2c45" }}>: {"{"} </span>
          <span style={{ color: "#3a3860" }}>"total_lines"</span>
          <span style={{ color: "#2e2c45" }}>: </span>
          <span style={{ color: "#34d399" }}>1085399</span>
          <span style={{ color: "#2e2c45" }}> {"}"}</span>
        </div>
        <div style={{ color: "#2e2c45" }}>{"}"}</div>

        <div style={{
          position: "absolute", top: 18, right: 18,
          background: "rgba(124,58,237,0.2)",
          border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: 6, padding: "4px 10px",
          fontSize: "0.65rem", fontWeight: 700, color: "#a78bfa",
          letterSpacing: "0.06em", textTransform: "uppercase",
          fontFamily: "var(--font-mono)",
          backdropFilter: "blur(8px)",
        }}>
          168× compression
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    label: "Compress",
    title: "88k lines per second",
    desc: "Drain algorithm groups log templates, strips routine noise, and extracts only the lines that matter. Zero data invented.",
    color: "#a78bfa",
    gradColors: ["#0d001a", "#08000f", "#1a0050", "#07000a"] as [string, string, string, string],
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></svg>,
    label: "Analyze",
    title: "Claude tags every line",
    desc: "Claude AI reads the compressed evidence and labels root causes, triggers, and consequences — with a plain-English narrative.",
    color: "#c4b5fd",
    gradColors: ["#150040", "#08000f", "#1a0060", "#050010"] as [string, string, string, string],
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
    label: "Integrate",
    title: "MCP · CLI · API",
    desc: "One command installs an MCP server. Works with Claude Code, Codex, Cursor, and any agent that reads logs.",
    color: "#60a5fa",
    gradColors: ["#001840", "#00000f", "#001a60", "#000510"] as [string, string, string, string],
  },
];

export default function Home() {
  // Parallax effect on scroll
  const heroRef = useRef<HTMLDivElement>(null);
  const torusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (torusRef.current) {
        torusRef.current.style.transform = `translateY(${y * 0.18}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{
        minHeight: "94vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}>
        {/* ShaderGradient background */}
        <HeroGradient />

        {/* Vignette overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, #05050c 100%)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: 1240,
          margin: "0 auto", padding: "80px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60, alignItems: "center",
        }}>

          {/* Left */}
          <div>
            <div data-reveal style={{ marginBottom: 28 }}>
              <span className="badge badge-purple" style={{ background: "rgba(124,58,237,0.15)", backdropFilter: "blur(8px)" }}>
                Log intelligence for AI agents
              </span>
            </div>

            <h1 data-reveal data-reveal-delay="1" style={{
              fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
              fontWeight: 800, lineHeight: 1.05,
              letterSpacing: "-0.04em", marginBottom: 28,
            }}>
              <span style={{ color: "#e8e4f0" }}>Logs rebuilt<br />for </span>
              <Typewriter />
            </h1>

            <p data-reveal data-reveal-delay="2" style={{
              color: "#45426a", fontSize: "1.05rem", lineHeight: 1.9,
              maxWidth: 460, marginBottom: 44,
            }}>
              Cypra compresses raw log output into compact IncidentCapsules —
              structured JSON your agent reasons over without burning its context budget.
            </p>

            <div data-reveal data-reveal-delay="3" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 48 }}>
              <Btn href="/compress" variant="primary" style={{ fontSize: "0.95rem", padding: "13px 30px" }}>
                Start compressing
              </Btn>
              <Btn href="/vision" variant="ghost" style={{ fontSize: "0.95rem", padding: "13px 28px" }}>
                Read the vision →
              </Btn>
            </div>

            <div data-reveal data-reveal-delay="4" style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.68rem", color: "#252338", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginRight: 20 }}>
                Works with
              </span>
              {["Claude Code", "Codex", "Cursor", "MCP"].map((name, i) => (
                <span key={name} style={{
                  fontSize: "0.72rem", color: "#2e2c45", fontWeight: 500,
                  borderLeft: "1px solid #16162a", paddingLeft: 18, marginRight: 18,
                  paddingRight: 0,
                  ...(i === 0 ? { borderLeft: "none", paddingLeft: 0 } : {}),
                }}>
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 3D scene + terminal card */}
          <div ref={torusRef} style={{ position: "relative", height: 520 }}>
            {/* r3f torus behind */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
              <FloatingTorus />
            </div>

            {/* Glass glow ring */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300, height: 300,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
              animation: "pulse-ring 4s ease-in-out infinite",
              pointerEvents: "none",
            }} />

            {/* Terminal card floating on top */}
            <div data-reveal data-reveal-delay="2" style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 420,
              animation: "float-slow 7s ease-in-out infinite",
              zIndex: 10,
            }}>
              <TerminalPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* NeuroNoise background */}
        <NeuroNoise
          colorFront="#1a0050"
          colorBack="#05050c"
          speed={0.4}
          style={{ position: "absolute", inset: 0, opacity: 0.5 }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, #05050c 0%, transparent 20%, transparent 80%, #05050c 100%)",
          pointerEvents: "none",
        }} />

        <div data-reveal style={{
          position: "relative", zIndex: 1,
          maxWidth: 1240, margin: "0 auto", padding: "72px 64px",
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0,
        }}>
          {[
            { to: 95, suffix: "%", label: "Fewer tokens sent to agent" },
            { to: 168, suffix: "×", label: "Average line compression" },
            { to: 88, suffix: "k/s", label: "Lines processed per second" },
          ].map((s, i) => (
            <div key={s.label} style={{
              borderLeft: i > 0 ? "1px solid #1a1a2e" : "none",
              paddingLeft: i > 0 ? 56 : 0,
            }}>
              <Counter to={s.to} suffix={s.suffix} />
              <div className="stat-label" style={{ marginTop: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 64px 48px", position: "relative", zIndex: 1 }}>
          <p style={{ color: "#1e1d30", fontSize: "0.76rem" }}>
            Benchmarked on LogHub-2.0 · 42,000 lines × 14 systems · +0.146 agent diagnosis accuracy vs raw logs (p &lt; 0.001)
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "100px 64px 120px" }}>
        <div data-reveal style={{ marginBottom: 64 }}>
          <p style={{ fontSize: "0.72rem", color: "#3d3a58", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 18 }}>
            How it works
          </p>
          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800,
            letterSpacing: "-0.035em", lineHeight: 1.1, color: "#e8e4f0", maxWidth: 480,
          }}>
            Three steps from logs<br />
            <span style={{ color: "#3a3858" }}>to a clean capsule</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              data-reveal
              data-reveal-delay={String(i + 1)}
              className="feature-card glass-card"
              style={{ padding: 32 }}
            >
              {/* MeshGradient texture background */}
              <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", opacity: 0.25 }}>
                <MeshGradient
                  colors={f.gradColors}
                  speed={0.15}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Icon + step number */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `rgba(${f.color === "#a78bfa" ? "167,139,250" : f.color === "#c4b5fd" ? "196,181,253" : "96,165,250"},0.12)`,
                    border: `1px solid rgba(${f.color === "#a78bfa" ? "167,139,250" : f.color === "#c4b5fd" ? "196,181,253" : "96,165,250"},0.25)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: f.color, backdropFilter: "blur(8px)",
                  }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0e0e1e", letterSpacing: "-0.05em", lineHeight: 1 }}>
                    0{i + 1}
                  </span>
                </div>

                <span className="badge" style={{
                  background: `rgba(${f.color === "#a78bfa" ? "167,139,250" : f.color === "#c4b5fd" ? "196,181,253" : "96,165,250"},0.12)`,
                  color: f.color,
                  borderColor: `rgba(${f.color === "#a78bfa" ? "167,139,250" : f.color === "#c4b5fd" ? "196,181,253" : "96,165,250"},0.25)`,
                  marginBottom: 14, display: "inline-flex", backdropFilter: "blur(8px)",
                }}>
                  {f.label}
                </span>

                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#e8e4f0", letterSpacing: "-0.025em", marginBottom: 12 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#45426a", lineHeight: 1.8 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div data-reveal style={{ marginTop: 80, position: "relative", overflow: "hidden" }}>
          {/* MeshGradient background */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", opacity: 0.4 }}>
            <MeshGradient
              colors={["#160050", "#030010", "#200060", "#05000e"]}
              speed={0.2}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          <div className="glass" style={{
            borderRadius: 24,
            padding: "48px 56px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 24,
            position: "relative", zIndex: 1,
          }}>
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e8e4f0", letterSpacing: "-0.025em", marginBottom: 8 }}>
                See it on your own logs
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#45426a" }}>
                No signup. No account. Paste logs, get a capsule in seconds.
              </p>
            </div>
            <Btn href="/compress" variant="primary" style={{ fontSize: "0.95rem", padding: "13px 32px", whiteSpace: "nowrap" }}>
              Try the compressor →
            </Btn>
          </div>
        </div>
      </section>
    </div>
  );
}
