import { Server } from "socket.io";

const allowedOrigins = [
  "http://localhost:5173",
  "https://pizza-hub-server-application.onrender.com",
  "https://pizza-hub-kappa.vercel.app",
];

let io;

export const initializeSocket = (socket) => {
  io = new Server(socket, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, origin);
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-order", (orderId) => {
      console.log("📦 JOIN ORDER RECEIVED:", orderId);
      socket.join(`order:${orderId}`);

      console.log(`${socket.id} joined order:${orderId}`);

      console.log("Current rooms:", [...socket.rooms]);
    });

    socket.on("leave-order", (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
