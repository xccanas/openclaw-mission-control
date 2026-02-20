const crypto = require('crypto');

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Generate JWKS
const jwk = publicKey.export({ format: 'jwk' });
const jwks = {
  keys: [{
    kid: '1',
    kty: 'RSA',
    use: 'sig',
    n: jwk.n,
    e: jwk.e,
    alg: 'RS256'
  }]
};

console.log('JWT_PRIVATE_KEY=' + privateKey.replace(/\n/g, '\\n'));
console.log('JWKS=' + JSON.stringify(jwks, null, 2).replace(/\n/g, '\\n').replace(/"/g, '\\"'));