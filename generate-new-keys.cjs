const crypto = require('crypto');
const fs = require('fs');

// Generate fresh RSA key pair
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

// Export public key as JWK
const publicKeyJwk = crypto.createPublicKey(publicKey).export({ format: 'jwk' });

// Create JWKS
const jwks = JSON.stringify({
  keys: [{
    ...publicKeyJwk,
    alg: 'RS256',
    use: 'sig',
    kid: 'mission-control-key-1'
  }]
});

// Save to files
fs.writeFileSync('new-private-key.pem', privateKey);
fs.writeFileSync('new-jwks.json', jwks);

console.log('✅ New keys generated!');
console.log('\n=== NEW JWKS (set this in dashboard) ===');
console.log(jwks);
console.log('\n=== NEW PRIVATE KEY (set in dashboard) ===');
console.log(privateKey);