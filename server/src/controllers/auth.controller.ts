import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";
import { createAccessToken } from "../utils/jwt.js";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

function sanitizeUser(user: { id: string; name: string; email: string; role: string; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function authResponse(user: { id: string; name: string; email: string; role: string; createdAt: Date }) {
  return {
    user: sanitizeUser(user),
    token: createAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role
    })
  };
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    throw new HttpError(409, "An account already exists for this email");
  }

  const password = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password
    }
  });

  res.status(201).json(authResponse(user));
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(data.password, user.password);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }

  res.status(200).json(authResponse(user));
}

export async function getCurrentUser(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  const user = await prisma.user.findUnique({ where: { id: authReq.user.id } });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.status(200).json({ user: sanitizeUser(user) });
}
