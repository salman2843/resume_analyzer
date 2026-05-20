import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  FileText,
  Loader2,
  MessageSquareText,
  SearchCheck,
  Sparkles,
  Upload
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getResumes } from "../services/resumes";
import type { Resume } from "../services/resumes";
import { formatDate, getAnalyzedResumes, getAnalysisSummary, getList, getResumeScore } from "../utils/resumeUi";

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-6">
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-5 py-4 text-sm font-medium text-neutral-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Loader2 size={16} className="animate-spin" />
          Loading workspace...
        </div>
      </section>
    );
  }

  return user ? <AuthenticatedHome /> : <PublicLanding />;
}

function PublicLanding() {
  const workflow = [
    { label: "Upload resume", value: "PDF parsing", icon: Upload },
    { label: "AI analysis", value: "ATS + fixes", icon: Sparkles },
    { label: "Practice", value: "Interview Q&A", icon: MessageSquareText },
    { label: "Job match", value: "Role fit", icon: SearchCheck }
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2563eb]">AI resume workspace</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-6xl">
          Turn a resume into a clearer job-search plan.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
          ResumeIQ analyzes your resume, highlights practical fixes, generates interview questions, and prepares you for job matching in one focused workspace.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800"
            to="/register"
          >
            Create workspace <ArrowRight size={16} />
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            to="/login"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-neutral-100 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
                <FileText size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-950">Software Engineer Resume.pdf</p>
                <p className="text-xs text-neutral-500">Analyzed today · 5 interview questions ready</p>
              </div>
            </div>
            <span className="rounded-lg border border-[#16a34a]/20 bg-green-50 px-3 py-2 text-sm font-semibold text-[#16a34a]">86 / 100</span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-neutral-100 p-5 lg:border-b-0 lg:border-r">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "ATS score", value: "86", icon: BarChart3 },
                { label: "Strengths", value: "5", icon: CheckCircle2 },
                { label: "Job match", value: "Ready", icon: BriefcaseBusiness }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
                  <item.icon className="text-[#2563eb]" size={17} />
                  <p className="mt-3 text-xs font-medium text-neutral-500">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-950">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-950">Suggested improvements</p>
              <div className="mt-3 divide-y divide-neutral-200">
                {[
                  "Add measurable impact to recent project bullets.",
                  "Move core technical skills closer to the top.",
                  "Clarify ownership in backend and API work."
                ].map((item) => (
                  <p key={item} className="py-3 text-sm leading-6 text-neutral-600">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm font-semibold text-neutral-950">Workflow</p>
            <div className="mt-4 grid gap-3">
              {workflow.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                      <item.icon size={16} />
                    </span>
                    <span className="text-sm font-medium text-neutral-800">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-neutral-500">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthenticatedHome() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  useEffect(() => {
    getResumes()
      .then(setResumes)
      .catch(() => undefined)
      .finally(() => setIsLoadingResumes(false));
  }, []);

  const analyzedResumes = useMemo(() => getAnalyzedResumes(resumes), [resumes]);
  const latestAnalyzed = analyzedResumes[0];
  const score = getResumeScore(latestAnalyzed);
  const strengths = getList(latestAnalyzed?.latestAnalysis?.strengths);
  const suggestions = getList(latestAnalyzed?.latestAnalysis?.suggestions);
  const scoreTone = getScoreTone(score);

  return (
    <section className="mx-auto max-w-240 px-4 py-8 sm:px-6">
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-[#2563eb]">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Your career workspace, {user?.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Pick up from your latest resume analysis, generate interview questions, or compare your resume with a target job description.
            </p>
          </div>
          <Link className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800" to="/dashboard">
            Open dashboard
          </Link>
        </div>
      </div>

      {isLoadingResumes ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-5 py-12 text-sm font-medium text-neutral-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Loader2 size={16} className="animate-spin" />
          Loading latest resume...
        </div>
      ) : latestAnalyzed ? (
        <div className="mt-5 grid gap-5">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
                    <FileSearch size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-neutral-950">{latestAnalyzed.originalName}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Uploaded {formatDate(latestAnalyzed.createdAt)}
                      {latestAnalyzed.latestAnalysis ? ` · Analyzed ${formatDate(latestAnalyzed.latestAnalysis.createdAt)}` : ""}
                    </p>
                  </div>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">{getAnalysisSummary(latestAnalyzed.latestAnalysis)}</p>
              </div>
              <div className={`grid size-24 shrink-0 place-items-center rounded-full border-[7px] bg-white ${scoreTone.ring}`}>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${scoreTone.text}`}>{score ?? "--"}</p>
                  <p className="text-xs font-medium text-neutral-500">/ 100</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MetricPill label="ATS Score" value={latestAnalyzed.atsScore !== null ? String(latestAnalyzed.atsScore) : "--"} icon={BarChart3} />
              <MetricPill label="Strengths" value={String(strengths.length)} icon={CheckCircle2} />
              <MetricPill label="Saved Resumes" value={String(resumes.length)} icon={FileText} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-sm font-semibold text-neutral-950">Next improvements</p>
              <div className="mt-3 divide-y divide-neutral-100">
                {(suggestions.length ? suggestions.slice(0, 3) : ["Open the report to review improvement suggestions."]).map((item) => (
                  <p key={item} className="py-3 text-sm leading-6 text-neutral-600">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <ActionCard title="View latest report" description="Open the full analysis page." to={`/results/${latestAnalyzed.id}`} icon={BarChart3} primary />
              <ActionCard title="Practice interview" description="Generate questions from this resume." to={`/interview-practice/${latestAnalyzed.id}`} icon={MessageSquareText} />
              <ActionCard title="Match a job" description="Compare against a job description." to="/job-match" icon={SearchCheck} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-white px-5 py-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Upload className="mx-auto text-[#2563eb]" size={30} />
          <h2 className="mt-4 text-xl font-semibold text-neutral-950">Start with your first resume</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
            Upload a PDF resume to generate an analysis report, interview questions, and job-match insights.
          </p>
          <Link className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-blue-700" to="/dashboard">
            Upload resume
          </Link>
        </div>
      )}
    </section>
  );
}

function MetricPill({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart3 }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        <p className="mt-0.5 text-lg font-semibold text-neutral-950">{value}</p>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  to,
  icon: Icon,
  primary = false
}: {
  title: string;
  description: string;
  to: string;
  icon: typeof BarChart3;
  primary?: boolean;
}) {
  return (
    <Link
      className={`rounded-xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
        primary ? "border-[#2563eb] bg-blue-50" : "border-[#e5e7eb] bg-white hover:bg-neutral-50"
      }`}
      to={to}
    >
      <Icon className={primary ? "text-[#2563eb]" : "text-neutral-700"} size={19} />
      <p className="mt-3 text-sm font-semibold text-neutral-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
    </Link>
  );
}

function getScoreTone(score: number | null) {
  if (score === null) {
    return { ring: "border-neutral-200", text: "text-neutral-950" };
  }

  if (score >= 80) {
    return { ring: "border-[#16a34a]", text: "text-[#16a34a]" };
  }

  if (score >= 60) {
    return { ring: "border-[#d97706]", text: "text-[#d97706]" };
  }

  return { ring: "border-red-600", text: "text-red-600" };
}
