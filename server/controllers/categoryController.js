// server/controllers/categoryController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Error creating category' });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });
    res.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Error updating category' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Error deleting category' });
  }
};
