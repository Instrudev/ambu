import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth, AuthRequest } from "../middlewares/auth";

export const driversRouter = Router();

const shiftSchema = z.object({
  ambulanceId: z.string().uuid(),
  currentLat: z.number().optional(),
  currentLng: z.number().optional()
});

driversRouter.post("/shifts/start", requireAuth(["driver"]), async (req: AuthRequest, res) => {
  const data = shiftSchema.safeParse(req.body);
  if (!data.success || !req.user) {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }

  const shift = await prisma.driverShift.create({
    data: {
      driverId: req.user.id,
      ambulanceId: data.data.ambulanceId,
      currentLat: data.data.currentLat,
      currentLng: data.data.currentLng
    }
  });

  return res.json({ turno: shift });
});

driversRouter.post("/shifts/end", requireAuth(["driver"]), async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }

  const shift = await prisma.driverShift.findFirst({
    where: { driverId: req.user.id, endedAt: null },
    orderBy: { startedAt: "desc" }
  });

  if (!shift) {
    return res.status(404).json({ mensaje: "No hay turno activo" });
  }

  const updated = await prisma.driverShift.update({
    where: { id: shift.id },
    data: { endedAt: new Date() }
  });

  return res.json({ turno: updated });
});

driversRouter.get("/me", requireAuth(["driver"]), async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }

  const driver = await prisma.driver.findUnique({
    where: { id: req.user.id },
    include: { institution: true }
  });

  return res.json({ driver });
});
