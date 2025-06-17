const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseBuilder');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error: %o', err);
  
  return errorResponse(res, err.message || 'Internal Server Error', 500);
}

module.exports = errorHandler;