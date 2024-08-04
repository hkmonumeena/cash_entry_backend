require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

app.use(express.json()); // Parse JSON request bodies

// MongoDB connection URI
//const mongoUri = "mongodb+srv://monum811:Qdof5HxIQ6jNp5pA@mycluster.rvqjfla.mongodb.net/?retryWrites=true&w=majority&appName=mycluster";

const mongoUri = "mongodb+srv://monum811:Qdof5HxIQ6jNp5pA@mycluster.9nhhdax.mongodb.net/?retryWrites=true&w=majority&appName=mycluster"
// Connect to MongoDB
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Get the MongoDB connection
const db = mongoose.connection;

// Define a Mongoose schema
const schema = new mongoose.Schema({
    name: String,
    email: String
});

// Create a model from the schema
const User = mongoose.model('User', schema);

// Connection status API endpoint
router.get('/status', (req, res) => {
    if (db.readyState === 1) {
        res.json({ status: "success", message: "MongoDB is connected." });
    } else {
        res.json({ status: "fail", message: "MongoDB is not connected." });
    }
});

// Get all model names
router.get('/', (req, res) => {
    res.send(mongoose.modelNames());
});

// Create a new record
router.post('/add', async (req, res) => {
    try {
        const { name, email } = req.body;
        const newUser = new User({ name, email });
        await newUser.save();
        res.send('New record added.');
    } catch (error) {
        res.status(500).send('Error adding record: ' + error.message);
    }
});

// Delete existing record
router.delete('/', (req, res) => {
    res.send('Deleted existing record');
});

// Update existing record
router.put('/', (req, res) => {
    res.send('Updating existing record');
});

// Show demo records
router.get('/demo', (req, res) => {
    res.json([
        {
            id: '001',
            name: 'Smith',
            email: 'smith@gmail.com',
        },
        {
            id: '002',
            name: 'Sam',
            email: 'sam@gmail.com',
        },
        {
            id: '003',
            name: 'lily',
            email: 'lily@gmail.com',
        },
    ]);
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
