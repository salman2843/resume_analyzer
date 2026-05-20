import { AlertTriangle, CheckCircle2, Lightbulb, Target } from "lucide-react";
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
  const chartData = [
    { name: "ATS", score: resume.atsScore ?? 0 },
    { name: "Job match", score: analysis?.jobMatchScore ?? 0 },
    { name: "Strengths", score: Math.min(strengths.length * 20, 100) },
    { name: "Fixes", score: Math.max(100 - weaknesses.length * 18, 20) }
  ];

  return (
    <section className="grid gap-5">
      <div className="grid gap-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className="text-sm font-semibold uppercase text-sky-700">Resume report</p>
          <h2 className="mt-2 break-words text-2xl font-bold text-neutral-950">{resume.originalName}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{getAnalysisSummary(analysis)}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-neutral-600">
            <span className="rounded-lg bg-neutral-100 px-3 py-2">Uploaded {formatDate(resume.createdAt)}</span>
            {analysis ? <span className="rounded-lg bg-sky-50 px-3 py-2 text-sky-700">Analyzed {formatDate(analysis.createdAt)}</span> : null}
          </div>
        </div>

        <div className="rounded-lg bg-neutral-950 p-4 text-white">
          <p className="text-sm font-medium text-neutral-300">Overall score</p>
          <p className="mt-3 text-5xl font-bold">{score ?? "--"}</p>
          <p className="mt-1 text-sm text-neutral-300">{score ? "out of 100" : "Run analysis first"}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-950">Score breakdown</h3>
              <p className="mt-1 text-sm text-neutral-500">A quick view of the current resume health.</p>
            </div>
            <Target className="text-sky-700" size={20} />
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip cursor={{ fill: "#f4f4f5" }} />
                <Bar dataKey="score" fill="#0369a1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-3">
          <ReportList title="Strengths" icon={CheckCircle2} colorClass="text-emerald-700" items={strengths} empty="No strengths returned yet." />
          <ReportList title="Critical fixes" icon={AlertTriangle} colorClass="text-amber-700" items={weaknesses} empty="No weaknesses returned yet." />
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-violet-700" size={19} />
          <h3 className="text-lg font-bold text-neutral-950">Suggested improvements</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(suggestions.length ? suggestions : ["Run an analysis to generate targeted improvement suggestions."]).map((item) => (
            <p key={item} className="rounded-lg bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-950">
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

type ReportListProps = {
  title: string;
  icon: typeof CheckCircle2;
  colorClass: string;
  items: string[];
  empty: string;
};

function ReportList({ title, icon: Icon, colorClass, items, empty }: ReportListProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className={colorClass} size={18} />
        <h3 className="text-sm font-bold text-neutral-950">{title}</h3>
      </div>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-neutral-600">
        {(items.length ? items : [empty]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
