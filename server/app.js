const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db/connectDB.js');
const webRoutes = require('./routes/web.js');
// Socket.IO and http imports have been removed as they are no longer needed.

dotenv.config();
const app = express();

// The separate http server and Socket.IO initialization have been removed.

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
app.use(express.json());

// The Socket.IO connection handler (io.on(...)) has been removed.
// Add this root route for a health check
app.get('/', (req, res) => {
  res.send('report managemnet backend server is live and running!');
});

// API Routes
app.use('/api', webRoutes);


const PORT = process.env.PORT || 2000;

connectDB().then(() => {
  // --- Use the standard app.listen ---
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});