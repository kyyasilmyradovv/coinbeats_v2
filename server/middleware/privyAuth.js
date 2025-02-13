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
      console.error('[privyAuth] Error fetching signing key =>', err);
      return callback(err);
    }
    // For ES256, use key.getPublicKey()
    const signingKey = key.getPublicKey();
    // console.log('[privyAuth] Signing key found for kid =>', header.kid);
    callback(null, signingKey);
  });
}

/**
 * Express middleware to verify a Privy token from `Authorization: Bearer ...`
 * Attach decoded user info to `req.user` if valid; otherwise 401.
 */
exports.requirePrivyAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log('[privyAuth] Checking Authorization header =>', authHeader);

    if (!authHeader) {
      console.warn('[privyAuth] Missing Authorization header');
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.warn('[privyAuth] Bearer token not found after split');
      return res.status(401).json({ error: 'Missing Bearer token' });
    }

    // Debug: Let's decode the token (without verifying) to see the header & payload
    const decodedRaw = jwt.decode(token, { complete: true });
    // console.log('[privyAuth] Received token =>', token);
    // console.log('[privyAuth] Decoded token header =>', decodedRaw?.header);
    // console.log('[privyAuth] Decoded token payload =>', decodedRaw?.payload);

    // Verify the token using the JWKS callback
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
        // If valid, store the decoded claims on req.user (e.g. sub = did:privy:...)
        // console.log('[privyAuth] Token verified OK => decoded =>', decoded);
        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    console.error('Unexpected error verifying token =>', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
