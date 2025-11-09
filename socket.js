const socketIo = require("socket.io");
const Rider = require("./models/rider.model");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "https://nagrow-client-demo.vercel.app/",
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
    });


      socket.on("joinOrderRoom", ({orderId}) => {
            socket.join(`order_${orderId}`);
        });

        socket.on("joinRestaurantRoom", ({restaurantId}) => {
            socket.join(`restaurant_${restaurantId}`);
        });

        socket.on("joinRiderRoom", ({riderId}) =>{
          socket.join(`rider_${riderId}`);
        });

        socket.on("riderLocationUpdate", async ({ riderId, latitude, longitude }) => {
          try {
            await Rider.findByIdAndUpdate(riderId, {
              location: { type: "Point", coordinates: [longitude, latitude] },
            });
            console.log(`✅ Updated rider ${riderId} location: ${latitude},${longitude}`);
          } catch (err) {
            console.log("❌ Failed to update rider location:", err.message);
          }
        });

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

function getIO() {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
}

module.exports = { initializeSocket, sendMessageToSocketId, emitToUser, emitToRestaurant, emitToRider, getIO };
