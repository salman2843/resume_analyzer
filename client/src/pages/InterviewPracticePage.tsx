import { AxiosError } from "axios";
import { ChevronDown, FileText, Loader2, MessageSquareText, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  generateInterviewQuestions,
  getInterviewSessions,
  getResumes
} from "../services/resumes";
import type { InterviewSession, Resume } from "../services/resumes";
import { formatDate } from "../utils/resumeUi";

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
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [openQuestionId, setOpenQuestionId] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  useEffect(() => {
    if (!selectedId) {
      setSessions([]);
      return;
    }

    setError("");
    setIsLoadingSessions(true);
    getInterviewSessions(selectedId)
      .then((items) => {
        setSessions(items);
        setOpenQuestionId("0");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoadingSessions(false));
  }, [selectedId]);

  const selectedResume = resumes.find((resume) => resume.id === selectedId);
  const latestSession = sessions[0];
  const questions = useMemo(() => latestSession?.questions?.questions || [], [latestSession]);
  const jobRole = latestSession?.questions?.jobRole || "Resume-based role";

  async function handleGenerateQuestions() {
    if (!selectedResume) {
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const session = await generateInterviewQuestions(selectedResume.id);
      setSessions((current) => [session, ...current]);
      setOpenQuestionId("0");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="mx-auto max-w-215 px-4 py-8 sm:px-6">
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
                <MessageSquareText size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase text-[#2563eb]">Interview practice</p>
                <h1 className="mt-1 text-2xl font-semibold text-neutral-950">Generate resume-based questions</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
              Create five interview questions from the selected resume, with short sample answers you can review.
            </p>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleGenerateQuestions}
            disabled={isGenerating || !selectedResume?.extractedText}
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {questions.length ? "Generate more questions" : "Generate questions"}
          </button>
        </div>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-5 py-12 text-sm font-medium text-neutral-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Loader2 size={16} className="animate-spin" />
          Loading resumes...
        </div>
      ) : resumes.length > 0 ? (
        <div className="mt-5 grid gap-5">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <label className="text-sm font-semibold text-neutral-950" htmlFor="resume-select">
              Practice source
            </label>
            <select
              id="resume-select"
              className="mt-3 h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-neutral-800 outline-none focus:border-[#2563eb]"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.originalName}
                </option>
              ))}
            </select>
            {selectedResume ? (
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-neutral-500">
                <span className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2">
                  <FileText size={14} />
                  {selectedResume.originalName}
                </span>
                <span className="rounded-lg bg-neutral-100 px-3 py-2">Uploaded {formatDate(selectedResume.createdAt)}</span>
                {latestSession ? <span className="rounded-lg bg-blue-50 px-3 py-2 text-[#2563eb]">Latest set {formatDate(latestSession.createdAt)}</span> : null}
              </div>
            ) : null}
            {!selectedResume?.extractedText ? (
              <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-[#d97706]">
                This resume does not have extracted text, so questions cannot be generated.
              </p>
            ) : null}
          </div>

          {isLoadingSessions ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-5 py-10 text-sm font-medium text-neutral-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <Loader2 size={16} className="animate-spin" />
              Loading saved questions...
            </div>
          ) : questions.length > 0 ? (
            <div className="grid gap-5">
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold uppercase text-[#2563eb]">Generated set</p>
                    <h2 className="mt-1 text-xl font-semibold text-neutral-950">{jobRole}</h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">Open each question to review the short sample answer.</p>
                  </div>
                  <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2563eb] bg-white px-4 text-sm font-semibold text-[#2563eb] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Generate more questions
                  </button>
                </div>
              </div>

              <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {questions.map((item, index) => {
                  const id = String(index);
                  const isOpen = openQuestionId === id;

                  return (
                    <div key={`${latestSession.id}-${id}`} className="bg-white">
                      <button
                        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-neutral-50"
                        type="button"
                        onClick={() => setOpenQuestionId(isOpen ? "" : id)}
                        aria-expanded={isOpen}
                      >
                        <span className="flex gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-[#2563eb]">
                            {index + 1}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold leading-6 text-neutral-950">{item.question}</span>
                            <span className="mt-1 block text-xs font-medium text-neutral-500">{isOpen ? "Sample answer shown" : "Show sample answer"}</span>
                          </span>
                        </span>
                        <ChevronDown size={18} className={`mt-1 shrink-0 text-neutral-400 transition ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen ? (
                        <div className="px-5 pb-5 pl-17">
                          <p className="rounded-lg bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700">{item.sampleAnswer}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <MessageSquareText className="mx-auto text-[#2563eb]" size={28} />
              <h2 className="mt-4 text-xl font-semibold text-neutral-950">No questions generated yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Generate a set of five questions from this resume. The first answer will be open by default.
              </p>
              <button
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !selectedResume?.extractedText}
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate questions
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-white px-5 py-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-xl font-semibold text-neutral-950">No resumes yet</h2>
          <p className="mt-2 text-sm text-neutral-500">Upload a resume before generating interview questions.</p>
          <Link className="mt-5 inline-flex h-10 items-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white" to="/dashboard">
            Upload resume
          </Link>
        </div>
      )}
    </section>
  );
}
