import api from "./api";

export type ResumeAnalysis = {
  id: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  jobMatchScore: number | null;
  createdAt: string;
};

export type Resume = {
  id: string;
  fileUrl: string;
  originalName: string;
  extractedText: string | null;
  atsScore: number | null;
  createdAt: string;
  latestAnalysis: ResumeAnalysis | null;
};

export async function getResumes() {
  const response = await api.get<{ resumes: Resume[] }>("/resumes");
  return response.data.resumes;
}

export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await api.post<{ resume: Resume }>("/resumes", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data.resume;
}

export async function downloadResume(resume: Resume) {
  const response = await api.get<Blob>(`/resumes/${resume.id}/download`, {
    responseType: "blob"
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");

  link.href = url;
  link.download = resume.originalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function deleteResume(id: string) {
  await api.delete(`/resumes/${id}`);
}

export async function analyzeResume(id: string) {
  const response = await api.post<{ resume: Resume; analysis: ResumeAnalysis }>(`/resumes/${id}/analyze`);
  return response.data;
}

export function getResumeFileUrl(fileUrl: string) {
  const baseUrl = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${baseUrl}${fileUrl}`;
}
