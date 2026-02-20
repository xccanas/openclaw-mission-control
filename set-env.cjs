const fs = require('fs');
const { execSync } = require('child_process');

// Read the generated keys
const privateKey = fs.readFileSync('jwt-private-key.pem', 'utf8');
const jwks = fs.readFileSync('jwks.json', 'utf8');

// Set environment variables using convex CLI
console.log('Setting JWT_PRIVATE_KEY...');
try {
  execSync(`npx convex env set JWT_PRIVATE_KEY "${privateKey.replace(/\n/g, '\\n')}"`, { 
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (error) {
  console.log('Failed to set JWT_PRIVATE_KEY, trying alternative approach...');
  console.log('Please run manually:');
  console.log(`npx convex env set JWT_PRIVATE_KEY "${privateKey.replace(/\n/g, '\\n')}"`);
}

console.log('Setting JWKS...');
try {
  execSync(`npx convex env set JWKS '${jwks.replace(/'/g, "\\'")}'`, { 
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (error) {
  console.log('Failed to set JWKS, trying alternative approach...');
  console.log('Please run manually:');
  console.log(`npx convex env set JWKS '${jwks}'`);
}

console.log('✅ Environment variables setup attempted!');