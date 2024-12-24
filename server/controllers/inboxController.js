// server/controllers/inboxController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');

const prisma = new PrismaClient();

/**
 * Get pending feedback submissions.
 */
exports.getPendingFeedbackSubmissions = async (req, res, next) => {
  try {
    const submissions = await prisma.userTaskSubmission.findMany({
      where: {
        processed: false,
        task: {
          verificationMethod: 'LEAVE_FEEDBACK',
        },
      },
      include: {
        user: true,
        task: true, // Corrected relation name
      },
    });

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching feedback submissions:', error);
    next(createError(500, 'Error fetching feedback submissions'));
  }
};

/**
 * Get pending other submissions.
 */
exports.getPendingOtherSubmissions = async (req, res, next) => {
  try {
    const submissions = await prisma.userTaskSubmission.findMany({
      where: {
        processed: false,
        task: {
          verificationMethod: {
            not: 'LEAVE_FEEDBACK',
          },
        },
      },
      include: {
        user: true,
        task: true, // Corrected relation name
      },
    });

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching other submissions:', error);
    next(createError(500, 'Error fetching other submissions'));
  }
};

/**
 * Credit user for a submission.
 */
exports.creditUserForFeedback = async (req, res, next) => {
  const { submissionId } = req.params;

  try {
    const submission = await prisma.userTaskSubmission.findUnique({
      where: { id: parseInt(submissionId, 10) },
      include: {
        user: true,
        task: true, // Corrected relation name
      },
    });

    if (!submission) {
      return next(createError(404, 'Submission not found'));
    }

    if (submission.processed) {
      return next(createError(400, 'Submission already processed'));
    }

    const task = submission.task;

    // Find or create UserVerification
    let userVerification = await prisma.userVerification.findFirst({
      where: {
        userId: submission.userId,
        verificationTaskId: submission.taskId,
      },
    });

    if (!userVerification) {
      // If not found, create a new UserVerification
      userVerification = await prisma.userVerification.create({
        data: {
          userId: submission.userId,
          verificationTaskId: submission.taskId,
          verified: false,
          createdAt: new Date(),
        },
      });
    }

    if (userVerification.verified) {
      return next(createError(400, 'User already verified for this task'));
    }

    const completedAt = new Date();
    const pointsAwarded = task.xp;

    await prisma.userVerification.update({
      where: { id: userVerification.id },
      data: {
        verified: true,
        completedAt,
        pointsAwarded,
      },
    });

    // Create a new Point record
    await prisma.point.create({
      data: {
        userId: submission.userId,
        value: pointsAwarded,
        verificationTaskId: submission.taskId,
      },
    });

    // Increase user pointCount & lastWeekPointCount
    await prisma.user.update({
      where: { id: submission.userId },
      data: {
        pointCount: { increment: pointsAwarded },
        lastWeekPointCount: { increment: pointsAwarded },
      },
    });

    // TODO: test on the development when available again
    if (pointsAwarded > 99) {
      await prisma.raffle.create({
        data: {
          userId: submission.userId,
          taskId: parseInt(submission.taskId, 10),
          amount: pointsAwarded / 100,
        },
      });
      await prisma.user.update({
        where: { id: submission.userId },
        data: { raffleAmount: { increment: pointsAwarded / 100 } },
      });
    }

    // Mark the submission as processed
    await prisma.userTaskSubmission.update({
      where: { id: submission.id },
      data: { processed: true },
    });

    res.json({ message: 'User credited successfully' });
  } catch (error) {
    console.error('Error crediting user for submission:', error);
    next(createError(500, 'Error crediting user for submission'));
  }
};

/**
 * Delete a submission.
 */
exports.deleteFeedbackSubmission = async (req, res, next) => {
  const { submissionId } = req.params;

  try {
    const submission = await prisma.userTaskSubmission.findUnique({
      where: { id: parseInt(submissionId, 10) },
    });

    if (!submission) {
      return next(createError(404, 'Submission not found'));
    }

    // Mark the submission as processed
    await prisma.userTaskSubmission.update({
      where: { id: submission.id },
      data: { processed: true },
    });

    res.json({ message: 'Submission marked as processed' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    next(createError(500, 'Error deleting submission'));
  }
};
