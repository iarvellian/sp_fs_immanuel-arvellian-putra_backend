const { body } = require('express-validator');

exports.createTaskRules = [
  body('title')
    .notEmpty().withMessage('Task title is required').bail()
    .isLength({ min: 3 }).withMessage('Task title must be at least 3 characters'),

  body('description')
    .notEmpty().withMessage('Task description is required').bail()
    .isLength({ min: 5 }).withMessage('Task description must be at least 5 characters'),

  body('status')
    .notEmpty().withMessage('Task status is required').bail()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid task status'),

  body('assigneeId')
    .optional()
    .isUUID().withMessage('Assignee must be valid UUID')
];

exports.updateTaskRules = [
  body('title')
    .optional()
    .notEmpty().withMessage('Title cannot be empty'),

  body('description')
    .optional()
    .isString().withMessage('Description must be string'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),

  body('assigneeId')
    .optional()
    .isUUID().withMessage('Assignee must be valid UUID')
];