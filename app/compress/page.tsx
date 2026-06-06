"use client";

import { useState, useEffect, useRef } from "react";
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

const ROLE_CONFIG: Record<string, { label: string; border: string; bg: string; glow: string; textColor: string }> = {
  root_cause:  { label: "Root Cause",  border: "rgba(248,113,113,0.35)", bg: "rgba(248,113,113,0.06)", glow: "rgba(248,113,113,0.15)", textColor: "#f87171" },
  trigger:     { label: "Trigger",     border: "rgba(251,191,36,0.35)",  bg: "rgba(251,191,36,0.06)",  glow: "rgba(251,191,36,0.12)",  textColor: "#fbbf24" },
  consequence: { label: "Consequence", border: "rgba(96,165,250,0.35)",  bg: "rgba(96,165,250,0.06)",  glow: "rgba(96,165,250,0.12)",  textColor: "#60a5fa" },
};

const STORAGE_KEY = "cypra_session";

function getSession() {
  if (typeof window === "undefined") return "";
  const k = "cypra_sid";
  let id = localStorage.getItem(k);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(k, id); }
  return id;
}

interface SavedSession {
  input: string; service: string; capsule: IncidentCapsule; analysis: ClaudeAnalysis | null; savedAt: number;
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
  const [restored, setRestored] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSid(getSession());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SavedSession = JSON.parse(raw);
        if (Date.now() - saved.savedAt < 86_400_000) {
          setInput(saved.input); setService(saved.service);
          setCapsule(saved.capsule); setAnalysis(saved.analysis); setRestored(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!capsule) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, service, capsule, analysis, savedAt: Date.now() }));
    } catch { /* ignore */ }
  }, [capsule, analysis, input, service]);

  const lines = input.split("\n").filter(l => l.trim()).length;

  function run() {
    if (!input.trim()) return;
    setLoading(true); setAnalysis(null); setAnalyzeError(null); setRestored(false);
    setTimeout(() => {
      const result = compress(input, service || "service");
      setCapsule(result); setLoading(false); setView("visual");
      if (result.evidence.length > 0) runAnalysis(result, input);
    }, 350);
  }

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
    setInput(""); setCapsule(null); setAnalysis(null); setAnalyzeError(null); setRestored(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  function getEnrichedEvidence() {
    if (!capsule) return [];
    return capsule.evidence.map((ev, i) => {
      const claudeItem = analysis?.evidence.find(a => a.index === i + 1);
      return { ...ev, role: claudeItem?.role ?? ev.role, explanation: claudeItem?.explanation ?? null };
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 58px)" }}>

      {/* ── Top bar ── */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(5,5,12,0.8)",
        backdropFilter: "blur(24px)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#252338" }}>
            Compress
          </span>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 7, padding: "4px 12px",
          }}>
            <span style={{ fontSize: "0.66rem", color: "#2e2c45" }}>service</span>
            <input
              value={service}
              onChange={e => setService(e.target.value)}
              placeholder="api"
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#a78bfa", fontSize: "0.78rem", width: 72,
                fontFamily: "var(--font-mono)", padding: 0,
              }}
            />
          </div>

          {lines > 0 && (
            <span style={{ fontSize: "0.66rem", color: "#252338", fontFamily: "var(--font-mono)" }}>
              {lines.toLocaleString()} lines
            </span>
          )}
          {restored && (
            <span className="badge badge-purple" style={{ fontSize: "0.58rem", padding: "2px 7px", backdropFilter: "blur(8px)" }}>
              restored
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {sid && (
            <span style={{ fontSize: "0.62rem", color: "#1a1a2a", fontFamily: "var(--font-mono)" }}>
              {sid.slice(0, 8)}
            </span>
          )}
          <Btn variant="text" onClick={() => { setInput(SAMPLE); setCapsule(null); setAnalysis(null); setAnalyzeError(null); setRestored(false); }}>
            load sample
          </Btn>
          {(input || capsule) && <Btn variant="text" onClick={clearAll}>clear</Btn>}
          <Btn
            variant="primary"
            onClick={run}
            disabled={!input.trim() || loading}
            style={{ fontSize: "0.8rem", padding: "6px 20px" }}
          >
            {loading ? "compressing…" : "Compress"}
          </Btn>
        </div>
      </div>

      {/* ── Split ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1px 1fr", minHeight: 0 }}>

        {/* Left */}
        <div style={{ overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(5,5,12,0.5)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a1a28" }} />
            <span style={{ fontSize: "0.62rem", color: "#252338", fontFamily: "var(--font-mono)" }}>
              stdin · raw log stream
            </span>
          </div>
          <textarea
            ref={taRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="minimal-textarea"
            placeholder={"Paste log output here…\n\n2024-03-15T14:22:11Z ERROR [db] connection pool exhausted\n2024-03-15T14:22:11Z ERROR [api] 500 Internal Server Error"}
            style={{ flex: 1, padding: "20px 24px", minHeight: 0 }}
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div style={{ background: "rgba(255,255,255,0.04)" }} />

        {/* Right */}
        <div style={{ overflow: "auto" }}>
          {/* Sticky output header */}
          <div style={{
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "sticky", top: 0,
            background: "rgba(5,5,12,0.85)",
            backdropFilter: "blur(20px)",
            zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: capsule ? "#7c3aed" : "#1a1a28",
                boxShadow: capsule ? "0 0 8px #7c3aed" : "none",
                transition: "all 0.4s",
              }} />
              <span style={{ fontSize: "0.62rem", color: "#252338", fontFamily: "var(--font-mono)" }}>
                stdout · IncidentCapsule
              </span>
            </div>
            {capsule && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {(["visual", "json"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{
                    background: view === v ? "rgba(124,58,237,0.18)" : "transparent",
                    backdropFilter: view === v ? "blur(8px)" : "none",
                    border: view === v ? "1px solid rgba(167,139,250,0.25)" : "1px solid transparent",
                    borderRadius: 5, padding: "3px 10px",
                    fontSize: "0.62rem", fontWeight: 600,
                    color: view === v ? "#a78bfa" : "#2e2c45",
                    cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
                    transition: "all 0.2s",
                  }}>
                    {v}
                  </button>
                ))}
                <button onClick={copyJson} style={{
                  background: "transparent", border: "none",
                  fontSize: "0.62rem", color: copied ? "#a78bfa" : "#2e2c45",
                  cursor: "pointer", marginLeft: 4, transition: "color 0.2s",
                }}>
                  {copied ? "✓ copied" : "copy"}
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: "24px" }}>
            {/* Empty state */}
            {!capsule && !loading && (
              <div style={{ paddingTop: 48, maxWidth: 300 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 13,
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2e2c45" strokeWidth="1.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <p style={{ color: "#252338", fontSize: "0.85rem", lineHeight: 1.85 }}>
                  Paste a log stream on the left and hit{" "}
                  <span style={{ color: "#2e2c45" }}>Compress</span>.
                  Cypra groups lines into templates, tags anomalies, and returns a structured IncidentCapsule.
                </p>
                <p style={{ color: "#7c3aed", fontSize: "0.72rem", marginTop: 16, opacity: 0.6 }}>
                  ✦ Claude AI analyzes evidence roles automatically
                </p>
              </div>
            )}

            {/* Loading shimmer */}
            {loading && (
              <div style={{ paddingTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                {[80, 55, 70, 45, 62, 35].map((w, i) => (
                  <div key={i} style={{
                    height: 9, width: `${w}%`,
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 4,
                    animation: `shimmer 1.3s ease-in-out ${i * 0.08}s infinite`,
                  }} />
                ))}
              </div>
            )}

            {/* JSON view */}
            {capsule && !loading && view === "json" && (
              <pre style={{ color: "#2e2c45", fontFamily: "var(--font-mono)", fontSize: "11px", lineHeight: 1.9, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(capsule, null, 2)}
              </pre>
            )}

            {/* Visual view */}
            {capsule && !loading && view === "visual" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Stats row */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 1, borderRadius: 12, overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(16px)",
                }}>
                  {[
                    { label: "service", val: capsule.service },
                    { label: "compression", val: `${capsule.compression}×` },
                    { label: "lines", val: capsule.routine_summary.total_lines.toLocaleString() },
                    { label: "templates", val: String(capsule.routine_summary.templates) },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.015)",
                      padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: "0.58rem", color: "#252338", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontWeight: 600 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#c4b5fd", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                        {s.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Window */}
                <div style={{
                  background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 9, padding: "11px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: "0.6rem", color: "#252338", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, flexShrink: 0 }}>window</span>
                  <span style={{ fontSize: "0.76rem", color: "#2e2c45", fontFamily: "var(--font-mono)" }}>{capsule.window}</span>
                </div>

                {/* Claude Analysis card */}
                <div style={{ position: "relative", overflow: "hidden", borderRadius: 14 }}>
                  {/* PulsingBorder as animated background */}
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
                    background: "rgba(12,6,30,0.85)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    borderRadius: 14, overflow: "hidden",
                    margin: 1,
                  }}>
                    <div style={{
                      padding: "12px 18px",
                      borderBottom: "1px solid rgba(124,58,237,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 6,
                          background: "rgba(124,58,237,0.2)",
                          border: "1px solid rgba(167,139,250,0.3)",
                          backdropFilter: "blur(8px)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12" />
                          </svg>
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          Claude Analysis
                        </span>
                        {analyzing && (
                          <span style={{ fontSize: "0.6rem", color: "#5a3a80", letterSpacing: "0.05em" }}>thinking…</span>
                        )}
                      </div>
                      {analyzeError && !analyzing && (
                        <button onClick={() => capsule && runAnalysis(capsule, input)} style={{
                          background: "none", border: "none",
                          fontSize: "0.65rem", color: "#7c3aed", cursor: "pointer",
                        }}>
                          retry ↺
                        </button>
                      )}
                    </div>

                    <div style={{ padding: "16px 18px" }}>
                      {analyzing && !analysis && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[75, 90, 60].map((w, i) => (
                            <div key={i} style={{
                              height: 9, width: `${w}%`,
                              background: "rgba(124,58,237,0.1)",
                              borderRadius: 4,
                              animation: `shimmer 1.5s ease-in-out ${i * 0.15}s infinite`,
                            }} />
                          ))}
                        </div>
                      )}
                      {analyzeError && !analyzing && (
                        <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, backdropFilter: "blur(8px)" }}>
                          <p style={{ fontSize: "0.75rem", color: "#f87171", margin: 0, lineHeight: 1.6 }}>{analyzeError}</p>
                        </div>
                      )}
                      {analysis?.narrative && (
                        <p style={{ fontSize: "0.83rem", color: "#7a7898", lineHeight: 1.85, margin: 0 }}>
                          {analysis.narrative}
                        </p>
                      )}
                      {!analyzing && !analyzeError && !analysis && capsule.evidence.length === 0 && (
                        <p style={{ fontSize: "0.75rem", color: "#252338", margin: 0 }}>No anomalies found in this log stream.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence cards */}
                {capsule.evidence.length > 0 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <span style={{ fontSize: "0.62rem", color: "#252338", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Evidence</span>
                      <span style={{ fontSize: "0.62rem", color: "#252338", fontFamily: "var(--font-mono)" }}>
                        {capsule.evidence.length} lines extracted
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {getEnrichedEvidence().map((ev, i) => {
                        const cfg = ROLE_CONFIG[ev.role] ?? ROLE_CONFIG.consequence;
                        return (
                          <div key={i} style={{
                            background: cfg.bg,
                            backdropFilter: "blur(20px) saturate(160%)",
                            WebkitBackdropFilter: "blur(20px) saturate(160%)",
                            border: `1px solid ${cfg.border}`,
                            borderLeft: `3px solid ${cfg.textColor}`,
                            borderRadius: 12,
                            padding: "14px 18px",
                            boxShadow: `0 4px 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                            transition: "transform 0.2s, box-shadow 0.2s",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.transform = "translateX(3px)";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 30px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`;
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.transform = "";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`;
                          }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{
                                fontSize: "0.62rem", fontWeight: 700,
                                letterSpacing: "0.08em", textTransform: "uppercase",
                                padding: "3px 9px", borderRadius: 999,
                                background: `rgba(${cfg.textColor === "#f87171" ? "248,113,113" : cfg.textColor === "#fbbf24" ? "251,191,36" : "96,165,250"},0.15)`,
                                color: cfg.textColor,
                                border: `1px solid ${cfg.border}`,
                                backdropFilter: "blur(4px)",
                              }}>
                                {cfg.label}
                              </span>
                              <span style={{ fontSize: "0.6rem", color: "#2e2c45", fontFamily: "var(--font-mono)" }}>
                                line {ev.line.toLocaleString()}
                              </span>
                            </div>

                            <div style={{ fontSize: "0.77rem", color: "#7a7898", fontFamily: "var(--font-mono)", lineHeight: 1.65, wordBreak: "break-all" }}>
                              {ev.text}
                            </div>

                            {ev.explanation && (
                              <div style={{
                                marginTop: 10, paddingTop: 10,
                                borderTop: `1px solid ${cfg.border}`,
                                fontSize: "0.72rem", color: "#45426a", lineHeight: 1.7,
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
                    padding: "28px", textAlign: "center",
                    background: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 12,
                  }}>
                    <p style={{ color: "#252338", fontSize: "0.82rem", lineHeight: 1.8 }}>
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
