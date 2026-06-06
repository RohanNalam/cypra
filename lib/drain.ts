export interface LogTemplate {
  id: string;
  tokens: string[];   // "<*>" marks a variable slot
  lines: ParsedLine[];
  count: number;
}

export interface ParsedLine {
  lineNo: number;
  raw: string;
  timestamp?: string;
  level?: string;
  message: string;
}

export interface EvidenceLine {
  role: "root_cause" | "trigger" | "consequence";
  line: number;
  text: string;
}

export interface RoutineSummary {
  total_lines: number;
  templates: number;
}

export interface IncidentCapsule {
  service: string;
  window: string;
  compression: number;
  evidence: EvidenceLine[];
  routine_summary: RoutineSummary;
}

// ─── constants ───────────────────────────────────────────────────────────────

const ERROR_PATTERNS = [
  /error/i, /exception/i, /fatal/i, /panic/i, /critical/i,
  /traceback/i, /stacktrace/i, /segfault/i, /oom/i, /killed/i,
  /unhandled/i, /uncaught/i, /abort/i, /crash/i,
];

const TRIGGER_PATTERNS = [
  /warn/i, /slow/i, /timeout/i, /retry/i, /backoff/i,
  /high\s+latency/i, /elevated/i, /threshold/i, /queue/i, /lag/i,
  /pool\s+acquire/i, /connection\s+refused/i, /too\s+many/i,
];

const PII_PATTERNS: [RegExp, string][] = [
  [/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]"],
  [/\b4[0-9]{12}(?:[0-9]{3})?\b/g, "[CARD]"],
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]"],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[IP]"],
  [/bearer\s+[A-Za-z0-9._\-]+/gi, "bearer [TOKEN]"],
  [/password[=:]\s*\S+/gi, "password=[REDACTED]"],
  [/secret[=:]\s*\S+/gi, "secret=[REDACTED]"],
  [/token[=:]\s*[A-Za-z0-9._\-]+/gi, "token=[REDACTED]"],
];

// ─── preprocessing ────────────────────────────────────────────────────────────

function redactPII(text: string): string {
  let s = text;
  for (const [re, rep] of PII_PATTERNS) s = s.replace(re, rep);
  return s;
}

function parseLine(raw: string, lineNo: number): ParsedLine {
  const s = redactPII(raw.trim());

  // JSON log line
  if (s.startsWith("{")) {
    try {
      const obj = JSON.parse(s);
      return {
        lineNo,
        raw: s,
        timestamp: obj.time ?? obj.timestamp ?? obj.ts,
        level: (obj.level ?? obj.severity ?? obj.lvl ?? "").toUpperCase(),
        message: obj.msg ?? obj.message ?? obj.text ?? s,
      };
    } catch {/* fall through */}
  }

  // syslog / common log: "Jan 02 15:04:05 host proc: msg"
  const syslog = s.match(
    /^(\S+\s+\S+\s+\S+)\s+\S+\s+\S+:\s+(.+)$/
  );
  if (syslog) {
    return { lineNo, raw: s, timestamp: syslog[1], message: syslog[2] };
  }

  // ISO timestamp prefix: 2024-01-02T03:04:05 [LEVEL] msg
  const iso = s.match(
    /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?:\[?(DEBUG|INFO|WARN|WARNING|ERROR|FATAL|TRACE)\]?\s+)?(.+)$/i
  );
  if (iso) {
    return {
      lineNo,
      raw: s,
      timestamp: iso[1],
      level: iso[2]?.toUpperCase(),
      message: iso[3],
    };
  }

  return { lineNo, raw: s, message: s };
}

// ─── Drain algorithm ──────────────────────────────────────────────────────────

function tokenize(msg: string): string[] {
  return msg.split(/\s+/).filter(Boolean);
}

function isVariable(token: string): boolean {
  return (
    /\d{2,}/.test(token) ||        // long number sequences
    /^[0-9a-f]{8,}$/i.test(token) || // hex IDs
    /^\d+ms$/.test(token) ||        // durations
    /^\d+s$/.test(token) ||
    /^[\d.]+$/.test(token) ||       // pure numbers / floats
    /^\/[\w/.-]+$/.test(token) ||   // paths
    /https?:\/\//.test(token)       // URLs
  );
}

function similarity(tmplTokens: string[], lineTokens: string[]): number {
  if (tmplTokens.length !== lineTokens.length) return 0;
  let matches = 0;
  for (let i = 0; i < tmplTokens.length; i++) {
    if (tmplTokens[i] === "<*>" || tmplTokens[i] === lineTokens[i]) matches++;
  }
  return matches / tmplTokens.length;
}

