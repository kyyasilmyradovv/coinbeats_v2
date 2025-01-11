const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

// For admin
exports.getPoints = async (req, res, next) => {
  try {
    let { keyword, limit, offset } = req.query;
    if (keyword) keyword = '%' + keyword + '%';

    const points = await prisma.$queryRaw`
      SELECT 
        p.value as value,
        p."createdAt" as "createdAt", 
        p.description as description, 
        u.name AS user_name, 
        vt.name AS task_name,
        a.name AS academy_name
      FROM 
        "Point" AS p
      JOIN 
        "User" AS u 
        ON u.id = p."userId"
      LEFT JOIN 
        "VerificationTask" AS vt 
        ON vt.id = p."verificationTaskId"
      LEFT JOIN 
        "Academy" AS a 
        ON a.id = p."academyId"
      WHERE 
        u.name ILIKE ${keyword || '%%'}
      ORDER BY 
        p.id DESC
      LIMIT 
        ${+limit || 20} 
      OFFSET 
        ${+offset || 0};
    `;

    res.status(200).json(points);
  } catch (error) {
    console.error('Error fetching pints:', error);
    next(createError(500, 'Error fetching points'));
  }
};
