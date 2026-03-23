const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const routeService = require('./services/routeService');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// ── Connect MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));

// ── API Key loader (uses .env first, falls back to api.txt) ───────────────
app.get('/maps-loader.js', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ||
                 (fs.existsSync('api.txt') ? fs.readFileSync('api.txt', 'utf8').trim() : '');
  res.type('application/javascript');
  res.send(`
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=places&callback=initMap";
    document.head.appendChild(script);
  `);
});

// ── HTML Routes ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/maps', (req, res) => res.render('maps'));

// ── Auth Routes (file-based, unchanged from main) ──────────────────────────
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Username and password required');
  let users = fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) : [];
  if (users.find(u => u.username === username)) return res.status(400).send('User already exists');
  users.push({ username, password });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!fs.existsSync(USERS_FILE)) return res.status(400).send('User not found');
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  const user = users.find(u => u.username === username && u.password === password);
  user ? res.redirect('/maps') : res.status(401).send('Invalid credentials');
});

// ── Crime Data API ─────────────────────────────────────────────────────────
app.get('/api/crime-data/:city', (req, res) => {
  const city = req.params.city.toLowerCase();
  const allowed = ['hyd', 'hyd_clustered'];
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
