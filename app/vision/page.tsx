import Btn from "@/components/Btn";
import ReadingProgress from "@/components/ReadingProgress";

export default function VisionPage() {
  return (
    <>
      <ReadingProgress />

      <article style={{ position: "relative", zIndex: 1, padding: "80px 24px 160px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>

          {/* Eyebrow pill */}
          <div style={{ marginBottom: 32 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px 5px 10px",
              borderRadius: 999,
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(167,139,250,0.22)",
              backdropFilter: "blur(12px)",
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#7c3aed",
                boxShadow: "0 0 8px rgba(124,58,237,0.8)",
              }} />
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#7c3aed",
              }}>
                Vision · June 2025
              </span>
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            color: "#e8e4f0",
            marginBottom: 20,
          }}>
            Logs for agents,<br />
            <span className="gradient-text">not for humans</span>
          </h1>

          <p style={{
            color: "#3d3a58", marginBottom: 56,
            fontSize: "0.85rem", letterSpacing: "0.01em",
          }}>
            A thesis on why observability needs a second reader.
          </p>

          {/* Divider */}
          <hr className="divider" style={{ marginBottom: 56 }} />

          {/* ── Section 1 ── */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: "1.45rem", fontWeight: 700,
              letterSpacing: "-0.03em", color: "#e8e4f0",
              lineHeight: 1.3, marginBottom: 24,
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <span className="section-num" style={{ marginTop: 4 }}>01</span>
              The last log was written to be read by a human.
            </h2>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 20, fontSize: "0.98rem" }}>
              For thirty years, the mental model was simple. A server writes a line.
              A person opens a terminal and reads it. When volume grew, people built
              dashboards — Kibana, Datadog, Grafana — visual layers on top of the
              stream so a human could still glance and orient. The interface changed.
              The reader didn&apos;t.
            </p>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 28, fontSize: "0.98rem" }}>
              Every advance in observability was an advance in making logs more
              human-readable. Structured logging so you could filter without grep.
              Distributed tracing so a single request could be followed across a dozen
              services. Dashboards, alerts, on-call rotations — all of it designed
              around the assumption that a person would eventually show up, scroll,
              and figure it out.
            </p>

            <div className="pull-quote">
              <p style={{ color: "#c4b5fd", fontSize: "1.05rem", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                The dashboard is a beautiful, elaborate apology for the fact that
                nobody can read the logs anymore.
              </p>
            </div>

            <p style={{ color: "#6b6888", lineHeight: 1.9, fontSize: "0.98rem" }}>
              And the volume kept winning. One microservice now emits millions of
              lines a day. A real incident spans the whole fleet at once. Most
              platform work is still a person at a terminal at 3am, running{" "}
              <code style={{
                fontFamily: "var(--font-mono)", fontSize: "0.82em",
                background: "#13132a", border: "1px solid #1e1e38",
                borderRadius: 4, padding: "1px 6px", color: "#a78bfa",
              }}>kubectl</code>{" "}
              against one pod at a time, scrolling, guessing,
              paging the next person when they run out of guesses.
            </p>
          </div>

          <hr className="divider" style={{ marginBottom: 48 }} />

          {/* ── Section 2 ── */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: "1.45rem", fontWeight: 700,
              letterSpacing: "-0.03em", color: "#e8e4f0",
              lineHeight: 1.3, marginBottom: 24,
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <span className="section-num" style={{ marginTop: 4 }}>02</span>
              The reader changed.
            </h2>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 20, fontSize: "0.98rem" }}>
              Debugging runs through an agent now. Claude Code, Codex, whatever you
              point at the incident. And the agent inherits a stack built for eyes
              it does not have. It cannot glance at a dashboard. It cannot scroll
              forever. Its memory is finite and it pays by the token.
            </p>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 28, fontSize: "0.98rem" }}>
              So we hand it the same firehose we could never read ourselves, and we
              watch it do what we did: take a thin slice, miss the line that mattered,
              run out of room.
            </p>

            <div className="pull-quote">
              <p style={{ color: "#c4b5fd", fontSize: "1.05rem", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                The infrastructure was built for the wrong reader.
              </p>
            </div>

            <p style={{ color: "#6b6888", lineHeight: 1.9, fontSize: "0.98rem" }}>
              When an agent tries to read logs for debugging, individual developers
              burn enormous amounts of tokens and context on routine noise — normal
              startup messages, cache hits, health checks — before the agent ever
              reaches the error. Platform teams may have millions of lines per day
              across thousands of pods. More than any agent context window can hold
              at all. Tools like Claude Code already hit this wall and respond by
              compacting mid-session, losing state. Cypra prevents that by
              pre-processing logs before they reach the agent.
            </p>
          </div>

          <hr className="divider" style={{ marginBottom: 48 }} />

          {/* ── Section 3 ── */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: "1.45rem", fontWeight: 700,
              letterSpacing: "-0.03em", color: "#e8e4f0",
              lineHeight: 1.3, marginBottom: 24,
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <span className="section-num" style={{ marginTop: 4 }}>03</span>
              How it works.
            </h2>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 20, fontSize: "0.98rem" }}>
              The core insight is that most log lines are the same line, slightly
              different.{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82em", background: "#13132a", border: "1px solid #1e1e38", borderRadius: 4, padding: "1px 6px", color: "#a78bfa" }}>
                GET /v1/users/123 200
              </code>{" "}
              and{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82em", background: "#13132a", border: "1px solid #1e1e38", borderRadius: 4, padding: "1px 6px", color: "#a78bfa" }}>
                GET /v1/users/456 200
              </code>{" "}
              are not two pieces of information —
              they are one template with a variable slot. Cypra uses a variant of
              the <strong style={{ color: "#e8e4f0", fontWeight: 600 }}>Drain algorithm</strong> to group log lines into templates,
              identify which tokens are constant and which are variable, and compute
              statistical distributions over the variable slots.
            </p>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 28, fontSize: "0.98rem" }}>
              The result is not a summary. Nothing is invented or paraphrased.
              Every evidence entry is a verbatim log line with a real line-number
              citation. What Cypra produces is a strict JSON document called an{" "}
              <strong style={{ color: "#e8e4f0", fontWeight: 600 }}>IncidentCapsule</strong> — the smallest possible representation
              that preserves full debugging signal.
            </p>

            {/* Code block — double-bezel */}
            <div style={{
              margin: "2rem 0",
              borderRadius: 16,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: 2,
            }}>
              <div style={{
                borderRadius: 14,
                background: "#04040e",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}>
                {/* Titlebar */}
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
                  <span style={{ marginLeft: 10, fontSize: "0.62rem", color: "#2e2c45", fontFamily: "var(--font-mono)" }}>
                    incident_capsule.json
                  </span>
                </div>
                <pre style={{
                  padding: "20px 24px",
                  color: "#64618a",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11.5px",
                  lineHeight: 2,
                  margin: 0,
                  overflowX: "auto",
                }}>
{"{\n  "}<span style={{ color: "#e2e0f0" }}>&quot;service&quot;</span>{": &quot;api&quot;,\n  "}<span style={{ color: "#e2e0f0" }}>&quot;window&quot;</span>{": &quot;14:22:11 to 15:22:11&quot;,\n  "}<span style={{ color: "#c4b5fd" }}>&quot;compression&quot;</span>{": 8021,\n  "}<span style={{ color: "#e2e0f0" }}>&quot;evidence&quot;</span>{": [\n    { \"role\": "}<span style={{ color: "#f87171" }}>&quot;root_cause&quot;</span>{", \"line\": 412847, \"text\": \"psycopg2.OperationalError\" },\n    { \"role\": "}<span style={{ color: "#fbbf24" }}>&quot;trigger&quot;</span>{"   , \"line\": 412831, \"text\": \"pool acquire 480ms\" },\n    { \"role\": "}<span style={{ color: "#60a5fa" }}>&quot;consequence&quot;</span>{", \"line\": 412854, \"text\": \"queue=18, dropping\" }\n  ],\n  "}<span style={{ color: "#e2e0f0" }}>&quot;routine_summary&quot;</span>{": { \"total_lines\": 1085399, \"templates\": 15 }\n}"}
                </pre>
              </div>
            </div>

            <p style={{ color: "#6b6888", lineHeight: 1.9, fontSize: "0.98rem" }}>
              The <em style={{ color: "#c4b5fd", fontStyle: "normal" }}>compression</em> field tells you how many times smaller the
              capsule is than the raw input — in this case, 8,021×. The agent
              receives the capsule instead of the raw stream and arrives directly
              at the causal chain: what triggered the failure, what the root cause
              was, and what cascaded downstream.
            </p>
          </div>

          <hr className="divider" style={{ marginBottom: 48 }} />

          {/* ── Section 4: Numbers ── */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: "1.45rem", fontWeight: 700,
              letterSpacing: "-0.03em", color: "#e8e4f0",
              lineHeight: 1.3, marginBottom: 24,
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <span className="section-num" style={{ marginTop: 4 }}>04</span>
              The numbers.
            </h2>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 32, fontSize: "0.98rem" }}>
              Benchmarked on <strong style={{ color: "#e8e4f0", fontWeight: 600 }}>LogHub-2.0</strong> — 42,000 lines across
              14 production systems — and an 80-window agent diagnosis evaluation
              judged by GPT-4.5.
            </p>

            {/* Stats grid — double-bezel outer shell */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 10, marginBottom: 32,
            }}>
              {[
                { val: "+0.146", unit: "pts", desc: "agent diagnosis accuracy vs raw logs at 3k-line windows", color: "#a78bfa" },
                { val: "18,098", unit: "tkns", desc: "fewer tokens consumed per debug session on average", color: "#60a5fa" },
                { val: "+0.111", unit: "pts", desc: "template accuracy improvement over bare Drain3", color: "#34d399" },
                { val: "88k", unit: "/sec", desc: "log lines processed on a single CPU core", color: "#fbbf24" },
              ].map((s) => (
                <div key={s.val} className="vision-stat">
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
                    <span style={{
                      fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em",
                      lineHeight: 1, color: s.color, fontFamily: "var(--font-mono)",
                    }}>
                      {s.val}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: s.color, opacity: 0.6, fontFamily: "var(--font-mono)" }}>
                      {s.unit}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#3d3a58", lineHeight: 1.6, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pull-quote">
              <p style={{ color: "#c4b5fd", fontSize: "1rem", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                At small windows (&lt;300 lines), raw logs actually win — and we say so.
                The advantage is specifically when volume exceeds what an agent can hold.
              </p>
            </div>
          </div>

          <hr className="divider" style={{ marginBottom: 48 }} />

          {/* ── Section 5: Integration ── */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: "1.45rem", fontWeight: 700,
              letterSpacing: "-0.03em", color: "#e8e4f0",
              lineHeight: 1.3, marginBottom: 24,
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <span className="section-num" style={{ marginTop: 4 }}>05</span>
              How to use it.
            </h2>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 20, fontSize: "0.98rem" }}>
              Cypra integrates in three ways. Running{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82em", background: "#13132a", border: "1px solid #1e1e38", borderRadius: 4, padding: "1px 6px", color: "#a78bfa" }}>
                cypra setup
              </code>{" "}
              detects Claude Code, installs a hook, and registers an MCP server — from that
              point every log Claude Code reads goes through Cypra automatically.
              For Codex or any MCP-compatible agent,{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82em", background: "#13132a", border: "1px solid #1e1e38", borderRadius: 4, padding: "1px 6px", color: "#a78bfa" }}>
                cypra mcp serve
              </code>{" "}
              exposes <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82em", background: "#13132a", border: "1px solid #1e1e38", borderRadius: 4, padding: "1px 6px", color: "#a78bfa" }}>tail_aws_logs</code>,{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82em", background: "#13132a", border: "1px solid #1e1e38", borderRadius: 4, padding: "1px 6px", color: "#a78bfa" }}>tail_vercel</code>, and{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82em", background: "#13132a", border: "1px solid #1e1e38", borderRadius: 4, padding: "1px 6px", color: "#a78bfa" }}>wrap</code>{" "}
              as tools.
            </p>

            <p style={{ color: "#6b6888", lineHeight: 1.9, marginBottom: 24, fontSize: "0.98rem" }}>
              For everything else,{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82em", background: "#13132a", border: "1px solid #1e1e38", borderRadius: 4, padding: "1px 6px", color: "#a78bfa" }}>
                cypra wrap --
              </code>{" "}
              is a drop-in prefix that works with any log-emitting command:
            </p>

            {/* Terminal block — double-bezel */}
            <div style={{
              margin: "1.5rem 0",
              borderRadius: 14,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: 2,
            }}>
              <div style={{
                borderRadius: 12,
                background: "#04040e",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}>
                <div style={{
                  background: "rgba(255,255,255,0.025)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  padding: "9px 14px",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
                  <span style={{ marginLeft: 10, fontSize: "0.62rem", color: "#2e2c45", fontFamily: "var(--font-mono)" }}>
                    terminal
                  </span>
                </div>
                <pre style={{
                  padding: "18px 22px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px", lineHeight: 2.1,
                  margin: 0, color: "#4a4870",
                }}>
                  <span style={{ color: "#2e2c45" }}>$ </span><span style={{ color: "#a78bfa" }}>cypra wrap --</span> kubectl logs -n prod api{"\n"}
                  <span style={{ color: "#2e2c45" }}>$ </span><span style={{ color: "#a78bfa" }}>cypra wrap --</span> vercel logs --since 1h{"\n"}
                  <span style={{ color: "#2e2c45" }}>$ </span><span style={{ color: "#a78bfa" }}>cypra wrap --</span> aws logs tail /prod/api{"\n"}
                  <span style={{ color: "#2e2c45" }}>$ </span><span style={{ color: "#a78bfa" }}>cypra wrap --</span> docker compose logs api
                </pre>
              </div>
            </div>

            <p style={{ color: "#6b6888", lineHeight: 1.9, fontSize: "0.98rem" }}>
              Supported sources: Vercel, AWS CloudWatch, Railway, Kubernetes,
              Docker, Datadog, Sentry, journalctl, and any stdout-emitting command.
            </p>
          </div>

          {/* ── CTA ── */}
          <div className="vision-cta" data-reveal>
            {/* Subtle background orb */}
            <div style={{
              position: "absolute", top: -40, right: -40,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{
                fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#7c3aed", marginBottom: 14,
              }}>
                No signup required
              </p>
              <h3 style={{
                fontSize: "1.5rem", fontWeight: 700,
                letterSpacing: "-0.03em", color: "#e8e4f0",
                marginBottom: 10, lineHeight: 1.3,
              }}>
                See it on your own logs.
              </h3>
              <p style={{ color: "#4a4870", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 28, maxWidth: 420 }}>
                Paste any log stream and get back a structured IncidentCapsule in under a second.
                Claude AI annotates each evidence line automatically.
              </p>
              <Btn href="/compress" variant="primary" style={{ fontSize: "0.9rem", padding: "11px 28px" }}>
                Try the compressor
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 2 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Btn>
            </div>
          </div>

        </div>
      </article>
    </>
  );
}
