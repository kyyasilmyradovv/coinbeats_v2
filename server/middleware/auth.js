// server/middleware/auth.js

const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.query.token;
  const token = authHeader && authHeader.split(' ')[1];

  const telegramUserIdHeader = req.headers['x-telegram-user-id'];

  if (!token && !telegramUserIdHeader) {
    return next(createError(401, 'Unauthorized'));
  }

  if (token) {
    jwt.verify(token, JWT_SECRET, async (err, user) => {
      if (err) return next(createError(403, 'Forbidden'));

      try {
        const userId = parseInt(user.id, 10);
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!dbUser) {
          return next(createError(404, 'User not found'));
        }

        req.user = {
          id: dbUser.id,
          roles: dbUser.roles,
          telegramUserId: dbUser.telegramUserId,
          email: dbUser.email,
        };

        next();
      } catch (error) {
        console.error('Error fetching user in authenticateToken:', error);
        next(createError(500, 'Internal Server Error'));
      }
    });
  } else if (telegramUserIdHeader) {
    // Authenticate using telegramUserId
    try {
      const telegramUserId = parseInt(telegramUserIdHeader, 10);

      const dbUser = await prisma.user.findUnique({
        where: { telegramUserId },
      });

      if (!dbUser) {
        return next(createError(404, 'User not found'));
      }

      req.user = {
        id: dbUser.id,
        roles: dbUser.roles,
        telegramUserId: dbUser.telegramUserId,
        email: dbUser.email,
      };

      next();
    } catch (error) {
      console.error('Error fetching user in authenticateToken:', error);
      next(createError(500, 'Internal Server Error'));
    }
  } else {
    return next(createError(401, 'Unauthorized'));
  }
};

exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];

    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return next(
        createError(403, 'Forbidden: You do not have access to this resource')
      );
    }

    next();
  };
};
