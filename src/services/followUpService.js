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
    .update({ status, created_at: new Date().toISOString() }) // Use created_at as a proxy for updated if not present, but schema has created_at
    .eq('id', id)
  if (error) throw error
}

export async function rescheduleFollowUp(id, newDate) {
  const { error } = await supabase
    .from('follow_ups')
    .update({ scheduled_at: newDate, status: 'pending' })
    .eq('id', id)
  if (error) throw error
}

