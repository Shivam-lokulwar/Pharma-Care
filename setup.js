#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up PharmaCare Pharmacy Management System...\n');

// Create .env files
const frontendEnv = `VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=PharmaCare Management System`;

const backendEnv = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/pharmacy_management

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=pharmacare_super_secret_jwt_key_${Date.now()}
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`;

try {
  // Create frontend .env
  fs.writeFileSync('.env', frontendEnv);
  console.log('Created frontend .env file');

  // Create backend .env
  fs.writeFileSync('server/.env', backendEnv);
  console.log(' Created backend .env file');

  // Install dependencies
  console.log('\n Installing dependencies...');
  
  console.log('Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing backend dependencies...');
  execSync('npm install', { cwd: 'server', stdio: 'inherit' });

  console.log('\nSetup completed successfully!');
  console.log('\n Next steps:');
  console.log('1. Make sure MongoDB is running on your system');
  console.log('2. Start the application with: npm run dev:full');
  console.log('3. Open http://localhost:5173 in your browser');
  console.log('\n Default login credentials:');
  console.log('Admin: username=admin, password=admin123');
  console.log('Staff: username=staff, password=staff123');

} catch (error) {
  console.error('Setup failed:', error.message);
  process.exit(1);
}

