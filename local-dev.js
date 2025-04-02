// This is a simple script to run the application locally
require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting local development environment...');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('\x1b[31mError: .env file not found!\x1b[0m');
  console.log('Create a .env file in the root directory with:');
  console.log('DATABASE_URL=your_database_url');
  console.log('SESSION_SECRET=your_secret');
  process.exit(1);
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('\x1b[31mError: DATABASE_URL environment variable is not set!\x1b[0m');
  console.log('Make sure your .env file contains:');
  console.log('DATABASE_URL=your_database_url');
  process.exit(1);
}

console.log('\x1b[32m✓ Environment variables loaded successfully\x1b[0m');
console.log(`Using database: ${process.env.DATABASE_URL.split('@')[1].split('/')[0]}`);

// Start the server
console.log('\x1b[34mStarting server...\x1b[0m');
const server = exec('node -r dotenv/config --loader tsx server/index.ts');

server.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.error('\x1b[31m' + data.toString().trim() + '\x1b[0m');
});

server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.kill();
  process.exit(0);
});