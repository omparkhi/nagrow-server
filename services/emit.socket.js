const { getSocket } = require("../socket");

function emitToRestaurant(resId, event, data) {
  const io = getSocket();
  io.to(`restaurant_${resId}`).emit(event, data);
}

function emitToUser(userId, event, data) {
  const io = getSocket();
  io.to(`user_${userId}`).emit(event, data);
}

function emitToRider(riderId, event, data) {
  const io = getSocket();
  io.to(`rider_${riderId}`).emit(event, data);
}

module.exports = {
  emitToRestaurant,
  emitToUser,
  emitToRider,
};