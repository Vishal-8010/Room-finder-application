// Utility to fetch nearby places using OpenStreetMap Overpass API
export async function fetchNearbyPlaces(lat, lon, radius = 3000, limit = 40) {
    // radius in meters
    try {
        // Validate coordinates
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            console.warn('Invalid coordinates for nearby places', { lat, lon });
            return [];
        }

        // Ensure coordinates are numbers
        lat = parseFloat(lat);
        lon = parseFloat(lon);

        if (isNaN(lat) || isNaN(lon)) {
            console.warn('Failed to parse coordinates', { lat, lon });
            return [];
        }

        const query = `[
out:json][timeout:25];(
  node(around:${radius},${lat},${lon})[amenity~"hospital|clinic|pharmacy|school|university|bank|cafe|restaurant|bar|bus_station|bus_stop|atm|police|post_office|library|gym"];
  way(around:${radius},${lat},${lon})[amenity~"hospital|clinic|pharmacy|school|university|bank|cafe|restaurant|bar|bus_station|bus_stop|atm|police|post_office|library|gym"];
  node(around:${radius},${lat},${lon})[shop~"supermarket|convenience|bakery|confectionery|pharmacy"];
  way(around:${radius},${lat},${lon})[shop~"supermarket|convenience|bakery|confectionery|pharmacy"];
  node(around:${radius},${lat},${lon})[leisure~"park|playground|swimming_pool"];
  way(around:${radius},${lat},${lon})[leisure~"park|playground|swimming_pool"];
);
out center;`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

        const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: `data=${encodeURIComponent(query)}`,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            console.warn('Overpass API error:', res.status, res.statusText);
            return [];
        }

        const data = await res.json();

        if (!data.elements || data.elements.length === 0) {
            console.info('No elements found in overpass response');
            return [];
        }

        const places = data.elements.map((el) => {
            const tags = el.tags || {};
            const name = tags.name || tags['name:en'] || 'Unnamed';
            let latLng = null;

            if (el.type === 'node') {
                latLng = { lat: el.lat, lon: el.lon };
            } else if (el.type === 'way' || el.type === 'relation') {
                if (el.center) {
                    latLng = { lat: el.center.lat, lon: el.center.lon };
                }
            }

            const category = tags.amenity || tags.shop || tags.leisure || tags.tourism || 'unknown';

            return {
                id: `${el.type}/${el.id}`,
                name,
                category,
                lat: latLng ? latLng.lat : null,
                lon: latLng ? latLng.lon : null,
                tags
            };
        }).filter(p => p.lat && p.lon && !isNaN(p.lat) && !isNaN(p.lon));

        // Deduplicate by id and by roughly same coords
        const uniq = [];
        const seen = new Set();

        for (const p of places) {
            if (seen.has(p.id)) continue;
            const key = `${p.lat.toFixed(5)}_${p.lon.toFixed(5)}_${p.name}`;
            if (seen.has(key)) continue;

            seen.add(p.id);
            seen.add(key);
            uniq.push(p);

            if (uniq.length >= limit) break;
        }

        console.info(`Found ${uniq.length} nearby places for coordinates (${lat}, ${lon})`);
        return uniq;
    } catch (err) {
        if (err.name === 'AbortError') {
            console.warn('Nearby places fetch timeout');
        } else {
            console.error('fetchNearbyPlaces error', err);
        }
        return [];
    }
}