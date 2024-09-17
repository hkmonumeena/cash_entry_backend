const express = require('express');
const transactionController = require('../controllers/transactionController');
const {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    getTransactions,
    getTransactionSummary,
    getTagsSummary,
    getTransactionsByTag,
    getAllTransactionsFilter,
    updateTagName
  } = require('../controllers/transactionController');
const router = express.Router();

// Route for creating an item
router.post('/createTransaction',createTransaction);
// Update a transaction
router.post('/transactions/update', updateTransaction);

// Delete a transaction
router.post('/transactions/delete', deleteTransaction);

// Get a single transaction
router.get('/transactions', getTransaction);

// Get summary transaction
router.post('/transactions/summary/', getTransactionSummary);

// Get summary transaction
router.post('/transactions/tagSummary/', getTagsSummary);

// Get summary transaction
router.post('/transactions/byTag/', getTransactionsByTag);

// Get summary transaction
router.post('/update_tag', updateTagName);

// Get summary transaction
router.post('/transactions/filterTransactions/', getAllTransactionsFilter);

// Get paginated list of transactions
router.get('/transactions', getTransactions);


module.exports = router;