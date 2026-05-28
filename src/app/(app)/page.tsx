import { listProjects } from "@/lib/omni";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const projects = listProjects();

  return (
    <div className="px-8 py-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {projects.length} project{projects.length === 1 ? "" : "s"} in your omni corpus.
        </p>
      </header>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
          Projects
        </h2>
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">
            No projects found. The omni repo should be bind-mounted at /opt/omni
            inside this container.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
                >
                  <h3 className="font-medium text-slate-900">{p.slug}</h3>
                  {p.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <div className="text-xs text-slate-500 mt-2">
                    {p.strategyCount} strateg{p.strategyCount === 1 ? "y" : "ies"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
