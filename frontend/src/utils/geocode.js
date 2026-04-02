// Utility to fetch lat/lng from address using OpenStreetMap Nominatim
export async function geocodeByName(locationName) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(locationName)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) {
        return {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
            display_name: data[0].display_name
        };
    }
    return null;
}
// Utility to fetch address from lat/lng using OpenStreetMap Nominatim
export async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const response = await fetch(url);
    if (!response.ok) return '';
    const data = await response.json();
    return data.display_name || '';
}