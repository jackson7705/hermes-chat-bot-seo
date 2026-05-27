import { ChatWidget } from "@/components/chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Hermes Chat Bot — Example
          </h1>
          <p className="mt-3 text-slate-600">
            A floating, draggable chat widget powered by{" "}
            <a
              href="https://hermes-agent.nousresearch.com/"
              className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              Hermes Agent
            </a>
            . Click the orb in the bottom-right to chat. Drag it anywhere on the page.
            Your conversations are saved in <code>localStorage</code> and reachable via
            the History icon in the chat header.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card title="Drag the icon">Pointer drag to reposition. Survives page refreshes.</Card>
            <Card title="Sessions">Every chat is saved. Switch between them from the history menu.</Card>
            <Card title="Hermes brain">All AI lives on your Hermes deployment. This app just proxies.</Card>
            <Card title="Bring your own tools">Wire MCP servers to Hermes for agent capabilities.</Card>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Read the{" "}
            <a
              href="https://github.com/boshify/hermes-chat-bot-example#readme"
              className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              README
            </a>{" "}
            to wire this into your own app.
          </p>
        </div>
      </div>

      <ChatWidget />
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
  );
}
