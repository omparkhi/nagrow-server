const axios = require("axios");

async function getDistanceKm(origin, destination) {
    const apikey = process.env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apikey}`;

    const { data } = await axios.get(url);

    if( data.rows && data.rows[0].elements && data.rows[0].elements[0].status === "OK" ) {
        const distanceMeters = data.rows[0].elements[0].distance.value;
        // console.log(distanceMeters);
        const distanceKm = distanceMeters / 1000;
        // console.log("distanceKm: ", distanceKm);
        // console.log("distanceKm * 10: ", (distanceKm * 10) / 10 );
        const roundedDistance = Math.round( distanceKm * 10 ) / 10;
        return roundedDistance;
    }

    throw new Error("Failed to fetch distance from Google API");
}

module.exports = getDistanceKm;