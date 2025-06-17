const { validationResult } = require('express-validator');
const { badRequestResponse } = require('../utils/responseBuilder');

module.exports = function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = {};

    errors.array().forEach(err => {
      const field = err.path || err.param || 'undefined';

      if (!formatted[field]) {
        formatted[field] = [];
      }

      if (!formatted[field].includes(err.msg)) {
        formatted[field].push(err.msg);
      }
    });

    return badRequestResponse(res, 'Validation failed', formatted);
  }

  next();
};