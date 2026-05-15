import type { NextFunction, Request, Response } from "express";

type AppError = Error & {
  statusCode?: number;
};

export function errorHandler(error: AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error"
  });
}
