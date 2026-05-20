import { AxiosError } from "axios";
import { BrainCircuit, Loader2, MessageSquareText, Mic, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResumes } from "../services/resumes";
import type { Resume } from "../services/resumes";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || "Something went wrong";
  }

  return "Something went wrong";
}

export default function InterviewPracticePage() {
  const { resumeId } = useParams();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState(resumeId || "");
  const [isLoading, setIsLoading] = useState(true);
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
  const practiceModes = [
    { title: "Resume deep dive", description: "Questions based on projects, skills, and experience.", icon: BrainCircuit },
    { title: "Timed mock interview", description: "A future mode for timed answers and review.", icon: Timer },
    { title: "Voice practice", description: "A future mode for spoken answers and coaching.", icon: Mic }
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="border-b border-neutral-200 pb-6">
        <p className="text-sm font-semibold uppercase text-violet-700">Interview module</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-950">Interview practice</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          This route is ready for AI-generated interview questions based on the selected resume.
        </p>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-12 text-sm font-medium text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Loading resumes...
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-neutral-950">Practice source</h2>
            <select
              className="mt-4 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800"
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
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {selectedResume
                ? "Question generation will use this resume and its latest analysis when the AI interview endpoint is added."
                : "Upload a resume before starting practice."}
            </p>
          </aside>

          <div className="grid gap-4">
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-5">
              <MessageSquareText className="text-violet-700" size={24} />
              <h2 className="mt-3 text-xl font-bold text-neutral-950">Question generation workspace</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-950">
                The page structure is in place for generating behavioral, technical, and resume-specific questions.
              </p>
              <button
                className="mt-5 inline-flex h-10 items-center rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white opacity-70"
                type="button"
                disabled
              >
                Generate questions soon
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {practiceModes.map((mode) => (
                <div key={mode.title} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                  <mode.icon className="text-violet-700" size={21} />
                  <h3 className="mt-3 text-base font-bold text-neutral-950">{mode.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>
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
