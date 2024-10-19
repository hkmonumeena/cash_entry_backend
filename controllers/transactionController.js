const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
// Controller for creating a transaction
exports.createTransaction = async (req, res) => {
    try {
      const { authId, account, amount, date, remarks, tag, timeInMiles, transactionNumber, type, status,id } = req.body;
  
      // Ensure user exists (optional step depending on your needs)
      const userExists = await User.findOne({ authId });
      if (!userExists) {
        return res.status(201).json({ message: 'User not found' });
      }
  
      const transaction = new Transaction({
        id,
        authId,
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
  
      await transaction.save();
      res.status(200).json(transaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  // Controller for updating a transaction
exports.updateTransaction = async (req, res) => {
    const { _id } = req.body; // Transaction ID is passed as a URL parameter
    const updateData = req.body; // The fields to be updated are in the request body
  
    try {
      // Find the transaction by ID and update it with new data
      const transaction = await Transaction.findByIdAndUpdate(_id, updateData, {
        new: true, // Return the updated document
        runValidators: true // Run schema validators on the update
      });
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      res.json({
        message: 'Transaction updated successfully',
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Controller for deleting a transaction
exports.deleteTransaction = async (req, res) => {
    const { id } = req.query; // Transaction ID is passed as a URL parameter
    
    try {
      // Find and delete the transaction by ID
      const transaction = await Transaction.findByIdAndDelete(id);
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      res.json({
        message: 'Transaction deleted successfully',
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Controller for getting a single transaction
exports.getTransaction = async (req, res) => {
    const { id } = req.query; // Transaction ID is passed as a URL parameter
  
    try {
      // Find the transaction by ID
      const transaction = await Transaction.findById(id);
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Controller for getting a paginated list of transactions
exports.getTransactions = async (req, res) => {
    const { authId, page = 1, limit = 10 } = req.query;
    // Check if authId is provided and valid
    if (!authId) {
      return res.status(400).json({ status: 'fail', message: 'authId is required.' });
    }

  };

// Controller for getting the total sum and count of credits, debits, and by status
exports.getTransactionSummary = async (req, res) => {
  const { authId } = req.query; // authId is passed as a query parameter

  // Validate authId
  if (!authId) {
    return res.status(400).json({ message: 'authId is required.' });
  }
  try {
    const pipeline = [
      { $match: { authId } },
      {
        $group: {
          _id: '$status',
          totalCredits: {
            $sum: {
              $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0]
            }
          },
          totalDebits: {
            $sum: {
              $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0]
            }
          },
          creditCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'CREDIT'] }, 1, 0]
            }
          },
          debitCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'DEBIT'] }, 1, 0]
            }
          },
          cashCount: {
            $sum: {
              $cond: [{ $eq: ['$account', 'CASH'] }, 1, 0]
            }
          },
          onlineCount: {
            $sum: {
              $cond: [{ $eq: ['$account', 'ONLINE'] }, 1, 0]
            }
          },
          transactionCount: { $sum: 1 },
          uniqueTags: { $addToSet: '$tag' },
          minDate: { $min: '$date' },
          maxDate: { $max: '$date' },
          maxCreditAmount: {
            $max: {
              $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', null]
            }
          },
          minCreditAmount: {
            $min: {
              $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', null]
            }
          },
          maxDebitAmount: {
            $max: {
              $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', null]
            }
          },
          minDebitAmount: {
            $min: {
              $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', null]
            }
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: '$totalCredits' },
          totalDebits: { $sum: '$totalDebits' },
          totalCreditCount: { $sum: '$creditCount' },
          totalDebitCount: { $sum: '$debitCount' },
          totalCashCount: { $sum: '$cashCount' },
          totalOnlineCount: { $sum: '$onlineCount' },
          totalTransactionCount: { $sum: '$transactionCount' },
          uniqueTags: { $push: '$uniqueTags' },
          minDate: { $min: '$minDate' },
          maxDate: { $max: '$maxDate' },
          creditsByStatus: {
            $push: {
              k: '$_id',
              v: '$totalCredits'
            }
          },
          debitsByStatus: {
            $push: {
              k: '$_id',
              v: '$totalDebits'
            }
          },
          maxCreditAmount: { $max: '$maxCreditAmount' },
          minCreditAmount: { $min: '$minCreditAmount' },
          maxDebitAmount: { $max: '$maxDebitAmount' },
          minDebitAmount: { $min: '$minDebitAmount' },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCredits: 1,
          totalDebits: 1,
          totalCreditCount: 1,
          totalDebitCount: 1,
          totalCashCount: 1,
          totalOnlineCount: 1,
          totalTransactionCount: 1,
          uniqueTagCount: {
            $size: {
              $reduce: {
                input: '$uniqueTags',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }
            }
          },
          dateRange: {
            firstDate: '$minDate',
            lastDate: '$maxDate'
          },
          averageCreditAmount: {
            $cond: [
              { $eq: ['$totalCreditCount', 0] },
              0,
              { $divide: ['$totalCredits', '$totalCreditCount'] }
            ]
          },
          averageDebitAmount: {
            $cond: [
              { $eq: ['$totalDebitCount', 0] },
              0,
              { $divide: ['$totalDebits', '$totalDebitCount'] }
            ]
          },
          maxCreditAmount: 1,
          minCreditAmount: 1,
          maxDebitAmount: 1,
          minDebitAmount: 1,
          creditsByStatus: { $arrayToObject: '$creditsByStatus' },
          debitsByStatus: { $arrayToObject: '$debitsByStatus' }
        }
      }
    ];

    const [summary] = await Transaction.aggregate(pipeline);

    if (!summary) {
      return res
        .status(404)
        .json({ message: 'No transactions found for the given authId.' });
    }

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// Controller for getting unique tags with their details and settlement status

exports.getTagsSummary = async (req, res) => {
  const {
    authId,
    status,
    type,
    account,
    tag,
    date,
    amount,
    page = 1,
    limit = 10,
  } = req.body; // Assume the filters are passed in the request body

  if (!authId) {
    return res.status(400).json({ message: 'authId is required.' });
  }

  try {
    // Construct match conditions based on filters
    const matchConditions = { authId };

    if (status && status.length > 0) {
      matchConditions.status = { $in: status };
    }

    if (type && type.length > 0) {
      matchConditions.type = { $in: type };
    }

    if (account && account.length > 0) {
      matchConditions.account = { $in: account };
    }

    if (tag && tag.length > 0) {
      matchConditions.tag = { $in: tag };
    }

    if (date && date.start && date.end) {
      const startDate = new Date(date.start);
      const endDate = new Date(date.end);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      matchConditions.timeInMiles = {
        $gte: startDate.getTime(),
        $lte: endDate.getTime(),
      };
    }

    if (amount && amount.min !== undefined) {
      matchConditions.amount = { $gte: amount.min };
    }

    if (amount && amount.max !== undefined && amount.max !== null) {
      matchConditions.amount = { ...matchConditions.amount, $lte: amount.max };
    }

    // Define the aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      { $sort: { date: -1 } }, // Sort by date in descending order
      {
        $group: {
          _id: '$tag',
          lastUsedDate: { $first: '$date' },
          lastTransactionAmount: { $first: '$amount' },
          lastTransactionStatus: { $first: '$status' },
          lastTransactionType: { $first: '$type' },
          totalCreditAmount: {
            $sum: { $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0] },
          },
          totalDebitAmount: {
            $sum: { $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0] },
          },
          totalCreditSum: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$type', 'CREDIT'] }, { $ne: ['$status', 'VOID'] },{ $ne: ['$status', 'CLEARED'] }] },
                '$amount',
                0,
              ],
            },
          },
          totalDebitSum: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$type', 'DEBIT'] }, { $ne: ['$status', 'VOID'] },{ $ne: ['$status', 'CLEARED'] }] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          tag: '$_id',
          lastUsedDate: 1,
          lastTransactionAmount: 1,
          lastTransactionStatus: 1,
          lastTransactionType: 1,
          totalCreditAmount: 1,
          totalDebitAmount: 1,
          totalCreditSum: 1,
          totalDebitSum: 1,
          balance: { $subtract: ['$totalCreditSum', '$totalDebitSum'] },
          settlementMessage: {
            $cond: {
              if: { $gt: [{ $subtract: ['$totalCreditSum', '$totalDebitSum'] }, 0] },
              then: {
                $concat: [
                  "You 'll pay ",
                  { $toString: { $subtract: ['$totalCreditSum', '$totalDebitSum'] } },
                  '',
                ],
              },
              else: {
                $concat: [
                  "You 'll get ",
                  {
                    $toString: {
                      $abs: { $subtract: ['$totalDebitSum', '$totalCreditSum'] },
                    },
                  },
                  '',
                ],
              },
            },
          },
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const tagsSummary = await Transaction.aggregate(pipeline);

    if (!tagsSummary || tagsSummary.length === 0) {
      return res.status(404).json({ message: 'No tags found for the given authId.' });
    }

    res.json(tagsSummary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};




// GET /api/transactions/by-tag
exports.getTransactionsByTag = async (req, res) => {
  const { tag, authId, startDate, endDate } = req.body;

  try {
    // Construct match conditions
    const matchConditions = { authId, tag };
    
    // Add date range filter if dates are provided
 // Add timeInMiles range filter if date range is provided
 if (startDate && endDate) {
  const startDate2 = new Date(startDate);
  const endDate2 = new Date(endDate);

  // Set start time to the beginning of the day and end time to the end of the day
  startDate2.setHours(0, 0, 0, 0);
  endDate2.setHours(23, 59, 59, 999);

  matchConditions.timeInMiles = {
    $gte: startDate2.getTime(),
    $lte: endDate2.getTime()
  };
}

    // Find all transactions by tag
    const transactions = await Transaction.find(matchConditions).sort({ timeInMiles: 1 }); // 1 for ascending order, -1 for descending order

    if (!transactions.length) {
      return res.status(200).json({ message: 'No transactions found for the given tag and date range.' });
    }

    const pipeline = [
      {
        $match: matchConditions
      },
      {
        $group: {
          _id: null,
          totalCredits: { 
            $sum: { $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0] } 
          },
          totalDebits: { 
            $sum: { $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0] } 
          },
          creditPending: { 
            $sum: { $cond: [{ $and: [ { $eq: ['$type', 'CREDIT'] }, { $eq: ['$status', 'PENDING'] } ] }, '$amount', 0] }
          },
          creditCleared: { 
            $sum: { $cond: [{ $and: [ { $eq: ['$type', 'CREDIT'] }, { $eq: ['$status', 'CLEARED'] } ] }, '$amount', 0] }
          },
          creditOverdue: { 
            $sum: { $cond: [{ $and: [ { $eq: ['$type', 'CREDIT'] }, { $eq: ['$status', 'OVERDUE'] } ] }, '$amount', 0] }
          },
          creditVoid: {
            $sum: { $cond: [{ $and: [ { $eq: ['$type', 'CREDIT'] }, { $eq: ['$status', 'VOID'] } ] }, '$amount', 0] }
          },
          debitPending: { 
            $sum: { $cond: [{ $and: [ { $eq: ['$type', 'DEBIT'] }, { $eq: ['$status', 'PENDING'] } ] }, '$amount', 0] }
          },
          debitCleared: { 
            $sum: { $cond: [{ $and: [ { $eq: ['$type', 'DEBIT'] }, { $eq: ['$status', 'CLEARED'] } ] }, '$amount', 0] }
          },
          debitOverdue: { 
            $sum: { $cond: [{ $and: [ { $eq: ['$type', 'DEBIT'] }, { $eq: ['$status', 'OVERDUE'] } ] }, '$amount', 0] }
          },
          debitVoid: {
            $sum: { $cond: [{ $and: [ { $eq: ['$type', 'DEBIT'] }, { $eq: ['$status', 'VOID'] } ] }, '$amount', 0] }
          }
        }
      },
      {
        $addFields: {
          netBalance: { 
            $subtract: [
              { $subtract: ['$totalDebits',  { $add: ['$debitCleared', '$debitVoid'] } ] }, 
              { $subtract: ['$totalCredits', { $add: ['$creditCleared', '$creditVoid'] }] }
            ]
          },
          message: {
            $cond: [
              { $gt: [
                { $subtract: [
                  { $subtract: ['$totalDebits', { $add: ['$debitCleared', '$debitVoid'] } ] },
                  { $subtract: ['$totalCredits', { $add: ['$creditCleared', '$creditVoid'] }] }
                ] }, 0] 
              },
              { $concat: ['You\'ll receive ', { $toString: { $subtract: [
                { $subtract: ['$totalDebits', { $add: ['$debitCleared', '$debitVoid'] } ] },
                { $subtract: ['$totalCredits', { $add: ['$creditCleared', '$creditVoid'] }] }
              ] } }, ' amount'] },
              { $concat: ['You\'ll pay ', { $toString: { $abs: { $subtract: [
                { $subtract: ['$totalDebits', { $add: ['$debitCleared', '$debitVoid'] } ] },
                { $subtract: ['$totalCredits', { $add: ['$creditCleared', '$creditVoid'] }] }
              ] } } }, ' amount'] }
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalCredits: 1,
          totalDebits: 1,
          creditPending: 1,
          creditCleared: 1,
          creditOverdue: 1,
          creditVoid: 1,
          debitPending: 1,
          debitCleared: 1,
          debitOverdue: 1,
          debitVoid: 1,
          netBalance: 1,
          message: 1
        }
      }
    ];
    

    const [summary] = await Transaction.aggregate(pipeline);

    res.json({ transactions, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTransactionsFilter = async (req, res) => {
  const { authId, status = [], type = [], account = [], tag = [], date, amount, page = 1, limit = 10 } = req.body;

  // Initialize query object
  const query = { authId: authId }; 

  // Ensure user exists
  const userExists = await User.findOne({ authId });
  if (!userExists) {
    return res.status(201).json({ message: 'User not found' });
  }

  // Apply filters to the query
  if (status.length > 0) {
    query.status = { $in: status };
  }

  if (type.length > 0) {
    query.type = { $in: type };
  }

  if (account.length > 0) {
    query.account = { $in: account };
  }

  if (tag && tag.length > 0 && tag[0] !== "") {
    query.tag = { $in: tag };
  }

  if (date && date.start && date.end) {
    const startDate = new Date(date.start);
    const endDate = new Date(date.end);

    // Set start time to the beginning of the day and end time to the end of the day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    query.timeInMiles = {
      $gte: startDate.getTime(),
      $lte: endDate.getTime()
    };
  }

  if (amount && amount.min !== undefined && amount.max !== undefined) {
    query.amount = {
      $gte: amount.min,
      $lte: amount.max
    };
  }

  try {
    // Fetch transactions with the applied filters
    const transactions = await Transaction.find(query)
      .sort({ timeInMiles: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Count total transactions matching the query for pagination metadata
    const totalTransactions = await Transaction.countDocuments(query);

    // Calculate totalPages
    const totalPages = totalTransactions ? Math.ceil(totalTransactions / limit) : 0;

    // Group transactions by date and calculate summary
    const transactionsByDate = {};
    transactions.forEach(transaction => {
      // Extract date without time for grouping
      const dateKey = new Date(transaction.timeInMiles).toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

      if (!transactionsByDate[dateKey]) {
        transactionsByDate[dateKey] = {
          totalCredits: 0,
          totalDebits: 0,
          totalAmount: 0,
          netBalance: 0,
          transactionCount: 0,
          transactions: []
        };
      }
      const dateGroup = transactionsByDate[dateKey];
      if (transaction.type === 'CREDIT') {
        dateGroup.totalCredits += transaction.amount;
      } else if (transaction.type === 'DEBIT') {
        dateGroup.totalDebits += transaction.amount;
      }
      dateGroup.totalAmount += transaction.amount;
      dateGroup.netBalance += (transaction.type === 'CREDIT' ? transaction.amount : -transaction.amount);
      dateGroup.transactionCount += 1;
      dateGroup.transactions.push(transaction);
    });

    // Format transactionsByDate for response
    const formattedTransactionsByDate = Object.keys(transactionsByDate).map(date => ({
      date,
      ...transactionsByDate[date]
    }));

    // Send response
    res.json({
      dateRangeSummary: {
        totalCredits: transactions.reduce((sum, txn) => txn.type === 'CREDIT' ? sum + txn.amount : sum, 0),
        totalDebits: transactions.reduce((sum, txn) => txn.type === 'DEBIT' ? sum + txn.amount : sum, 0),
        netBalance: transactions.reduce((sum, txn) => txn.type === 'CREDIT' ? sum + txn.amount : sum - txn.amount, 0)
      },
      transactionsByDate: formattedTransactionsByDate,
      pagination: {
        totalTransactions,
        currentPage: page,
        totalPages,
        hasMorePages: page < totalPages
      },
      filterCriteria: {
        status,
        type,
        account,
        tag,
        date,
        amount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Controller for updating tag name in all transactions
exports.updateTagName = async (req, res) => {
  const { oldTagName, newTagName, authId } = req.body; // Assuming the old tag name, new tag name, and authId are passed in the request body

  if (!oldTagName || !newTagName || !authId) {
      return res.status(200).json({ success: false, message: 'oldTagName, newTagName, and authId are required.' });
  }

  try {
      // Update the tag name in all transactions for the given authId
      const result = await Transaction.updateMany(
          { authId, tag: { $regex: new RegExp(`^${oldTagName}$`, 'i') } }, // Match transactions with the old tag name and specific authId
          { $set: { tag: newTagName } } // Update the tag field with the new tag name
      );

      if (result.matchedCount === 0) {
          return res.status(200).json({ success: false, message: 'No transactions found with the specified tag name.' });
      }

      res.status(200).json({
          success: true,
          message: `Tag name updated successfully in ${result.modifiedCount} transactions.`,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
      });
  } catch (error) {
      console.error('Error updating tag name:', error);
      res.status(200).json({ success: false, message: 'An error occurred while updating the tag name.', error: error.message });
  }
};









