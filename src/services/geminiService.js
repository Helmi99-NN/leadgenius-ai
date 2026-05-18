// ============================================
// LeadGenius AI — Gemini Vision Service
// Analisis screenshot chat dengan Gemini AI
// ============================================
import { findRelevantReplies } from './machineService'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Daftar model yang bisa dicoba (fallback jika quota habis)
// Setiap model punya quota terpisah, jadi jika satu habis, coba yang lain
const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
]

function getApiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
}

/**
 * Helper: delay/sleep
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Analisis screenshot chat menggunakan Gemini Vision API
 * Dengan auto-retry dan fallback ke model lain jika quota habis
 * @param {string} base64Image - Base64 encoded image (tanpa prefix data:image/...)
 * @param {string} mimeType - MIME type gambar (image/jpeg, image/png, dll)
 * @returns {Promise<Object>} Hasil analisis AI
 */
export async function analyzeChatScreenshot(base64Image, mimeType = 'image/jpeg') {
  const prompt = `Kamu adalah AI Sales Intelligence Analyst untuk marketplace (Shopee, Tokopedia, dll).

Analisis screenshot chat ini dan berikan respons dalam format JSON yang VALID (tanpa markdown code block, langsung JSON saja).

Format JSON yang diharapkan:
{
  "customerName": "nama pelanggan (dari chat atau tulis 'Pelanggan')",
  "score": angka 0-100 (skor probabilitas closing),
  "category": "hot" atau "warm" atau "cold",
  "sentiment": "deskripsi singkat sentimen pelanggan",
  "transcript": "transkrip percakapan yang dibaca dari screenshot",
  "insights": [
    {"text": "insight 1 tentang niat beli", "priority": "high/medium/low"},
    {"text": "insight 2 tentang urgensi", "priority": "high/medium/low"},
    {"text": "insight 3 tentang sensitivitas harga", "priority": "high/medium/low"}
  ],
  "product": "produk yang dibahas",
  "intent": "deskripsi niat pembelian",
  "isCustomerLastMessage": boolean (true jika pesan terakhir dikirim oleh pelanggan, false jika oleh kita/toko),
  "bestReply": "rekomendasi balasan terbaik dan paling efektif untuk saat ini (BAHASA INDONESIA)",
  "replies": {
    "hard": ["balasan gaya penjualan agresif opsi 1", "balasan gaya agresif opsi 2"],
    "soft": ["balasan gaya penjualan halus opsi 1", "balasan gaya halus opsi 2"],
    "authority": ["balasan gaya otoritas opsi 1", "balasan gaya otoritas opsi 2"],
    "scarcity": ["balasan gaya kelangkaan opsi 1", "balasan gaya kelangkaan opsi 2"]
  }
}

PENTING:
- Semua balasan HARUS dalam Bahasa Indonesia
- Balasan harus relevan dengan konteks percakapan
- Skor tinggi (80-100) = pelanggan sangat tertarik/mau beli
- Skor sedang (40-79) = pelanggan masih mempertimbangkan
- Skor rendah (0-39) = pelanggan hanya browsing/tidak tertarik
- Jika tidak bisa membaca chat, tetap berikan respons dengan score 0 dan catatan di insights`

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  }

  // Coba setiap model, dengan retry jika kena rate limit
  let lastError = null

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`[Gemini] Mencoba model: ${model}, percobaan ${attempt + 1}`)
        const url = getApiUrl(model)

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        // Rate limit — tunggu lalu retry
        if (response.status === 429) {
          const retryAfter = parseRetryAfter(response) || (10 * (attempt + 1))
          console.warn(`[Gemini] Rate limited pada ${model}. Retry dalam ${retryAfter}s...`)
          lastError = new Error(`Rate limit. Menunggu ${retryAfter} detik...`)
          await sleep(retryAfter * 1000)
          continue
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errMsg = errorData?.error?.message || `HTTP ${response.status}`
          console.warn(`[Gemini] Error pada ${model}: ${errMsg}`)
          lastError = new Error(errMsg)
          break // Coba model berikutnya
        }

        const data = await response.json()

        // Ambil teks dari respons Gemini
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Parse JSON dari respons (hapus markdown code block jika ada)
        const cleanedText = rawText
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/gi, '')
          .trim()

        try {
          const result = JSON.parse(cleanedText)
          console.log(`[Gemini] ✅ Berhasil dengan model: ${model}`)
          return result
        } catch (parseError) {
          console.error('[Gemini] Gagal parse JSON:', cleanedText)
          lastError = new Error('Gagal memproses respons AI. Coba upload ulang gambar.')
          break // Coba model berikutnya
        }
      } catch (fetchError) {
        console.error(`[Gemini] Fetch error pada ${model}:`, fetchError)
        lastError = fetchError
        break // Coba model berikutnya
      }
    }
  }

  // Semua model gagal
  throw new Error(
    lastError?.message || 'Semua model Gemini gagal. Coba lagi nanti.'
  )
}

