import { AxiosError } from "axios";
import {
  BarChart3,
  Download,
  ExternalLink,
  FileQuestion,
  FileText,
  FileUp,
  Loader2,
  MessageSquareText,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  WandSparkles
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AnalysisLoading from "../components/AnalysisLoading";
import { useAuth } from "../context/AuthContext";
import { analyzeResume, deleteResume, downloadResume, getResumeFileUrl, getResumes, uploadResume } from "../services/resumes";
import type { Resume } from "../services/resumes";
import { formatDate, getAnalyzedResumes, getResumeScore, getTextStatus } from "../utils/resumeUi";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Something went wrong";
  }

  return "Something went wrong";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [error, setError] = useState("");
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const latestResume = resumes[0];
  const analyzedResumes = useMemo(() => getAnalyzedResumes(resumes), [resumes]);
  const dashboardMetrics = useMemo(
    () => [
      { label: "Resume score", value: getResumeScore(latestResume) ? `${getResumeScore(latestResume)}%` : "No scan yet", icon: BarChart3 },
      { label: "Uploads", value: `${resumes.length} saved`, icon: Target },
      { label: "Reports", value: `${analyzedResumes.length} ready`, icon: Sparkles }
    ],
    [analyzedResumes.length, latestResume, resumes.length]
  );
  const modules = [
    {
      title: "Analysis",
      description: "Run AI analysis and generate a structured report.",
      to: "/analysis",
      icon: WandSparkles,
      accent: "bg-sky-700"
    },
    {
      title: "Results",
      description: "Review scores, strengths, fixes, and suggestions.",
      to: analyzedResumes[0] ? `/results/${analyzedResumes[0].id}` : "/results",
      icon: TrendingUp,
      accent: "bg-emerald-700"
    },
    {
      title: "Interview Practice",
      description: "Prepare resume-based interview questions.",
      to: "/interview-practice",
      icon: MessageSquareText,
      accent: "bg-violet-700"
    },
    {
      title: "Job Match",
      description: "Compare resumes with job descriptions.",
      to: "/job-match",
      icon: FileQuestion,
      accent: "bg-amber-700"
    }
  ];

  useEffect(() => {
    getResumes()
      .then(setResumes)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoadingResumes(false));
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");

    if (file.type !== "application/pdf") {
      setError("Only PDF resumes are supported");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume PDF must be 5 MB or smaller");
      return;
    }

    setIsUploading(true);

    try {
      const resume = await uploadResume(file);
      setResumes((current) => [resume, ...current]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(resume: Resume) {
    setError("");
    setDownloadingId(resume.id);

    try {
      await downloadResume(resume);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(resume: Resume) {
    const shouldDelete = window.confirm(`Delete ${resume.originalName}?`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setDeletingId(resume.id);

    try {
      await deleteResume(resume.id);
      setResumes((current) => current.filter((item) => item.id !== resume.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAnalyze(resume: Resume) {
    setError("");
    setAnalyzingId(resume.id);

    try {
      const result = await analyzeResume(resume.id);
      setResumes((current) => current.map((item) => (item.id === resume.id ? result.resume : item)));
      navigate(`/results/${resume.id}`, { state: { resume: result.resume } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-neutral-200 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-sky-700">Career workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-950">Welcome, {user?.name}</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Manage resumes, run analysis, review reports, and prepare upcoming career workflows from one place.
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
          {isUploading ? "Uploading..." : "Upload resume"}
        </button>
        <input ref={fileInputRef} className="hidden" type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {dashboardMetrics.map((metric) => (
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

      <section className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-950">Resume library</h2>
            <p className="mt-1 text-sm text-neutral-500">Saved PDFs linked to this account.</p>
          </div>
          <button
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
            Add PDF
          </button>
        </div>

        {isLoadingResumes ? (
          <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm font-medium text-neutral-500">
            <Loader2 size={16} className="animate-spin" />
            Loading resumes...
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid gap-3 p-4">
            {resumes.map((resume) => (
              <article
                key={resume.id}
                className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50/60 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm ring-1 ring-neutral-200">
                    <FileText size={19} />
                  </span>
                  <div className="min-w-0">
                    <a
                      className="block truncate text-sm font-semibold text-neutral-950 hover:text-sky-700"
                      href={getResumeFileUrl(resume.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      title={resume.originalName}
                    >
                      {resume.originalName}
                    </a>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      <span>Uploaded {formatDate(resume.createdAt)}</span>
                      <span>{getTextStatus(resume)}</span>
                      {resume.atsScore ? <span>ATS {resume.atsScore}%</span> : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-sky-700 px-3 text-xs font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={() => handleAnalyze(resume)}
                    disabled={analyzingId === resume.id || !resume.extractedText}
                  >
                    {analyzingId === resume.id ? <Loader2 size={14} className="animate-spin" /> : <WandSparkles size={14} />}
                    {resume.latestAnalysis ? "Re-analyze" : "Analyze"}
                  </button>
                  {resume.latestAnalysis ? (
                    <Link
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-neutral-700 shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-100"
                      to={`/results/${resume.id}`}
                    >
                      Results
                    </Link>
                  ) : null}
                  
                  <button
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-neutral-700 shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={() => handleDownload(resume)}
                    disabled={downloadingId === resume.id}
                  >
                    {downloadingId === resume.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Download
                  </button>
                  <button
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-neutral-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={() => handleDelete(resume)}
                    disabled={deletingId === resume.id}
                  >
                    {deletingId === resume.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete
                  </button>
                </div>
                {analyzingId === resume.id ? (
                  <div className="border-t border-neutral-200 pt-4 lg:col-span-2">
                    <AnalysisLoading compact />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
              <FileUp size={22} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-neutral-950">Upload your first resume</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Add a PDF resume to start building analysis history for this account.
            </p>
            <button
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
              Choose PDF
            </button>
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-neutral-950">Modules</h2>
          <Link className="text-sm font-semibold text-sky-700 hover:text-sky-800" to="/analysis">
            Start analysis
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <Link
              key={module.title}
              className="group rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
              to={module.to}
            >
              <span className={`flex size-10 items-center justify-center rounded-lg text-white ${module.accent}`}>
                <module.icon size={18} />
              </span>
              <h3 className="mt-4 text-base font-bold text-neutral-950">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{module.description}</p>
            </Link>
          ))}
        </div>
      </section>

    </section>
  );
}
