require('dotenv').config();
const transactionRoutes = require('./routes/transactionRoutes')
const userRoutes = require('./routes/userRoutes');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // For parsing application/json
// Serve static files from the 'public' directory
app.use(express.static('public'));
// MongoDB connection
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

  // Use routes
app.use('/api', transactionRoutes);
// Use the user routes
app.use('/api', userRoutes);

app.get('/privacy_policy', (req, res) => {
  res.sendFile(__dirname + '/public/privacy_policy.html');
});

app.get('/terms_and_conditions', (req, res) => {
  res.sendFile(__dirname + '/public/terms_conditions.html');
});

// Start server
//
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
