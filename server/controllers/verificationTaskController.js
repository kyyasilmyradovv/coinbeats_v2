// server/controllers/verificationTaskController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');

const prisma = new PrismaClient();

exports.createVerificationTask = async (req, res, next) => {
  const {
    name,
    description,
    taskType,
    intervalType,
    repeatInterval,
    displayLocation,
    platform,
    verificationMethod,
    xp,
    shortCircuit,
    shortCircuitTimer,
    academyId,
  } = req.body;

  try {
    // For academy-specific tasks, ensure that the user is the creator of the academy
    if (taskType === 'ACADEMY_SPECIFIC') {
      if (!academyId) {
        return next(
          createError(400, 'academyId is required for academy-specific tasks')
        );
      }

      const academy = await prisma.academy.findUnique({
        where: { id: academyId },
      });

      if (!academy) {
        return next(createError(404, 'Academy not found'));
      }

      if (
        academy.creatorId !== req.user.id &&
        !req.user.roles.includes('ADMIN') &&
        !req.user.roles.includes('SUPERADMIN')
      ) {
        return next(
          createError(
            403,
            'You are not authorized to add tasks to this academy'
          )
        );
      }
    } else {
      // For platform-specific tasks, only ADMIN or SUPERADMIN can create
      if (
        !req.user.roles.includes('ADMIN') &&
        !req.user.roles.includes('SUPERADMIN')
      ) {
        return next(
          createError(403, 'You are not authorized to create platform tasks')
        );
      }
    }

    const verificationTask = await prisma.verificationTask.create({
      data: {
        name,
        description,
        taskType,
        intervalType,
        repeatInterval,
        displayLocation,
        platform,
        verificationMethod,
        xp,
        shortCircuit,
        shortCircuitTimer,
        academyId,
      },
    });

    res.status(201).json(verificationTask);
  } catch (error) {
    console.error('Error creating verification task:', error);
    next(createError(500, 'Error creating verification task'));
  }
};

exports.getVerificationTasks = async (req, res, next) => {
  try {
    let verificationTasks;

    if (
      req.user.roles.includes('ADMIN') ||
      req.user.roles.includes('SUPERADMIN')
    ) {
      // For platform-specific tasks
      verificationTasks = await prisma.verificationTask.findMany({
        where: { taskType: 'PLATFORM_SPECIFIC' },
      });
    } else if (req.user.roles.includes('CREATOR')) {
      // For academy-specific tasks, only for the creator's academies
      const academies = await prisma.academy.findMany({
        where: { creatorId: req.user.id },
        select: { id: true },
      });

      const academyIds = academies.map((academy) => academy.id);

      verificationTasks = await prisma.verificationTask.findMany({
        where: {
          taskType: 'ACADEMY_SPECIFIC',
          academyId: { in: academyIds },
        },
      });
    } else {
      // For users, fetch tasks assigned to them or available tasks
      verificationTasks = await prisma.verificationTask.findMany({
        where: {
          OR: [
            { taskType: 'PLATFORM_SPECIFIC' },
            { taskType: 'ACADEMY_SPECIFIC' },
          ],
        },
      });
    }

    res.json(verificationTasks);
  } catch (error) {
    console.error('Error fetching verification tasks:', error);
    next(createError(500, 'Error fetching verification tasks'));
  }
};

exports.getVerificationTaskById = async (req, res, next) => {
  const { taskId } = req.params;

  try {
    const verificationTask = await prisma.verificationTask.findUnique({
      where: { id: parseInt(taskId, 10) },
    });

    if (!verificationTask) {
      return next(createError(404, 'Verification task not found'));
    }

    res.json(verificationTask);
  } catch (error) {
    console.error('Error fetching verification task:', error);
    next(createError(500, 'Error fetching verification task'));
  }
};

exports.updateVerificationTask = async (req, res, next) => {
  const { taskId } = req.params;
  const {
    name,
    description,
    intervalType,
    repeatInterval,
    displayLocation,
    platform,
    verificationMethod,
    xp,
    shortCircuit,
    shortCircuitTimer,
  } = req.body;

  try {
    const verificationTask = await prisma.verificationTask.findUnique({
      where: { id: parseInt(taskId, 10) },
    });

    if (!verificationTask) {
      return next(createError(404, 'Verification task not found'));
    }

    // Authorization: Only the creator of the academy can update the task, or ADMIN/SUPERADMIN
    if (verificationTask.taskType === 'ACADEMY_SPECIFIC') {
      const academy = await prisma.academy.findUnique({
        where: { id: verificationTask.academyId },
      });

      if (
        academy.creatorId !== req.user.id &&
        !req.user.roles.includes('ADMIN') &&
        !req.user.roles.includes('SUPERADMIN')
      ) {
        return next(
          createError(403, 'You are not authorized to update this task')
        );
      }
    } else {
      if (
        !req.user.roles.includes('ADMIN') &&
        !req.user.roles.includes('SUPERADMIN')
      ) {
        return next(
          createError(403, 'You are not authorized to update this task')
        );
      }
    }

    const updatedTask = await prisma.verificationTask.update({
      where: { id: parseInt(taskId, 10) },
      data: {
        name,
        description,
        intervalType,
        repeatInterval,
        displayLocation,
        platform,
        verificationMethod,
        xp,
        shortCircuit,
        shortCircuitTimer,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating verification task:', error);
    next(createError(500, 'Error updating verification task'));
  }
};

exports.deleteVerificationTask = async (req, res, next) => {
  const { taskId } = req.params;

  try {
    const verificationTask = await prisma.verificationTask.findUnique({
      where: { id: parseInt(taskId, 10) },
    });

    if (!verificationTask) {
      return next(createError(404, 'Verification task not found'));
    }

    // Authorization: Only the creator of the academy can delete the task, or ADMIN/SUPERADMIN
    if (verificationTask.taskType === 'ACADEMY_SPECIFIC') {
      const academy = await prisma.academy.findUnique({
        where: { id: verificationTask.academyId },
      });

      if (
        academy.creatorId !== req.user.id &&
        !req.user.roles.includes('ADMIN') &&
        !req.user.roles.includes('SUPERADMIN')
      ) {
        return next(
          createError(403, 'You are not authorized to delete this task')
        );
      }
    } else {
      if (
        !req.user.roles.includes('ADMIN') &&
        !req.user.roles.includes('SUPERADMIN')
      ) {
        return next(
          createError(403, 'You are not authorized to delete this task')
        );
      }
    }

    await prisma.verificationTask.delete({
      where: { id: parseInt(taskId, 10) },
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting verification task:', error);
    next(createError(500, 'Error deleting verification task'));
  }
};

exports.getTasksForGamesPage = async (req, res, next) => {
  try {
    const tasks = await prisma.verificationTask.findMany({
      where: {
        OR: [
          {
            taskType: 'PLATFORM_SPECIFIC',
            displayLocation: 'GAMES_PAGE',
          },
          {
            taskType: 'PLATFORM_SPECIFIC',
            displayLocation: 'HOME_PAGE',
          },
        ],
      },
      include: {
        _count: {
          select: { userVerification: true },
        },
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for games page:', error);
    next(createError(500, 'Error fetching tasks for games page'));
  }
};

exports.getTasksForHomepage = async (req, res, next) => {
  try {
    const tasks = await prisma.verificationTask.findMany({
      where: {
        displayLocation: 'HOME_PAGE',
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for homepage:', error);
    next(createError(500, 'Error fetching tasks for homepage'));
  }
};
