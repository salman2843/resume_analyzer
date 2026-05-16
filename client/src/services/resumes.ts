import api from "./api";

export type Resume = {
  id: string;
  fileUrl: string;
  originalName: string;
  extractedText: string | null;
  atsScore: number | null;
  createdAt: string;
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

export function getResumeFileUrl(fileUrl: string) {
  const baseUrl = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${baseUrl}${fileUrl}`;
}
