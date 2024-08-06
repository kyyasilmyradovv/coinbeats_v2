// server/controllers/chainController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new chain
exports.createChain = async (req, res) => {
  try {
    const { name } = req.body;
    const chain = await prisma.chain.create({
      data: { name },
    });
    res.status(201).json({ message: 'Chain created successfully', chain });
  } catch (error) {
    console.error('Error creating chain:', error);
    res.status(500).json({ error: 'Error creating chain' });
  }
};

// Get all chains
exports.getChains = async (req, res) => {
  try {
    const chains = await prisma.chain.findMany();
    res.json(chains);
  } catch (error) {
    console.error('Error fetching chains:', error);
    res.status(500).json({ error: 'Error fetching chains' });
  }
};

// Update a chain
exports.updateChain = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedChain = await prisma.chain.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });
    res.json({ message: 'Chain updated successfully', chain: updatedChain });
  } catch (error) {
    console.error('Error updating chain:', error);
    res.status(500).json({ error: 'Error updating chain' });
  }
};

// Delete a chain
exports.deleteChain = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.chain.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting chain:', error);
    res.status(500).json({ error: 'Error deleting chain' });
  }
};
