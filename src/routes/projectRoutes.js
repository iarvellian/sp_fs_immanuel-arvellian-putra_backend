const express = require('express');
const router = express.Router();
const validateRequest = require('../middlewares/validateRequest');
const { protect } = require('../middlewares/authMiddleware');
const { createProjectRules, inviteMemberRules, updateProjectRules } = require('../validators/projectValidators');
const { getMyProjects, createProject, getProjectById, updateProject, deleteProject, inviteMember, deleteMember } = require('../controllers/projectController');

router.use(protect);

router.get('/', getMyProjects);
router.post('/', createProjectRules, validateRequest, createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProjectRules, validateRequest, updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/invite', inviteMemberRules, validateRequest, inviteMember);
router.delete('/:id/members/:userId', deleteMember);

module.exports = router;