import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";

function formatResume(resume: {
  id: string;
  fileUrl: string;
  originalName: string;
  extractedText: string | null;
  atsScore: number | null;
  createdAt: Date;
}) {
  return {
    id: resume.id,
    fileUrl: resume.fileUrl,
    originalName: resume.originalName,
    extractedText: resume.extractedText,
    atsScore: resume.atsScore,
    createdAt: resume.createdAt
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
