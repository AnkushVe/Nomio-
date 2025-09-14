const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up TravelPlanner...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `GEMINI_API_KEY=your_gemini_api_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
PORT=5000`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
  console.log('📝 Please add your API keys to the .env file:');
  console.log('   - Get Gemini API key: https://makersuite.google.com/app/apikey');
  console.log('   - Get Mapbox token: https://www.mapbox.com/account/access-tokens');
  console.log('   - Note: Mapbox token is used for both backend and frontend\n');
} else {
  console.log('✅ .env file already exists\n');
}

console.log('📋 Next steps:');
console.log('1. Add your API keys to the .env file');
console.log('2. Run: npm run install-all');
console.log('3. Run: npm run dev');
console.log('4. Open http://localhost:3000 in your browser\n');

console.log('🎉 Setup complete! Happy traveling!');
