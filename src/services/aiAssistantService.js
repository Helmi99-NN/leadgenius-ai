// ============================================
// LeadGenius AI — AI Assistant Service
// Asisten AI yang bisa query & update database
// ============================================

import { supabase } from '../lib/supabase'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
]

function getApiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
}

// System prompt yang menjelaskan kemampuan asisten
const SYSTEM_PROMPT = `Kamu adalah LeadGenius AI Assistant — asisten CRM cerdas untuk seller marketplace.

KEMAMPUAN KAMU:
1. QUERY: Mencari data prospek/lead di database
2. UPDATE: Mengubah data prospek (platform, skor, kategori, kontak, dll)
3. DELETE: Menghapus prospek
4. INFO: Menjawab pertanyaan tentang data dan statistik
5. GENERAL: Menjawab pertanyaan umum tentang penjualan

SCHEMA DATABASE (tabel "leads"):
- id: BIGINT (primary key)
- company: TEXT (nama customer/username)
- contact: TEXT (kontak)
- platform: TEXT (shopee, tokopedia, facebook, instagram, whatsapp, tiktok, dll)
- score: INTEGER (0-100, skor prospek)
- category: TEXT (hot/warm/cold)
- sentiment: TEXT
- context: TEXT (konteks percakapan)
- status: TEXT (active/archived)
- needs_followup: BOOLEAN
- last_message: TEXT
- created_at, updated_at: TIMESTAMP

ATURAN RESPONS:
- SELALU jawab dalam Bahasa Indonesia yang ramah dan ringkas
- Jika diminta melakukan aksi database, kembalikan JSON action
- Jika hanya pertanyaan umum, jawab langsung tanpa action

FORMAT RESPONS (WAJIB JSON):
{
  "reply": "Pesan balasan untuk user",
  "action": null | {
    "type": "query" | "update" | "delete" | "stats",
    "table": "leads",
    "filter": { "column": "value" },
    "updates": { "column": "new_value" },
    "ilike": { "column": "pattern" }
  }
}

CONTOH:
User: "ubah platform navisha ke facebook"
Response: {"reply": "Baik, saya ubah platform customer navisha ke Facebook ✅", "action": {"type": "update", "table": "leads", "ilike": {"company": "navisha"}, "updates": {"platform": "facebook"}}}

User: "berapa total prospek panas?"
Response: {"reply": "Saya cek dulu data prospek panas...", "action": {"type": "stats", "table": "leads", "filter": {"category": "hot"}}}

User: "tampilkan semua prospek"
Response: {"reply": "Berikut daftar semua prospek:", "action": {"type": "query", "table": "leads"}}

User: "halo, apa kabar?"
Response: {"reply": "Halo! Saya LeadGenius AI Assistant 👋 Saya bisa membantu kamu mengelola data prospek. Mau saya bantu apa hari ini?", "action": null}

PENTING: SELALU kembalikan JSON valid. Jangan tambahkan teks di luar JSON.`

// Kirim pesan ke Gemini dan dapatkan respons + action
export async function sendMessage(userMessage, chatHistory = []) {
  // Bangun conversation history untuk Gemini
  const contents = []

  // System instruction sebagai pesan pertama
  contents.push({
    role: 'user',
    parts: [{ text: SYSTEM_PROMPT }],
  })
  contents.push({
    role: 'model',
    parts: [{ text: '{"reply": "Saya siap membantu! Ada yang bisa saya bantu?", "action": null}' }],
  })

  // Tambahkan chat history
  for (const msg of chatHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })
  }

  // Pesan user saat ini
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  })

  // Coba kirim ke model
  for (const model of MODELS) {
    try {
      const response = await fetch(getApiUrl(model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (response.status === 429) continue // Rate limit, coba model lain

      if (!response.ok) {
        const errData = await response.json()
        console.warn(`Model ${model} error:`, errData)
        continue
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) continue

      // Parse JSON response
      try {
        const parsed = JSON.parse(text)
        return parsed
      } catch {
        // Kalau gagal parse, kembalikan sebagai reply biasa
        return { reply: text, action: null }
      }
    } catch (err) {
      console.warn(`Model ${model} gagal:`, err)
      continue
    }
  }

  return { reply: 'Maaf, saya sedang tidak bisa memproses. Coba lagi nanti ya! 🙏', action: null }
}

// Eksekusi action dari AI response
export async function executeAction(action) {
  if (!action) return null
  
  // WHITELIST TABEL: Cegah AI mengakses tabel sensitif (users, auth, dll)
  const ALLOWED_TABLES = ['leads', 'follow_ups', 'chat_messages']
  if (action.table && !ALLOWED_TABLES.includes(action.table)) {
    console.error('⚠️ AI mencoba mengakses tabel terlarang:', action.table)
    return { success: false, error: 'Akses ditolak: AI dilarang mengakses tabel ' + action.table }
  }

  try {
    switch (action.type) {
      case 'query': {
        let query = supabase.from(action.table).select('*')
        if (action.filter) {
          for (const [col, val] of Object.entries(action.filter)) {
            query = query.eq(col, val)
          }
        }
        if (action.ilike) {
          for (const [col, val] of Object.entries(action.ilike)) {
            query = query.ilike(col, `%${val}%`)
          }
        }
        const { data, error } = await query.order('updated_at', { ascending: false }).limit(20)
        if (error) throw error
        return { success: true, data, count: data?.length || 0 }
      }

      case 'update': {
        let query = supabase.from(action.table).update({
          ...action.updates,
          updated_at: new Date().toISOString(),
        })
        if (action.filter) {
          for (const [col, val] of Object.entries(action.filter)) {
            query = query.eq(col, val)
          }
        }
        if (action.ilike) {
          for (const [col, val] of Object.entries(action.ilike)) {
            query = query.ilike(col, `%${val}%`)
          }
        }
        const { data, error } = await query.select()
        if (error) throw error
        return { success: true, data, count: data?.length || 0 }
      }

      case 'delete': {
        let query = supabase.from(action.table).delete()
        if (action.filter) {
          for (const [col, val] of Object.entries(action.filter)) {
            query = query.eq(col, val)
          }
        }
        if (action.ilike) {
          for (const [col, val] of Object.entries(action.ilike)) {
            query = query.ilike(col, `%${val}%`)
          }
        }
        const { data, error } = await query.select()
        if (error) throw error
        return { success: true, data, count: data?.length || 0 }
      }

      case 'stats': {
        let query = supabase.from(action.table).select('*')
        if (action.filter) {
          for (const [col, val] of Object.entries(action.filter)) {
            query = query.eq(col, val)
          }
        }
        const { data, error } = await query
        if (error) throw error
        return {
          success: true,
          count: data?.length || 0,
          data: data?.slice(0, 5), // Sampel data
        }
      }

      default:
        return null
    }
  } catch (err) {
    console.error('Gagal eksekusi action:', err)
    return { success: false, error: err.message }
  }
}
