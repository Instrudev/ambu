import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { driversRouter } from "./routes/drivers";
import { adminRouter } from "./routes/admin";
import { createIncidentsRouter } from "./routes/incidents";
import { Server } from "socket.io";

export const createApp = (io: Server) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    return res.json({ estado: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/drivers", driversRouter);
  app.use("/incidents", createIncidentsRouter(io));
  app.use("/admin", adminRouter);

  return app;
};
