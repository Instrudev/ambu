import { IncidentStatus, DriverShiftStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { distanciaEnMetros } from "../utils/geo";
import { Server } from "socket.io";

const RADIO_INICIAL_METROS = 1000;
const INCREMENTO_RADIO_METROS = 500;
const ESPERA_SEGUNDOS = 10;

export const crearEmergencia = async (params: {
  userId: string;
  lat: number;
  lng: number;
  direccion?: string;
  io: Server;
}) => {
  const ahora = new Date();
  const haceUnMinuto = new Date(ahora.getTime() - 60_000);

  const incidentesActivos = await prisma.incident.findMany({
    where: {
      createdAt: { gte: haceUnMinuto },
      status: { in: [IncidentStatus.active, IncidentStatus.assigned, IncidentStatus.attending, IncidentStatus.support] }
    }
  });

  const incidenteExistente = incidentesActivos.find((incidente) => {
    return distanciaEnMetros(incidente.lat, incidente.lng, params.lat, params.lng) < 50;
  });

  if (incidenteExistente) {
    await prisma.incidentUser.upsert({
      where: { incidentId_userId: { incidentId: incidenteExistente.id, userId: params.userId } },
      create: { incidentId: incidenteExistente.id, userId: params.userId },
      update: {}
    });

    await prisma.incidentLog.create({
      data: {
        incidentId: incidenteExistente.id,
        mensaje: "Solicitud agrupada a incidente existente"
      }
    });

    return incidenteExistente;
  }

  const nuevoIncidente = await prisma.incident.create({
    data: {
      lat: params.lat,
      lng: params.lng,
      direccion: params.direccion,
      incidentUsers: {
        create: { userId: params.userId }
      },
      logs: {
        create: {
          mensaje: "Incidente creado y listo para despacho"
        }
      }
    }
  });

  iniciarDespachoExpandido({ incidenteId: nuevoIncidente.id, lat: params.lat, lng: params.lng, io: params.io });

  return nuevoIncidente;
};

const obtenerConductoresCercanos = async (lat: number, lng: number, radioMetros: number) => {
  const shifts = await prisma.driverShift.findMany({
    where: { status: DriverShiftStatus.available, currentLat: { not: null }, currentLng: { not: null } },
    include: { driver: true }
  });

  return shifts.filter((shift) => {
    if (shift.currentLat === null || shift.currentLng === null) {
      return false;
    }
    return distanciaEnMetros(lat, lng, shift.currentLat, shift.currentLng) <= radioMetros;
  });
};

const iniciarDespachoExpandido = async (params: { incidenteId: string; lat: number; lng: number; io: Server }) => {
  let radioActual = RADIO_INICIAL_METROS;
  let activo = true;

  const timer = setInterval(async () => {
    const incidente = await prisma.incident.findUnique({ where: { id: params.incidenteId } });
    if (!incidente || incidente.status !== IncidentStatus.active) {
      activo = false;
    }

    if (!activo) {
      clearInterval(timer);
      return;
    }

    const conductores = await obtenerConductoresCercanos(params.lat, params.lng, radioActual);
    conductores.forEach((shift) => {
      params.io.to(`driver-${shift.driverId}`).emit("incidente:oferta", {
        incidenteId: params.incidenteId,
        lat: params.lat,
        lng: params.lng,
        radio: radioActual
      });
    });

    await prisma.incidentLog.create({
      data: {
        incidentId: params.incidenteId,
        mensaje: `Despacho enviado a ${conductores.length} conductores con radio ${radioActual}m`
      }
    });

    radioActual += INCREMENTO_RADIO_METROS;
  }, ESPERA_SEGUNDOS * 1000);
};

export const aceptarIncidente = async (params: {
  incidenteId: string;
  driverId: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const incidente = await tx.incident.findUnique({ where: { id: params.incidenteId } });
    if (!incidente || incidente.status !== IncidentStatus.active) {
      throw new Error("Incidente no disponible");
    }

    const turno = await tx.driverShift.findFirst({
      where: {
        driverId: params.driverId,
        status: DriverShiftStatus.available,
        endedAt: null
      }
    });

    if (!turno) {
      throw new Error("Turno no disponible");
    }

    const incidenteActualizado = await tx.incident.update({
      where: { id: params.incidenteId },
      data: {
        status: IncidentStatus.assigned,
        shiftId: turno.id
      }
    });

    await tx.driverShift.update({
      where: { id: turno.id },
      data: { status: DriverShiftStatus.in_service }
    });

    await tx.incidentLog.create({
      data: {
        incidentId: params.incidenteId,
        mensaje: "Incidente asignado a conductor"
      }
    });

    return incidenteActualizado;
  });
};