function mergeIntoTemplate(tmpl: string[], line: string[]): string[] {
  return tmpl.map((t, i) =>
    t === "<*>" || t === line[i] ? t : "<*>"
  );
}

function initialTemplate(tokens: string[]): string[] {
  return tokens.map((t) => (isVariable(t) ? "<*>" : t));
}

const SIM_THRESHOLD = 0.5;

export function compress(
  rawText: string,
  serviceName = "service"
): IncidentCapsule {
  const rawLines = rawText.split("\n").filter((l) => l.trim().length > 0);
  if (rawLines.length === 0) {
    return {
      service: serviceName,
      window: "—",
      compression: 1,
      evidence: [],
      routine_summary: { total_lines: 0, templates: 0 },
    };
  }

  const parsed = rawLines.map((l, i) => parseLine(l, i + 1));

  // Collect timestamps for window
  const timestamps = parsed
    .map((p) => p.timestamp)
    .filter(Boolean) as string[];
  const windowStr =
    timestamps.length >= 2
      ? `${timestamps[0]} to ${timestamps[timestamps.length - 1]}`
      : timestamps.length === 1
      ? timestamps[0]
      : "unknown";

  // ── Drain grouping ──
  const templates: LogTemplate[] = [];

  for (const pl of parsed) {
    const tokens = tokenize(pl.message);
    if (tokens.length === 0) continue;

    // Find best matching template of same length
    let bestIdx = -1;
    let bestSim = SIM_THRESHOLD;
    for (let i = 0; i < templates.length; i++) {
      if (templates[i].tokens.length !== tokens.length) continue;
      const sim = similarity(templates[i].tokens, tokens);
      if (sim > bestSim) {
        bestSim = sim;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) {
      templates.push({
        id: `t${templates.length}`,
        tokens: initialTemplate(tokens),
        lines: [pl],
        count: 1,
      });
    } else {
      templates[bestIdx].tokens = mergeIntoTemplate(templates[bestIdx].tokens, tokens);
      templates[bestIdx].lines.push(pl);
      templates[bestIdx].count++;
    }
  }

  // ── Evidence selection ──
  const evidence: EvidenceLine[] = [];
  const usedLines = new Set<number>();

  // First pass: root causes
  for (const pl of parsed) {
    if (usedLines.has(pl.lineNo)) continue;
    if (ERROR_PATTERNS.some((p) => p.test(pl.message))) {
      evidence.push({ role: "root_cause", line: pl.lineNo, text: pl.message.slice(0, 200) });
      usedLines.add(pl.lineNo);
      if (evidence.filter((e) => e.role === "root_cause").length >= 3) break;
    }
  }

  // Second pass: triggers (just before root causes)
  const rootLines = evidence.map((e) => e.line);
  for (const pl of parsed) {
    if (usedLines.has(pl.lineNo)) continue;
    if (TRIGGER_PATTERNS.some((p) => p.test(pl.message))) {
      // Prefer triggers that appear near a root cause
      const isNear = rootLines.some((rl) => Math.abs(rl - pl.lineNo) < 30);
      if (isNear || evidence.filter((e) => e.role === "trigger").length === 0) {
        evidence.push({ role: "trigger", line: pl.lineNo, text: pl.message.slice(0, 200) });
        usedLines.add(pl.lineNo);
        if (evidence.filter((e) => e.role === "trigger").length >= 2) break;
      }
    }
  }

  // Third pass: consequences (after root causes)
  const maxRoot = Math.max(...(rootLines.length ? rootLines : [0]));
  for (const pl of parsed) {
    if (usedLines.has(pl.lineNo)) continue;
    if (pl.lineNo > maxRoot && (pl.level === "ERROR" || pl.level === "WARN")) {
      evidence.push({ role: "consequence", line: pl.lineNo, text: pl.message.slice(0, 200) });
      usedLines.add(pl.lineNo);
      if (evidence.filter((e) => e.role === "consequence").length >= 2) break;
    }
  }

  // Sort evidence by line number
  evidence.sort((a, b) => a.line - b.line);

  // ── Compression ratio ──
  const rawChars = rawText.length;
  const capsuleChars = JSON.stringify({ evidence }).length;
  const compression = Math.max(1, Math.round(rawChars / Math.max(capsuleChars, 1)));

  return {
    service: serviceName,
    window: windowStr,
    compression,
    evidence,
    routine_summary: {
      total_lines: rawLines.length,
      templates: templates.length,
    },
  };
}
