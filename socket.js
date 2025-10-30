const socketIo = require("socket.io");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle joining room
    socket.on("joinRoom", ({ userId, restaurantId, riderId }) => {
      if (userId) socket.join(`user_${userId}`);
      if (restaurantId) {
        socket.join(`restaurant_${restaurantId}`);
        console.log(`Restaurant joined room: restaurant_${restaurantId}`);
      }
      if (riderId) socket.join(`rider_${riderId}`);

      console.log("Rooms joined:", socket.rooms);     
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function emitToUser(userId, event, data) {
  io.to(`user_${userId}`).emit(event, data);
}

function emitToRestaurant(restaurantId, event, data) {
  io.to(`restaurant_${restaurantId}`).emit(event, data);
   console.log("📢 Emitting event to room:", `restaurant_${restaurantId}`, "event:", event, "data:", data);
}

function emitToRider(riderId, event, data) {
  io.to(`rider_${riderId}`).emit(event, data);
}

function sendMessageToSocketId(socketId, messageObject) {
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized");
  }
}

module.exports = { initializeSocket, sendMessageToSocketId, emitToUser, emitToRestaurant, emitToRider };
