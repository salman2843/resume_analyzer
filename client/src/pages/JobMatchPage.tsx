import { AxiosError } from "axios";
import { FileSearch, Loader2, SearchCheck, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResumes } from "../services/resumes";
import type { Resume } from "../services/resumes";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Something went wrong";
  }

  return "Something went wrong";
}

export default function JobMatchPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getResumes()
      .then((items) => {
        setResumes(items);
        setSelectedId(items[0]?.id || "");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="border-b border-neutral-200 pb-6">
        <p className="text-sm font-semibold uppercase text-amber-700">Job match module</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-950">Match resume with job description</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          A routed workspace for comparing a resume against target roles and tracking fit improvements.
        </p>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-12 text-sm font-medium text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Loading resumes...
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <SearchCheck className="text-amber-700" size={22} />
              <h2 className="text-xl font-bold text-neutral-950">Comparison setup</h2>
            </div>

            <label className="mt-5 block text-sm font-semibold text-neutral-700" htmlFor="resume-select">
              Resume
            </label>
            <select
              id="resume-select"
              className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {resumes.length ? (
                resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.originalName}
                  </option>
                ))
              ) : (
                <option value="">No resumes uploaded</option>
              )}
            </select>

            <label className="mt-5 block text-sm font-semibold text-neutral-700" htmlFor="job-description">
              Job description
            </label>
            <textarea
              id="job-description"
              className="mt-2 min-h-56 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm leading-6 text-neutral-800 outline-none focus:border-amber-400"
              placeholder="Paste a job description here when matching is connected."
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />

            <button
              className="mt-5 inline-flex h-10 items-center rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white opacity-70"
              type="button"
              disabled
            >
              Match resume soon
            </button>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <Target className="text-amber-700" size={22} />
              <h3 className="mt-3 text-base font-bold text-neutral-950">Match score</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                This panel will show keyword coverage, missing requirements, and role fit score.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <FileSearch className="text-sky-700" size={22} />
              <h3 className="mt-3 text-base font-bold text-neutral-950">Improvement tracker</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Future reports can compare versions and show whether resume changes improved job fit.
              </p>
            </div>
          </aside>
        </div>
      )}

      {!isLoading && resumes.length === 0 ? (
        <Link className="mt-5 inline-flex h-10 items-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white" to="/dashboard">
          Upload resume
        </Link>
      ) : null}
    </section>
  );
}
