const crypto = require('crypto');
const fs = require('fs');
const PRIVATE_KEY = fs.readFileSync('private.pem', 'utf8');

function decryptAESKey(encryptedKey) {
  const privateKey = crypto.createPrivateKey(PRIVATE_KEY);
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(encryptedKey, 'base64')
  );
}

function decryptData(encryptedData, aesKey) {
  const [iv, encrypted] = encryptedData
    .split(':')
    .map((part) => Buffer.from(part, 'base64'));
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(aesKey, 'hex'),
    iv
  );
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function encryptData(data, aesKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(aesKey, 'hex'),
    iv
  );
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
}

function cryptographyMiddleware(req, res, next) {
  const { key } = req.query;
  const { data } = req.body;
  const aesKey = key ? decryptAESKey(key) : undefined;

  try {
    if (key && data) {
      const decryptedRequest = decryptData(data, aesKey);
      req.body = JSON.parse(decryptedRequest);
    }

    const originalSend = res.send.bind(res);
    // const originalJson = res.json.bind(res);

    res.send = (data) => {
      originalSend(encryptData(data, aesKey));
    };

    // res.json = (data) => {
    //   originalJson(encryptData(data, aesKey));
    // };

    next();
  } catch (error) {
    console.error('Cryptography Middleware Error:', error);
    res.status(500).json({ error: 'Cryptography error' });
  }
}

module.exports = { cryptographyMiddleware };
