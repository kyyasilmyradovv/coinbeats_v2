// utils/jwt.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: '1h' } // Adjust expiration as needed
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id }, 
    JWT_REFRESH_SECRET, 
    { expiresIn: '7d' } // Adjust expiration as needed
  );
}

module.exports = { generateAccessToken, generateRefreshToken };
