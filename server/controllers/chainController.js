// server/controllers/chainController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.createChain = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(createError(400, 'Chain name is required'));
    }

    const chain = await prisma.chain.create({
      data: { name },
    });

    res.status(201).json({ message: 'Chain created successfully', chain });
  } catch (error) {
    console.error('Error creating chain:', error);
    next(createError(500, 'Error creating chain'));
  }
};

exports.getChains = async (req, res, next) => {
  try {
    const chains = await prisma.chain.findMany();

    if (!chains.length) {
      return next(createError(404, 'No chains found'));
    }

    res.json(chains);
  } catch (error) {
    console.error('Error fetching chains:', error);
    next(createError(500, 'Error fetching chains'));
  }
};

exports.updateChain = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return next(createError(400, 'Chain name is required'));
  }

  try {
    const updatedChain = await prisma.chain.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });

    res.json({ message: 'Chain updated successfully', chain: updatedChain });
  } catch (error) {
    console.error('Error updating chain:', error);
    next(createError(500, 'Error updating chain'));
  }
};

exports.deleteChain = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.chain.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting chain:', error);
    next(createError(500, 'Error deleting chain'));
  }
};
