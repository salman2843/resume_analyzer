import { BarChart3, FileUp, Sparkles, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const metrics = [
  { label: "Resume score", value: "No scan yet", icon: BarChart3 },
  { label: "Job matches", value: "0 saved", icon: Target },
  { label: "AI suggestions", value: "Ready", icon: Sparkles }
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-neutral-200 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-950">Welcome, {user?.name}</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Your resume pipeline is ready. Upload analysis and job matching come next.
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800"
          type="button"
        >
          <FileUp size={16} />
          Upload resume
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">{metric.label}</span>
              <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                <metric.icon size={17} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-neutral-950">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
          <FileUp size={22} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-neutral-950">Resume upload is next</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-500">
          The protected dashboard and auth session are in place. The next build step can attach PDF uploads,
          text extraction, and ATS scoring to this workspace.
        </p>
      </div>
    </section>
  );
}
