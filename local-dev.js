const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .env file exists, if not create it with basic config
if (!fs.existsSync('.env')) {
  console.log('Creating .env file with default configuration...');
  fs.writeFileSync('.env', 'SESSION_SECRET=local-development-secret\n');
  
  // Prompt for database URL if not available
  console.log('Please make sure to set DATABASE_URL in your .env file');
}

console.log('Starting local development server...');

// Choose whether to run the backend or frontend
const args = process.argv.slice(2);
const mode = args[0] || 'both';

if (mode === 'server' || mode === 'both') {
  console.log('Starting backend server...');
  const backend = spawn('npx', ['tsx', 'server/index.ts'], { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  backend.on('error', (err) => {
    console.error('Failed to start backend server:', err);
  });
}

if (mode === 'client' || mode === 'both') {
  console.log('Starting frontend development server...');
  const frontend = spawn('npx', ['vite', '--config', 'local-vite.config.ts'], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  frontend.on('error', (err) => {
    console.error('Failed to start frontend server:', err);
  });
}

console.log('\nUsage instructions:');
console.log('- Run "node local-dev.js" to start both servers');
console.log('- Run "node local-dev.js server" to start only the backend');
console.log('- Run "node local-dev.js client" to start only the frontend\n');