import { supabase } from '../lib/supabase'

// Ambil semua leads, dikelompokkan per kategori
export async function getLeadsByCategory() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('score', { ascending: false })

  if (error) throw error

  return {
    hot: data.filter((l) => l.category === 'hot'),
    warm: data.filter((l) => l.category === 'warm'),
    cold: data.filter((l) => l.category === 'cold'),
  }
}

// Ambil detail lead + chat history
export async function getLeadDetail(leadId) {
  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadErr) throw leadErr

  const { data: chats } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true })

  return { ...lead, chatHistory: chats || [] }
}

// Ambil statistik untuk dashboard
export async function getLeadStats() {
  const { data, error } = await supabase.from('leads').select('*')
  if (error) throw error

  const hot = data.filter((l) => l.category === 'hot').length
  const warm = data.filter((l) => l.category === 'warm').length
  const cold = data.filter((l) => l.category === 'cold').length
  const total = data.length
  const avgScore = total > 0 ? Math.round(data.reduce((s, l) => s + l.score, 0) / total) : 0

  return { hot, warm, cold, total, avgScore }
}

// Update kategori lead
export async function updateLeadCategory(leadId, category) {
  const { error } = await supabase
    .from('leads')
    .update({ category, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) throw error
}

// Hapus lead beserta semua data terkait (CASCADE dari schema)
export async function deleteLead(leadId) {
  // Hapus notifikasi terkait (ON DELETE SET NULL, jadi perlu hapus manual)
  await supabase.from('notifications').delete().eq('lead_id', leadId)
  
  // Hapus generated_replies terkait (ON DELETE SET NULL)
  await supabase.from('generated_replies').delete().eq('lead_id', leadId)

  // Hapus lead (chat_messages & follow_ups akan CASCADE otomatis)
  const { error } = await supabase.from('leads').delete().eq('id', leadId)
  if (error) throw error
}
