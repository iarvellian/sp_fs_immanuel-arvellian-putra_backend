const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse, notFoundResponse, badRequestResponse } = require('../utils/responseBuilder');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const owned = await prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true }
            }
          }
        }
      }
    });

    const cleanedOwned = owned.map(project => ({
      ...project,
      members: project.members.map(m => m.user)
    }));

    const member = await prisma.membership.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, email: true }
                }
              }
            }
          }
        }
      }
    });

    const memberProjects = member.map(m => {
      const proj = m.project;
      return {
        ...proj,
        members: proj.members.map(mem => mem.user)
      };
    });

    const allProjects = [...cleanedOwned, ...memberProjects];

    allProjects.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(res, 'Projects retrieved successfully', allProjects);
  } catch (err) {
    logger.error('Error fetching projects: %o', err);
    return errorResponse(res, 'Failed to fetch projects');
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const existingProject = await prisma.project.findFirst({
      where: {
        name,
        ownerId: userId
      }
    });

    if (existingProject) return badRequestResponse(res, 'Project with this name already exists');

    const project = await prisma.project.create({
      data: {
        name,
        ownerId: userId,
      }
    });

    return successResponse(res, 'Project created successfully', project, 201);
  } catch (err) {
    logger.error('Error creating project: %o', err);
    return errorResponse(res, 'Failed to create project');
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: true }
        },
        tasks: true
      }
    });

    if (!project) return notFoundResponse(res, 'Project not found');

    const isOwner = project.ownerId === userId;
    const isMember = project.members.some(m => m.userId === userId);

    if (!isOwner && !isMember) {
      return badRequestResponse(res, 'You are not authorized to access this project');
    }

    const simplifiedMembers = project.members.map(m => ({
      userId: m.userId,
      email: m.user.email
    }));

    const responseData = {
      ...project,
      members: simplifiedMembers
    };

    return successResponse(res, 'Project detail fetched successfully', responseData);
  } catch (err) {
    logger.error('Error fetching project detail: %o', err);
    return errorResponse(res, 'Failed to fetch project detail');
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name } = req.body;
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return notFoundResponse(res, 'Project not found');
    if (project.ownerId !== userId) return badRequestResponse(res, 'Only the owner can update the project');

    const existingProject = await prisma.project.findFirst({
      where: {
        name,
        ownerId: userId,
        NOT: { id: projectId }
      }
    });

    if (existingProject) return badRequestResponse(res, 'Project with this name already exists');

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name }
    });

    return successResponse(res, 'Project updated successfully', updated);
  } catch (err) {
    logger.error('Update project error: %o', err);
    return errorResponse(res, 'Failed to update project');
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return notFoundResponse(res, 'Project not found');
    if (project.ownerId !== userId) return badRequestResponse(res, 'Only the owner can delete the project');

    await prisma.project.delete({
      where: { id: projectId }
    });

    return successResponse(res, 'Project deleted successfully');
  } catch (err) {
    logger.error('Delete project error: %o', err);
    return errorResponse(res, 'Failed to delete project');
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = req.params.id;
    const ownerId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return notFoundResponse(res, 'Project not found');
    if (project.ownerId !== ownerId) return badRequestResponse(res, 'Only owner can invite members');

    const user = await prisma.user.findUnique({ where: { email } });

    if (user.id === ownerId) return badRequestResponse(res, 'You cannot invite yourself');

    if (!user) return notFoundResponse(res, 'User not found');

    const existing = await prisma.membership.findFirst({
      where: {
        projectId,
        userId: user.id
      }
    });

    if (existing) return badRequestResponse(res, 'User already a member');

    const member = await prisma.membership.create({
      data: {
        userId: user.id,
        projectId
      }
    });

    return successResponse(res, 'Member invited successfully', member, 201);
  } catch (err) {
    logger.error('Invite member error: %o', err);
    return errorResponse(res, 'Failed to invite member');
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const projectId = req.params.id;
    const memberId = req.params.userId;
    const ownerId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return notFoundResponse(res, 'Project not found');

    if (project.ownerId !== ownerId) {
      return badRequestResponse(res, 'Only the project owner can remove members');
    }

    if (memberId === ownerId) {
      return badRequestResponse(res, 'Owner cannot be removed from the project');
    }

    const membership = await prisma.membership.findFirst({
      where: {
        projectId,
        userId: memberId
      }
    });

    if (!membership) {
      return notFoundResponse(res, 'Member not found in this project');
    }

    await prisma.membership.delete({
      where: { id: membership.id }
    });

    return successResponse(res, 'Member removed successfully');
  } catch (err) {
    logger.error('Delete member error: %o', err);
    return errorResponse(res, 'Failed to remove member');
  }
};