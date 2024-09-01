const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');


// Controller for creating a new user
exports.privacyPolicy = async (req, res) => {
  try {
    const { authId, name, email, phoneNumber } = req.body;

    const user = new User({
      authId,
      name,
      email,
      phoneNumber
    });

    await user.save();
    res.status(200).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Controller for creating a new user
exports.createUser = async (req, res) => {
    try {
      const { authId, name, email, phoneNumber } = req.body;
  
      const user = new User({
        authId,
        name,
        email,
        phoneNumber
      });
  
      await user.save();
      res.status(200).json({ message: 'User created successfully', user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };


// Controller for updating a user's information
exports.updateUser = async (req, res) => {
    const { authId } = req.params; // Assume authId is passed as a URL parameter
    const updateData = req.body; // The fields to be updated are in the request body
  
    try {
      // Find the user by authId and update the document with the new data
      const user = await User.findOneAndUpdate({ authId }, updateData, {
        new: true, // Return the updated document
        runValidators: true // Run schema validators on the update
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


// Controller for deleting a user and their transactions
exports.deleteUserAndTransactions = async (req, res) => {
  const { authId } = req.params; // Assume authId is passed as a URL parameter

  try {
    // Find and delete the user
    const user = await User.findOneAndDelete({ authId });

    if (!user) {
      return res.status(404).json({ message: 'User not found with '+authId });
    }

    // Delete all transactions associated with the user
    const deletedTransactions = await Transaction.deleteMany({ authId });

    res.json({
      message: 'User and associated transactions deleted successfully',
      deletedTransactionsCount: deletedTransactions.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
