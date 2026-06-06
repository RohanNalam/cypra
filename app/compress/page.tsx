"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { compress, IncidentCapsule } from "@/lib/drain";
import Btn from "@/components/Btn";
import { PulsingBorder } from "@paper-design/shaders-react";

const SAMPLE = `2024-03-15T14:22:01.123Z INFO  [api] GET /v1/health 200 3ms
2024-03-15T14:22:02.445Z INFO  [api] GET /v1/users/4821 200 12ms
2024-03-15T14:22:03.112Z INFO  [api] POST /v1/orders 201 45ms
2024-03-15T14:22:04.003Z INFO  [db] pool acquire 18ms (pool=5/20)
2024-03-15T14:22:05.890Z INFO  [api] GET /v1/health 200 2ms
2024-03-15T14:22:06.001Z INFO  [api] GET /v1/products 200 8ms
2024-03-15T14:22:07.334Z WARN  [db] pool acquire 210ms (pool=18/20) — threshold exceeded
2024-03-15T14:22:08.001Z INFO  [api] GET /v1/health 200 3ms
2024-03-15T14:22:09.112Z WARN  [db] pool acquire 480ms — high latency detected
2024-03-15T14:22:10.445Z INFO  [api] GET /v1/orders/9920 200 15ms
2024-03-15T14:22:11.003Z ERROR [db] psycopg2.OperationalError: connection pool exhausted after 30s timeout
2024-03-15T14:22:11.004Z ERROR [api] Unhandled exception in POST /v1/checkout — 500 Internal Server Error
2024-03-15T14:22:11.089Z ERROR [api] pool exhausted, queue=18, pending requests dropping
2024-03-15T14:22:12.001Z INFO  [api] GET /v1/health 200 2ms
2024-03-15T14:22:13.334Z INFO  [api] GET /v1/health 200 2ms`;

const ROLE_CONFIG: Record<string, { label: string; border: string; bg: string; glow: string; textColor: string; rgb: string }> = {
  root_cause:  { label: "Root Cause",  border: "rgba(248,113,113,0.35)", bg: "rgba(248,113,113,0.06)", glow: "rgba(248,113,113,0.15)", textColor: "#f87171", rgb: "248,113,113" },
  trigger:     { label: "Trigger",     border: "rgba(251,191,36,0.35)",  bg: "rgba(251,191,36,0.06)",  glow: "rgba(251,191,36,0.12)",  textColor: "#fbbf24", rgb: "251,191,36"  },
  consequence: { label: "Consequence", border: "rgba(96,165,250,0.35)",  bg: "rgba(96,165,250,0.06)",  glow: "rgba(96,165,250,0.12)",  textColor: "#60a5fa", rgb: "96,165,250"  },
};

function getSession() {
  if (typeof window === "undefined") return "";
  const k = "cypra_sid";
  let id = localStorage.getItem(k);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(k, id); }
  return id;
}

interface ClaudeAnalysis {
  narrative: string;
  evidence: { index: number; role: string; explanation: string }[];
}

