import Btn from "@/components/Btn";

export default function VisionPage() {
  return (
    <article style={{ position: "relative", zIndex: 1, padding: "80px 24px 140px" }}>
      <div className="prose">

        {/* Eyebrow */}
        <p style={{
          fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#3d3a58", marginBottom: 28,
        }}>
          Vision
        </p>

        <h1>
          Logs for agents,<br />
          <span className="gradient-text">not for humans</span>
        </h1>

        <p style={{ color: "#3d3a58", marginTop: 8, marginBottom: 48, fontSize: "0.82rem", letterSpacing: "0.01em" }}>
          June 2025
        </p>

        <hr />

        {/* Section 1 */}
        <h2>The last log was written to be read by a human.</h2>

        <p>
          For thirty years, the mental model was simple. A server writes a line.
          A person opens a terminal and reads it. When volume grew, people built
          dashboards — Kibana, Datadog, Grafana — visual layers on top of the
          stream so a human could still glance and orient. The interface changed.
          The reader didn't.
        </p>

        <p>
          Every advance in observability was an advance in making logs more
          human-readable. Structured logging so you could filter without grep.
          Distributed tracing so a single request could be followed across a dozen
          services. Dashboards, alerts, on-call rotations — all of it designed
          around the assumption that a person would eventually show up, scroll,
          and figure it out.
        </p>

        <blockquote>
          The dashboard is a beautiful, elaborate apology for the fact that
          nobody can read the logs anymore.
        </blockquote>

        <p>
          And the volume kept winning. One microservice now emits millions of
          lines a day. A real incident spans the whole fleet at once. Most
          platform work is still a person at a terminal at 3am, running{" "}
          <code>kubectl</code> against one pod at a time, scrolling, guessing,
          paging the next person when they run out of guesses.
        </p>

        <hr />

        {/* Section 2 */}
        <h2>The reader changed.</h2>

        <p>
          Debugging runs through an agent now. Claude Code, Codex, whatever you
          point at the incident. And the agent inherits a stack built for eyes
          it does not have. It cannot glance at a dashboard. It cannot scroll
          forever. Its memory is finite and it pays by the token.
        </p>

        <p>
          So we hand it the same firehose we could never read ourselves, and we
          watch it do what we did: take a thin slice, miss the line that mattered,
          run out of room.
        </p>

        <blockquote>
          The infrastructure was built for the wrong reader.
        </blockquote>

        <p>
          When an agent tries to read logs for debugging, individual developers
          burn enormous amounts of tokens and context on routine noise — normal
          startup messages, cache hits, health checks — before the agent ever
          reaches the error. Platform teams may have millions of lines per day
          across thousands of pods. More than any agent context window can hold
          at all. Tools like Claude Code already hit this wall and respond by
          compacting mid-session, losing state. Cypra prevents that by
          pre-processing logs before they reach the agent.
        </p>

        <hr />

        {/* Section 3 — The engine */}
        <h2>How it works.</h2>

        <p>
          The core insight is that most log lines are the same line, slightly
          different. <code>GET /v1/users/123 200</code> and{" "}
          <code>GET /v1/users/456 200</code> are not two pieces of information —
          they are one template with a variable slot. Cypra uses a variant of
          the <strong>Drain algorithm</strong> to group log lines into templates,
          identify which tokens are constant and which are variable, and compute
          statistical distributions over the variable slots.
        </p>

        <p>
          The result is not a summary. Nothing is invented or paraphrased.
          Every evidence entry is a verbatim log line with a real line-number
          citation. What Cypra produces is a strict JSON document called an{" "}
          <strong>IncidentCapsule</strong> — the smallest possible representation
          that preserves full debugging signal.
        </p>

        <div className="code-block" style={{ margin: "2rem 0" }}>
          <pre style={{ color: "#64618a", fontSize: "11.5px", lineHeight: 2 }}>
{`{
  `}<span style={{ color: "#e2e0f0" }}>"service"</span>{`: "api",
  `}<span style={{ color: "#e2e0f0" }}>"window"</span>{`: "14:22:11 to 15:22:11",
  `}<span style={{ color: "#c4b5fd" }}>"compression"</span>{`: 8021,
  `}<span style={{ color: "#e2e0f0" }}>"evidence"</span>{`: [
    { "role": `}<span style={{ color: "#f87171" }}>"root_cause"</span>{`, "line": 412847, "text": "psycopg2.OperationalError" },
    { "role": `}<span style={{ color: "#fbbf24" }}>"trigger"</span>{`,    "line": 412831, "text": "pool acquire 480ms" },
    { "role": `}<span style={{ color: "#60a5fa" }}>"consequence"</span>{`, "line": 412854, "text": "pool exhausted, queue=18" }
  ],
  `}<span style={{ color: "#e2e0f0" }}>"routine_summary"</span>{`: { "total_lines": 1085399, "templates": 15 }
}`}
          </pre>
        </div>

        <p>
          The <em>compression</em> field tells you how many times smaller the
          capsule is than the raw input — in this case, 8,021×. The agent
          receives the capsule instead of the raw stream and arrives directly
          at the causal chain: what triggered the failure, what the root cause
          was, and what cascaded downstream.
        </p>

        <hr />

        {/* Section 4 — Numbers */}
        <h2>The numbers.</h2>

        <p>
          We benchmarked on <strong>LogHub-2.0</strong>, a labeled dataset of
          42,000 lines across 14 production systems, and on an 80-window agent
          diagnosis evaluation judged by GPT-4.5.
        </p>

        <p>
          Against raw logs at 3,000-line windows — the realistic production case
          where raw logs overflow the context budget and evidence is lost before
          the agent reaches it — Cypra scores <strong>+0.146 higher</strong>{" "}
          on agent diagnosis accuracy (p &lt; 0.001) while sending{" "}
          <strong>18,098 fewer tokens</strong> per session.
        </p>

        <p>
          Template accuracy is <strong>+0.111 better</strong> than bare Drain3
          (the most popular open-source log parser), with identical grouping
          accuracy and purity. The grouping engine runs at{" "}
          <strong>88,000 lines per second</strong> on a single core.
        </p>

        <blockquote>
          At small windows (&lt;300 lines), raw logs actually win — and we say so.
          The advantage is specifically when volume exceeds what an agent can hold.
        </blockquote>

        <hr />

        {/* Section 5 — Integration */}
        <h2>How to use it.</h2>

        <p>
          Cypra integrates in three ways. Running <code>cypra setup</code> detects
          Claude Code, installs a hook, and registers an MCP server — from that
          point every log Claude Code reads goes through Cypra automatically.
          For Codex or any MCP-compatible agent, <code>cypra mcp serve</code>{" "}
          exposes <code>tail_aws_logs</code>, <code>tail_vercel</code>, and{" "}
          <code>wrap</code> as tools.
        </p>

        <p>
          For everything else, <code>cypra wrap --</code> is a drop-in prefix
          that works with any log-emitting command:
        </p>

        <div className="code-block" style={{ margin: "1.5rem 0" }}>
          <pre style={{ color: "#4a4870" }}>
{`cypra wrap -- `}<span style={{ color: "#a78bfa" }}>kubectl logs -n prod api
</span>{`cypra wrap -- `}<span style={{ color: "#a78bfa" }}>vercel logs --since 1h
</span>{`cypra wrap -- `}<span style={{ color: "#a78bfa" }}>aws logs tail /prod/api
</span>{`cypra wrap -- `}<span style={{ color: "#a78bfa" }}>docker compose logs api</span>
          </pre>
        </div>

        <p>
          Supported sources: Vercel, AWS CloudWatch, Railway, Kubernetes,
          Docker, Datadog, Sentry, journalctl, and any stdout-emitting command.
        </p>

        <hr />

        {/* CTA */}
        <div style={{ marginTop: 48 }}>
          <p style={{ color: "#3d3a58", fontSize: "0.82rem", marginBottom: 24 }}>
            See it working on your own logs — no signup required.
          </p>
          <Btn href="/compress" variant="primary" style={{ fontSize: "0.9rem", padding: "11px 28px" }}>
            Try the compressor →
          </Btn>
        </div>

      </div>
    </article>
  );
}
