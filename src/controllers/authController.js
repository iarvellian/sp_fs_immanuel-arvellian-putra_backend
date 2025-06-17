const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse, badRequestResponse } = require('../utils/responseBuilder');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return badRequestResponse(res, 'Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    const token = generateToken(user);
    return successResponse(res, 'User registered successfully', { 
        token, 
        user: { id: user.id, email: user.email } 
    });
  } catch (err) {
    logger.error('Register Error: %o', err);
    return errorResponse(res, 'Registration failed');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return badRequestResponse(res, 'Email not registered');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return badRequestResponse(res, 'Invalid credentials');

    const token = generateToken(user);
    return successResponse(res, 'Login successful', { 
        token, 
        user: { id: user.id, email: user.email } 
    });
  } catch (err) {
    logger.error('Login Error: %o', err);
    return errorResponse(res, 'Login failed');
  }
};