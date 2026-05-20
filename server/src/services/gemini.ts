import { z } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const analysisSchema = z.object({
  atsScore: z.number().int().min(0).max(100),
  jobMatchScore: z.number().int().min(0).max(100).nullable().optional(),
  strengths: z.array(z.string().min(1)).min(1).max(8),
  weaknesses: z.array(z.string().min(1)).min(1).max(8),
  suggestions: z.array(z.string().min(1)).min(1).max(10)
});

export type ResumeAnalysisResult = z.infer<typeof analysisSchema>;

const interviewQuestionSchema = z.object({
  jobRole: z.string().min(1).max(120),
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        sampleAnswer: z.string().min(1)
      })
    )
    .length(5)
});

export type InterviewQuestionResult = z.infer<typeof interviewQuestionSchema>;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

function buildPrompt(resumeText: string) {
  return `Analyze this resume for ATS readiness and hiring quality.

Return only valid JSON matching this shape:
{
  "atsScore": number from 0 to 100,
  "jobMatchScore": null,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[]
}

Rules:
- Do not include markdown.
- Do not invent work history, tools, degrees, or companies.
- Base every point only on the resume text.
- Keep each bullet specific and practical.
- jobMatchScore must be null because no job description was provided.

Resume text:
${resumeText.slice(0, 24000)}`;
}

function buildInterviewPrompt(resumeText: string) {
  return `Generate interview practice questions from this resume.

Return only valid JSON matching this shape:
{
  "jobRole": "short inferred target job role",
  "questions": [
    {
      "question": "interview question",
      "sampleAnswer": "short example answer"
    }
  ]
}

Rules:
- Generate exactly 5 questions.
- Questions must be related to the candidate's likely job role, resume projects, skills, and experience.
- Infer the job role only from the resume text.
- Keep sample answers short, practical, and first-person.
- Do not invent companies, degrees, metrics, or tools not present in the resume.
- Do not include markdown.

Resume text:
${resumeText.slice(0, 24000)}`;
}

function parseJsonText(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(withoutFence);
}

export async function analyzeResumeText(resumeText: string) {
  if (!env.geminiApiKey) {
    throw new HttpError(500, "GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(resumeText) }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    }
  );

  const payload = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new HttpError(response.status, payload.error?.message || "Gemini analysis failed");
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!text) {
    throw new HttpError(502, "Gemini returned an empty analysis");
  }

  try {
    return analysisSchema.parse(parseJsonText(text));
  } catch {
    throw new HttpError(502, "Gemini returned an invalid analysis format");
  }
}

export async function generateInterviewQuestions(resumeText: string) {
  if (!env.geminiApiKey) {
    throw new HttpError(500, "GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildInterviewPrompt(resumeText) }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      })
    }
  );

  const payload = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new HttpError(response.status, payload.error?.message || "Gemini question generation failed");
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!text) {
    throw new HttpError(502, "Gemini returned empty interview questions");
  }

  try {
    return interviewQuestionSchema.parse(parseJsonText(text));
  } catch {
    throw new HttpError(502, "Gemini returned invalid interview question format");
  }
}
