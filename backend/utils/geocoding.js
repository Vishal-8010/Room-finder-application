const axios = require('axios');

/**
 * Geocode an address using Mapbox Geocoding API
 * @param {string} address - The address to geocode
 * @param {string} mapboxToken - Mapbox API token (from env var)
 * @returns {Promise<{longitude: number, latitude: number} | null>} - Coordinates or null if not found
 */
async function geocodeAddress(address, mapboxToken) {
    if (!address || !mapboxToken) {
        console.warn('Geocoding: missing address or token');
        return null;
    }

    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;

        const response = await axios.get(url, { timeout: 5000 });

        if (response.data.features && response.data.features.length > 0) {
            const [longitude, latitude] = response.data.features[0].center;
            return { longitude, latitude };
        }

        console.warn(`Geocoding: no results for address: ${address}`);
        return null;
    } catch (error) {
        console.error('Geocoding API error:', error.message);
        return null;
    }
}

/**
 * Build GeoJSON Point from coordinates
 * @param {number} longitude
 * @param {number} latitude
 * @returns {object} - GeoJSON Point object
 */
function buildGeoJSONPoint(longitude, latitude) {
    return {
        type: 'Point',
        coordinates: [longitude, latitude]
    };
}

module.exports = {
    geocodeAddress,
    buildGeoJSONPoint
};