const express = require('express');
const mongoose = require('mongoose');
const app = express();
const http = require('http').Server(app);
const port = 3000;

// MongoDB connection URI
const mongoUri = "mongodb+srv://monum811:Qdof5HxIQ6jNp5pA@mycluster.9nhhdax.mongodb.net/?retryWrites=true&w=majority&appName=mycluster";

// Connect to MongoDB with additional options
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout
});

// Get the MongoDB connection
const db = mongoose.connection;

// Connection event listeners
db.on('connected', () => {
    console.log('MongoDB connected successfully.');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected.');
});

// API endpoint to check connection status
app.get('/status', (req, res) => {
    if (db.readyState === 1) {
        res.json({ status: "success", message: "MongoDB is connected." });
    } else {
        res.json({ status: "fail", message: "MongoDB is not connected." });
    }
});

// Other routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/about', (req, res) => {
    res.send('This is the About page.');
});

http.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
