const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't exit(1) here if we want the app to still serve files/EJS 
    // even if local DB is down (though auth won't work)
  }
};

module.exports = connectDB;
