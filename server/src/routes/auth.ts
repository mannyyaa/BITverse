import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { ApiError } from "../middleware/error.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new ApiError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash },
    });

    const token = signToken({ sub: user.id, email: user.email, name: user.name });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatarColor: user.avatarColor },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new ApiError(401, "Invalid credentials");

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid credentials");

    const token = signToken({ sub: user.id, email: user.email, name: user.name });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatarColor: user.avatarColor },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { sub } = (req as AuthRequest).user;
    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user) throw new ApiError(404, "User not found");
    res.json({ id: user.id, email: user.email, name: user.name, avatarColor: user.avatarColor });
  } catch (err) {
    next(err);
  }
});
