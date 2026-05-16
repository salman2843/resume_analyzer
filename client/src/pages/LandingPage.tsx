import { ArrowRight, BarChart3, BriefcaseBusiness, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-[1fr_420px]">
      <div>
        <p className="text-sm font-semibold uppercase text-emerald-700">AI Resume Analyzer SaaS</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-neutral-950 sm:text-6xl">
          ResumeIQ
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
          Upload resumes, score ATS readiness, compare against job descriptions, and track improvement from one focused dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            to="/register"
          >
            Create workspace <ArrowRight size={16} />
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            to="/login"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <p className="text-sm font-semibold text-neutral-950">Latest resume score</p>
            <p className="text-sm text-neutral-500">Software Engineer Resume.pdf</p>
          </div>
          <span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">82%</span>
        </div>
        <div className="mt-5 space-y-4">
          {[
            { icon: ShieldCheck, label: "ATS structure", value: "Strong" },
            { icon: BriefcaseBusiness, label: "Job match", value: "Frontend role" },
            { icon: BarChart3, label: "Tracked improvement", value: "+18 points" }
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-neutral-100 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                  <item.icon size={18} />
                </span>
                <span className="font-medium text-neutral-800">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-neutral-950">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
