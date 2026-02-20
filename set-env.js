const fs = require('fs');
const { execSync } = require('child_process');

// Read the generated keys
const privateKey = fs.readFileSync('jwt-private-key.pem', 'utf8');
const jwks = fs.readFileSync('jwks.json', 'utf8');

// Set environment variables using convex CLI
console.log('Setting JWT_PRIVATE_KEY...');
execSync(`npx convex env set JWT_PRIVATE_KEY "${privateKey.replace(/\n/g, '\\n')}"`, { 
  stdio: 'inherit',
  cwd: __dirname
});

console.log('Setting JWKS...');
execSync(`npx convex env set JWKS '${jwks.replace(/'/g, "\\'")}'`, { 
  stdio: 'inherit',
  cwd: __dirname
});

console.log('✅ Environment variables set successfully!');