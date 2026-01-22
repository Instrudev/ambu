import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { crearEmergencia, aceptarIncidente } from "../services/incidentService";
import { prisma } from "../config/prisma";
import { Server } from "socket.io";

const emergencySchema = z.object({
  lat: z.number(),
  lng: z.number(),
  direccion: z.string().optional()
});

export const createIncidentsRouter = (io: Server) => {
  const router = Router();

  router.post("/emergency", requireAuth(["user"]), async (req: AuthRequest, res) => {
    const data = emergencySchema.safeParse(req.body);
    if (!data.success || !req.user) {
      return res.status(400).json({ mensaje: "Datos inválidos" });
    }

    const incidente = await crearEmergencia({
      userId: req.user.id,
      lat: data.data.lat,
      lng: data.data.lng,
      direccion: data.data.direccion,
      io
    });

    return res.json({ incidente });
  });

  router.post("/:id/accept", requireAuth(["driver"]), async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ mensaje: "No autorizado" });
    }

    try {
      const incidente = await aceptarIncidente({ incidenteId: req.params.id, driverId: req.user.id });
      io.emit("incidente:asignado", { incidenteId: incidente.id, shiftId: incidente.shiftId });
      return res.json({ incidente });
    } catch (error) {
      return res.status(409).json({ mensaje: "Incidente no disponible" });
    }
  });

  router.get("/nearby", requireAuth(["driver", "admin"]), async (req, res) => {
    const querySchema = z.object({
      lat: z.coerce.number(),
      lng: z.coerce.number(),
      radio: z.coerce.number().default(1000)
    });

    const data = querySchema.safeParse(req.query);
    if (!data.success) {
      return res.status(400).json({ mensaje: "Parámetros inválidos" });
    }

    const incidents = await prisma.incident.findMany({
      where: {
        status: { in: ["active", "assigned", "attending", "support"] }
      }
    });

    return res.json({ incidents });
  });

  return router;
};
