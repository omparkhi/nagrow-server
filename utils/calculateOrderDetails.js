const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");
const getDistanceKm = require("./getDistanceKm");

async function calculateOrderDetails(userId, restaurantId, items, tip=0) {
    const user = await User.findById(userId);
    if(!user) throw new Error("Use not found");

    const selectedAddress = user.address.find((a) => a.selectedAddress === true);
    if(!selectedAddress) throw new Error("No Selected Address");

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    const distanceKm = await getDistanceKm(
        {
            lat: selectedAddress.coordinates.coordinates[1],
            lng: selectedAddress.coordinates.coordinates[0],
        },
        {
            lat: restaurant.address.location.coordinates[1],
            lng: restaurant.address.location.coordinates[0],
        }
    );

    console.log(distanceKm);


    // securely calculate total
    const subTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = Math.ceil(distanceKm * 12);
    const grandTotal = subTotal + deliveryFee + Number(tip);


    return {
        distanceKm, 
        subTotal,
        deliveryFee,
        grandTotal,
        deliveryAddress: selectedAddress.formattedAddress,
    };
}