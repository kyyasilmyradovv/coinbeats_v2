// server/middleware/bigIntMiddleware.js

const bigIntReplacer = require('../utils/bigIntReplacer');

function bigIntMiddleware(req, res, next) {
  const oldJson = res.json;
  res.json = function (data) {
    const replacedData = bigIntReplacer('', data);
    return oldJson.call(this, replacedData);
  };
  next();
}

module.exports = bigIntMiddleware;
