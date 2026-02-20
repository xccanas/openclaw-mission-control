// generate-jwt-keys.cjs
const crypto = require('crypto');
const fs = require('fs');

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

// Create JWK from public key
const publicKeyJwk = crypto.createPublicKey(publicKey).export({ format: 'jwk' });

// Create JWKS format
const jwks = JSON.stringify({
  keys: [{
    ...publicKeyJwk,
    alg: 'RS256',
    use: 'sig',
    kid: 'convex-auth-key-1'
  }]
});

// Output results
console.log('=== JWT_PRIVATE_KEY (set this in Convex env) ===');
console.log(privateKey.replace(/\n/g, '\\n')); // Escaped for copy-paste

console.log('\n=== JWKS (set this in Convex env) ===');
console.log(jwks);

// Also save to files
fs.writeFileSync('jwt-private-key.pem', privateKey);
fs.writeFileSync('jwks.json', jwks);
console.log('\n✅ Keys saved to jwt-private-key.pem and jwks.json');