const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require("../utils/responseBuilder");
const logger = require("../utils/logger");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
      orderBy: {
        email: "asc"
      }
    });

    return successResponse(res, "Users fetched successfully", users);
  } catch (err) {
    logger.error("Failed to fetch users: %o", err);
    return errorResponse(res, "Failed to fetch users");
  }
};
