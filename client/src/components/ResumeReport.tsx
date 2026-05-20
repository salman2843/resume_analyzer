import { AlertTriangle, BriefcaseBusiness, CheckCircle2, FileText, Lightbulb, MessageSquareText, SearchCheck, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Resume } from "../services/resumes";
import { formatDate, getAnalysisSummary, getList, getResumeScore } from "../utils/resumeUi";

type ResumeReportProps = {
  resume: Resume;
};

export default function ResumeReport({ resume }: ResumeReportProps) {
  const analysis = resume.latestAnalysis;
  const score = getResumeScore(resume);
  const strengths = getList(analysis?.strengths);
  const weaknesses = getList(analysis?.weaknesses);
  const suggestions = getList(analysis?.suggestions);
  const scoreTone = getScoreTone(score);
  const stats = [
    { label: "ATS Score", value: resume.atsScore !== null ? `${resume.atsScore}` : "--", icon: Target },
    { label: "Job Match Score", value: analysis?.jobMatchScore !== null && analysis?.jobMatchScore !== undefined ? `${analysis.jobMatchScore}` : "--", icon: BriefcaseBusiness },
    { label: "Strengths Count", value: `${strengths.length}`, icon: CheckCircle2 }
  ];
  const chartData = [
    { name: "ATS", score: resume.atsScore ?? 0 },
    { name: "Job match", score: analysis?.jobMatchScore ?? 0 },
    { name: "Strengths", score: Math.min(strengths.length * 20, 100) },
    { name: "Fixes", score: Math.max(100 - weaknesses.length * 18, 20) }
  ];

  return (
    <section className="grid gap-5">
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                <FileText size={18} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-neutral-950">{resume.originalName}</h1>
                <p className="mt-1 text-xs text-neutral-500">
                  Uploaded {formatDate(resume.createdAt)}
                  {analysis ? ` · Analyzed ${formatDate(analysis.createdAt)}` : ""}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">{getAnalysisSummary(analysis)}</p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <div className={`grid size-28 place-items-center rounded-full border-[7px] bg-white ${scoreTone.ring}`}>
              <div className="text-center">
                <p className={`text-3xl font-bold ${scoreTone.text}`}>{score ?? "--"}</p>
                <p className="text-xs font-medium text-neutral-500">/ 100</p>
              </div>
            </div>
            <Link
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              to="/analysis"
            >
              Analyze another resume
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
              <stat.icon size={17} />
            </span>
            <div>
              <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
              <p className="mt-0.5 text-lg font-semibold text-neutral-950">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid items-stretch gap-5 sm:grid-cols-[3fr_2fr]">
        <ChecklistCard
          title="Strengths"
          icon={CheckCircle2}
          tone="green"
          items={strengths}
          empty="No strengths returned yet."
        />
        <ChecklistCard
          title="Critical Fixes"
          icon={AlertTriangle}
          tone="amber"
          items={weaknesses}
          empty="No critical fixes returned yet."
        />
      </div>

      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-[#2563eb]" size={19} />
          <h2 className="text-lg font-semibold text-neutral-950">Suggested Improvements</h2>
        </div>
        <ol className="mt-4 divide-y divide-neutral-100">
          {(suggestions.length ? suggestions : ["Run an analysis to generate targeted improvement suggestions."]).map((item, index) => (
            <SuggestionItem key={item} index={index + 1} text={item} />
          ))}
        </ol>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <MessageSquareText className="text-[#2563eb]" size={22} />
          <h2 className="mt-3 text-base font-semibold text-neutral-950">Generate Interview Questions</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Practice with questions based on this resume and its latest analysis.</p>
          <Link
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-blue-700"
            to={`/interview-practice/${resume.id}`}
          >
            Start practice
          </Link>
        </div>
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SearchCheck className="text-[#2563eb]" size={22} />
          <h2 className="mt-3 text-base font-semibold text-neutral-950">Match with Job Description</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Compare this resume against a target role and find missing keywords.</p>
          <Link
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#2563eb] bg-white px-4 text-sm font-semibold text-[#2563eb] hover:bg-blue-50"
            to="/job-match"
          >
            Match resume
          </Link>
        </div>
      </div>

      <details className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <summary className="cursor-pointer text-sm font-semibold text-neutral-800">Score breakdown details</summary>
        <div className="mt-5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#6b7280" />
              <YAxis hide domain={[0, 100]} />
              <Tooltip cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="score" fill="#2563eb" radius={[5, 5, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </details>
    </section>
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

type ChecklistCardProps = {
  title: string;
  icon: LucideIcon;
  tone: "green" | "amber";
  items: string[];
  empty: string;
};

function ChecklistCard({ title, icon: Icon, tone, items, empty }: ChecklistCardProps) {
  const styles =
    tone === "green"
      ? {
          border: "border-t-[#16a34a]",
          text: "text-[#16a34a]",
          bg: "bg-green-50"
        }
      : {
          border: "border-t-[#d97706]",
          text: "text-[#d97706]",
          bg: "bg-amber-50"
        };

  return (
    <div className={`h-full rounded-xl border border-[#e5e7eb] border-t-4 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${styles.border}`}>
      <div className="flex items-center gap-2">
        <Icon className={styles.text} size={18} />
        <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
      </div>
      <ul className="mt-4 grid gap-3">
        {(items.length ? items : [empty]).map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-neutral-700">
            <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}>
              <Icon size={14} />
            </span>
            <span className="text-neutral-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SuggestionItem({ index, text }: { index: number; text: string }) {
  const { heading, description } = splitSuggestion(text);

  return (
    <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-4 first:pt-0 last:pb-0">
      <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-[#2563eb]">
        {index}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-neutral-950">{heading}</h3>
        <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
      </div>
    </li>
  );
}

function splitSuggestion(text: string) {
  const trimmed = text.trim();
  const [firstPart, ...rest] = trimmed.split(/[:.]\s+|-\s+/);
  const heading = firstPart.length > 6 && firstPart.length <= 72 ? firstPart : "Recommended update";
  const description = rest.length ? rest.join(". ") : trimmed;

  return { heading, description };
}
