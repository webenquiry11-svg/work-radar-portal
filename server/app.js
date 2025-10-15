const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db/connectDB.js');
const webRoutes = require('./routes/web.js');

const path = require('path');
dotenv.config();
const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
app.use(express.json());
// Serve static files from the React build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}
// --- API Routes ---
// This is the ONLY job of this server. It handles all requests that start with /api.
app.use('/api', webRoutes);
// In production, all other non-API routes should serve the React app's index.html
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}


const PORT = process.env.PORT || 2000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});