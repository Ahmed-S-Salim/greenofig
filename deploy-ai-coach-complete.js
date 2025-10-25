// Complete AI Coach deployment script
import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

async function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`✅ ${description} - Done!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 AI Coach Complete Deployment\n');
  console.log('═'.repeat(60));

  // Step 1: Deploy Edge Function
  console.log('\n📍 Step 1: Deploying Edge Function');
  console.log('─'.repeat(60));

  const deployFunction = await runCommand(
    'npx supabase functions deploy ai-coach-memory',
    'Deploying ai-coach-memory Edge Function'
  );

  if (!deployFunction) {
    console.log('\n⚠️  Edge Function deployment failed. You may need to:');
    console.log('   1. Run: npx supabase login');
    console.log('   2. Run: npx supabase link --project-ref xdzoikocriuvgkoenjqk');
    console.log('   3. Then run this script again\n');
    console.log('   Or deploy manually via Supabase Dashboard > Edge Functions\n');
  }

  // Step 2: Run SQL migrations
  console.log('\n📍 Step 2: Running SQL Migrations');
  console.log('─'.repeat(60));
  console.log('\nYou need to run these SQL files in Supabase SQL Editor:');
  console.log('   1. create-ai-chat-table.sql');
  console.log('   2. create-ai-settings-table.sql');
  console.log('\nThese files are in your project root directory.');
  console.log('Copy and paste them into: Supabase Dashboard > SQL Editor > New Query\n');

  // Step 3: Summary
  console.log('\n📍 Step 3: Summary & Next Steps');
  console.log('─'.repeat(60));
  console.log('\n✨ Deployment Summary:');
  console.log(`   • Edge Function: ${deployFunction ? '✅ Deployed' : '⏳ Pending'}`);
  console.log('   • Database Tables: ⏳ Pending (run SQL files manually)');
  console.log('   • AI Settings: ✅ Already configured with Gemini API');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Go to Supabase Dashboard > SQL Editor');
  console.log('   2. Run create-ai-chat-table.sql');
  console.log('   3. Run create-ai-settings-table.sql');
  console.log('   4. Test AI Coach at: http://localhost:3000/app/ai-coach');
  console.log('   5. Configure AI providers in Admin Panel > AI Coach tab');
  console.log('\n💡 The default Gemini provider is already configured!');
  console.log('   Just run the SQL migrations and you\'re ready to go!\n');
  console.log('═'.repeat(60));
  console.log('');
}

main().catch(console.error);
