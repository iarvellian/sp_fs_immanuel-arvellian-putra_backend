const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse, notFoundResponse, badRequestResponse } = require('../utils/responseBuilder');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

exports.getTaskByProjectId = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) return notFoundResponse(res, 'Project not found');

    const isAllowed = project.ownerId === userId || project.members.some(m => m.userId === userId);

    if (!isAllowed) return badRequestResponse(res, 'Not authorized to access tasks');

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { 
        assignee: {
          select: {
            id: true,
            email: true,
          }
        } 
      }
    });

    return successResponse(res, 'Tasks retrieved successfully', tasks);
  } catch (err) {
    logger.error('Get tasks error: %o', err);
    return errorResponse(res, 'Failed to fetch tasks');
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, assigneeId } = req.body;
    const projectId = req.params.projectId;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) return notFoundResponse(res, 'Project not found');

    const isAuthorized = project.ownerId === userId || project.members.some(m => m.userId === userId);

    if (!isAuthorized) return badRequestResponse(res, 'Not allowed to add task to this project');

    if (assigneeId && assigneeId !== '') {
      const isAssigneeValid = assigneeId === project.ownerId || project.members.some(m => m.userId === assigneeId);

      if (!isAssigneeValid) {
        return badRequestResponse(res, 'Assignee must be a project member');
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        projectId,
        assigneeId: assigneeId || null
      },
      include: {
        assignee: {
          select: { id: true, email: true }
        }
      }
    });

    return successResponse(res, 'Task created successfully', task, 201);
  } catch (err) {
    logger.error('Create task error: %o', err);
    return errorResponse(res, 'Failed to create task');
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { members: true } },
        assignee: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    if (!task) return notFoundResponse(res, 'Task not found');

    const { project } = task;
    const isAllowed = project.ownerId === userId || project.members.some(m => m.userId === userId);

    if (!isAllowed) return badRequestResponse(res, 'Not authorized to access this task');

    return successResponse(res, 'Task retrieved successfully', task);
  } catch (err) {
    logger.error('Get task detail error: %o', err);
    return errorResponse(res, 'Failed to fetch task');
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, assigneeId } = req.body;
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { members: true } }
      }
    });

    if (!task) return notFoundResponse(res, 'Task not found');

    const isAllowed = task.project.ownerId === userId || task.project.members.some(m => m.userId === userId);

    if (!isAllowed) return badRequestResponse(res, 'Not allowed to update this task');

    if (assigneeId !== undefined && assigneeId !== '') {
      const isValid = assigneeId === task.project.ownerId || task.project.members.some(m => m.userId === assigneeId);

      if (!isValid) {
        return badRequestResponse(res, 'Assignee must be a project member');
      }
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (assigneeId !== undefined) data.assigneeId = assigneeId === '' ? null : assigneeId;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: {
          select: { id: true, email: true }
        }
      }
    });

    return successResponse(res, 'Task updated successfully', updated);
  } catch (err) {
    logger.error('Update task error: %o', err);
    return errorResponse(res, 'Failed to update task');
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { members: true } }
      }
    });

    if (!task) return notFoundResponse(res, 'Task not found');

    const isAllowed = task.project.ownerId === userId || task.project.members.some(m => m.userId === userId);

    if (!isAllowed) return badRequestResponse(res, 'Not allowed to delete this task');

    await prisma.task.delete({ where: { id: taskId } });

    return successResponse(res, 'Task deleted successfully');
  } catch (err) {
    logger.error('Delete task error: %o', err);
    return errorResponse(res, 'Failed to delete task');
  }
};