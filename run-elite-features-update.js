import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://ppujvavrlryarvjqerqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWp2YXZybHJ5YXJ2anFlcnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NjQwNTAsImV4cCI6MjA0NjE0MDA1MH0.aaqLQ_anoct7wTPEVLFKe8rYbg5TdsmLRokfwxxA-14';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateFeatures() {
  console.log('Updating Doctor Consultations...');
  const { data: data1, error: error1 } = await supabase
    .from('features')
    .update({ 
      name_ar: 'استشارات الأطباء',
      description_ar: 'جدولة استشارات افتراضية مع أطباء مرخصين للمخاوف الصحية والمشورة الطبية.'
    })
    .ilike('name', '%Doctor Consultation%')
    .select();
  
  if (error1) {
    console.error('Error updating Doctor Consultations:', error1);
  } else {
    console.log('✅ Updated Doctor Consultations:', data1);
  }

  console.log('\nUpdating Appointment Scheduling...');
  const { data: data2, error: error2 } = await supabase
    .from('features')
    .update({
      name_ar: 'جدولة المواعيد',
      description_ar: 'حجز المواعيد مع متخصصي الصحة مباشرة من خلال المنصة مع التكامل مع التقويم.'
    })
    .ilike('name', '%Appointment Scheduling%')
    .select();
  
  if (error2) {
    console.error('Error updating Appointment Scheduling:', error2);
  } else {
    console.log('✅ Updated Appointment Scheduling:', data2);
  }

  console.log('\n=== Verification ===');
  const { data: verify, error: verifyError } = await supabase
    .from('features')
    .select('name, name_ar, tier_requirement')
    .in('name_ar', ['استشارات الأطباء', 'جدولة المواعيد']);
  
  if (verifyError) {
    console.error('Error verifying:', verifyError);
  } else {
    console.log('Verified features:');
    verify.forEach(f => {
      console.log(`- ${f.name} → ${f.name_ar} (${f.tier_requirement})`);
    });
  }
  
  process.exit(0);
}

updateFeatures();
