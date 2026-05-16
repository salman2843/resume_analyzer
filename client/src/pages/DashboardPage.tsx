import { AxiosError } from "axios";
import { BarChart3, ExternalLink, FileText, FileUp, Loader2, Sparkles, Target } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getResumeFileUrl, getResumes, uploadResume } from "../services/resumes";
import type { Resume } from "../services/resumes";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Something went wrong";
  }

  return "Something went wrong";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function getTextStatus(resume: Resume) {
  return resume.extractedText ? "Text extracted" : "PDF saved";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [error, setError] = useState("");
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const latestResume = resumes[0];
  const dashboardMetrics = useMemo(
    () => [
      { label: "Resume score", value: latestResume?.atsScore ? `${latestResume.atsScore}%` : "No scan yet", icon: BarChart3 },
      { label: "Uploads", value: `${resumes.length} saved`, icon: Target },
      { label: "AI suggestions", value: latestResume?.extractedText ? "Text ready" : "Ready", icon: Sparkles }
    ],
    [latestResume, resumes.length]
  );

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

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col justify-between gap-5 border-b border-neutral-200 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-950">Welcome, {user?.name}</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Upload resumes, extract text, and keep your analysis history connected to your account.
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
            <h2 className="text-lg font-bold text-neutral-950">Resume history</h2>
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
                className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50/60 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-neutral-200">
                    <FileText size={19} />
                  </span>
                  <div className="min-w-0">
                    <a
                      className="block truncate text-sm font-semibold text-neutral-950 hover:text-emerald-700"
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
                    </div>
                  </div>
                </div>
                <a
                  className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-neutral-700 shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-100"
                  href={getResumeFileUrl(resume.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <FileUp size={22} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-neutral-950">Upload your first resume</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Add a PDF resume to start building the analysis history for this account.
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
    </section>
  );
}
