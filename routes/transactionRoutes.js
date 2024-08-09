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
    getAllTransactionsFilter
  } = require('../controllers/transactionController');
const router = express.Router();

// Route for creating an item
router.post('/createTransaction',createTransaction);
// Update a transaction
router.post('/transactions/update/:id', updateTransaction);

// Delete a transaction
router.post('/transactions/delete/:id', deleteTransaction);

// Get a single transaction
router.get('/transactions/:id', getTransaction);

// Get summary transaction
router.post('/transactions/summary/', getTransactionSummary);

// Get summary transaction
router.post('/transactions/tagSummary/', getTagsSummary);

// Get summary transaction
router.post('/transactions/byTag/', getTransactionsByTag);

// Get summary transaction
router.post('/transactions/filterTransactions/', getAllTransactionsFilter);

// Get paginated list of transactions
router.get('/transactions', getTransactions);


module.exports = router;