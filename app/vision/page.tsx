import Link from "next/link";

const capsuleExample = `{
  "service": "api",
  "window": "14:22:11 to 15:22:11",
  "compression": 8021,
  "evidence": [
    {
      "role": "root_cause",
      "line": 412847,
      "text": "psycopg2.OperationalError: pool exhausted"
    },
    {
      "role": "trigger",
      "line": 412831,
      "text": "pool acquire 480ms (threshold: 200ms)"
    },
    {
      "role": "consequence",
      "line": 412854,
      "text": "pool exhausted, queue=18, timeout=30s"
    }
  ],
  "routine_summary": {
    "total_lines": 1085399,
    "templates": 15
  }
}`;

export default function VisionPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 space-y-32">

      {/* Hero */}
      <section className="text-center relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% 0%, #7c3aed15 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6"
            style={{
              background: "#7c3aed18",
              border: "1px solid #7c3aed44",
              color: "#c4b5fd",
            }}
          >
            The Vision
          </span>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            <span className="text-white">Logs were built for humans.</span>
            <br />
            <span className="gradient-text">
              But the reader is now an AI.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Cypra sits between your log source and your AI coding agent,
            doing the filtering first — so the agent arrives at the error,
            not a wall of noise.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section>
        <SectionLabel>The Problem</SectionLabel>
        <h2 className="text-3xl font-bold text-white mb-8">
          1.2 million lines. One context window. Something has to give.
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: "🪣",
              title: "Context overflow",
              body:
                "Agents hit their limit mid-log and compact — losing state right before the relevant error.",
            },
            {
              icon: "💸",
              title: "Token waste",
              body:
                "Health checks, cache hits, and startup messages eat 90% of your budget before anything useful loads.",
            },
            {
              icon: "🔍",
              title: "No causal structure",
              body:
                "Raw logs are a flat stream. Agents can't distinguish root cause from consequence without explicit tags.",
            },
            {
              icon: "⏳",
              title: "Latency bottleneck",
              body:
                "Feeding full logs to an agent adds seconds of processing time and inference cost on every debug session.",
            },
          ].map((c) => (
            <div key={c.title} className="card p-6">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {c.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Engine */}
      <section>
        <SectionLabel>The Engine</SectionLabel>
        <h2 className="text-3xl font-bold text-white mb-4">
          Drain-based log templating, built for agents
        </h2>
        <p className="text-gray-400 mb-10 max-w-2xl">
          Cypra&apos;s core engine groups log lines into templates by identifying
          what&apos;s constant vs. variable in each line — then renders a
          compact oracle JSON your agent can actually reason over.
        </p>

        {/* Pipeline steps */}
        <div className="relative">
          {/* connector line */}
          <div
            className="absolute left-6 top-10 bottom-10 w-px hidden md:block"
            style={{
              background:
                "linear-gradient(to bottom, #7c3aed44, #7c3aed11)",
            }}
          />
          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Ingest",
                body:
                  "Any line-oriented log stream: stdin, Kubernetes, AWS CloudWatch, Vercel, Docker, journalctl.",
              },
              {
                step: "02",
                title: "Preprocess",
                body:
                  "Parse format-specific structure (JSON logs, syslog, Spark, HDFS) and redact PII automatically.",
              },
              {
                step: "03",
                title: "Template with Drain",
                body:
                  "Group lines into templates; identify variable slots and compute their statistical distribution.",
              },
              {
                step: "04",
                title: "Score & tag evidence",
                body:
                  "Flag lines as root_cause, trigger, or consequence based on anomaly detection and causal ordering.",
              },
              {
                step: "05",
                title: "Render IncidentCapsule",
                body:
                  "Emit a strict JSON document with compression ratio, verbatim cited lines, and a routine summary.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start md:pl-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold z-10"
                  style={{
                    background: "#0f0f1a",
                    border: "1px solid #3b3560",
                    color: "#c4b5fd",
                  }}
                >
                  {s.step}
                </div>
                <div className="card flex-1 p-5">
                  <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IncidentCapsule */}
      <section>
        <SectionLabel>The Output</SectionLabel>
        <h2 className="text-3xl font-bold text-white mb-4">
          The IncidentCapsule
        </h2>
        <p className="text-gray-400 mb-8 max-w-2xl">
          Every evidence entry is a verbatim log line with a real line-number
          citation — nothing invented or paraphrased. The agent gets
          compression ratio, causal tags, and a routine summary in one document.
        </p>

        <div className="grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 code-block p-5 overflow-x-auto">
            <pre className="text-sm">
              {capsuleExample.split("\n").map((line, i) => {
                const roleColors: Record<string, string> = {
                  root_cause: "#f87171",
                  trigger: "#fbbf24",
                  consequence: "#60a5fa",
                };
                const roleMatch = line.match(/"role": "(\w+)"/);
                const color = roleMatch ? roleColors[roleMatch[1]] : undefined;
                return (
                  <span
                    key={i}
                    style={{ color: color ?? "#e2e8f0", display: "block" }}
                  >
                    {line}
                  </span>
                );
              })}
            </pre>
          </div>

          <div className="md:col-span-2 space-y-3">
            {[
              {
                color: "#f87171",
                role: "root_cause",
                desc: "The line that actually caused the incident.",
              },
              {
                color: "#fbbf24",
                role: "trigger",
                desc: "The preceding condition that enabled the failure.",
              },
              {
                color: "#60a5fa",
                role: "consequence",
                desc: "Downstream effects cascading from the root cause.",
              },
            ].map((r) => (
              <div
                key={r.role}
                className="p-4 rounded-lg text-sm"
                style={{
                  background: `${r.color}10`,
                  border: `1px solid ${r.color}30`,
                }}
              >
                <div
                  className="font-mono font-bold mb-1"
                  style={{ color: r.color }}
                >
                  {r.role}
                </div>
                <div className="text-gray-400">{r.desc}</div>
              </div>
            ))}
            <div
              className="p-4 rounded-lg text-sm"
              style={{
                background: "#7c3aed10",
                border: "1px solid #7c3aed30",
              }}
            >
              <div className="font-mono font-bold mb-1 text-violet-300">
                compression: 8021
              </div>
              <div className="text-gray-400">
                The capsule is 8,021× smaller than the raw input.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benchmarks */}
      <section>
        <SectionLabel>Benchmarks</SectionLabel>
        <h2 className="text-3xl font-bold text-white mb-4">
          Better signal. Far fewer tokens.
        </h2>
        <p className="text-gray-400 mb-10 max-w-2xl">
          Evaluated on LogHub-2.0 (42k lines × 14 systems) and an 80-window
          agent diagnosis eval judged by GPT-4.5. Advantage emerges at 3,000+
          line windows, where raw logs overflow context and evidence is lost.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-4">
              Parser benchmark vs Drain3
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="pb-3">Metric</th>
                  <th className="pb-3">Result</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {[
                  ["Grouping accuracy", "Identical"],
                  ["Purity", "Identical"],
                  ["Template accuracy", "+0.111 ↑"],
                  ["Throughput", "88k lines/sec"],
                ].map(([m, v]) => (
                  <tr key={m} className="border-t border-gray-800">
                    <td className="py-2 text-gray-400">{m}</td>
                    <td
                      className="py-2 font-mono font-semibold"
                      style={{ color: "#c4b5fd" }}
                    >
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-6">
            <h3 className="text-white font-semibold mb-4">
              Agent diagnosis eval (3,000-line windows)
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="pb-3">Comparison</th>
                  <th className="pb-3">Δ Score</th>
                  <th className="pb-3">Δ Tokens</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["vs raw logs", "+0.146*", "−18,098"],
                  ["vs Drain3", "+0.078*", "−143"],
                ].map(([c, s, t]) => (
                  <tr key={c} className="border-t border-gray-800">
                    <td className="py-2 text-gray-400">{c}</td>
                    <td
                      className="py-2 font-mono font-semibold"
                      style={{ color: "#4ade80" }}
                    >
                      {s}
                    </td>
                    <td
                      className="py-2 font-mono text-gray-300"
                    >
                      {t}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-gray-600 text-xs mt-3">* p &lt; 0.01</p>
          </div>
        </div>

        <div
          className="p-5 rounded-xl text-sm text-gray-400 leading-relaxed"
          style={{ background: "#7c3aed08", border: "1px solid #3b3560" }}
        >
          <strong className="text-violet-300">Honest caveat:</strong> at small
          windows (&lt;300 lines) where raw logs fit the context budget, raw
          logs actually win. Cypra&apos;s advantage is specifically when log
          volume exceeds what an agent can hold — which is the realistic
          production case.
        </div>
      </section>

      {/* Integration */}
      <section>
        <SectionLabel>Integration</SectionLabel>
        <h2 className="text-3xl font-bold text-white mb-8">
          Works with every log source
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              title: "Claude Code",
              badge: "Auto",
              body:
                "codag setup detects Claude Code, installs a hook, and registers an MCP server. Every log read goes through Cypra automatically.",
              code: "cypra setup",
            },
            {
              title: "Universal wrap",
              badge: "Any source",
              body:
                "A drop-in CLI prefix that works with any log-emitting command over stdout.",
              code: "cypra wrap -- kubectl logs -n prod api",
            },
            {
              title: "MCP server",
              badge: "Drop-in",
              body:
                "Run the MCP server and point any MCP-compatible agent at it. Tools: tail_aws_logs, tail_vercel, wrap.",
              code: "cypra mcp serve",
            },
          ].map((i) => (
            <div key={i.title} className="card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{i.title}</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "#7c3aed22",
                    color: "#c4b5fd",
                    border: "1px solid #7c3aed44",
                  }}
                >
                  {i.badge}
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">
                {i.body}
              </p>
              <div className="code-block p-3 text-xs text-violet-300 font-mono">
                {i.code}
              </div>
            </div>
          ))}
        </div>

        {/* Supported sources */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            "Vercel",
            "AWS CloudWatch",
            "Railway",
            "Kubernetes",
            "Docker",
            "Datadog",
            "Sentry",
            "journalctl",
            "stdout",
          ].map((s) => (
            <span
              key={s}
              className="px-3 py-1 rounded-full text-xs text-gray-400"
              style={{ background: "#1e1e2e", border: "1px solid #2a2a3a" }}
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-12">
        <div
          className="rounded-2xl p-12 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0f0f1a 0%, #1a1030 50%, #0f0f1a 100%)",
            border: "1px solid #3b3560",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 50%, #7c3aed15 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              See it working on your logs
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Paste any log file. Get an IncidentCapsule in seconds. No signup
              required.
            </p>
            <Link
              href="/compress"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                color: "white",
                display: "inline-block",
                padding: "14px 40px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
              }}
            >
              Try the compressor →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
      style={{
        background: "#7c3aed18",
        border: "1px solid #7c3aed33",
        color: "#c4b5fd",
      }}
    >
      {children}
    </div>
  );
}
