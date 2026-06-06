"use client";

import { useState, useEffect, useRef } from "react";
import { compress, IncidentCapsule } from "@/lib/drain";

const SAMPLE_LOGS = `2024-03-15T14:22:01.123Z INFO  [api] GET /v1/health 200 3ms
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

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "anon";
  const key = "cypra_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function RoleTag({ role }: { role: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    root_cause: { bg: "#f8717115", text: "#f87171", border: "#f8717133" },
    trigger: { bg: "#fbbf2415", text: "#fbbf24", border: "#fbbf2433" },
    consequence: { bg: "#60a5fa15", text: "#60a5fa", border: "#60a5fa33" },
  };
  const c = colors[role] ?? { bg: "#ffffff10", text: "#ffffff", border: "#ffffff30" };
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {role}
    </span>
  );
}

function CapsuleView({ capsule }: { capsule: IncidentCapsule }) {
  const [view, setView] = useState<"visual" | "json">("visual");
  const jsonStr = JSON.stringify(capsule, null, 2);

  const copyJson = () => {
    navigator.clipboard.writeText(jsonStr);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["visual", "json"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                background: view === v ? "#7c3aed30" : "transparent",
                color: view === v ? "#c4b5fd" : "#6b7280",
                border: view === v ? "1px solid #7c3aed55" : "1px solid transparent",
              }}
            >
              {v === "visual" ? "Visual" : "JSON"}
            </button>
          ))}
        </div>
        <button
          onClick={copyJson}
          className="text-xs text-gray-500 hover:text-violet-300 transition-colors px-2 py-1 rounded"
          style={{ border: "1px solid #2a2a3a" }}
        >
          Copy JSON
        </button>
      </div>

      {view === "visual" ? (
        <div className="space-y-4">
          {/* Meta row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Service", value: capsule.service },
              { label: "Compression", value: `${capsule.compression.toLocaleString()}×` },
              { label: "Total lines", value: capsule.routine_summary.total_lines.toLocaleString() },
              { label: "Templates", value: capsule.routine_summary.templates },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg p-3 text-center"
                style={{ background: "#0f0f1a", border: "1px solid #1e1e2e" }}
              >
                <div
                  className="text-lg font-bold font-mono"
                  style={{ color: "#c4b5fd" }}
                >
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Window */}
          <div
            className="text-xs text-gray-400 px-3 py-2 rounded-lg font-mono"
            style={{ background: "#0f0f1a", border: "1px solid #1e1e2e" }}
          >
            window: {capsule.window}
          </div>

          {/* Evidence */}
          {capsule.evidence.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Evidence ({capsule.evidence.length} lines)
              </div>
              {capsule.evidence.map((ev, i) => (
                <div
                  key={i}
                  className="rounded-lg p-4 flex flex-col gap-2"
                  style={{ background: "#0a0a12", border: "1px solid #1e1e2e" }}
                >
                  <div className="flex items-center gap-2">
                    <RoleTag role={ev.role} />
                    <span className="text-xs text-gray-600 font-mono">
                      line {ev.line.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-200 font-mono leading-relaxed break-all">
                    {ev.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-lg p-6 text-center text-gray-500 text-sm"
              style={{ background: "#0f0f1a", border: "1px dashed #2a2a3a" }}
            >
              No anomalies or errors detected in these logs.
              <br />
              <span className="text-xs text-gray-600 mt-1 block">
                Try pasting logs that contain ERROR, WARN, exception, or timeout messages.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="code-block p-4 overflow-x-auto max-h-[480px] overflow-y-auto">
          <pre className="text-xs text-gray-300 leading-relaxed">{jsonStr}</pre>
        </div>
      )}
    </div>
  );
}

export default function CompressPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [service, setService] = useState("api");
  const [capsule, setCapsule] = useState<IncidentCapsule | null>(null);
  const [loading, setLoading] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    setLineCount(input.split("\n").filter((l) => l.trim()).length);
  }, [input]);

  function handleCompress() {
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setCapsule(compress(input, service || "service"));
      setLoading(false);
    }, 400);
  }

  function loadSample() {
    setInput(SAMPLE_LOGS);
    setService("api");
    setCapsule(null);
  }

  function handleClear() {
    setInput("");
    setCapsule(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-bold text-white">Log Compressor</h1>
          {sessionId && (
            <span
              className="text-xs font-mono text-gray-600 px-2 py-1 rounded"
              style={{ background: "#0f0f1a", border: "1px solid #1e1e2e" }}
              title="Your private session ID — no data is stored on our servers"
            >
              session: {sessionId.slice(0, 8)}…
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm">
          Paste any log output below. Cypra groups lines into templates, tags
          anomalies with causal roles, and emits an IncidentCapsule your agent
          can reason over.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: input */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400 font-medium">
              Raw logs
            </label>
            <div className="flex items-center gap-2">
              {lineCount > 0 && (
                <span className="text-xs text-gray-600">
                  {lineCount.toLocaleString()} lines
                </span>
              )}
              <button
                onClick={loadSample}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Load sample
              </button>
              {input && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste logs here…\n\n2024-03-15T14:22:01Z INFO [api] GET /v1/health 200 3ms\n2024-03-15T14:22:11Z ERROR [db] connection pool exhausted\n…`}
            className="w-full font-mono text-xs text-gray-300 resize-none focus:outline-none"
            style={{
              background: "#060610",
              border: "1px solid #1e1e2e",
              borderRadius: "10px",
              padding: "16px",
              minHeight: "420px",
              lineHeight: "1.7",
              caretColor: "#c4b5fd",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "#7c3aed66")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "#1e1e2e")
            }
            spellCheck={false}
          />

          {/* Service name + compress button */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs text-gray-500 whitespace-nowrap">
                Service name
              </label>
              <input
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="api"
                className="flex-1 px-3 py-2 text-sm text-gray-200 focus:outline-none rounded-lg"
                style={{
                  background: "#0f0f1a",
                  border: "1px solid #2a2a3a",
                  color: "#e2e8f0",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed66")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2a3a")}
              />
            </div>
            <button
              onClick={handleCompress}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 px-6 py-2 rounded-xl font-semibold text-sm transition-all"
              style={{
                background:
                  !input.trim() || loading
                    ? "#3b3560"
                    : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                color: !input.trim() || loading ? "#6b7280" : "white",
                cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Compressing…" : "Compress →"}
            </button>
          </div>
        </div>

        {/* Right: output */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400 font-medium">
              IncidentCapsule
            </label>
            {capsule && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "#4ade8015",
                  color: "#4ade80",
                  border: "1px solid #4ade8033",
                }}
              >
                ✓ Ready
              </span>
            )}
          </div>

          <div
            className="flex-1 rounded-xl overflow-hidden"
            style={{
              background: "#0a0a12",
              border: "1px solid #1e1e2e",
              minHeight: "420px",
              padding: "16px",
            }}
          >
            {capsule ? (
              <CapsuleView capsule={capsule} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-gray-600">
                <div className="text-4xl opacity-40">⬡</div>
                <div className="text-sm">
                  Paste logs on the left and hit{" "}
                  <span style={{ color: "#7c3aed" }}>Compress</span> to
                  generate an IncidentCapsule
                </div>
                <div className="text-xs text-gray-700">
                  All processing happens in your browser — no data leaves your
                  machine
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How it works mini */}
      <div className="mt-12 grid md:grid-cols-3 gap-4">
        {[
          {
            icon: "🧩",
            title: "Drain grouping",
            body:
              "Similar log lines are collapsed into templates. Variable slots (IDs, timestamps, numbers) are identified and summarised.",
          },
          {
            icon: "🎯",
            title: "Causal tagging",
            body:
              "Lines matching error, exception, and anomaly patterns are tagged root_cause, trigger, or consequence by line proximity.",
          },
          {
            icon: "🔒",
            title: "Private by default",
            body:
              "Compression runs entirely in your browser. Your session ID is stored only in localStorage and never sent to any server.",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-xl p-5"
            style={{ background: "#0f0f1a", border: "1px solid #1e1e2e" }}
          >
            <div className="text-2xl mb-3">{c.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-1">
              {c.title}
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
