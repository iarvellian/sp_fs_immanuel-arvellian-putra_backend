const express = require('express');
const router = express.Router();
const validateRequest = require('../middlewares/validateRequest');
const { registerRules, loginRules } = require('../validators/authValidators');
const { register, login } = require('../controllers/authController');

router.post('/register', registerRules, validateRequest, register);
router.post('/login', loginRules, validateRequest, login);

module.exports = router;