import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { saveAnalyzedLead } from '../services/leadsService'

export function useGlobalChatListener() {
  useEffect(() => {
    console.log('[LeadGenius] Global Chat Listener Aktif')
    
    const subscription = supabase
      .channel('global:incoming_chats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incoming_chats' }, async (payload) => {
        const newChat = payload.new
        if (newChat.status === 'unread') {
          console.log('[LeadGenius] Chat masuk terdeteksi secara global!', newChat)
          
          try {
            // Sesuai permintaan: Masuk Leads (65/Warm), masuk Chat History, set Follow-Up 2 hari, Notif "Prospek Baru"
            const customerName = newChat.customer_name || 'Pelanggan Shopee'
            const analysisResult = {
              customerName: customerName,
              score: 65, // Skor default
              category: 'warm', // Kategori default
              intent: 'Pesan baru dari Shopee',
              sentiment: 'neutral',
              transcript: newChat.message,
              isCustomerLastMessage: true,
              replies: null // Belum digenerate 4 style, nanti di-generate manual di Generator Balasan
            }
            
            await saveAnalyzedLead(analysisResult, { id: 'shopee' })
            console.log('[LeadGenius] Berhasil memasukkan chat ke daftar Leads!')
          } catch (err) {
            console.error('[LeadGenius] Gagal memproses chat global:', err)
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])
}
