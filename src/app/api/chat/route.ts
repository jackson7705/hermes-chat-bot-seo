/**
 * Hermes proxy route.
 *
 * Browsers should NEVER hold the HERMES_API_KEY. The chat widget POSTs
 * messages to this route, this route forwards them to Hermes's
 * OpenAI-compatible API server, and the JSON reply is returned.
 *
 * Drop this file into any Next.js App Router project; pair with the
 * <ChatWidget /> component for a complete embed.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const RequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .min(1)
    .max(60),
});

export async function POST(request: NextRequest) {
  const hermesUrl = process.env.HERMES_URL;
  const hermesKey = process.env.HERMES_API_KEY;
  if (!hermesUrl || !hermesKey) {
    return NextResponse.json(
      { error: "Not configured: HERMES_URL or HERMES_API_KEY is missing." },
      { status: 500 }
    );
  }

  let parsed: z.infer<typeof RequestSchema>;
  try {
    parsed = RequestSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body", details: (err as Error).message },
      { status: 400 }
    );
  }

  const endpoint = `${hermesUrl.replace(/\/$/, "")}/chat/completions`;
  const model = process.env.HERMES_MODEL || "hermes-agent";

  let hermesRes: Response;
  try {
    hermesRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hermesKey}`,
      },
      body: JSON.stringify({
        model,
        messages: parsed.messages,
        stream: false,
      }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Could not reach Hermes.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  const rawText = await hermesRes.text();
  if (!hermesRes.ok) {
    return NextResponse.json(
      { error: `Hermes returned ${hermesRes.status}`, details: rawText.slice(0, 1000) },
      { status: hermesRes.status === 401 ? 502 : hermesRes.status }
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Hermes returned a non-JSON response.", details: rawText.slice(0, 1000) },
      { status: 502 }
    );
  }

  const reply: string = payload?.choices?.[0]?.message?.content ?? "(no response)";
  return NextResponse.json({ reply });
}
