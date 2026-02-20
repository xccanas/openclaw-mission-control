const fs = require('fs');
const { execSync } = require('child_process');

const privateKey = fs.readFileSync('jwt-private-key.pem', 'utf8');
const jwks = JSON.stringify({
  keys: [{
    kty: "RSA",
    n: "mFApz8FYzY6dM2BtPY_ZvnhY9NGknLUHjo_RCUXn1CWf_b6XK9jIKv26t816ixIGIo7ohBdS9_FtXZciHJ0e_brdpMYClcj7roXH5bl33jx1QV-9MPYEp3dsCfwoiazsqRzAwOpDwwEnL5-llnHgEEeDdsRrAFMlyPKq1Txraxbj21btpzNm1JyfHNyV_dXY3yTQxdPcnzmv3gYPUQ8qmJ4sluEKADMjBtILfSX31Yjp1a1Z53wI1t-GiM5Tx5dNR2hUEjzqNNH1BDUHOgaSdp64I8nWqh04WPjNrXUar4ADZ-tauVaHB0mf4dyYhB43jKXoBUgp_0IQ9EPWVxGGnw",
    e: "AQAB",
    alg: "RS256",
    use: "sig",
    kid: "convex-auth-key-1"
  }]
});

try {
  console.log('Setting JWT_PRIVATE_KEY...');
  execSync(`npx convex env --prod set JWT_PRIVATE_KEY "${privateKey.replace(/\n/g, '\\n')}"`, { 
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('Setting JWKS...');
  execSync(`npx convex env --prod set JWKS '${jwks.replace(/'/g, "\\'")}'`, { 
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('✅ JWT keys set in production successfully!');
} catch (error) {
  console.log('Error setting JWT keys:', error.message);
  console.log('Please set them manually in the Convex dashboard.');
}