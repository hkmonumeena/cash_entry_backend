const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
// Controller for creating a transaction
exports.createTransaction = async (req, res) => {
    try {
      const { authId, account, amount, date, remarks, tag, timeInMiles, transactionNumber, type, status } = req.body;
  
      // Ensure user exists (optional step depending on your needs)
      const userExists = await User.findOne({ authId });
      if (!userExists) {
        return res.status(201).json({ message: 'User not found' });
      }
  
      const transaction = new Transaction({
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
    const { id } = req.params; // Transaction ID is passed as a URL parameter
    const updateData = req.body; // The fields to be updated are in the request body
  
    try {
      // Find the transaction by ID and update it with new data
      const transaction = await Transaction.findByIdAndUpdate(id, updateData, {
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
    const { id } = req.params; // Transaction ID is passed as a URL parameter
  
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
    const { id } = req.params; // Transaction ID is passed as a URL parameter
  
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
// Controller for getting unique tags with their details and settlement status
exports.getTagsSummary = async (req, res) => {
  const { authId } = req.query; // authId is passed as a query parameter

  if (!authId) {
    return res.status(400).json({ message: 'authId is required.' });
  }

  try {
    const pipeline = [
      { $match: { authId } },
      {
        $sort: { date: -1 } // Sort by date in descending order to get the latest transaction first
      },
      {
        $group: {
          _id: '$tag',
          lastUsedDate: { $first: '$date' },
          lastTransactionAmount: { $first: '$amount' },
          lastTransactionStatus: { $first: '$status' },
          totalCreditAmount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0]
            }
          },
          totalDebitAmount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0]
            }
          },
          totalCreditSum: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$type', 'CREDIT'] }, { $ne: ['$status', 'VOID'] }] }, '$amount', 0]
            }
          },
          totalDebitSum: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$type', 'DEBIT'] }, { $ne: ['$status', 'VOID'] }] }, '$amount', 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          tag: '$_id',
          lastUsedDate: 1,
          lastTransactionAmount: 1,
          lastTransactionStatus: 1,
          totalCreditAmount: 1,
          totalDebitAmount: 1,
          totalCreditSum: 1,
          totalDebitSum: 1,
          balance: {
            $subtract: ['$totalCreditSum', '$totalDebitSum']
          },
          settlementMessage: {
            $cond: {
              if: { $gt: [{ $subtract: ['$totalCreditSum', '$totalDebitSum'] }, 0] },
              then: { $concat: ['You have to pay ', { $toString: { $subtract: ['$totalCreditSum', '$totalDebitSum'] } }, ''] },
              else: { $concat: ['You will receive ', { $toString: { $abs: { $subtract: ['$totalDebitSum', '$totalCreditSum'] } } }, ''] }
            }
          }
        }
      }
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


