// models/transactionModel.js

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    date: String,
    timeInMiles: Number,
    type: { type: String, enum: ['CREDIT', 'DEBIT'] },
    account: { type: String, enum: ['ONLINE', 'CASH'] },
    transactionNumber:{
        type: String,
        required: true,
        unique: true 
      },
    amount: Number,
    remarks: String,
    tag: String,
    status: { type: String, enum: ['PENDING', 'CLEARED', 'OVERDUE', 'VOID'] },
    authId: { type: String, required: true }, // Reference to User's authId
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
transactionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });
  
  // Middleware for updating 'updatedAt' on every update using findOneAndUpdate
  transactionSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
  });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
