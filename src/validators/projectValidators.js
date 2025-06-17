const { body } = require('express-validator');

exports.createProjectRules = [
  body('name')
    .notEmpty().withMessage('Project name is required').bail()
    .isLength({ min: 3 }).withMessage('Project name must be at least 3 characters'),
];

exports.updateProjectRules = [
  body('name')
    .notEmpty().withMessage('Project name is required').bail()
    .isLength({ min: 3 }).withMessage('Project name must be at least 3 characters'),
];

exports.inviteMemberRules = [
  body('email')
    .notEmpty().withMessage('Email is required').bail()
    .isEmail().withMessage('Invalid email format'),
];
