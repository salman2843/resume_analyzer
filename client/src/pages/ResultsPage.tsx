import { AxiosError } from "axios";
import { Loader2, MessageSquareText, SearchCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ResumeReport from "../components/ResumeReport";
import { getResumes } from "../services/resumes";
import type { Resume } from "../services/resumes";
import { getAnalyzedResumes } from "../utils/resumeUi";

type LocationState = {
  resume?: Resume;
};

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Something went wrong";
  }

  return "Something went wrong";
}

export default function ResultsPage() {
  const { resumeId } = useParams();
  const location = useLocation();
  const stateResume = (location.state as LocationState | null)?.resume;
  const [resumes, setResumes] = useState<Resume[]>(stateResume ? [stateResume] : []);
  const [isLoading, setIsLoading] = useState(!stateResume);
  const [error, setError] = useState("");

  useEffect(() => {
    getResumes()
      .then(setResumes)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const analyzedResumes = useMemo(() => getAnalyzedResumes(resumes), [resumes]);
  const selectedResume = useMemo(() => {
    if (resumeId) {
      return resumes.find((resume) => resume.id === resumeId) || stateResume;
    }

    return analyzedResumes[0] || resumes[0] || stateResume;
  }, [analyzedResumes, resumeId, resumes, stateResume]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700">Results module</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-950">Resume analysis results</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">Review the latest AI report and move into interview or job-match workflows.</p>
        </div>
        <Link className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white" to="/analysis">
          Analyze another resume
        </Link>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-12 text-sm font-medium text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Loading results...
        </div>
      ) : selectedResume ? (
        <div className="mt-6 grid gap-5">
          <ResumeReport resume={selectedResume} />
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:border-violet-200 hover:bg-violet-50"
              to={`/interview-practice/${selectedResume.id}`}
            >
              <MessageSquareText className="text-violet-700" size={22} />
              <h2 className="mt-3 text-base font-bold text-neutral-950">Generate interview questions</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Use this resume as the source for role-specific practice later.</p>
            </Link>
            <Link
              className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:border-amber-200 hover:bg-amber-50"
              to="/job-match"
            >
              <SearchCheck className="text-amber-700" size={22} />
              <h2 className="mt-3 text-base font-bold text-neutral-950">Match with job description</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Compare this report against a target job once matching is connected.</p>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white px-5 py-12 text-center shadow-sm">
          <h2 className="text-xl font-bold text-neutral-950">No analysis results yet</h2>
          <p className="mt-2 text-sm text-neutral-500">Run analysis on a resume to generate your first report.</p>
          <Link className="mt-5 inline-flex h-10 items-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white" to="/analysis">
            Start analysis
          </Link>
        </div>
      )}
    </section>
  );
}
