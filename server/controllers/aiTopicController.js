const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getAllTopics = async (req, res, next) => {
  try {
    const { keyword, limit = 6, offset = 0 } = req.query;

    const where = {};
    if (keyword) {
      where.title = { contains: keyword, mode: 'insensitive' };
    }
    if (limit == 100) where.is_active = true;

    let topics = await prisma.aiTopics.findMany({
      where,
      select: { id: true, title: true, is_active: true },
      orderBy: { order: 'asc' },
      take: +limit,
      skip: +offset,
    });

    res.status(200).json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    next(createError(500, 'Error fetching topics'));
  }
};

exports.getTopic = async (req, res, next) => {
  try {
    const { id } = req.params;

    let topic = await prisma.aiTopics.findUnique({
      where: { id: +id },
      include: {
        academies: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    res.status(200).json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    next(createError(500, 'Error fetching topic'));
  }
};

exports.createTopic = async (req, res, next) => {
  try {
    const { title, context, is_active, academyIds } = req.body;

    const maxOrder = await prisma.aiTopics.aggregate({ _max: { order: true } });

    await prisma.aiTopics.create({
      data: {
        title,
        context,
        is_active,
        order: maxOrder._max.order + 1,
        academies: {
          connect: academyIds.map((id) => ({ id })),
        },
      },
    });

    res.status(200).send();
  } catch (error) {
    console.error('Error creating topic:', error);
    next(createError(500, 'Error creating topic'));
  }
};

exports.updateTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, context, is_active, academyIds } = req.body;

    await prisma.aiTopics.update({
      where: { id: +id },
      data: {
        title,
        context,
        is_active,
        academies: {
          set: academyIds.map((id) => ({ id })),
        },
      },
    });

    res.status(200).send();
  } catch (error) {
    console.error('Error updating topic:', error);
    next(createError(500, 'Error updating topic'));
  }
};

exports.deleteTopic = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.aiTopics.delete({ where: { id: +id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting topic:', error);
    next(createError(500, 'Error deleting topic'));
  }
};

exports.reorderTopics = async (req, res, next) => {
  try {
    const { topicIds } = req.body;

    for (let i = 0; i < topicIds.length; i++) {
      await prisma.aiTopics.update({
        where: { id: topicIds[i] },
        data: { order: i + 1 },
      });
    }

    res.status(200).send();
  } catch (error) {
    console.error('Error reordering topics:', error);
    next(createError(500, 'Error reordering topics'));
  }
};

exports.getAcademies = async (req, res, next) => {
  try {
    const { keyword, limit = 7 } = req.query;

    const where = {};
    if (keyword) where.name = { contains: keyword, mode: 'insensitive' };

    let academies = await prisma.academy.findMany({
      where,
      select: { id: true, name: true },
      take: +limit,
    });

    res.status(200).json(academies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    next(createError(500, 'Error fetching academies'));
  }
};
