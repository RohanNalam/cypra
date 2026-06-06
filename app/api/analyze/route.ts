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

Analyze this incident evidence and return a JSON object with exactly this structure:
{
  "narrative": "2-3 sentence plain-English explanation of what happened — what caused it, what triggered it, and what the impact was",
  "evidence": [
    {
      "index": 1,
      "role": "root_cause" | "trigger" | "consequence",
      "explanation": "one sentence explaining why this line has this role"
    }
  ]
}

Rules:
- Assign exactly one role per evidence item
- root_cause: the underlying failure (exhausted resource, crashed process, bad config)
- trigger: the event that exposed or initiated the failure
- consequence: downstream effects or symptoms
- If fewer than 3 distinct roles are present, that's fine — assign the most accurate role
- Return only valid JSON, no markdown fences`;

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

    let parsed;
    try {
      parsed = JSON.parse(textBlock.text.trim());
    } catch {
      const match = textBlock.text.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json(
          { error: `Could not parse Claude response: ${textBlock.text.slice(0, 200)}` },
          { status: 500 }
        );
      }
      parsed = JSON.parse(match[0]);
    }

    return NextResponse.json({ analysis: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze] Claude API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
