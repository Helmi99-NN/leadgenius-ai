// ============================================
// LeadGenius AI — Machine Reply Database Service
// CRUD operations untuk mesin dan template jawaban
// ============================================

import { supabase } from '../lib/supabase'

// ── MACHINES ──

/**
 * Ambil semua mesin, diurutkan berdasarkan nama
 */
export async function getMachines() {
  const { data, error } = await supabase
    .from('machines')
    .select('*, machine_replies(count)')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Cari mesin berdasarkan nama (untuk autocomplete)
 */
export async function searchMachines(query) {
  const { data, error } = await supabase
    .from('machines')
    .select('id, name, description, category')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })
    .limit(10)

  if (error) throw error
  return data || []
}

/**
 * Tambah mesin baru (atau return existing jika nama sudah ada)
 */
export async function addMachine(name, description = '', category = '') {
  // Cek apakah sudah ada
  const { data: existing } = await supabase
    .from('machines')
    .select('id, name')
    .ilike('name', name.trim())
    .limit(1)

  if (existing && existing.length > 0) {
    return { data: existing[0], isExisting: true }
  }

  const { data, error } = await supabase
    .from('machines')
    .insert({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
    })
    .select()
    .single()

  if (error) throw error
  return { data, isExisting: false }
}

/**
 * Update mesin
 */
export async function updateMachine(id, updates) {
  const { data, error } = await supabase
    .from('machines')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Hapus mesin beserta semua reply template-nya
 */
export async function deleteMachine(id) {
  const { error } = await supabase
    .from('machines')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// ── MACHINE REPLIES ──

/**
 * Ambil semua reply template untuk mesin tertentu
 */
export async function getMachineReplies(machineId) {
  const { data, error } = await supabase
    .from('machine_replies')
    .select('*')
    .eq('machine_id', machineId)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Tambah reply template baru
 */
export async function addMachineReply(machineId, question, answer, tags = []) {
  const { data, error } = await supabase
    .from('machine_replies')
    .insert({
      machine_id: machineId,
      question: question.trim(),
      answer: answer.trim(),
      tags,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update reply template
 */
export async function updateMachineReply(id, updates) {
  const { data, error } = await supabase
    .from('machine_replies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Hapus reply template
 */
export async function deleteMachineReply(id) {
  const { error } = await supabase
    .from('machine_replies')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * Increment usage count saat reply digunakan
 */
export async function incrementReplyUsage(id) {
  const { data, error } = await supabase.rpc('increment_reply_usage', { reply_id: id })
  // Fallback: manual update jika RPC tidak tersedia
  if (error) {
    const { data: current } = await supabase
      .from('machine_replies')
      .select('usage_count')
      .eq('id', id)
      .single()

    if (current) {
      await supabase
        .from('machine_replies')
        .update({ usage_count: (current.usage_count || 0) + 1 })
        .eq('id', id)
    }
  }
  return data
}

/**
 * Cari jawaban berdasarkan nama mesin dan kata kunci pertanyaan
 * Digunakan oleh Gemini service untuk memperkaya konteks
 */
export async function findRelevantReplies(machineName, keyword = '') {
  let query = supabase
    .from('machine_replies')
    .select('*, machines!inner(name)')

  if (machineName) {
    query = query.ilike('machines.name', `%${machineName}%`)
  }

  if (keyword) {
    // Pecah keyword menjadi kata-kata (ambil yang panjangnya > 2 agar lebih akurat)
    const words = keyword.split(' ').filter(w => w.length > 2)
    if (words.length > 0) {
      // Buat query OR untuk setiap kata, baik di question maupun answer
      const orConditions = words.map(w => `question.ilike.%${w}%,answer.ilike.%${w}%`).join(',')
      query = query.or(orConditions)
    } else {
      // Fallback jika tidak ada kata valid
      query = query.or(`question.ilike.%${keyword}%,answer.ilike.%${keyword}%`)
    }
  }

  // Ambil hingga 30 data (Gemini token cukup besar)
  const { data, error } = await query.order('usage_count', { ascending: false }).limit(30)

  if (error) throw error
  return data || []
}
