const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Log environment variables (without exposing sensitive data)
console.log('Environment variables loaded:');
console.log('GH_TOKEN present:', !!process.env.GH_TOKEN);
console.log('NODE_ENV:', process.env.NODE_ENV); 