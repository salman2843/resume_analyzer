import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

type AppError = Error & {
  statusCode?: number;
};

export function errorHandler(error: AppError, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error"
  });
}
