/**
 * routeService.js
 * Calculates route danger index and nearby danger zones
 * by comparing route GPS points against the crime data JSON.
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// ── Load a city's crime JSON (cached per process) ──────────────────────────
const _cache = {};

function loadCityData(city) {
  if (_cache[city]) return _cache[city];
  const filePath = path.join(DATA_DIR, `${city}.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Data file not found: ${city}.json`);
  _cache[city] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return _cache[city];
}

// ── Haversine distance in km ───────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MATCH_RADIUS_KM = 0.15; // 150 m proximity to flag a danger zone

/**
 * calculateRouteSafety
 * @param {Array<{lat,lng}>} routePoints - array of GPS coords along the route
 * @param {string} city - data file prefix (e.g. 'hyd_clustered')
 * @returns {Object} { dangerIndex, matchedZones }
 */
function calculateRouteSafety(routePoints, city = 'hyd_clustered') {
  const crimeData = loadCityData(city);
  let totalDanger = 0;
  let matchCount  = 0;
  const matchedZones = [];

  for (const point of routePoints) {
    for (const zone of crimeData) {
      // NOTE: project stores lati=lng, longi=lat (legacy swap)
      const zoneLat = zone.longi;
      const zoneLng = zone.lati;
      const dist = haversine(point.lat, point.lng, zoneLat, zoneLng);

      if (dist <= MATCH_RADIUS_KM) {
        const mag = (zone.properties && zone.properties.mag) || 0;
        totalDanger += mag;
        matchCount++;
        matchedZones.push({
          lat: zoneLat,
          lng: zoneLng,
          mag,
          name: (zone.properties && zone.properties.name) || '',
          distKm: +dist.toFixed(3)
        });
      }
    }
  }

  const dangerIndex = matchCount > 0 ? +(totalDanger / matchCount).toFixed(2) : 0;
  return { dangerIndex, matchCount, matchedZones };
}

/**
 * getNearbyDangerZones
 * Used by Socket.IO GPS stream — returns zones within 300 m of a live location.
 */
function getNearbyDangerZones(lat, lng, city = 'hyd_clustered', radiusKm = 0.3) {
  const crimeData = loadCityData(city);
  const nearby = [];

  for (const zone of crimeData) {
    const zoneLat = zone.longi;
    const zoneLng = zone.lati;
    const dist = haversine(lat, lng, zoneLat, zoneLng);
    if (dist <= radiusKm) {
      nearby.push({
        lat: zoneLat,
        lng: zoneLng,
        mag: (zone.properties && zone.properties.mag) || 0,
        name: (zone.properties && zone.properties.name) || '',
        distKm: +dist.toFixed(3)
      });
    }
  }

  // Sort by danger (highest first), then proximity
  nearby.sort((a, b) => b.mag - a.mag || a.distKm - b.distKm);
  return { lat, lng, nearby };
}

module.exports = { calculateRouteSafety, getNearbyDangerZones };
