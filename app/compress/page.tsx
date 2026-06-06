"use client";

import { useState, useEffect, useRef } from "react";
import { compress, IncidentCapsule } from "@/lib/drain";
import Btn from "@/components/Btn";

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

const ROLE_CONFIG: Record<string, { badge: string; border: string; bg: string; label: string }> = {
  root_cause: { badge: "badge-red", border: "#f8717140", bg: "#f8717108", label: "Root Cause" },
  trigger:    { badge: "badge-yellow", border: "#fbbf2440", bg: "#fbbf2408", label: "Trigger" },
  consequence:{ badge: "badge-blue", border: "#60a5fa40", bg: "#60a5fa08", label: "Consequence" },
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
  input: string;
  service: string;
  capsule: IncidentCapsule;
  analysis: ClaudeAnalysis | null;
  savedAt: number;
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
          setInput(saved.input);
          setService(saved.service);
          setCapsule(saved.capsule);
          setAnalysis(saved.analysis);
          setRestored(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!capsule) return;
    try {
      const session: SavedSession = { input, service, capsule, analysis, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch { /* ignore */ }
  }, [capsule, analysis, input, service]);

  const lines = input.split("\n").filter(l => l.trim()).length;

  function run() {
    if (!input.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setAnalyzeError(null);
    setRestored(false);
    setTimeout(() => {
      const result = compress(input, service || "service");
      setCapsule(result);
      setLoading(false);
      setView("visual");
      if (result.evidence.length > 0) runAnalysis(result, input);
    }, 350);
  }

  async function runAnalysis(cap: IncidentCapsule, raw: string) {
    setAnalyzing(true);
    setAnalyzeError(null);
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
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function clearAll() {
    setInput("");
    setCapsule(null);
    setAnalysis(null);
    setAnalyzeError(null);
    setRestored(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  function getEnrichedEvidence() {
    if (!capsule) return [];
    return capsule.evidence.map((ev, i) => {
      const claudeItem = analysis?.evidence.find(a => a.index === i + 1);
      return {
        ...ev,
        role: claudeItem?.role ?? ev.role,
        explanation: claudeItem?.explanation ?? null,
      };
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)" }}>
      {/* ── Top bar ── */}
      <div style={{
        borderBottom: "1px solid #0e0e1a",
        padding: "0 24px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#07070d",
        flexShrink: 0,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#2e2c45",
          }}>
            Compress
          </span>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#0c0c18", border: "1px solid #16162a",
            borderRadius: 6, padding: "4px 10px",
          }}>
            <span style={{ fontSize: "0.68rem", color: "#3d3a58" }}>service</span>
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
            <span style={{
              fontSize: "0.68rem", color: "#2e2c45",
              fontFamily: "var(--font-mono)",
            }}>
              {lines.toLocaleString()} lines
            </span>
          )}

          {restored && (
            <span className="badge badge-purple" style={{ fontSize: "0.6rem", padding: "2px 7px" }}>
              restored
            </span>
          )}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {sid && (
            <span style={{ fontSize: "0.65rem", color: "#1e1e30", fontFamily: "var(--font-mono)" }}>
              {sid.slice(0, 8)}
            </span>
          )}
          <Btn variant="text" onClick={() => {
            setInput(SAMPLE); setCapsule(null); setAnalysis(null);
            setAnalyzeError(null); setRestored(false);
          }}>
            load sample
          </Btn>
          {(input || capsule) && (
            <Btn variant="text" onClick={clearAll}>clear</Btn>
          )}
          <Btn
            variant="primary"
            onClick={run}
            disabled={!input.trim() || loading}
            style={{ fontSize: "0.8rem", padding: "6px 18px" }}
          >
            {loading ? "compressing…" : "Compress"}
          </Btn>
        </div>
      </div>

      {/* ── Main split ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1px 1fr", minHeight: 0 }}>

        {/* Left — input */}
        <div style={{ overflow: "auto", display: "flex", flexDirection: "column" }}>
          {/* Input header */}
          <div style={{
            padding: "10px 20px",
            borderBottom: "1px solid #0e0e1a",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1e1e30" }} />
            <span style={{ fontSize: "0.65rem", color: "#2e2c45", fontFamily: "var(--font-mono)" }}>
              stdin · raw log stream
            </span>
          </div>
          <textarea
            ref={taRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="minimal-textarea"
            placeholder={"Paste log output here…\n\n2024-03-15T14:22:11Z ERROR [db] connection pool exhausted\n2024-03-15T14:22:11Z ERROR [api] 500 Internal Server Error\n…"}
            style={{
              flex: 1, padding: "20px 24px",
              minHeight: 0,
            }}
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div style={{ background: "#0e0e1a" }} />

        {/* Right — output */}
        <div style={{ overflow: "auto" }}>
          {/* Output header */}
          <div style={{
            padding: "10px 20px",
            borderBottom: "1px solid #0e0e1a",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "sticky", top: 0, background: "#07070d", zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: capsule ? "#7c3aed" : "#1e1e30" }} />
              <span style={{ fontSize: "0.65rem", color: "#2e2c45", fontFamily: "var(--font-mono)" }}>
                stdout · IncidentCapsule
              </span>
            </div>
            {capsule && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {(["visual", "json"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      background: view === v ? "#12103a" : "transparent",
                      border: view === v ? "1px solid #2a2060" : "1px solid transparent",
                      borderRadius: 5, padding: "3px 10px",
                      fontSize: "0.62rem", fontWeight: 600,
                      color: view === v ? "#a78bfa" : "#3a3858",
                      cursor: "pointer", letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {v}
                  </button>
                ))}
                <button
                  onClick={copyJson}
                  style={{
                    background: "transparent", border: "none",
                    fontSize: "0.62rem", color: copied ? "#a78bfa" : "#3a3858",
                    cursor: "pointer", marginLeft: 4,
                  }}
                >
                  {copied ? "✓ copied" : "copy"}
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: "24px" }}>
            {/* Empty state */}
            {!capsule && !loading && (
              <div style={{ paddingTop: 48, maxWidth: 320 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 11,
                  background: "#0c0c18", border: "1px solid #16162a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e2c45" strokeWidth="1.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <p style={{ color: "#2e2c45", fontSize: "0.85rem", lineHeight: 1.85 }}>
                  Paste a log stream on the left and hit{" "}
                  <span style={{ color: "#3d3a58" }}>Compress</span>.
                  <br />
                  Cypra groups lines into templates, tags anomalies with causal roles, and returns a structured IncidentCapsule.
                </p>
                <p style={{ color: "#7c3aed", fontSize: "0.72rem", marginTop: 16 }}>
                  ✦ Claude AI analyzes evidence roles automatically
                </p>
              </div>
            )}

            {loading && (
              <div style={{ paddingTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
                {[80, 60, 70, 50, 65].map((w, i) => (
                  <div key={i} style={{
                    height: 10, width: `${w}%`,
                    background: "#0c0c18", borderRadius: 4,
                    animation: `shimmer 1.2s ease-in-out ${i * 0.1}s infinite`,
                  }} />
                ))}
              </div>
            )}

            {capsule && !loading && view === "json" && (
              <pre style={{
                color: "#3d3a58", fontFamily: "var(--font-mono)",
                fontSize: "11px", lineHeight: 1.9,
                whiteSpace: "pre-wrap", wordBreak: "break-all",
              }}>
                {JSON.stringify(capsule, null, 2)}
              </pre>
            )}

            {capsule && !loading && view === "visual" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                {/* Stats row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 1,
                  background: "#0e0e1a",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #0e0e1a",
                }}>
                  {[
                    { label: "service", val: capsule.service },
                    { label: "compression", val: `${capsule.compression}×` },
                    { label: "lines", val: capsule.routine_summary.total_lines.toLocaleString() },
                    { label: "templates", val: String(capsule.routine_summary.templates) },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: "#09090f", padding: "14px 16px",
                    }}>
                      <div style={{ fontSize: "0.6rem", color: "#2e2c45", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, fontWeight: 600 }}>
                        {s.label}
                      </div>
                      <div style={{
                        fontSize: "0.95rem", fontWeight: 700, color: "#c4b5fd",
                        fontFamily: "var(--font-mono)", letterSpacing: "-0.02em",
                      }}>
                        {s.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Window */}
                <div style={{
                  background: "#09090f", border: "1px solid #0e0e1a",
                  borderRadius: 8, padding: "12px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: "0.62rem", color: "#2e2c45", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, flexShrink: 0 }}>
                    window
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#3d3a58", fontFamily: "var(--font-mono)" }}>
                    {capsule.window}
                  </span>
                </div>

                {/* Claude Analysis */}
                <div style={{
                  background: "#08081a",
                  border: "1px solid #1a1040",
                  borderRadius: 12,
                  overflow: "hidden",
                }}>
                  {/* Card header */}
                  <div style={{
                    padding: "12px 18px",
                    borderBottom: "1px solid #12102a",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5,
                        background: "#7c3aed22",
                        border: "1px solid #7c3aed40",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "#7c3aed", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Claude Analysis
                      </span>
                      {analyzing && (
                        <span style={{ fontSize: "0.62rem", color: "#4a3a70" }}>thinking…</span>
                      )}
                    </div>
                    {analyzeError && !analyzing && (
                      <button
                        onClick={() => capsule && runAnalysis(capsule, input)}
                        style={{
                          background: "none", border: "none",
                          fontSize: "0.65rem", color: "#7c3aed",
                          cursor: "pointer", padding: "2px 8px",
                        }}
                      >
                        retry ↺
                      </button>
                    )}
                  </div>

                  <div style={{ padding: "16px 18px" }}>
                    {analyzing && !analysis && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[75, 90, 60].map((w, i) => (
                          <div key={i} style={{
                            height: 10, width: `${w}%`,
                            background: "#12102a", borderRadius: 4,
                            animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
                          }} />
                        ))}
                      </div>
                    )}

                    {analyzeError && !analyzing && (
                      <div style={{
                        padding: "10px 14px", background: "#f8717110",
                        border: "1px solid #f8717130", borderRadius: 8,
                      }}>
                        <p style={{ fontSize: "0.75rem", color: "#f87171", margin: 0, lineHeight: 1.6 }}>
                          {analyzeError}
                        </p>
                      </div>
                    )}

                    {analysis?.narrative && (
                      <p style={{ fontSize: "0.83rem", color: "#8a86a8", lineHeight: 1.8, margin: 0 }}>
                        {analysis.narrative}
                      </p>
                    )}

                    {!analyzing && !analyzeError && !analysis && capsule.evidence.length === 0 && (
                      <p style={{ fontSize: "0.75rem", color: "#2e2c45", margin: 0 }}>
                        No anomalies found in this log stream.
                      </p>
                    )}
                  </div>
                </div>

                {/* Evidence */}
                {capsule.evidence.length > 0 && (
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: 14,
                    }}>
                      <span style={{
                        fontSize: "0.65rem", color: "#2e2c45",
                        textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
                      }}>
                        Evidence
                      </span>
                      <span style={{
                        fontSize: "0.65rem", color: "#2e2c45",
                        fontFamily: "var(--font-mono)",
                      }}>
                        {capsule.evidence.length} lines extracted
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {getEnrichedEvidence().map((ev, i) => {
                        const cfg = ROLE_CONFIG[ev.role] ?? ROLE_CONFIG.consequence;
                        return (
                          <div key={i} style={{
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            borderLeft: `3px solid ${cfg.border.replace("40", "cc")}`,
                            borderRadius: 10,
                            padding: "14px 16px",
                          }}>
                            {/* Top row: badge + line number */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span className={`badge ${cfg.badge}`}>
                                {cfg.label}
                              </span>
                              <span style={{ fontSize: "0.62rem", color: "#3a3858", fontFamily: "var(--font-mono)" }}>
                                line {ev.line.toLocaleString()}
                              </span>
                            </div>

                            {/* Log text */}
                            <div style={{
                              fontSize: "0.77rem", color: "#9a96b8",
                              fontFamily: "var(--font-mono)", lineHeight: 1.6,
                              wordBreak: "break-all",
                            }}>
                              {ev.text}
                            </div>

                            {/* Claude explanation */}
                            {ev.explanation && (
                              <div style={{
                                marginTop: 10, paddingTop: 10,
                                borderTop: `1px solid ${cfg.border}`,
                                fontSize: "0.72rem", color: "#4a4762", lineHeight: 1.65,
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
                    padding: "24px", background: "#09090f",
                    border: "1px solid #0e0e1a", borderRadius: 10,
                    textAlign: "center",
                  }}>
                    <p style={{ color: "#2e2c45", fontSize: "0.82rem", lineHeight: 1.8 }}>
                      No anomalies detected. Try logs containing ERROR, WARN,
                      exception, or timeout messages.
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
