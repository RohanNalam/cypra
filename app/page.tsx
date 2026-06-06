import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center relative overflow-hidden">
      {/* Background glow orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed18 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            background: "#7c3aed18",
            border: "1px solid #7c3aed44",
            color: "#c4b5fd",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" />
          Log intelligence for AI agents
        </div>

        <h1 className="text-6xl font-bold leading-tight mb-6">
          <span className="text-white">Logs your agent</span>
          <br />
          <span className="gradient-text">can actually read</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Cypra compresses millions of raw log lines into compact
          IncidentCapsules — structured JSON your AI agent can reason over
          without blowing its context budget.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/compress"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              color: "white",
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
          >
            Start compressing →
          </Link>
          <Link
            href="/vision"
            style={{
              background: "transparent",
              color: "#c4b5fd",
              border: "1px solid #3b3560",
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: "12px",
              fontWeight: 500,
              fontSize: "1rem",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            How it works
          </Link>
        </div>

        {/* Quick stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "95%", label: "fewer tokens" },
            { value: "168×", label: "line compression" },
            { value: "<1ms", label: "per line" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold shimmer-text">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
