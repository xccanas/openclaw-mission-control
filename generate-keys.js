import crypto from 'crypto';

// Generate JWT private key
const privateKey = crypto.generateKeySync('rsa', {
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

// Generate JWKS (JSON Web Key Set)
const publicKey = crypto.createPublicKey(privateKey);
const jwks = {
  keys: [{
    kid: '1',
    kty: 'RSA',
    use: 'sig',
    n: publicKey.export({ format: 'jwk' }).n,
    e: publicKey.export({ format: 'jwk' }).e,
    alg: 'RS256'
  }]
};

console.log('JWT_PRIVATE_KEY:');
console.log(privateKey);
console.log('\nJWKS:');
console.log(JSON.stringify(jwks, null, 2));