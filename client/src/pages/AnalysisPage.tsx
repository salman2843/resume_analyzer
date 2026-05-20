import { AxiosError } from "axios";
import { FileText, Loader2, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AnalysisLoading from "../components/AnalysisLoading";
import { analyzeResume, getResumes } from "../services/resumes";
import type { Resume } from "../services/resumes";
import { formatDate, getResumeScore, getTextStatus } from "../utils/resumeUi";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Something went wrong";
  }

  return "Something went wrong";
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState(resumeId || "");
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getResumes()
      .then((items) => {
        setResumes(items);
        setSelectedId(resumeId || items[0]?.id || "");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [resumeId]);

  const selectedResume = resumes.find((resume) => resume.id === selectedId);

  async function handleAnalyze(resume: Resume) {
    setError("");
    setAnalyzingId(resume.id);

    try {
      const result = await analyzeResume(resume.id);
      navigate(`/results/${resume.id}`, { state: { resume: result.resume } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="border-b border-neutral-200 pb-6">
        <p className="text-sm font-semibold uppercase text-sky-700">Analysis module</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-950">Analyze a resume</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Choose a saved resume, run the AI analysis workflow, and open a dedicated report page when the result is ready.
        </p>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-12 text-sm font-medium text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Loading resumes...
        </div>
      ) : resumes.length > 0 ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-neutral-950">Select resume</h2>
            <div className="mt-4 grid gap-2">
              {resumes.map((resume) => (
                <button
                  key={resume.id}
                  className={`rounded-lg border p-3 text-left ${
                    selectedId === resume.id ? "border-sky-300 bg-sky-50" : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                  type="button"
                  onClick={() => setSelectedId(resume.id)}
                >
                  <span className="block truncate text-sm font-semibold text-neutral-950">{resume.originalName}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{getTextStatus(resume)}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            {selectedResume ? (
              <>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                      <FileText size={21} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-neutral-950">{selectedResume.originalName}</h2>
                      <p className="mt-1 text-sm text-neutral-500">Uploaded {formatDate(selectedResume.createdAt)}</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-neutral-100 px-4 py-3">
                    <p className="text-xs font-semibold uppercase text-neutral-500">Current score</p>
                    <p className="mt-1 text-2xl font-bold text-neutral-950">{getResumeScore(selectedResume) ?? "--"}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm leading-6 text-neutral-600">
                  <p>
                    The analyzer will evaluate structure, strengths, weak areas, suggestions, ATS score, and job-match readiness.
                  </p>
                  {!selectedResume.extractedText ? (
                    <p className="rounded-lg bg-amber-50 px-4 py-3 font-medium text-amber-800">
                      This resume does not have extracted text yet, so analysis is unavailable.
                    </p>
                  ) : null}
                </div>

                {analyzingId === selectedResume.id ? (
                  <div className="mt-5">
                    <AnalysisLoading />
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={() => handleAnalyze(selectedResume)}
                    disabled={analyzingId === selectedResume.id || !selectedResume.extractedText}
                  >
                    {analyzingId === selectedResume.id ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />}
                    {selectedResume.latestAnalysis ? "Re-analyze resume" : "Analyze resume"}
                  </button>
                  {selectedResume.latestAnalysis ? (
                    <Link
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                      to={`/results/${selectedResume.id}`}
                    >
                      Open report
                    </Link>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white px-5 py-12 text-center shadow-sm">
          <h2 className="text-xl font-bold text-neutral-950">No resumes yet</h2>
          <p className="mt-2 text-sm text-neutral-500">Upload a resume from the dashboard before running analysis.</p>
          <Link className="mt-5 inline-flex h-10 items-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white" to="/dashboard">
            Go to dashboard
          </Link>
        </div>
      )}
    </section>
  );
}
