const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://dlukbrvgddglgshhnfqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdWticnZnZGRnbGdzaGhuZnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMDA5NzgsImV4cCI6MjA0NDU3Njk3OH0.IFoTQZdmZS1M1vQPNpLXDDV_EeKQ3cBCd00Fo8B9fD0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getFeatures() {
  const { data, error } = await supabase
    .from('features')
    .select('name, category, plan_tier')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('\n=== ALL FEATURES FROM DATABASE ===\n');

    const grouped = {};
    data.forEach(f => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push(f);
    });

    Object.keys(grouped).forEach(cat => {
      console.log(`${cat}:`);
      grouped[cat].forEach(f => {
        console.log(`  - [${f.plan_tier || 'Basic'}] ${f.name}`);
      });
      console.log('');
    });
  }
}

getFeatures();
