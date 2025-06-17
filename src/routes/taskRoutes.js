const express = require('express');
const router = express.Router();
const validateRequest = require('../middlewares/validateRequest');
const { protect } = require('../middlewares/authMiddleware');
const { createTaskRules, updateTaskRules } = require('../validators/taskValidators');
const { getTaskByProjectId, createTask, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');

router.use(protect);

router.get('/:projectId', getTaskByProjectId);
router.post('/:projectId', createTaskRules, validateRequest, createTask);
router.get('/detail/:taskId', getTaskById);
router.put('/detail/:taskId', updateTaskRules, validateRequest, updateTask);
router.delete('/detail/:taskId', deleteTask);

module.exports = router;
