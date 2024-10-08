// server/controllers/academyTypeController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

// Helper function to parse boolean values
const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return false;
};

// Create a new Academy Type
exports.createAcademyType = async (req, res, next) => {
  console.log('createAcademyType function called');
  const { name, description, restricted, allowedUserEmails } = req.body;
  console.log(
    'Received restricted value:',
    restricted,
    'Type:',
    typeof restricted
  );

  try {
    const restrictedValue = parseBoolean(restricted);
    console.log('Parsed restrictedValue:', restrictedValue);

    const dataToCreate = {
      name,
      description,
      restricted: restrictedValue,
    };
    console.log('Data to create:', dataToCreate);

    if (restrictedValue && allowedUserEmails) {
      const users = await prisma.user.findMany({
        where: { email: { in: allowedUserEmails } },
      });

      if (users.length !== allowedUserEmails.length) {
        return next(
          createError(400, 'Some emails do not correspond to existing users')
        );
      }

      dataToCreate.allowedUsers = {
        connect: users.map((user) => ({ id: user.id })),
      };
    }

    const newAcademyType = await prisma.academyType.create({
      data: dataToCreate,
      include: { allowedUsers: true },
    });
    console.log('New Academy Type created:', newAcademyType);
    res.status(201).json(newAcademyType);
  } catch (error) {
    console.error('Error creating academy type:', error);
    next(createError(500, 'Error creating academy type'));
  }
};

// Get all Academy Types
exports.getAllAcademyTypes = async (req, res, next) => {
  const { id: userId, roles } = req.user; // Include roles from the authenticated user

  try {
    let academyTypes;

    if (roles.includes('SUPERADMIN')) {
      // If the user is SUPERADMIN, fetch all academy types
      academyTypes = await prisma.academyType.findMany({
        include: { initialQuestions: true, allowedUsers: true },
      });
    } else {
      // For other users, fetch only allowed or unrestricted academy types
      academyTypes = await prisma.academyType.findMany({
        where: {
          OR: [
            { restricted: false },
            { allowedUsers: { some: { id: userId } } },
          ],
        },
        include: { initialQuestions: true, allowedUsers: true },
      });
    }

    res.status(200).json(academyTypes);
  } catch (error) {
    next(createError(500, 'Error fetching academy types'));
  }
};

// Update an Academy Type
exports.updateAcademyType = async (req, res, next) => {
  console.log('updateAcademyType function called');
  const { id } = req.params;
  let { name, description, restricted, allowedUserEmails } = req.body;
  console.log(
    'Received restricted value:',
    restricted,
    'Type:',
    typeof restricted
  );

  try {
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (restricted !== undefined)
      dataToUpdate.restricted = parseBoolean(restricted);

    if (allowedUserEmails !== undefined) {
      const users = await prisma.user.findMany({
        where: { email: { in: allowedUserEmails } },
      });

      if (users.length !== allowedUserEmails.length) {
        return next(
          createError(400, 'Some emails do not correspond to existing users')
        );
      }

      dataToUpdate.allowedUsers = {
        set: users.map((user) => ({ id: user.id })),
      };
    }

    const updatedAcademyType = await prisma.academyType.update({
      where: { id: parseInt(id, 10) },
      data: dataToUpdate,
      include: { allowedUsers: true },
    });
    console.log('Academy Type updated:', updatedAcademyType);
    res.status(200).json(updatedAcademyType);
  } catch (error) {
    console.error('Error updating academy type:', error);
    next(createError(500, 'Error updating academy type'));
  }
};

// Delete an Academy Type (Cascading delete of Initial Questions)
exports.deleteAcademyType = async (req, res, next) => {
  console.log('deleteAcademyType hit');
  const { id } = req.params;

  try {
    await prisma.academyType.delete({
      where: { id: parseInt(id, 10) },
    });
    console.log('Academy Type deleted');
    res.status(200).json({ message: 'Academy Type deleted successfully' });
  } catch (error) {
    console.error('Error deleting academy type:', error);
    next(
      createError(500, 'Internal Server Error: Error deleting academy type')
    );
  }
};

// Add an Initial Question to an Academy Type
exports.addInitialQuestion = async (req, res, next) => {
  console.log('addInitialQuestion hit');
  const { id } = req.params;
  const { question } = req.body;

  try {
    const newQuestion = await prisma.initialQuestion.create({
      data: {
        question,
        academyTypeId: parseInt(id, 10),
      },
    });
    console.log('New Initial Question added:', newQuestion);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error adding initial question:', error);
    next(
      createError(500, 'Internal Server Error: Error adding initial question')
    );
  }
};

// Delete an Initial Question
exports.deleteInitialQuestion = async (req, res, next) => {
  console.log('deleteInitialQuestion hit');
  const { questionId } = req.params;

  try {
    await prisma.initialQuestion.delete({
      where: { id: parseInt(questionId, 10) },
    });
    console.log('Initial Question deleted');
    res.status(200).json({ message: 'Initial Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting initial question:', error);
    next(
      createError(500, 'Internal Server Error: Error deleting initial question')
    );
  }
};

exports.updateInitialQuestion = async (req, res, next) => {
  console.log('updateInitialQuestion hit');
  const { questionId } = req.params;
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return next(createError(400, 'Invalid question data'));
  }

  try {
    const updatedQuestion = await prisma.initialQuestion.update({
      where: { id: parseInt(questionId, 10) },
      data: { question },
    });
    console.log('Initial Question updated:', updatedQuestion);
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error('Error updating initial question:', error);

    if (error.code === 'P2025') {
      // Record not found
      return next(createError(404, 'Initial Question not found'));
    }

    next(
      createError(500, 'Internal Server Error: Error updating initial question')
    );
  }
};
