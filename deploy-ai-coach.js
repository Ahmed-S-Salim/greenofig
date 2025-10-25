// Quick deployment script for AI Coach
// This script helps you deploy the AI Coach with Gemini integration

const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n🤖 AI Coach Deployment Helper\n');
  console.log('This script will help you deploy the AI Coach with Gemini integration.\n');

  // Step 1: Check if database table exists
  console.log('📋 Step 1: Database Setup');
  console.log('─'.repeat(50));
  console.log('\nYou need to run the SQL migration in Supabase:');
  console.log('  File: create-ai-chat-table.sql');
  console.log('  Location: Supabase Dashboard > SQL Editor\n');

  const dbReady = await question('Have you created the ai_chat_messages table? (y/n): ');
  if (dbReady.toLowerCase() !== 'y') {
    console.log('\n⚠️  Please run create-ai-chat-table.sql first, then run this script again.');
    rl.close();
    return;
  }

  // Step 2: Get Gemini API Key
  console.log('\n🔑 Step 2: Gemini API Key');
  console.log('─'.repeat(50));
  console.log('\nGet your Gemini API key from: https://ai.google.dev/');
  console.log('It should start with "AIza..."\n');

  const apiKey = await question('Enter your Gemini API key (or press Enter to skip): ');

  // Step 3: Deploy Edge Function
  console.log('\n🚀 Step 3: Deploy Edge Function');
  console.log('─'.repeat(50));

  const deployChoice = await question('\nHow would you like to deploy?\n  1) Using Supabase CLI (automated)\n  2) Manual (I\'ll do it in the dashboard)\n\nChoice (1 or 2): ');

  if (deployChoice === '1') {
    console.log('\n📦 Checking Supabase CLI...');

    try {
      await execPromise('npx supabase --version');
      console.log('✅ Supabase CLI is available\n');

      // Check if project is linked
      console.log('🔗 Linking to your Supabase project...');
      console.log('Your project ref: xdzoikocriuvgkoenjqk\n');

      const linkProject = await question('Link to project now? (y/n): ');
      if (linkProject.toLowerCase() === 'y') {
        try {
          await execPromise('npx supabase link --project-ref xdzoikocriuvgkoenjqk');
          console.log('✅ Project linked successfully\n');
        } catch (error) {
          console.log('⚠️  Link failed. You might already be linked or need to login first.');
          console.log('   Try: npx supabase login\n');
        }
      }

      // Deploy function
      const deployNow = await question('Deploy the ai-coach-memory function now? (y/n): ');
      if (deployNow.toLowerCase() === 'y') {
        console.log('\n📤 Deploying Edge Function...');
        try {
          const { stdout } = await execPromise('npx supabase functions deploy ai-coach-memory');
          console.log(stdout);
          console.log('✅ Edge Function deployed successfully!\n');
        } catch (error) {
          console.log('❌ Deployment failed:', error.message);
          console.log('\nTry deploying manually via the Supabase Dashboard.\n');
        }
      }

      // Set secret
      if (apiKey && apiKey.trim()) {
        const setSecret = await question('Set the GEMINI_API_KEY secret now? (y/n): ');
        if (setSecret.toLowerCase() === 'y') {
          console.log('\n🔐 Setting secret...');
          try {
            await execPromise(`npx supabase secrets set GEMINI_API_KEY=${apiKey.trim()}`);
            console.log('✅ Secret set successfully!\n');
          } catch (error) {
            console.log('❌ Failed to set secret:', error.message);
            console.log('\nSet it manually in Supabase Dashboard > Project Settings > Edge Functions > Secrets\n');
          }
        }
      }

    } catch (error) {
      console.log('❌ Supabase CLI not available');
      console.log('   Install with: npm install -g supabase\n');
    }

  } else {
    console.log('\n📖 Manual Deployment Steps:');
    console.log('─'.repeat(50));
    console.log('\n1. Go to Supabase Dashboard > Edge Functions');
    console.log('2. Click "Create Function"');
    console.log('3. Name: ai-coach-memory');
    console.log('4. Copy content from: supabase/functions/ai-coach-memory/index.ts');
    console.log('5. Click "Deploy"');

    if (apiKey && apiKey.trim()) {
      console.log('\n6. Go to Project Settings > Edge Functions > Secrets');
      console.log('7. Add secret:');
      console.log('   - Name: GEMINI_API_KEY');
      console.log(`   - Value: ${apiKey.substring(0, 10)}...`);
    }
    console.log('');
  }

  // Step 4: Test
  console.log('\n🧪 Step 4: Testing');
  console.log('─'.repeat(50));
  console.log('\nTo test your AI Coach:');
  console.log('1. Make sure your dev server is running (npm run dev)');
  console.log('2. Navigate to: http://localhost:3000/app/ai-coach');
  console.log('3. Try asking: "Give me a healthy breakfast idea"');
  console.log('\nIf you get errors, check:');
  console.log('  • Edge Function is deployed');
  console.log('  • GEMINI_API_KEY secret is set');
  console.log('  • Database table ai_chat_messages exists');
  console.log('  • You are logged in\n');

  // Optional: Test locally
  if (apiKey && apiKey.trim()) {
    console.log('\n🔬 Optional: Test Gemini API Key Locally');
    console.log('─'.repeat(50));
    const testLocal = await question('\nTest your Gemini API key locally? (y/n): ');

    if (testLocal.toLowerCase() === 'y') {
      console.log('\n🧪 Running local test...\n');

      // Update test file with API key
      const fs = require('fs');
      let testContent = fs.readFileSync('test-gemini-local.js', 'utf8');
      testContent = testContent.replace('YOUR_GEMINI_API_KEY_HERE', apiKey.trim());
      fs.writeFileSync('test-gemini-local.js', testContent);

      try {
        const { stdout, stderr } = await execPromise('node test-gemini-local.js');
        console.log(stdout);
        if (stderr) console.log(stderr);
      } catch (error) {
        console.log('❌ Test failed:', error.message);
      }
    }
  }

  console.log('\n✨ Setup Complete!');
  console.log('─'.repeat(50));
  console.log('\nYour AI Coach is ready to help users achieve their health goals! 🌱\n');

  rl.close();
}

main().catch(console.error);
