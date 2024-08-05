const Item = require('../models/itemModel');
const sendResponse = require('../utils/responseUtil');

// Controller for creating an item
exports.createItem = async (req, res) => {
  try {
    const {
      account,
      amount,
      date,
      remarks,
      tag,
      timeInMiles,
      transactionNumber,
      type,
      status
    } = req.body;

    const item = new Item({
      account,
      amount,
      date,
      remarks,
      tag,
      timeInMiles,
      transactionNumber,
      type,
      status
    });

    await item.save();
    
    // Use the common response utility
    sendResponse(res, 200, 'Item created successfully', item);
  } catch (error) {
    // Use the common response utility for errors as well
    sendResponse(res, 400, error.message);
  }
};
