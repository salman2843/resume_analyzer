import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
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
    <section className="mx-auto max-w-[860px] px-4 py-8 sm:px-6">
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-5 py-12 text-sm font-medium text-neutral-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Loader2 size={16} className="animate-spin" />
          Loading results...
        </div>
      ) : selectedResume ? (
        <ResumeReport resume={selectedResume} />
      ) : (
        <div className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
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
