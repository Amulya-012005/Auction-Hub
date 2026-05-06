import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/api/socket.io",
});

app.set("io", io);

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Client connected");

  socket.on("join:auction", (auctionId: number) => {
    socket.join(`auction:${auctionId}`);
    logger.info({ socketId: socket.id, auctionId }, "Joined auction room");
  });

  socket.on("leave:auction", (auctionId: number) => {
    socket.leave(`auction:${auctionId}`);
  });

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Client disconnected");
  });
});

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening with Socket.io");
});
