import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { requireAuth } from "../middlewares/auth";

export const adminRouter = Router();

const institutionSchema = z.object({
  nombre: z.string().min(2),
  direccion: z.string().optional(),
  telefono: z.string().optional()
});

const ambulanceSchema = z.object({
  codigo: z.string().min(2),
  placa: z.string().min(3),
  modelo: z.string().optional(),
  institutionId: z.string().uuid()
});

const driverSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional(),
  password: z.string().min(6),
  institutionId: z.string().uuid()
});

adminRouter.use(requireAuth(["admin"]));

// Instituciones
adminRouter.get("/institutions", async (_req, res) => {
  const items = await prisma.institution.findMany();
  return res.json({ instituciones: items });
});

adminRouter.post("/institutions", async (req, res) => {
  const data = institutionSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }
  const item = await prisma.institution.create({ data: data.data });
  return res.json({ institucion: item });
});

adminRouter.put("/institutions/:id", async (req, res) => {
  const data = institutionSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }
  const item = await prisma.institution.update({ where: { id: req.params.id }, data: data.data });
  return res.json({ institucion: item });
});

adminRouter.delete("/institutions/:id", async (req, res) => {
  await prisma.institution.delete({ where: { id: req.params.id } });
  return res.json({ mensaje: "Institución eliminada" });
});

// Ambulancias
adminRouter.get("/ambulances", async (_req, res) => {
  const items = await prisma.ambulance.findMany({ include: { institution: true } });
  return res.json({ ambulancias: items });
});

adminRouter.post("/ambulances", async (req, res) => {
  const data = ambulanceSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }
  const item = await prisma.ambulance.create({ data: data.data });
  return res.json({ ambulancia: item });
});

adminRouter.put("/ambulances/:id", async (req, res) => {
  const data = ambulanceSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }
  const item = await prisma.ambulance.update({ where: { id: req.params.id }, data: data.data });
  return res.json({ ambulancia: item });
});

adminRouter.delete("/ambulances/:id", async (req, res) => {
  await prisma.ambulance.delete({ where: { id: req.params.id } });
  return res.json({ mensaje: "Ambulancia eliminada" });
});

// Conductores
adminRouter.get("/drivers", async (_req, res) => {
  const items = await prisma.driver.findMany({ include: { institution: true } });
  return res.json({ conductores: items });
});

adminRouter.post("/drivers", async (req, res) => {
  const data = driverSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }
  const hashed = await bcrypt.hash(data.data.password, 10);
  const item = await prisma.driver.create({
    data: {
      ...data.data,
      password: hashed
    }
  });
  return res.json({ conductor: item });
});

adminRouter.put("/drivers/:id", async (req, res) => {
  const data = driverSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }
  const hashed = await bcrypt.hash(data.data.password, 10);
  const item = await prisma.driver.update({
    where: { id: req.params.id },
    data: { ...data.data, password: hashed }
  });
  return res.json({ conductor: item });
});

adminRouter.delete("/drivers/:id", async (req, res) => {
  await prisma.driver.delete({ where: { id: req.params.id } });
  return res.json({ mensaje: "Conductor eliminado" });
});
