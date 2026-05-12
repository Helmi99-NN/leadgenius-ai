import { supabase } from '../lib/supabase'

export async function getFollowUps() {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, leads(company, contact, initials, score, category)')
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function updateFollowUpStatus(id, status) {
  const { error } = await supabase
    .from('follow_ups')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}
