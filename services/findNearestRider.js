const Rider = require("../models/rider.model");
const axios = require("axios");

// ✅ Find nearest available rider using Google Distance Matrix
exports.findNearestRider = async (restaurantCoords) => {
    const availableRiders = await Rider.find({ 
        isAvailable: true,
        "location.coordinates.0": { $ne: 0 },
        "location.coordinates.1": { $ne: 0 },
    });

    console.log("all rider available :" , availableRiders);
    if(availableRiders.length === 0) return null;

    const destinations = availableRiders
    .map((rider) => `${rider.location.coordinates[1]},${rider.location.coordinates[0]}`)
    .join("|"); 

    const api = process.env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${restaurantCoords[1]},${restaurantCoords[0]}&destinations=${destinations}&key=${api}`;

    const { data } = await axios.get(url);
    if (!data.rows?.length || !data.rows[0].elements) {
        console.log("⚠️ No distance data returned from Google API:", data);
        return null;
    }

    const distances = data.rows[0].elements;
    let nearestIndex = -1;
    let minDistance = Infinity;

    for(let i = 0; i < distances.length; i++) {
        const element = distances[i];
        if (element.status === "OK" && element.distance?.value) {
            if (element.distance.value < minDistance) {
                minDistance = element.distance.value;
                nearestIndex = i;
            }
        }
    }

    if (nearestIndex === -1) return null;
    return availableRiders[nearestIndex];

};