import { supabase } from '../lib/supabase'

export async function getNotifications(filter = 'all') {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter !== 'all') {
    const typeMap = {
      'followup': 'followup',
      'new-lead': 'new-lead',
      'competitor': 'competitor',
    }
    if (typeMap[filter]) {
      query = query.eq('type', typeMap[filter])
    }
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function markAllRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false)
  if (error) throw error
}

export async function getUnreadNotificationCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)
  
  if (error) throw error
  return count || 0
}
