# Hermes Chat Bot — Example

A floating, draggable chat widget for any web app — powered by [Hermes Agent](https://hermes-agent.nousresearch.com/) running on your own infrastructure. Drop the widget into a Next.js app, point it at your Hermes deployment via two env vars, and you've got an in-app AI assistant.

![floating chat widget mounted in a host app](docs/preview.png)

## Features

- **Floating draggable icon** — pointer-drag to reposition, position persists across page loads
- **Anchored chat window** — opens below the icon, flips above/inward if it would run off-screen
- **Session history** — every chat is saved to `localStorage`; switch between past conversations from the History menu
- **Hermes brain** — your Hermes deployment owns the LLM, system prompt, and tools (via MCP). The host app just proxies messages.
- **Zero state on your backend** — no DB, no auth required (add your own if you need it)
- **Reduced-motion respecting** — float + glow animations disable when the user prefers reduced motion

## Prerequisites

You need a running Hermes Agent instance with the **API Server** channel enabled. The fast path is the Railway template (one-click deploy) — see the [Hermes docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/open-webui/) for setup. On the Hermes side, you must have these env vars set:

```bash
API_SERVER_ENABLED=true
API_SERVER_KEY=your-shared-secret      # the bearer token the host app will use
API_SERVER_PORT=8642                   # default
API_SERVER_HOST=127.0.0.1              # or 0.0.0.0 if exposing publicly
LLM_MODEL=anthropic/claude-sonnet-4.5  # whatever upstream model + provider you've wired
```

If `LLM_MODEL` is empty, Hermes will accept your requests but return a 400 from the upstream provider ("model: String should have at least 1 character"). Make sure it's set.

## Quick start (run this example)

```bash
git clone https://github.com/boshify/hermes-chat-bot-example.git
cd hermes-chat-bot-example
npm install

cp .env.example .env.local
# edit .env.local — set HERMES_URL and HERMES_API_KEY

npm run dev
```

Open <http://localhost:3000>. The chat orb sits in the bottom-right. Click to open, drag to move, send a message — Hermes replies.

## Drop into an existing Next.js app

1. **Copy these directories** into your app:
   - `src/components/chat/` → the widget
   - `src/app/api/chat/route.ts` → the proxy route
   - `src/lib/cn.ts` → tiny class-name helper (skip if you already have one)

2. **Install peer deps** (skip any you already have):
   ```bash
   npm install lucide-react clsx tailwind-merge zod
   ```

3. **Add the animation keyframes** to your `globals.css` (the contents of `@layer utilities { … }` in this repo's [`src/app/globals.css`](src/app/globals.css)). Skip if you don't want the idle float + glow.

4. **Mount the widget once** in your root layout or any page that should show it:
   ```tsx
   import { ChatWidget } from "@/components/chat";

   export default function Layout({ children }) {
     return (
       <>
         {children}
         <ChatWidget />
       </>
     );
   }
   ```

5. **Set env vars** in `.env.local`:
   ```bash
   HERMES_URL=https://your-hermes.up.railway.app/v1
   HERMES_API_KEY=your-API_SERVER_KEY
   ```

Done. The widget is now on every page that renders that layout.

## Customising the widget

`<ChatWidget />` takes a few optional props:

```tsx
<ChatWidget
  title="Beacon"                // shown in the header. Default: "Assistant"
  iconSize={64}                 // icon diameter in px. Default: 56
  headerColor="#0a1f3d"         // hex/rgb for the header bar. Default: indigo-950
  endpoint="/api/agent/chat"    // override the proxy route path. Default: "/api/chat"
/>
```

To swap the icon entirely, edit [`src/components/chat/chat-icon.tsx`](src/components/chat/chat-icon.tsx). The current implementation is an inline SVG — replace it with your own SVG, or use `next/image` to load a PNG from `/public`.

To re-skin the chat window itself, edit [`src/components/chat/chat-window.tsx`](src/components/chat/chat-window.tsx). All styling is plain Tailwind.

## Architecture

```
┌──────────────────┐                              ┌──────────────────┐
│ Browser          │ ── POST /api/chat ────────▶  │ Your Next.js app │
│ <ChatWidget />   │                              │ /api/chat/route  │
│                  │ ◀── JSON {reply} ─────────── │   (proxy)        │
└──────────────────┘                              └─────────┬────────┘
                                                            │ POST /v1/chat/completions
                                                            │ Authorization: Bearer ${HERMES_API_KEY}
                                                            ▼
                                                  ┌──────────────────┐
                                                  │ Hermes Agent     │
                                                  │ (your Railway)   │
                                                  │ — LLM            │
                                                  │ — System prompt  │
                                                  │ — MCP tools      │
                                                  └──────────────────┘
```

The browser never holds the Hermes API key. The proxy route is a thin server-side hop that injects auth and forwards the OpenAI-compatible chat payload. If you want streaming, modify the route to pipe the SSE response back instead of awaiting `.text()`.

## Giving the bot tools (MCP)

The widget is intentionally tool-agnostic — tools live on the Hermes side. To give your bot the ability to actually *do* things (call your API, query a DB, open PRs), connect Hermes to one or more MCP servers via its config:

```yaml
mcp_servers:
  my_app:
    url: "https://your-app.com/api/mcp"
    headers:
      Authorization: "Bearer your-mcp-bearer"
    tools:
      include: []          # empty = all
      resources: false
      prompts: false
```

Reload Hermes (`/reload-mcp` or restart the gateway). Now your bot can call any tool exposed by that MCP server — the widget UI doesn't change at all.

Build your own MCP server with the [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk), or connect to existing ones.

## Adding auth

This example route accepts any request. In production, you almost certainly want to gate `/api/chat` behind your auth. With NextAuth:

```ts
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ... rest of the proxy
}
```

Same pattern for Clerk, Lucia, Iron Session, or your own.

## Non-Next.js host apps

The widget is a plain React component — it works in any React app (Vite, CRA, Remix, etc.). The only Next-specific piece is the `/api/chat` proxy route. For other frameworks:

- **Express / Fastify / Hono / Bun.serve**: implement the same proxy in your backend (it's ~30 lines)
- **Remix**: drop the proxy into `app/routes/api.chat.ts` as an `action`
- **Astro**: put it in `src/pages/api/chat.ts` as a `POST` endpoint
- **SPA with no backend**: NOT recommended — you'd have to expose the Hermes API key to the browser. Stand up a minimal proxy somewhere (Cloudflare Worker, Vercel Function, Railway, fly.io).

The widget itself doesn't care — it just POSTs to whatever `endpoint` prop you give it.

## Tech stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- lucide-react (icons)
- zod (request validation)

No state management library, no UI library, no chat library — everything is plain React + a hand-rolled `useSessions` hook.

## License

MIT. See [LICENSE](LICENSE).
