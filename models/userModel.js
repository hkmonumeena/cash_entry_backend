// models/userModel.js

const mongoose = require('mongoose');

// Define the user schema with basic fields
const userSchema = new mongoose.Schema({
  authId: {
    type: String,
    required: true,
    unique: true // Ensures that authId is unique for each user
  },
  name: {
    type: String,
    required: true // Assuming name is a required field
  },
  email: {
    type: String,
    required: false, // Assuming email is a required field
    unique: true // Ensures that email is unique for each user
  },
  // Add any other fields you need for the user
  // For example, you might want to include:
  phoneNumber: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically sets the date when the user is created
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set up a pre-save middleware to update the updatedAt field
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });
  
  // Middleware for updating 'updatedAt' on every update using findOneAndUpdate
  userSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
  });

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
