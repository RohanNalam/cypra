import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { capsule, rawSample } = body as {
      capsule: {
        service: string;
        window: string;
        compression: number;
        evidence: { role: string; text: string; line: number }[];
        routine_summary: { total_lines: number; templates: number };
      };
      rawSample: string;
    };

    if (!capsule) {
      return NextResponse.json({ error: "No capsule provided" }, { status: 400 });
    }

    const evidenceList = capsule.evidence
      .map((e, i) => `[${i + 1}] line ${e.line}: ${e.text}`)
      .join("\n");

    const prompt = `You are a site reliability engineer analyzing compressed log evidence from service "${capsule.service}".

Compression stats: ${capsule.compression}× compression, ${capsule.routine_summary.total_lines} lines → ${capsule.routine_summary.templates} templates.
Time window: ${capsule.window}

The log parser identified these ${capsule.evidence.length} anomalous lines as evidence:
${evidenceList}

Analyze this incident evidence and return a JSON object with exactly this structure (no markdown, no code fences, raw JSON only):
{
  "narrative": "2-3 sentence plain-English explanation of what happened",
  "evidence": [
    {
      "index": 1,
      "role": "root_cause",
      "explanation": "one sentence explaining why this line has this role"
    }
  ]
}

Rules:
- "role" must be exactly one of these three strings: "root_cause", "trigger", or "consequence"
- root_cause: the underlying failure (exhausted resource, crashed process, bad config)
- trigger: the event that exposed or initiated the failure
- consequence: downstream effects or symptoms
- Include one entry per evidence item, numbered 1 through ${capsule.evidence.length}
- Output raw JSON only — no markdown fences, no explanation, no extra text`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from Claude" }, { status: 500 });
    }

    // Strip markdown code fences if present, then extract JSON object
    let rawText = textBlock.text.trim();
    rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Last-resort: grab the first {...} block
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json(
          { error: `Could not parse Claude response: ${rawText.slice(0, 300)}` },
          { status: 500 }
        );
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch (e2) {
        return NextResponse.json(
          { error: `Malformed JSON from Claude: ${e2 instanceof Error ? e2.message : e2}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ analysis: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze] Claude API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
