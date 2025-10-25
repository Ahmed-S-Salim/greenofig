// Local test script for Gemini API
// SECURITY: Never hardcode API keys. Use environment variables instead.
// Run with: GEMINI_API_KEY=your_key_here node test-gemini-local.js

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
  console.error('❌ ERROR: Please set your GEMINI_API_KEY environment variable');
  console.error('Usage: GEMINI_API_KEY=your_key_here node test-gemini-local.js');
  process.exit(1);
}

async function testGemini() {
  const testMessage = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'You are a friendly health coach. Give me a healthy breakfast idea. Keep it concise.' }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  };

  try {
    console.log('Testing Gemini API...\n');

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error:', errorData);
      return;
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log('✅ Success! Gemini Response:\n');
    console.log(reply);
    console.log('\n🎉 Your Gemini API is working! You can now deploy the Edge Function.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();