/**
 * Parse retry-after duration dari error response
 */
function parseRetryAfter(response) {
  // Coba baca header Retry-After
  const retryHeader = response.headers.get('Retry-After')
  if (retryHeader) {
    const seconds = parseInt(retryHeader, 10)
    if (!isNaN(seconds)) return Math.min(seconds, 60)
  }
  return null
}

/**
 * Konversi file gambar ke base64
 * @param {File} file - File gambar
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      // Hapus prefix "data:image/jpeg;base64," untuk mendapatkan base64 murni
      const base64 = dataUrl.split(',')[1]
      resolve({ base64, mimeType: file.type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Generate balasan berdasarkan konteks (dari Generator Balasan page)
 * Memanfaatkan database mesin untuk memperkaya rekomendasi
 */
export async function generateReplyFromContext(customerMessage, toneValue, leadContext = null) {
  // Ambil keywords dari pesan (sangat sederhana, bisa diperbaiki dengan NLP/Regex)
  const keywords = customerMessage.split(' ').filter(w => w.length > 3).join(' ')
  
  // Coba cari di database mesin (cari tanpa nama spesifik dulu)
  let dbContext = ''
  try {
    const relevantReplies = await findRelevantReplies('', keywords)
    if (relevantReplies.length > 0) {
      dbContext = `\nBERIKUT ADALAH DATABASE PENGETAHUAN (MESIN & INFO PERUSAHAAN) YANG RELEVAN UNTUK REFERENSIMU:\n`
      relevantReplies.forEach((r, i) => {
        dbContext += `- ${i+1}. Topik/Mesin: ${r.machines?.name}. Info/Pertanyaan: "${r.question}". Jawaban: "${r.answer}"\n`
      })
      dbContext += `Gunakan informasi di atas (jika relevan dengan konteks pelanggan) untuk membuat balasan yang akurat.\n`
    }
  } catch (err) {
    console.warn('Gagal memuat konteks mesin:', err)
  }

  let toneDescription = 'seimbang'
  if (toneValue < 30) toneDescription = 'sangat formal dan profesional'
  else if (toneValue < 45) toneDescription = 'sedikit formal tapi sopan'
  else if (toneValue > 70) toneDescription = 'sangat santai, ramah, layaknya teman'
  else if (toneValue > 55) toneDescription = 'sedikit santai dan akrab'

  const prompt = `Kamu adalah AI Sales Assistant ahli. Buatlah opsi balasan untuk pesan pelanggan berikut.

Pesan Pelanggan: "${customerMessage}"
${leadContext ? `\nKonteks Lead:\nNama/Perusahaan: ${leadContext.company}\nStatus: ${leadContext.category}\n` : ''}
${dbContext}
Tone Penulisan yang Diinginkan: ${toneDescription} (Nilai: ${toneValue}/100, di mana 1=Sangat Formal, 100=Sangat Santai).
Gunakan bahasa Indonesia yang natural, jangan kaku.

Balas dengan format JSON murni:
{
  "replies": {
    "hard": ["balasan penjualan agresif/mendesak 1", "balasan penjualan agresif/mendesak 2", "balasan penjualan agresif/mendesak 3"],
    "soft": ["balasan ramah/konsultatif 1", "balasan ramah/konsultatif 2", "balasan ramah/konsultatif 3"],
    "authority": ["balasan menonjolkan keahlian/kualitas/garansi 1", "balasan menonjolkan otoritas 2", "balasan menonjolkan keahlian 3"],
    "scarcity": ["balasan menonjolkan kelangkaan/urgensi 1", "balasan kelangkaan stok 2", "balasan promo terbatas 3"]
  }
}`

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  }

  let lastError = null

  for (const model of MODELS) {
    try {
      const url = getApiUrl(model)
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.status === 429) {
        await sleep(2000)
        continue
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const cleanedText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
      
      const result = JSON.parse(cleanedText)
      return result.replies
    } catch (err) {
      lastError = err
    }
  }

  throw new Error('Gagal generate balasan: ' + (lastError?.message || 'Semua model gagal'))
}
