import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatWidget } from "@/components/chat";
import { SignOutLink } from "./sign-out";

type NavEntry =
  | { kind: "link"; href: string; label: string }
  | { kind: "stub"; href: string; label: string }
  | { kind: "section"; label: string };

const NAV: NavEntry[] = [
  { kind: "link", href: "/", label: "Dashboard" },

  { kind: "section", label: "New business" },
  { kind: "stub", href: "/prospects", label: "Prospects" },

  { kind: "section", label: "Active work" },
  { kind: "link", href: "/projects", label: "Clients" },
  { kind: "link", href: "/strategies", label: "Strategies" },
  { kind: "link", href: "/approvals", label: "Approvals" },
  { kind: "stub", href: "/content", label: "Content" },
  { kind: "stub", href: "/audits", label: "Audits" },
  { kind: "stub", href: "/outreach", label: "Outreach" },
  { kind: "stub", href: "/authority", label: "Authority Network" },
  { kind: "stub", href: "/local", label: "Local SEO" },
  { kind: "stub", href: "/reports", label: "Reports" },

  { kind: "section", label: "Knowledge" },
  { kind: "link", href: "/library", label: "Library" },

  { kind: "section", label: "Configuration" },
  { kind: "stub", href: "/settings", label: "Settings" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "—";

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-950 text-white text-sm font-semibold">
              ⚕
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Omni
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((entry, i) => {
            if (entry.kind === "section") {
              return (
                <div
                  key={i}
                  className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold"
                >
                  {entry.label}
                </div>
              );
            }
            if (entry.kind === "stub") {
              return (
                <Link
                  key={i}
                  href={entry.href}
                  className="block rounded-md px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{entry.label}</span>
                    <span className="text-[9px] uppercase tracking-wider rounded bg-slate-100 text-slate-500 px-1.5 py-0.5">
                      soon
                    </span>
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={i}
                href={entry.href}
                className="block rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {entry.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-slate-200 text-xs text-slate-500 space-y-1">
          <div className="truncate" title={email}>
            {email}
          </div>
          <SignOutLink />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>

      <ChatWidget title="Hermes" />
    </div>
  );
}
