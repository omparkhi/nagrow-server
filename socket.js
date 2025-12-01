const socketIo = require("socket.io");
const Rider = require("./models/rider.model");
let io;

const allowedOrigins = [
  "https://nagrow-client-demo.vercel.app",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://192.168.1.6:8081",  
];

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET","POST","PUT","DELETE","OPTIONS"],
      allowedHeaders: ["Content-Type","Authorization"]
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join room
    socket.on("joinRoom", ({ roomType, roomId }) => {
      const room = `${roomType}_${roomId}`;
      socket.join(room);
      console.log(`Joined room: ${room}`);
    });

    // Rider location update
    socket.on("rider:location", ({ riderId, coords }) => {
      const room = `rider_${riderId}`;
      io.to(room).emit("rider:location", coords);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });

  return io;
}

function getSocket() {
   if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initializeSocket, getSocket };