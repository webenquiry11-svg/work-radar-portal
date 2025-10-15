const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db/connectDB.js');
const webRoutes = require('./routes/web.js');

dotenv.config();
const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
app.use(express.json());

// --- THE FIX ---
// All code related to serving static files has been removed.
// Nginx is now solely responsible for serving the frontend.
// The server's only job is to handle API requests.

// --- API Routes ---
// The server will only respond to routes that start with /api
app.use('/api', webRoutes);

// Optional: Add a root route for a simple health check
app.get('/', (req, res) => {
  res.send('Work Radar API is running.');
});


const PORT = process.env.PORT || 2000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

