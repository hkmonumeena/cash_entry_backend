require('dotenv').config();
const transactionRoutes = require('./routes/transactionRoutes')
const userRoutes = require('./routes/userRoutes');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // For parsing application/json

// MongoDB connection
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

  // Use routes
app.use('/api', transactionRoutes);
// Use the user routes
app.use('/api', userRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
