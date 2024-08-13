const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(createError(400, 'Category name is required'));
    }

    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    next(createError(500, 'Error creating category'));
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany();

    if (!categories.length) {
      return next(createError(404, 'No categories found'));
    }

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    next(createError(500, 'Error fetching categories'));
  }
};

exports.updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return next(createError(400, 'Category name is required'));
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });
    res.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    next(createError(500, 'Error updating category'));
  }
};

exports.deleteCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting category:', error);
    next(createError(500, 'Error deleting category'));
  }
};
