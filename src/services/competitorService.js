import { supabase } from '../lib/supabase'

export async function getCompetitors() {
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .order('threat', { ascending: false })

  if (error) throw error
  return data || []
}

export async function addCompetitor(competitorData) {
  const { data, error } = await supabase
    .from('competitors')
    .insert(competitorData)
    .select()
    .single()

  if (error) throw error
  return data
}
