import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { env } from "./config/env";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  socket.on("driver:registrar", (payload: { driverId: string }) => {
    socket.join(`driver-${payload.driverId}`);
  });

  socket.on("incidente:cancelar", (payload: { incidenteId: string }) => {
    socket.broadcast.emit("incidente:cancelado", payload);
  });
});

const app = createApp(io);
server.on("request", app);

server.listen(env.PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${env.PORT}`);
});
