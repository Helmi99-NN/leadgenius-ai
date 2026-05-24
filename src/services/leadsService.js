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

// Simpan hasil analisis AI ke database
export async function saveAnalyzedLead(result, platformOverride) {
  const customerName = result.customerName || 'Pelanggan Baru'
  const initials = customerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  // 1. CEK DUPLIKAT
  const { data: existingLeads } = await supabase
    .from('leads')
    .select('id, company, score')
    .ilike('company', customerName)
    .limit(1)

  let lead = null
  let isUpdate = false

  if (existingLeads && existingLeads.length > 0) {
    isUpdate = true
    const existingId = existingLeads[0].id
    const { data: updatedLead, error: updateErr } = await supabase
      .from('leads')
      .update({
        score: result.score || existingLeads[0].score,
        category: result.category || 'cold',
        context: result.intent || result.product || '',
        sentiment: result.sentiment || '',
        last_message: result.transcript?.substring(0, 200) || '',
        last_message_time: new Date().toISOString(),
        needs_followup: true,
        updated_at: new Date().toISOString(),
        ...(platformOverride?.id ? { platform: platformOverride.id } : {}),
      })
      .eq('id', existingId)
      .select()
      .single()

    if (updateErr) throw updateErr
    lead = updatedLead || existingLeads[0]
  } else {
    const { data: newLead, error: leadErr } = await supabase.from('leads').insert({
      company: customerName,
      contact: customerName,
      initials,
      platform: platformOverride?.id || 'shopee',
      score: result.score || 0,
      category: result.category || 'cold',
      context: result.intent || result.product || '',
      sentiment: result.sentiment || '',
      last_message: result.transcript?.substring(0, 200) || '',
      last_message_time: new Date().toISOString(),
      needs_followup: true,
    }).select().single()

    if (leadErr) throw leadErr
    lead = newLead
  }

  if (lead) {
    // 2. Simpan transkrip
    if (result.transcript) {
      await supabase.from('chat_messages').insert({
        lead_id: lead.id,
        sender: 'customer',
        message: result.transcript,
      })
    }

    // 3. Follow-up
    const followUpDate = new Date()
    if (!result.isCustomerLastMessage) followUpDate.setDate(followUpDate.getDate() + 2)

    if (isUpdate) {
      const { data: existingFU } = await supabase
        .from('follow_ups')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('status', 'pending')
        .limit(1)

      if (existingFU && existingFU.length > 0) {
        await supabase.from('follow_ups').update({
          scheduled_at: followUpDate.toISOString(),
          ai_draft: result.replies?.soft?.[0] || 'Halo, terima kasih sudah menghubungi kami!',
          description: `Follow-up untuk ${customerName} — ${result.product || 'Produk'}`,
        }).eq('id', existingFU[0].id)
      } else {
        await supabase.from('follow_ups').insert({
          lead_id: lead.id,
          status: 'pending',
          scheduled_at: followUpDate.toISOString(),
          ai_draft: result.replies?.soft?.[0] || 'Halo, terima kasih sudah menghubungi kami!',
          description: `Follow-up untuk ${customerName} — ${result.product || 'Produk'}`,
        })
      }
    } else {
      await supabase.from('follow_ups').insert({
        lead_id: lead.id,
        status: 'pending',
        scheduled_at: followUpDate.toISOString(),
        ai_draft: result.replies?.soft?.[0] || 'Halo, terima kasih sudah menghubungi kami!',
        description: `Follow-up untuk ${customerName} — ${result.product || 'Produk'}`,
      })
    }

    // 4. Notifikasi
    await supabase.from('notifications').insert({
      type: isUpdate ? 'followup' : 'new-lead',
      title: isUpdate ? `Update: ${customerName} (Skor ${result.score})` : `Prospek Baru: ${customerName}`,
      description: `Skor ${result.score}/100 — ${result.category === 'hot' ? '🔥 Panas' : result.category === 'warm' ? '☀️ Hangat' : '❄️ Dingin'}. ${result.intent || result.product || ''}`,
      lead_id: lead.id,
      read: false,
    })

    // 5. Balasan AI
    if (result.replies) {
      if (isUpdate) await supabase.from('generated_replies').delete().eq('lead_id', lead.id)

      const replyRows = []
      for (const [style, texts] of Object.entries(result.replies)) {
        texts.forEach((text) => {
          replyRows.push({ lead_id: lead.id, style, content: text })
        })
      }
      if (replyRows.length > 0) await supabase.from('generated_replies').insert(replyRows)
    }
  }

  return { lead, isUpdate }
}
