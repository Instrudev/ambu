import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signToken } from "../utils/jwt";

export const authRouter = Router();

const registerSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "driver", "admin"]).default("user")
});

authRouter.post("/register", async (req, res) => {
  const data = registerSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ mensaje: "Datos inválidos", errores: data.error.flatten() });
  }

  const password = await bcrypt.hash(data.data.password, 10);
  const user = await prisma.user.create({
    data: {
      nombre: data.data.nombre,
      email: data.data.email,
      telefono: data.data.telefono,
      password
    }
  });

  const token = signToken({ sub: user.id, role: "user" });
  return res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email } });
});

authRouter.post("/login", async (req, res) => {
  const data = loginSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ mensaje: "Datos inválidos", errores: data.error.flatten() });
  }

  const { email, password, role } = data.data;
  const table = role === "admin" ? prisma.admin : role === "driver" ? prisma.driver : prisma.user;
  const account = await table.findUnique({ where: { email } });

  if (!account) {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }

  const valido = await bcrypt.compare(password, account.password);
  if (!valido) {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }

  const token = signToken({ sub: account.id, role });
  return res.json({ token, usuario: { id: account.id, nombre: account.nombre, email: account.email, role } });
});
