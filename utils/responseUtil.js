// utils/responseUtil.js

/**
 * Send a JSON response.
 * 
 * @param {Object} res - The response object from Express.
 * @param {number} statusCode - HTTP status code to send.
 * @param {string} message - A brief message about the response.
 * @param {Object} [data] - Optional data to include in the response.
 */
const sendResponse = (res, statusCode, message, data = {}) => {
    res.status(statusCode).json({
      status: statusCode < 300 ? 'success' : 'error',
      message,
      data
    });
  };
  
  module.exports = sendResponse;
  