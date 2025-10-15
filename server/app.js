const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db/connectDB.js');
const webRoutes = require('./routes/web.js');

dotenv.config();
const app = express();

// --- Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
app.use(express.json());

// --- API Routes ---
// This is the ONLY job of this server. It handles all requests that start with /api.
app.use('/api', webRoutes);


const PORT = process.env.PORT || 2000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});