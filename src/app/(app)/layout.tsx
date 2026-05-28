import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatWidget } from "@/components/chat";
import { SignOutLink } from "./sign-out";

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
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col">
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

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItem href="/" label="Dashboard" />
          <NavItem href="/projects" label="Projects" />
          <NavItem href="/strategies" label="Strategies" />
          <NavItem href="/approvals" label="Approvals" />
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

      {/* Chat orb persists across all platform pages */}
      <ChatWidget title="Hermes" />
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {label}
    </Link>
  );
}
