// SECURITY: Never hardcode API keys. Use environment variables instead.
// This file should only be used for local testing with your own API key.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
  console.error('❌ ERROR: Please set your GEMINI_API_KEY environment variable');
  console.error('Usage: GEMINI_API_KEY=your_key_here node list-gemini-models.js');
  process.exit(1);
}

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    const data = await response.json();

    console.log('Available Gemini Models:\n');
    data.models?.forEach(model => {
      console.log(`Model: ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
