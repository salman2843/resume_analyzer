import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { analyzeResumeText, generateInterviewQuestions } from "../services/gemini.js";
import { HttpError } from "../utils/httpError.js";

function formatAnalysis(analysis: {
  id: string;
  strengths: unknown;
  weaknesses: unknown;
  suggestions: unknown;
  jobMatchScore: number | null;
  createdAt: Date;
}) {
  return {
    id: analysis.id,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    suggestions: analysis.suggestions,
    jobMatchScore: analysis.jobMatchScore,
    createdAt: analysis.createdAt
  };
}

function formatResume(resume: {
  id: string;
  fileUrl: string;
  originalName: string;
  extractedText: string | null;
  atsScore: number | null;
  createdAt: Date;
  analyses?: Array<{
    id: string;
    strengths: unknown;
    weaknesses: unknown;
    suggestions: unknown;
    jobMatchScore: number | null;
    createdAt: Date;
  }>;
}) {
  return {
    id: resume.id,
    fileUrl: resume.fileUrl,
    originalName: resume.originalName,
    extractedText: resume.extractedText,
    atsScore: resume.atsScore,
    createdAt: resume.createdAt,
    latestAnalysis: resume.analyses?.[0] ? formatAnalysis(resume.analyses[0]) : null
  };
}

function formatInterviewSession(session: {
  id: string;
  questions: unknown;
  feedback: unknown;
  createdAt: Date;
}) {
  return {
    id: session.id,
    questions: session.questions,
    feedback: session.feedback,
    createdAt: session.createdAt
  };
}

async function removeUploadedFile(file?: Express.Multer.File) {
  if (!file) {
    return;
  }

  await fs.unlink(file.path).catch(() => undefined);
}

function getStoredResumePath(fileUrl: string) {
  return path.join(process.cwd(), fileUrl.replace(/^\/+/, ""));
}

function getResumeId(req: Request) {
  const id = req.params.id;

  if (typeof id !== "string") {
    throw new HttpError(400, "Invalid resume id");
  }

  return id;
}

export async function listResumes(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const resumes = await prisma.resume.findMany({
    where: { userId: authReq.user.id },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json({ resumes: resumes.map(formatResume) });
}

export async function uploadResume(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const file = req.file;

  if (!file) {
    throw new HttpError(400, "Upload a PDF resume");
  }

  try {
    const buffer = await fs.readFile(file.path);
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const extractedText = parsed.text.trim();

    const resume = await prisma.resume.create({
      data: {
        userId: authReq.user.id,
        fileUrl: `/uploads/resumes/${file.filename}`,
        originalName: file.originalname,
        extractedText: extractedText || null
      }
    });

    res.status(201).json({ resume: formatResume(resume) });
  } catch (error) {
    await removeUploadedFile(file);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(400, "Unable to read this PDF. Try another resume file.");
  }
}

export async function analyzeResume(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const resumeId = getResumeId(req);
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: authReq.user.id
    }
  });

  if (!resume) {
    throw new HttpError(404, "Resume not found");
  }

  if (!resume.extractedText) {
    throw new HttpError(400, "This resume has no extracted text to analyze");
  }

  const result = await analyzeResumeText(resume.extractedText);
  const analysis = await prisma.analysis.create({
    data: {
      resumeId: resume.id,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      jobMatchScore: result.jobMatchScore ?? null
    }
  });

  const updatedResume = await prisma.resume.update({
    where: { id: resume.id },
    data: { atsScore: result.atsScore },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  res.status(201).json({
    resume: formatResume(updatedResume),
    analysis: formatAnalysis(analysis)
  });
}

export async function listInterviewSessions(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const resumeId = getResumeId(req);
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: authReq.user.id
    }
  });

  if (!resume) {
    throw new HttpError(404, "Resume not found");
  }

  const sessions = await prisma.interviewSession.findMany({
    where: {
      userId: authReq.user.id,
      resumeId: resume.id
    },
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json({ sessions: sessions.map(formatInterviewSession) });
}

export async function createInterviewQuestions(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const resumeId = getResumeId(req);
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: authReq.user.id
    }
  });

  if (!resume) {
    throw new HttpError(404, "Resume not found");
  }

  if (!resume.extractedText) {
    throw new HttpError(400, "This resume has no extracted text for interview questions");
  }

  const result = await generateInterviewQuestions(resume.extractedText);
  const session = await prisma.interviewSession.create({
    data: {
      userId: authReq.user.id,
      resumeId: resume.id,
      questions: result
    }
  });

  res.status(201).json({ session: formatInterviewSession(session) });
}

export async function downloadResume(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const resumeId = getResumeId(req);
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: authReq.user.id
    }
  });

  if (!resume) {
    throw new HttpError(404, "Resume not found");
  }

  res.download(getStoredResumePath(resume.fileUrl), resume.originalName);
}

export async function deleteResume(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const resumeId = getResumeId(req);
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: authReq.user.id
    }
  });

  if (!resume) {
    throw new HttpError(404, "Resume not found");
  }

  await prisma.resume.delete({ where: { id: resume.id } });
  await fs.unlink(getStoredResumePath(resume.fileUrl)).catch(() => undefined);

  res.status(204).send();
}
