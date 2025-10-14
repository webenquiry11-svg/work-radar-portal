const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
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

// Serve static files from the React build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// API Routes
app.use('/api', webRoutes);

// In production, all other non-API routes should serve the React app
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 2000;

connectDB().then(() => {
  // --- Use the standard app.listen ---
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});