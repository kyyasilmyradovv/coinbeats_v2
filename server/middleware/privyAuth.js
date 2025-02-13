const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: process.env.PRIVY_JWKS_URI,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

exports.requirePrivyAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing Bearer token' });
    }

    // const decodedRaw = jwt.decode(token, { complete: true });
    // console.log(decodedRaw);

    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['ES256'],
        audience: process.env.PRIVY_APP_ID,
        issuer: 'privy.io',
      },
      (err, decoded) => {
        if (err) {
          console.error('Error verifying Privy token:', err);
          return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    console.error('Unexpected error verifying token =>', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
