import type { Resume, ResumeAnalysis } from "../services/resumes";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function getTextStatus(resume: Resume) {
  if (resume.latestAnalysis) {
    return "Analyzed";
  }

  return resume.extractedText ? "Text extracted" : "PDF saved";
}

export function getList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function getResumeScore(resume?: Resume | null) {
  return resume?.atsScore ?? resume?.latestAnalysis?.jobMatchScore ?? null;
}

export function getAnalyzedResumes(resumes: Resume[]) {
  return resumes.filter((resume) => Boolean(resume.latestAnalysis));
}

export function getAnalysisSummary(analysis?: ResumeAnalysis | null) {
  const strengths = getList(analysis?.strengths);
  const weaknesses = getList(analysis?.weaknesses);

  if (strengths.length > weaknesses.length) {
    return "Strong foundation with a few focused improvements left.";
  }

  if (weaknesses.length > strengths.length) {
    return "Needs targeted fixes before using it for priority applications.";
  }

  return analysis ? "Balanced review ready for next-step improvements." : "Run an analysis to generate a resume report.";
}
