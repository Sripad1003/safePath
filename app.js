const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const routeService = require('./services/routeService');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// ── API Key loader (uses .env first, falls back to api.txt) ───────────────
app.get('/maps-loader.js', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ;
  res.type('application/javascript');
  res.send(`
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=places&callback=initMap";
    document.head.appendChild(script);
  `);
});

// ── HTML Routes ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Crime Data API ─────────────────────────────────────────────────────────
app.get('/api/crime-data/:city', (req, res) => {
  const city = req.params.city.toLowerCase();
  const allowed = ['hyd_clustered']; // Only allow the clustered data now
  if (!allowed.includes(city)) return res.status(400).json({ error: 'Unknown city' });
  const jsonPath = path.join(__dirname, 'data', `${city}.json`);
  if (!fs.existsSync(jsonPath)) return res.status(404).json({ error: 'Data not found' });
  res.json(JSON.parse(fs.readFileSync(jsonPath, 'utf8')));
});

// ── Route Safety API ───────────────────────────────────────────────────────
app.post('/api/route-safety', async (req, res) => {
  try {
    const { routePoints, city } = req.body;
    if (!routePoints || !Array.isArray(routePoints)) {
      return res.status(400).json({ error: 'routePoints array required' });
    }
    const result = await routeService.calculateRouteSafety(routePoints, city || 'hyd_clustered');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Socket.IO: Real-time GPS ───────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Client sends its GPS position continuously
  socket.on('gps:update', async (data) => {
    // data: { lat, lng, city }
    try {
      const nearby = await routeService.getNearbyDangerZones(data.lat, data.lng, data.city || 'hyd_clustered');
      socket.emit('danger:nearby', nearby);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Safe Path Recommender running on port ${PORT}`);
});

