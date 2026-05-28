import Link from "next/link";
import { listProjects } from "@/lib/omni";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  const projects = listProjects();

  return (
    <div className="px-8 py-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Projects
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {projects.length} in your omni corpus.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-sm text-slate-500">
          No projects yet. Add one at{" "}
          <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
            custom/projects/&lt;slug&gt;/
          </code>{" "}
          in the omni repo and push.
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
                  {p.strategyCount} strateg
                  {p.strategyCount === 1 ? "y" : "ies"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
