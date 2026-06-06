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

const ROLE_COLORS: Record<string, string> = {
  root_cause: "#f87171",
  trigger: "#fbbf24",
  consequence: "#60a5fa",
};

function getSession() {
  if (typeof window === "undefined") return "";
  const k = "cypra_sid";
  let id = localStorage.getItem(k);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(k, id); }
  return id;
}

export default function CompressPage() {
  const [input, setInput] = useState("");
  const [service, setService] = useState("api");
  const [capsule, setCapsule] = useState<IncidentCapsule | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"visual" | "json">("visual");
  const [sid, setSid] = useState("");
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setSid(getSession()); }, []);

  const lines = input.split("\n").filter(l => l.trim()).length;

  function run() {
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setCapsule(compress(input, service || "service"));
      setLoading(false);
      setView("visual");
    }, 350);
  }

  function copyJson() {
    if (!capsule) return;
    navigator.clipboard.writeText(JSON.stringify(capsule, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{
        borderBottom: "1px solid #12121e",
        padding: "12px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: "0.78rem", color: "#7a7890", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Compress
          </span>
          {/* Service input inline */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", color: "#7a7890" }}>service</span>
            <input
              value={service}
              onChange={e => setService(e.target.value)}
              placeholder="api"
              style={{
                background: "transparent", border: "none", outline: "none",
                borderBottom: "1px solid #1e1e30",
                color: "#b0aac4", fontSize: "0.8rem", width: 80,
                padding: "2px 4px", fontFamily: "var(--font-mono)",
              }}
            />
          </div>
          {lines > 0 && (
            <span style={{ fontSize: "0.72rem", color: "#7a7890" }}>
              {lines.toLocaleString()} lines
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {sid && (
            <span style={{ fontSize: "0.68rem", color: "#5a5870", fontFamily: "var(--font-mono)" }}>
              {sid.slice(0, 8)}
            </span>
          )}
          <Btn variant="text" onClick={() => { setInput(SAMPLE); setCapsule(null); }}>
            load sample
          </Btn>
          {input && (
            <Btn variant="text" onClick={() => { setInput(""); setCapsule(null); }}>
              clear
            </Btn>
          )}
          <Btn
            variant="primary"
            onClick={run}
            disabled={!input.trim() || loading}
            style={{ fontSize: "0.82rem", padding: "7px 20px" }}
          >
            {loading ? "…" : "Compress"}
          </Btn>
        </div>
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1px 1fr", minHeight: 0 }}>
        {/* Left — log input */}
        <div style={{ padding: "28px 32px", overflow: "auto" }}>
          <textarea
            ref={taRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            className="minimal-textarea"
            placeholder={"Paste log output here…\n\n2024-03-15T14:22:11Z ERROR [db] connection pool exhausted\n2024-03-15T14:22:11Z ERROR [api] 500 Internal Server Error\n…"}
            style={{ minHeight: "calc(100vh - 180px)", width: "100%" }}
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div style={{ background: "#12121e" }} />

        {/* Right — output */}
        <div style={{ padding: "28px 32px", overflow: "auto" }}>
          {!capsule && !loading && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ color: "#5a5870", fontSize: "0.82rem", lineHeight: 1.9 }}>
                Paste any log stream on the left and hit{" "}
                <span style={{ color: "#3d3a58" }}>Compress</span>.
                <br />
                Cypra groups lines into templates, tags anomalies
                with causal roles, and returns an IncidentCapsule.
                <br /><br />
                <span style={{ color: "#18182a" }}>
                  All processing runs in your browser.
                  Nothing leaves your machine.
                </span>
              </p>
            </div>
          )}

          {loading && (
            <div style={{ color: "#7a7890", fontSize: "0.82rem", paddingTop: 8 }}>
              Compressing…
            </div>
          )}

          {capsule && !loading && (
            <div>
              {/* Output header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["visual", "json"] as const).map(v => (
                    <Btn
                      key={v}
                      variant={view === v ? "primary" : "ghost"}
                      onClick={() => setView(v)}
                      style={{ fontSize: "0.72rem", padding: "4px 12px", letterSpacing: "0.06em", textTransform: "uppercase" }}
                    >
                      {v}
                    </Btn>
                  ))}
                </div>
                <Btn variant="text" onClick={copyJson} style={{ color: copied ? "#c4b5fd" : undefined }}>
                  {copied ? "✓ copied" : "copy json"}
                </Btn>
              </div>

              {view === "visual" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {/* Meta */}
                  <div style={{ display: "flex", gap: 48 }}>
                    {[
                      { label: "service", val: capsule.service },
                      { label: "compression", val: `${capsule.compression.toLocaleString()}×` },
                      { label: "lines", val: capsule.routine_summary.total_lines.toLocaleString() },
                      { label: "templates", val: String(capsule.routine_summary.templates) },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: "0.68rem", color: "#7a7890", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#e8e4f0", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                          {s.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Window */}
                  <div>
                    <div style={{ fontSize: "0.68rem", color: "#7a7890", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                      window
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#3d3a58", fontFamily: "var(--font-mono)" }}>
                      {capsule.window}
                    </div>
                  </div>

                  {/* Evidence */}
                  {capsule.evidence.length > 0 ? (
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "#7a7890", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                        Evidence · {capsule.evidence.length} lines
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {capsule.evidence.map((ev, i) => (
                          <div key={i} style={{
                            display: "flex", gap: 16, alignItems: "flex-start",
                            padding: "14px 0",
                            borderTop: i === 0 ? "none" : "1px solid #0e0e18",
                          }}>
                            {/* Role */}
                            <div style={{ flexShrink: 0, width: 90, paddingTop: 1 }}>
                              <span style={{
                                fontSize: "0.68rem", fontWeight: 600,
                                color: ROLE_COLORS[ev.role] ?? "#b0aac4",
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.04em",
                              }}>
                                {ev.role}
                              </span>
                            </div>
                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: "0.78rem", color: "#b0aac4",
                                fontFamily: "var(--font-mono)",
                                lineHeight: 1.7, wordBreak: "break-all",
                              }}>
                                {ev.text}
                              </div>
                              <div style={{ fontSize: "0.65rem", color: "#5a5870", marginTop: 3 }}>
                                line {ev.line.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#5a5870", fontSize: "0.82rem", lineHeight: 1.8 }}>
                      No anomalies detected. Try logs containing ERROR, WARN,
                      exception, or timeout messages.
                    </p>
                  )}
                </div>
              ) : (
                <pre style={{
                  color: "#3d3a58", fontFamily: "var(--font-mono)",
                  fontSize: "11.5px", lineHeight: 1.85,
                  whiteSpace: "pre-wrap", wordBreak: "break-all",
                }}>
                  {JSON.stringify(capsule, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
