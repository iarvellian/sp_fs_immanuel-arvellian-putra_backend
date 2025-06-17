module.exports = {
  successResponse: function (res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      statusCode,
      message,
      data
    });
  },

  errorResponse: function (res, message = 'Something went wrong', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      statusCode,
      message,
      errors
    });
  },

  badRequestResponse: function (res, message = 'Bad Request', errors = null) {
    return res.status(400).json({
      statusCode: 400,
      message,
      errors
    });
  },

  notFoundResponse: function (res, message = 'Not Found') {
    return res.status(404).json({
      statusCode: 404,
      message
    });
  },

  unauthorizedResponse: function (res, message = 'Unauthorized') {
    return res.status(401).json({
      statusCode: 401,
      message
    });
  }
};