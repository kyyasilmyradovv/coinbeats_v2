// utils/jwt.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: '365d' } // Set to 1 year or longer, effectively indefinite
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id }, 
    JWT_REFRESH_SECRET, 
    { expiresIn: '365d' } // Set refresh token to a long expiration time as well
  );
}

module.exports = { generateAccessToken, generateRefreshToken };