export default function CompressPage() {
  const [input, setInput] = useState("");
  const [service, setService] = useState("api");
  const [capsule, setCapsule] = useState<IncidentCapsule | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ClaudeAnalysis | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [view, setView] = useState<"visual" | "json">("visual");
  const [sid, setSid] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSid(getSession());
  }, []);

  const lines = input.split("\n").filter(l => l.trim()).length;

  const run = useCallback(() => {
    if (!input.trim()) return;
    setLoading(true); setAnalysis(null); setAnalyzeError(null);
    setTimeout(() => {
      const result = compress(input, service || "service");
      setCapsule(result); setLoading(false); setView("visual");
      if (result.evidence.length > 0) runAnalysis(result, input);
    }, 350);
  }, [input, service]);

  // ⌘↵ or Ctrl+↵ keyboard shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  async function runAnalysis(cap: IncidentCapsule, raw: string) {
    setAnalyzing(true); setAnalyzeError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsule: cap, rawSample: raw.slice(0, 2000) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setAnalysis(data.analysis);
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function copyJson() {
    if (!capsule) return;
    navigator.clipboard.writeText(JSON.stringify(capsule, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  function clearAll() {
    setInput(""); setCapsule(null); setAnalysis(null); setAnalyzeError(null);
  }

  function getEnrichedEvidence() {
    if (!capsule) return [];
    return capsule.evidence.map((ev, i) => {
      const claudeItem = analysis?.evidence.find(a => a.index === i + 1);
      return { ...ev, role: claudeItem?.role ?? ev.role, explanation: claudeItem?.explanation ?? null };
    });
  }

  // Drag-and-drop handlers
  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragOver(true); }
  function onDragLeave() { setDragOver(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => { if (evt.target?.result) setInput(String(evt.target.result)); };
      reader.readAsText(file);
    } else {
      const text = e.dataTransfer.getData("text");
      if (text) setInput(text);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 58px)" }}>

      {/* ── Top bar ── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 20px", height: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(5,5,12,0.85)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        flexShrink: 0,
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{
            fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "#1e1c30",
          }}>
            Compress
          </span>

          {/* Service pill — double-bezel */}
          <div className="service-pill" style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.025)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8, padding: "4px 12px 4px 10px",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2e2c45" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <span style={{ fontSize: "0.62rem", color: "#2e2c45", letterSpacing: "0.04em" }}>service</span>
            <input
              value={service}
              onChange={e => setService(e.target.value)}
              placeholder="api"
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#a78bfa", fontSize: "0.75rem", width: 68,
                fontFamily: "var(--font-mono)", padding: 0, letterSpacing: "-0.01em",
              }}
            />
          </div>

          {lines > 0 && (
            <span style={{
              fontSize: "0.62rem", color: "#1e1c30",
              fontFamily: "var(--font-mono)", letterSpacing: "0.02em",
            }}>
              {lines.toLocaleString()} lines
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {sid && (
            <span style={{ fontSize: "0.58rem", color: "#15152a", fontFamily: "var(--font-mono)" }}>
              {sid.slice(0, 8)}
            </span>
          )}
          <Btn variant="text" onClick={() => { setInput(SAMPLE); setCapsule(null); setAnalysis(null); setAnalyzeError(null); }}>
            sample
          </Btn>
          {(input || capsule) && <Btn variant="text" onClick={clearAll}>clear</Btn>}
          <Btn
            variant="primary"
            onClick={run}
            disabled={!input.trim() || loading}
            style={{ fontSize: "0.78rem", padding: "6px 18px" }}
          >
            {loading ? "compressing…" : "Compress"}
          </Btn>
        </div>
      </div>

      {/* ── Split pane ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1px 1fr", minHeight: 0 }}>

        {/* ── Left: Input ── */}
        <div style={{
          overflow: "hidden", display: "flex", flexDirection: "column",
          background: dragOver ? "rgba(124,58,237,0.04)" : "transparent",
          transition: "background 0.2s",
        }}>
          {/* Left header */}
          <div style={{
            padding: "9px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(5,5,12,0.6)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: input ? "#a78bfa" : "#1a1a28",
                boxShadow: input ? "0 0 6px rgba(167,139,250,0.5)" : "none",
                transition: "all 0.4s",
              }} />
              <span style={{ fontSize: "0.59rem", color: "#1e1c30", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                stdin · raw log stream
              </span>
            </div>
            <span style={{
              fontSize: "0.56rem", color: "#141326",
              fontFamily: "var(--font-mono)", letterSpacing: "0.02em",
            }}>
              drop file or paste
            </span>
          </div>

          {/* Double-Bezel textarea wrapper */}
          <div
            className="log-input-shell"
            style={{
              flex: 1, margin: "12px",
              borderRadius: 14,
              background: dragOver
                ? "rgba(124,58,237,0.06)"
                : "rgba(255,255,255,0.018)",
              border: `1px solid ${dragOver ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`,
              padding: 2,
              display: "flex", flexDirection: "column",
              minHeight: 0,
              transition: "border-color 0.3s, background 0.3s",
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {/* Inner core */}
            <div
              className="log-input-core"
              style={{
                flex: 1, borderRadius: 12,
                background: "rgba(4,2,16,0.97)",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.2)",
                display: "flex", flexDirection: "column",
                overflow: "hidden", minHeight: 0,
              }}
            >
              {/* Textarea */}
              <textarea
                ref={taRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={"Paste log output here…\n\n  2024-03-15T14:22:11Z ERROR [db] connection pool exhausted\n  2024-03-15T14:22:11Z ERROR [api] 500 Internal Server Error\n\nOr click 'sample' in the toolbar above."}
                style={{
                  flex: 1,
                  padding: "20px 22px",
                  minHeight: 0,
                  background: "transparent",
                  border: "none", outline: "none", resize: "none",
                  color: "#c8c4dc",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12.5px", lineHeight: "1.9",
                  caretColor: "#a78bfa",
                }}
                spellCheck={false}
              />

              {/* Bottom status bar */}
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.04)",
                padding: "7px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(0,0,0,0.28)",
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: "0.58rem", color: "#1a1828",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.02em",
                }}>
                  {lines > 0
                    ? `${lines.toLocaleString()} lines · ${input.length.toLocaleString()} chars`
                    : "waiting for input"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.56rem", color: "#141326" }}>compress</span>
                  <span style={{
                    fontSize: "0.55rem", color: "#2e2c45",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 4, padding: "2px 6px",
                    fontFamily: "var(--font-mono)",
                  }}>
                    ⌘↵
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ background: "rgba(255,255,255,0.04)" }} />

        {/* ── Right: Output ── */}
        <div style={{ overflow: "auto" }}>

          {/* Sticky output header */}
          <div style={{
            padding: "9px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "sticky", top: 0,
            background: "rgba(5,5,12,0.9)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: capsule ? "#7c3aed" : "#1a1a28",
                boxShadow: capsule ? "0 0 8px rgba(124,58,237,0.8)" : "none",
                transition: "all 0.4s",
              }} />
              <span style={{ fontSize: "0.59rem", color: "#1e1c30", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                stdout · IncidentCapsule
              </span>
              {capsule && !loading && (
                <span style={{
                  fontSize: "0.56rem", color: "#7c3aed",
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: 4, padding: "1px 7px",
                  fontFamily: "var(--font-mono)",
                }}>
                  {capsule.compression}× compression
                </span>
              )}
            </div>
            {capsule && (
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {(["visual", "json"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{
                    background: view === v ? "rgba(124,58,237,0.18)" : "transparent",
                    backdropFilter: view === v ? "blur(8px)" : "none",
                    WebkitBackdropFilter: view === v ? "blur(8px)" : "none",
                    border: view === v ? "1px solid rgba(167,139,250,0.25)" : "1px solid transparent",
                    borderRadius: 5, padding: "3px 9px",
                    fontSize: "0.59rem", fontWeight: 600,
                    color: view === v ? "#a78bfa" : "#252338",
                    cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
                    transition: "all 0.2s",
                  }}>
                    {v}
                  </button>
                ))}
                <button onClick={copyJson} style={{
                  background: "transparent", border: "none",
                  fontSize: "0.59rem", color: copied ? "#a78bfa" : "#252338",
                  cursor: "pointer", marginLeft: 2, transition: "color 0.2s", padding: "3px 6px",
                }}>
                  {copied ? "✓ copied" : "copy"}
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: "20px 20px 32px" }}>

            {/* ── Empty state ── */}
            {!capsule && !loading && (
              <div style={{ paddingTop: 40 }}>
                {/* Double-bezel icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: 3, marginBottom: 20,
                }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: 11,
                    background: "rgba(5,2,18,0.9)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e2c45" strokeWidth="1.5">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                </div>
                <p style={{ color: "#252338", fontSize: "0.85rem", lineHeight: 1.9, maxWidth: 280, marginBottom: 14 }}>
                  Paste a log stream and hit{" "}
                  <span style={{ color: "#2e2c45" }}>Compress</span>.
                  Cypra groups lines into templates, tags anomalies, and returns a structured IncidentCapsule.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: "#7c3aed", boxShadow: "0 0 6px rgba(124,58,237,0.6)",
                    flexShrink: 0,
                  }} />
                  <p style={{ color: "#1e1c30", fontSize: "0.72rem", margin: 0 }}>
                    Claude AI annotates evidence roles automatically
                  </p>
                </div>
              </div>
            )}

            {/* ── Loading shimmer ── */}
            {loading && (
              <div style={{ paddingTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                {[78, 52, 68, 40, 60, 32, 50].map((w, i) => (
                  <div key={i} style={{
                    height: 8, width: `${w}%`,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 4,
                    animation: `shimmer 1.3s ease-in-out ${i * 0.08}s infinite`,
                  }} />
                ))}
              </div>
            )}

            {/* ── JSON view ── */}
            {capsule && !loading && view === "json" && (
              <div style={{
                borderRadius: 12,
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: 2,
              }}>
                <div style={{
                  borderRadius: 10,
                  background: "#03030d",
                  border: "1px solid rgba(255,255,255,0.04)",
                  padding: "18px 20px",
                }}>
                  <pre style={{
                    color: "#2e2c45", fontFamily: "var(--font-mono)",
                    fontSize: "11px", lineHeight: 2,
                    whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0,
                  }}>
                    {JSON.stringify(capsule, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* ── Visual view ── */}
            {capsule && !loading && view === "visual" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Stats row — double-bezel grid */}
                <div style={{
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.018)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: 2,
                }}>
                  <div style={{
                    borderRadius: 12,
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                    overflow: "hidden",
                    background: "#03030e",
                    border: "1px solid rgba(255,255,255,0.04)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}>
                    {[
                      { label: "service",     val: capsule.service,                                       accent: "#c4b5fd" },
                      { label: "compression", val: `${capsule.compression}×`,                             accent: "#7c3aed" },
                      { label: "lines",       val: capsule.routine_summary.total_lines.toLocaleString(),  accent: "#c4b5fd" },
                      { label: "templates",   val: String(capsule.routine_summary.templates),             accent: "#c4b5fd" },
                    ].map((s, i) => (
                      <div key={s.label} style={{
                        padding: "14px 16px",
                        borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        background: i === 1 ? "rgba(124,58,237,0.06)" : "transparent",
                      }}>
                        <div style={{
                          fontSize: "0.54rem", color: "#1e1c30",
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          marginBottom: 7, fontWeight: 600,
                        }}>
                          {s.label}
                        </div>
                        <div style={{
                          fontSize: "0.95rem", fontWeight: 700,
                          color: s.accent, fontFamily: "var(--font-mono)",
                          letterSpacing: "-0.02em",
                        }}>
                          {s.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Window badge */}
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 9, padding: "10px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#252338" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    <span style={{ fontSize: "0.56rem", color: "#252338", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                      window
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#2e2c45", fontFamily: "var(--font-mono)" }}>
                    {capsule.window}
                  </span>
                </div>

                {/* Claude Analysis card */}
                <div style={{ position: "relative", overflow: "hidden", borderRadius: 14 }}>
                  {/* PulsingBorder shell */}
                  {(analyzing || analysis) && (
                    <div style={{ position: "absolute", inset: 0 }}>
                      <PulsingBorder
                        colors={["#7c3aed", "#a78bfa", "#4c1d95"]}
                        colorBack="#05050c"
                        speed={analyzing ? 1.8 : 0.5}
                        roundness={0.3}
                        thickness={0.08}
                        bloom={0.4}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  )}

                  <div style={{
                    position: "relative", zIndex: 1,
                    background: analyzing || analysis ? "rgba(10,5,28,0.88)" : "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: analyzing || analysis ? "1px solid rgba(124,58,237,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, overflow: "hidden",
                    margin: analyzing || analysis ? 1 : 0,
                  }}>
                    <div style={{
                      padding: "11px 16px",
                      borderBottom: "1px solid rgba(124,58,237,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 6,
                          background: "rgba(124,58,237,0.18)",
                          border: "1px solid rgba(167,139,250,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                          </svg>
                        </div>
                        <span style={{
                          fontSize: "0.64rem", color: "#a78bfa",
                          fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>
                          Claude Analysis
                        </span>
                        {analyzing && (
                          <span style={{
                            fontSize: "0.58rem", color: "#5a3a80", letterSpacing: "0.04em",
                            display: "flex", alignItems: "center", gap: 5,
                          }}>
                            <span style={{
                              width: 5, height: 5, borderRadius: "50%",
                              background: "#7c3aed",
                              animation: "glow-pulse 1.4s ease-in-out infinite",
                              display: "inline-block",
                            }} />
                            thinking…
                          </span>
                        )}
                      </div>
                      {analyzeError && !analyzing && (
                        <button onClick={() => capsule && runAnalysis(capsule, input)} style={{
                          background: "rgba(124,58,237,0.1)",
                          border: "1px solid rgba(124,58,237,0.2)",
                          borderRadius: 5, padding: "3px 9px",
                          fontSize: "0.62rem", color: "#7c3aed", cursor: "pointer",
                          transition: "all 0.2s",
                        }}>
                          retry ↺
                        </button>
                      )}
                    </div>

                    <div style={{ padding: "14px 16px" }}>
                      {analyzing && !analysis && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[75, 90, 60].map((w, i) => (
                            <div key={i} style={{
                              height: 8, width: `${w}%`,
                              background: "rgba(124,58,237,0.1)",
                              borderRadius: 4,
                              animation: `shimmer 1.5s ease-in-out ${i * 0.15}s infinite`,
                            }} />
                          ))}
                        </div>
                      )}
                      {analyzeError && !analyzing && (
                        <div style={{
                          padding: "10px 14px",
                          background: "rgba(248,113,113,0.07)",
                          border: "1px solid rgba(248,113,113,0.18)",
                          borderRadius: 8,
                        }}>
                          <p style={{ fontSize: "0.74rem", color: "#f87171", margin: 0, lineHeight: 1.6 }}>
                            {analyzeError}
                          </p>
                        </div>
                      )}
                      {analysis?.narrative && (
                        <p style={{ fontSize: "0.82rem", color: "#7a7898", lineHeight: 1.88, margin: 0 }}>
                          {analysis.narrative}
                        </p>
                      )}
                      {!analyzing && !analyzeError && !analysis && capsule.evidence.length === 0 && (
                        <p style={{ fontSize: "0.74rem", color: "#252338", margin: 0 }}>
                          No anomalies found in this log stream.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence cards */}
                {capsule.evidence.length > 0 && (
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", marginBottom: 12,
                    }}>
                      <span style={{
                        fontSize: "0.58rem", color: "#252338",
                        textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
                      }}>
                        Evidence
                      </span>
                      <span style={{
                        fontSize: "0.58rem", color: "#1e1c30",
                        fontFamily: "var(--font-mono)",
                      }}>
                        {capsule.evidence.length} lines extracted
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {getEnrichedEvidence().map((ev, i) => {
                        const cfg = ROLE_CONFIG[ev.role] ?? ROLE_CONFIG.consequence;
                        return (
                          <div
                            key={i}
                            style={{
                              borderRadius: 12,
                              background: cfg.bg,
                              backdropFilter: "blur(20px) saturate(160%)",
                              WebkitBackdropFilter: "blur(20px) saturate(160%)",
                              border: `1px solid ${cfg.border}`,
                              borderLeft: `3px solid ${cfg.textColor}`,
                              padding: "13px 16px",
                              boxShadow: `0 4px 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                              transition: "transform 0.2s cubic-bezier(.22,1,.36,1), box-shadow 0.2s",
                              cursor: "default",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLDivElement).style.transform = "translateX(3px)";
                              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLDivElement).style.transform = "";
                              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`;
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                              <span style={{
                                fontSize: "0.59rem", fontWeight: 700,
                                letterSpacing: "0.08em", textTransform: "uppercase",
                                padding: "2px 8px", borderRadius: 999,
                                background: `rgba(${cfg.rgb},0.14)`,
                                color: cfg.textColor,
                                border: `1px solid ${cfg.border}`,
                              }}>
                                {cfg.label}
                              </span>
                              <span style={{
                                fontSize: "0.57rem", color: "#2e2c45",
                                fontFamily: "var(--font-mono)",
                              }}>
                                line {ev.line.toLocaleString()}
                              </span>
                            </div>

                            <div style={{
                              fontSize: "0.75rem", color: "#7a7898",
                              fontFamily: "var(--font-mono)", lineHeight: 1.65, wordBreak: "break-all",
                            }}>
                              {ev.text}
                            </div>

                            {ev.explanation && (
                              <div style={{
                                marginTop: 10, paddingTop: 10,
                                borderTop: `1px solid ${cfg.border}`,
                                fontSize: "0.71rem", color: "#45426a", lineHeight: 1.7,
                              }}>
                                {ev.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {capsule.evidence.length === 0 && (
                  <div style={{
                    padding: "24px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 12, textAlign: "center",
                  }}>
                    <p style={{ color: "#252338", fontSize: "0.82rem", lineHeight: 1.8, margin: 0 }}>
                      No anomalies detected. Try logs containing ERROR, WARN, exception, or timeout messages.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
