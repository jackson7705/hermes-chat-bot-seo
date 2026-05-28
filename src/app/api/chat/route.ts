/**
 * Hermes proxy route.
 *
 * Browsers never hold the HERMES_API_KEY. The chat widget POSTs the user's
 * messages plus a small `context` object (current pathname). We inject a
 * system prompt that tells Hermes:
 *   1. It's embedded in the Omnipresence platform
 *   2. Where the omni corpus and project context live on disk
 *   3. The output conventions to follow
 *   4. To actually DO requested work — write files, run processes — not
 *      just describe what it would do
 *   5. What the operator is currently looking at, so "run an audit" or
 *      "let's work today's tasks" knows the client.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 300;

const RequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      }),
    )
    .min(1)
    .max(60),
  context: z
    .object({
      pathname: z.string().optional(),
    })
    .optional(),
});

function pathnameToHint(pathname?: string): string {
  if (!pathname || pathname === "/") return "the platform dashboard.";
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "projects" && segments[1]) {
    return `the Clients section, viewing project "${segments[1]}". Treat that as the active project unless the operator names a different one.`;
  }
  if (segments[0] === "strategies" && segments[1] && segments[2]) {
    return `the strategy "${segments[2]}" inside project "${segments[1]}".`;
  }
  if (segments[0] === "approvals" && segments[1]) {
    return `the approval queue, viewing task ${segments[1]}.`;
  }
  if (segments[0] === "library" && segments[1]) {
    return `the Library, browsing ${segments[1]}${segments[2] ? ` / ${segments[2]}` : ""}${segments[3] ? ` / ${segments[3]}` : ""}.`;
  }
  if (segments.length === 1) {
    const labels: Record<string, string> = {
      prospects: "Prospects (new client onboarding)",
      projects: "Clients (active project list)",
      strategies: "Strategies (cross-project progress)",
      approvals: "the Approval kanban",
      content: "the Content section (production pipeline)",
      audits: "the Audits section (run-on-demand site audits)",
      outreach: "the Outreach section (link building + campaigns)",
      authority: "the Authority Network section (premium multi-site SEO)",
      local: "the Local SEO section",
      reports: "the Reports section (rank + AEO + GSC)",
      library: "the Library (browseable omni corpus)",
      settings: "Settings (credentials + integrations)",
    };
    return `the ${labels[segments[0]] ?? segments[0]} section.`;
  }
  return `the page at ${pathname}.`;
}

function buildSystemPrompt(pathname?: string): string {
  const context = pathnameToHint(pathname);
  return `You are Hermes, embedded as the in-corner assistant of the Omnipresence agency platform (Growth Pro Agency's deployment, https://hermes-chat.srv1709148.hstgr.cloud).

OPERATOR CONTEXT
The operator is currently looking at ${context}

YOU HAVE FULL FILESYSTEM TOOLS. Use them.
- READ access to the whole omni corpus at /opt/data/omni/ — core/ + custom/ + overrides/, all methodologies, processes, skills, project context.
- WRITE access to /opt/data/omni/custom/projects/<slug>/outputs/<kind>/ for deliverables (audits, drafts, briefs, reports).
- Shell tools: cat, grep, ls, find, sha1sum, etc.
- Per-project credentials in /opt/data/omni/custom/projects/<slug>/.env when configured.

WHEN THE OPERATOR ASKS YOU TO DO SOMETHING — ACTUALLY DO IT.
Do NOT describe what you would do. Do NOT ask permission for read-only work. Read the relevant omni process file, apply it, write the deliverable, then report.

COMMON REQUESTS AND HOW TO HANDLE THEM:

- "Run an audit on <client> [audit-type]"
  Read /opt/data/omni/core/processes/analysis/<audit-type>-audit.md (or aio-readiness-audit / retrieval-readiness-audit / publication-velocity-audit / lane-portfolio-audit if not specified).
  Apply to /opt/data/omni/custom/projects/<client>/.
  Write to /opt/data/omni/custom/projects/<client>/outputs/audits/YYYY-MM-DD-<audit-slug>.md.
  Report the file path + a one-paragraph summary.

- "Run a baseline assessment on <client>"
  Read /opt/data/omni/core/processes/client-engagement/brand-baseline-assessment.md.
  Apply to /opt/data/omni/custom/projects/<client>/.
  Write to /opt/data/omni/custom/projects/<client>/outputs/briefs/YYYY-MM-DD-brand-baseline.md.

- "Generate a proposal for <client>" / "Prepare me a sales call doc for <client>"
  Combine brand baseline + target market landscape + modern ICP processes.
  Write to outputs/sales/YYYY-MM-DD-proposal.md (or similar).

- "Let's work today's tasks for <client>"
  List unchecked - [ ] checkboxes in /opt/data/omni/custom/projects/<client>/strategies/*.md, then ask which one to start.

- "What's the status on <client>?"
  Summarise from README.md + notes.md + recent outputs/.

NEW CLIENT ONBOARDING (capability 01 from the team briefing)
When the operator names a new client that isn't in custom/projects/ yet, follow the client-engagement process chain: prospect-discovery → brand-baseline-assessment → target-market-landscape-analysis → modern-icp → project-config-generation → new-project-setup. Each step produces a markdown deliverable that doubles as a sales artifact.

OUTPUT CONVENTIONS
Every deliverable you write is a markdown file under custom/projects/<slug>/outputs/<kind>/, named YYYY-MM-DD-<short-slug>.md. Lead with an H1 title, then a one-paragraph executive summary, then the detail.

THE 15 CAPABILITY AREAS
You are the agent behind a full agency-grade SEO stack: client engagement (01), strategy + planning (02), content production at scale (03), refresh (04), 7 audit types (05), AI search + AEO (06), link building + outreach (07), authority satellite networks (08), local + multi-location SEO (09), reporting (10), visual + brand consistency (11), WordPress CMS ops (12), sales artifacts (13), operational compounding (14), and meta-extension (15). The methodologies are your brain, the processes are your scripts, the skills are your hands. All catalogued under /opt/data/omni/core/.

KEEP YOUR REPLIES TIGHT
You're a workhorse, not a chatbot. Short summaries + concrete file paths + concrete next steps. Don't pad. Don't apologise. Don't ask the operator to confirm read-only work.`;
}

export async function POST(request: NextRequest) {
  const hermesUrl = process.env.HERMES_URL;
  const hermesKey = process.env.HERMES_API_KEY;
  if (!hermesUrl || !hermesKey) {
    return NextResponse.json(
      { error: "Not configured: HERMES_URL or HERMES_API_KEY is missing." },
      { status: 500 },
    );
  }

  let parsed: z.infer<typeof RequestSchema>;
  try {
    parsed = RequestSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body", details: (err as Error).message },
      { status: 400 },
    );
  }

  const endpoint = `${hermesUrl.replace(/\/$/, "")}/chat/completions`;
  const model = process.env.HERMES_MODEL || "hermes-agent";

  // Prepend a system message describing the platform + current context.
  // We override any prior system message from the client to keep instructions
  // authoritative (browsers shouldn't be able to dictate Hermes's role).
  const cleanedMessages = parsed.messages.filter((m) => m.role !== "system");
  const messages = [
    { role: "system" as const, content: buildSystemPrompt(parsed.context?.pathname) },
    ...cleanedMessages,
  ];

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
        messages,
        stream: false,
      }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Could not reach Hermes.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  const rawText = await hermesRes.text();
  if (!hermesRes.ok) {
    return NextResponse.json(
      {
        error: `Hermes returned ${hermesRes.status}`,
        details: rawText.slice(0, 1000),
      },
      { status: hermesRes.status === 401 ? 502 : hermesRes.status },
    );
  }

  let payload: { choices?: { message?: { content?: string } }[] };
  try {
    payload = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      {
        error: "Hermes returned a non-JSON response.",
        details: rawText.slice(0, 1000),
      },
      { status: 502 },
    );
  }

  const reply: string = payload?.choices?.[0]?.message?.content ?? "(no response)";
  return NextResponse.json({ reply });
}
