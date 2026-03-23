const mongoose = require('mongoose');

const CrimeDataSchema = new mongoose.Schema({
  location_name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  city: { type: String, default: 'Hyderabad' },
  murder: { type: Number, default: 0 },
  rape: { type: Number, default: 0 },
  gangrape: { type: Number, default: 0 },
  robbery: { type: Number, default: 0 },
  theft: { type: Number, default: 0 },
  assault_murders: { type: Number, default: 0 },
  sexual_harassment: { type: Number, default: 0 },
  total_area: { type: Number, default: 0 },
  total_crime: { type: Number, default: 0 },
  crime_per_area: { type: Number, default: 0 },
  // Danger index computed by K-Means (0 = safe, 4 = extreme)
  danger_index: { type: Number, default: 0 },
  cluster: { type: Number, default: -1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CrimeData', CrimeDataSchema);
