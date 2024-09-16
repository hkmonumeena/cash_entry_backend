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
    res.status(200).json({ success : true,message: 'User created successfully', user });
  } catch (error) {
    res.status(200).json({success : false, message: error.message });
  }
};


// Controller for creating a new user
exports.createUser = async (req, res) => {
  try {
    const { authId, email, name, phoneNumber } = req.body;
    
    // Check if a user with the same authId or email already exists
    const existingUser = await User.findOne({
      $or: [{ authId }, { email }]
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'User already a member with this authId or email'
      });
    }

    // If no existing user is found, create a new user
    const user = new User({
      authId,
      name,
      email,
      phoneNumber
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
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
        return res.status(200).json({success : false,message: 'User not found' });
      }
  
      res.json({
        success : true,
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      res.status(200).json({success : false,message: error.message });
    }
  };


// Controller for deleting a user and their transactions
exports.deleteUserAndTransactions = async (req, res) => {
  const { authId } = req.params; // Assume authId is passed as a URL parameter

  try {
    // Find and delete the user
    const user = await User.findOneAndDelete({ authId });

    if (!user) {
      return res.status(200).json({success : false ,message: 'User not found with '+authId });
    }

    // Delete all transactions associated with the user
    const deletedTransactions = await Transaction.deleteMany({ authId });

    res.json({
      success : true,
      message: 'User and associated transactions deleted successfully',
      deletedTransactionsCount: deletedTransactions.deletedCount
    });
  } catch (error) {
    res.status(200).json({success : false, message: error.message });
  }
};
