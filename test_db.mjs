import { supabase } from './src/lib/supabase.js';

async function test() {
  const {data, error} = await supabase.from('machines').insert({
    name: 'test_machine',
    description: 'test_desc',
    category: 'general'
  }).select();
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
