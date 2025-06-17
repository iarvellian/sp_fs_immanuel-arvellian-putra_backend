const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const SECRET = process.env.JWT_SECRET;
const { unauthorizedResponse } = require('../utils/responseBuilder');

const prisma = new PrismaClient();

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorizedResponse(res, 'No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return unauthorizedResponse(res, 'User not found');

    req.user = user;
    next();
  } catch (err) {
    return unauthorizedResponse(res, 'Token is invalid or expired');
  }
}

module.exports = { protect };