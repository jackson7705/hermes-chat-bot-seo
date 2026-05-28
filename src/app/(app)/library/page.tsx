import Link from "next/link";
import {
  listMethodologies,
  listProcesses,
  listSkills,
} from "@/lib/omni";

export const dynamic = "force-dynamic";

export default function LibraryPage() {
  const methodologies = listMethodologies();
  const processes = listProcesses();
  const skills = listSkills();

  const items = [
    {
      slug: "methodologies",
      title: "Methodologies",
      blurb: "The brain. How to think about strategy, research, execution, architecture.",
      count: methodologies.length,
      color: "from-indigo-500 to-indigo-700",
    },
    {
      slug: "processes",
      title: "Processes",
      blurb: "The scripts. Step-by-step playbooks for client engagement, analysis, research, execution.",
      count: processes.length,
      color: "from-emerald-500 to-emerald-700",
    },
    {
      slug: "skills",
      title: "Skills",
      blurb: "The hands. Discrete capabilities the agent can invoke — data access, generation, analysis, research.",
      count: skills.length,
      color: "from-amber-500 to-amber-700",
    },
  ];

  return (
    <div className="px-8 py-10 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Library
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          The complete Omnipresence corpus. Methodologies are the brain,
          processes are the scripts, skills are the hands. Search by area or
          drill into any entry to read the full markdown.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/library/${item.slug}`}
            className="group block rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition"
          >
            <div
              className={`h-1 w-12 rounded-full bg-gradient-to-r ${item.color} mb-4`}
              aria-hidden
            />
            <h2 className="text-lg font-semibold text-slate-900">
              {item.title}
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {item.blurb}
            </p>
            <div className="mt-4 text-xs text-slate-500 tabular-nums">
              {item.count} entr{item.count === 1 ? "y" : "ies"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
