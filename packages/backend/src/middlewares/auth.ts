import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export type AuthRequest = Request & { user?: { id: string; role: "user" | "driver" | "admin" } };

export const requireAuth = (roles?: Array<"user" | "driver" | "admin">) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ mensaje: "No autorizado" });
    }

    const token = authHeader.replace("Bearer ", "");
    try {
      const payload = verifyToken(token);
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ mensaje: "Acceso denegado" });
      }
      req.user = { id: payload.sub, role: payload.role };
      return next();
    } catch (error) {
      return res.status(401).json({ mensaje: "Token inválido" });
    }
  };
};
