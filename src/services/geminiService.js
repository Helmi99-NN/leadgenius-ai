// ============================================
// LeadGenius AI — Gemini Vision Service
// Analisis screenshot chat dengan Gemini AI
// ============================================
import { findRelevantReplies } from './machineService'
import shopeeProducts from '../data/shopee_products.json'

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
// ── HELPER: Cari produk relevan dari database Shopee ──
// Menggunakan skor relevansi berbasis kata kunci inti (bukan filter mentah)
function searchShopeeProducts(queryText) {
  // Kata-kata umum yang TIDAK BERMAKNA untuk pencarian mesin (stop words)
  const stopWords = ['berapa', 'harga', 'yang', 'ada', 'bisa', 'untuk', 'ini', 'itu', 'apa',
    'mau', 'minta', 'dong', 'min', 'kak', 'bang', 'mas', 'pak', 'halo', 'hai', 'saya',
    'apakah', 'bagaimana', 'gimana', 'tolong', 'kasih', 'tau', 'tahu', 'dengan',
    'dan', 'atau', 'dari', 'tidak', 'juga', 'sudah', 'belum', 'lagi', 'per', 'nya']

  // Pecah query menjadi kata kunci bermakna (buang stop words)
  const rawWords = queryText.toLowerCase().replace(/[^\w\s,./]/g, '').split(/\s+/)
  const keywords = rawWords.filter(w => w.length > 1 && !stopWords.includes(w))

  if (keywords.length === 0) return []

  // Hitung skor relevansi setiap produk
  const scored = shopeeProducts.map(p => {
    const judulLower = (p.judul || '').toLowerCase()
    const deskLower = (p.deskripsi || '').toLowerCase()
    let score = 0

    for (const kw of keywords) {
      // Cocok di JUDUL = bobot tinggi (3 poin)
      if (judulLower.includes(kw)) score += 3
      // Cocok di DESKRIPSI = bobot sedang (1 poin)
      if (deskLower.includes(kw)) score += 1
    }
    return { ...p, relevanceScore: score }
  })

  // Ambil hanya yang punya skor > 0, urutkan dari paling relevan
  return scored
    .filter(p => p.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
}

// ── HELPER: Format produk menjadi konteks teks untuk AI ──
function formatProductContext(products, maxItems = 10) {
  if (!products || products.length === 0) return ''

  // Deduplikasi: Kelompokkan produk yang judulnya mirip >80%
  const seen = new Set()
  const unique = []
  for (const p of products) {
    const normalizedTitle = p.judul.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40)
    if (!seen.has(normalizedTitle)) {
      seen.add(normalizedTitle)
      unique.push(p)
    }
    if (unique.length >= maxItems) break
  }

  let ctx = `\n[SUMBER DATA 1: KATALOG PRODUK RESMI PERUSAHAAN]\n`
  ctx += `Berikut ${unique.length} produk yang paling relevan dengan pertanyaan pelanggan:\n\n`
  unique.forEach((p, i) => {
    ctx += `PRODUK ${i + 1}:\n`
    ctx += `  Nama: ${p.judul}\n`
    ctx += `  Harga: Rp ${Number(p.harga).toLocaleString('id-ID')}\n`
    // Kirim deskripsi LENGKAP (maks 600 karakter) agar spesifikasi tidak terpotong
    const deskripsi = (p.deskripsi || '').replace(/\\n/g, ' ').substring(0, 600)
    ctx += `  Spesifikasi: ${deskripsi}\n\n`
  })
  return ctx
}

export async function analyzeChatScreenshot(base64Image, mimeType = 'image/jpeg') {
  // ── LANGKAH 1: Baca gambar dulu untuk mendeteksi produk apa yang dibahas ──
  // Kita akan mengirim gambar DAN data katalog ke AI sekaligus
  // Agar AI bisa langsung menjawab dengan harga & spek yang akurat
  
  // Siapkan ringkasan seluruh katalog produk (judul + harga saja, hemat token)
  let catalogSummary = ''
  try {
    const allProducts = shopeeProducts.map(p => 
      `- ${p.judul} | Harga: Rp ${Number(p.harga).toLocaleString('id-ID')}`
    ).join('\n')
    catalogSummary = `\n\n[DATABASE KATALOG PRODUK PERUSAHAAN]\nAnda WAJIB menggunakan data harga dan spesifikasi dari katalog ini untuk membuat balasan. DILARANG MENGARANG HARGA.\n${allProducts}\n`
  } catch (err) {
    console.warn('Gagal memuat katalog untuk analisis chat:', err)
  }

  // Tambahkan konteks dari database WA
  let waContext = ''
  try {
    const allReplies = await findRelevantReplies('', '')
    if (allReplies.length > 0) {
      waContext = `\n[DATABASE PENGETAHUAN INTERNAL]\n`
      allReplies.slice(0, 15).forEach(r => {
        waContext += `- ${r.machines?.name}: ${r.question} → ${r.answer}\n`
      })
    }
  } catch (err) {
    console.warn('Gagal memuat konteks WA:', err)
  }

  const prompt = `Kamu adalah AI Sales Intelligence Analyst untuk perusahaan mesin CV Asianindo.

ANALISIS screenshot chat ini dan berikan respons dalam format JSON yang VALID (tanpa markdown code block, langsung JSON saja).

ATURAN KRITIS:
1. BACA DATABASE KATALOG PRODUK di bawah ini SEBELUM membuat balasan.
2. Jika pelanggan menanyakan harga/spek mesin, GUNAKAN DATA DARI KATALOG. DILARANG KERAS mengarang harga atau spesifikasi.
3. Jika produk yang ditanyakan pelanggan ada di katalog, sebutkan harga, kapasitas, dan spek yang relevan.
4. Semua balasan HARUS dalam Bahasa Indonesia.
${catalogSummary}
${waContext}

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
  "bestReply": "rekomendasi balasan terbaik berdasarkan DATA KATALOG (sertakan harga & spek asli jika relevan)",
  "replies": {
    "hard": ["balasan gaya penjualan agresif opsi 1", "balasan gaya agresif opsi 2"],
    "soft": ["balasan gaya penjualan halus opsi 1", "balasan gaya halus opsi 2"],
    "authority": ["balasan gaya otoritas opsi 1", "balasan gaya otoritas opsi 2"],
    "scarcity": ["balasan gaya kelangkaan opsi 1", "balasan gaya kelangkaan opsi 2"]
  }
}

PENTING:
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
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  }

  let lastError = null

  for (const model of MODELS) {
    try {
      console.log(`[Gemini] Mencoba model: ${model}`)
      const url = getApiUrl(model)

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.status === 429) {
        console.warn(`[Gemini] Rate limited pada ${model}. Pindah ke model berikutnya...`)
        lastError = new Error(`Rate limit pada ${model}.`)
        continue
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`
        console.warn(`[Gemini] Error pada ${model}: ${errMsg}`)
        lastError = new Error(errMsg)
        continue
      }

      const data = await response.json()
      let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      rawText = rawText.trim()
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '')
      }

      try {
        const result = JSON.parse(rawText)
        console.log(`[Gemini] ✅ Berhasil dengan model: ${model}`)
        return result
      } catch (parseError) {
        console.error('[Gemini] Gagal parse JSON:', rawText)
        // Auto-heal
        const lastBrace = rawText.lastIndexOf('}')
        if (lastBrace !== -1) {
          try {
            return JSON.parse(rawText.substring(0, lastBrace + 1))
          } catch (e) { /* fallthrough */ }
        }
        lastError = new Error('Gagal memproses respons AI. Coba upload ulang gambar.')
        continue
      }
    } catch (fetchError) {
      console.error(`[Gemini] Fetch error pada ${model}:`, fetchError)
      lastError = fetchError
      continue
    }
  }

  throw new Error(
    lastError?.message || 'Semua model Gemini gagal. Coba lagi nanti.'
  )
}

/**
 * Analisis Teks Chat menggunakan Gemini API
 * Digunakan untuk Share Target PWA di Mobile
 * @param {string} textContent - Teks chat
 * @returns {Promise<Object>} Hasil analisis AI
 */
export async function analyzeChatText(textContent) {
  const prompt = `Kamu adalah AI Sales Intelligence Analyst untuk marketplace (Shopee, Tokopedia, dll).

Analisis TEKS CHAT ini dan berikan respons dalam format JSON yang VALID (tanpa markdown code block, langsung JSON saja).

TEKS CHAT:
"""
${textContent}
"""

Format JSON yang diharapkan sama persis seperti ini:
{
  "customerName": "nama pelanggan (atau 'Pelanggan' jika tidak ada)",
  "score": angka 0-100 (skor probabilitas closing),
  "category": "hot" atau "warm" atau "cold",
  "sentiment": "deskripsi singkat sentimen pelanggan",
  "transcript": "transkrip percakapan aslinya",
  "insights": [
    {"text": "insight 1 tentang niat beli", "priority": "high/medium/low"},
    {"text": "insight 2 tentang urgensi", "priority": "high/medium/low"},
    {"text": "insight 3 tentang sensitivitas harga", "priority": "high/medium/low"}
  ],
  "product": "produk yang dibahas",
  "intent": "deskripsi niat pembelian",
  "isCustomerLastMessage": boolean (true jika pesan terakhir dikirim oleh pelanggan),
  "bestReply": "rekomendasi balasan terbaik",
  "replies": {
    "hard": ["opsi 1", "opsi 2"],
    "soft": ["opsi 1", "opsi 2"],
    "authority": ["opsi 1", "opsi 2"],
    "scarcity": ["opsi 1", "opsi 2"]
  }
}

PENTING:
- Semua balasan HARUS dalam Bahasa Indonesia
- Analisis berdasarkan teks yang diberikan.`

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
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

      if (response.status === 429) continue

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return JSON.parse(rawText)
    } catch (err) {
      lastError = err
    }
  }

  throw new Error(lastError?.message || 'Semua model gagal.')
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
 * Ekstrak informasi/pengetahuan dari gambar (screenshot chat, brosur, catatan tangan, dll)
 * Hasil langsung siap disimpan ke database knowledge base
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - MIME type gambar
 * @returns {Promise<Array>} Array of {question, answer}
 */
export async function extractKnowledgeFromImage(base64Image, mimeType = 'image/jpeg') {
  const prompt = `Kamu adalah AI Data Engineer yang SANGAT TELITI. Tugasmu adalah membaca gambar ini dan mengekstrak SEMUA informasi penting yang terkandung di dalamnya.

Gambar ini bisa berupa:
- Screenshot obrolan chat (WhatsApp, Shopee, dll)
- Foto brosur/katalog produk
- Foto catatan tangan
- Screenshot tabel harga
- Foto spesifikasi mesin
- Atau dokumen apapun

ATURAN EKSTRAKSI:
1. BACA GAMBAR DENGAN SANGAT TELITI, jangan lewatkan satu informasi pun.
2. Ekstrak SETIAP informasi menjadi format {"question": "...", "answer": "..."}.
3. "question" = Judul ringkas dari informasi tersebut. Contoh: "Mesin Vacuum Frying - Kapasitas 5kg", "Kebijakan Garansi", "Alamat Pabrik".
4. "answer" = Detail lengkap informasi tersebut termasuk angka, harga, spesifikasi, ukuran, dll.
5. Jika ada HARGA, pastikan ditulis lengkap dengan nominal Rupiah.
6. Jika ada SPESIFIKASI TEKNIS (kapasitas, dimensi, daya, material), tulis SELENGKAP mungkin.
7. Jika ada beberapa produk/mesin berbeda, buatkan entry terpisah untuk masing-masing.
8. Jika gambar TIDAK BISA DIBACA atau buram, kembalikan array kosong: []

Balas HANYA dengan JSON Array murni tanpa format markdown:
[
  {"question": "Judul Informasi 1", "answer": "Detail lengkap informasi 1"},
  {"question": "Judul Informasi 2", "answer": "Detail lengkap informasi 2"}
]`

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
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
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

      if (response.status === 429) continue
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

      rawText = rawText.trim()
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '')
      }

      try {
        const parsed = JSON.parse(rawText)
        return Array.isArray(parsed) ? parsed : []
      } catch (parseErr) {
        // Auto-heal jika terpotong
        const lastBrace = rawText.lastIndexOf('}')
        if (lastBrace !== -1) {
          const fixed = rawText.substring(0, lastBrace + 1) + '\n]'
          const arr = JSON.parse(fixed)
          return Array.isArray(arr) ? arr : []
        }
        throw parseErr
      }
    } catch (err) {
      lastError = err
    }
  }

  throw new Error('Gagal menganalisis gambar: ' + (lastError?.message || 'Semua model gagal'))
}

/**
 * Generate balasan berdasarkan konteks (dari Generator Balasan page)
 * Memanfaatkan database mesin untuk memperkaya rekomendasi
 */
export async function generateReplyFromContext(customerMessage, toneValue, leadContext = null, chatContext = '') {
  // ── 1. PENCARIAN CERDAS: Cari produk yang relevan menggunakan skor ──
  let dbContext = ''

  try {
    const relevantProducts = searchShopeeProducts(customerMessage)
    const formattedCtx = formatProductContext(relevantProducts, 10)
    if (formattedCtx) {
      dbContext += formattedCtx
    }
    console.log(`[RAG] Ditemukan ${relevantProducts.length} produk relevan, mengirim ${Math.min(relevantProducts.length, 10)} ke AI`)
  } catch (err) {
    console.warn('Gagal memuat konteks shopee:', err)
  }

  // ── 2. Cari di Database Pengetahuan Internal (Hasil Import WA) ──
  try {
    // Buat keyword pencarian yang bersih
    const stopWords = ['berapa', 'harga', 'yang', 'ada', 'bisa', 'untuk', 'ini', 'itu', 'apa',
      'mau', 'minta', 'dong', 'min', 'kak', 'bang', 'mas', 'pak', 'halo', 'hai', 'saya',
      'apakah', 'bagaimana', 'gimana', 'tolong', 'kasih', 'tau', 'tahu', 'dengan',
      'dan', 'atau', 'dari', 'tidak', 'juga', 'sudah', 'belum', 'lagi', 'per', 'nya']
    const cleanKeywords = customerMessage.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.includes(w)).join(' ')

    const relevantReplies = await findRelevantReplies('', cleanKeywords)
    if (relevantReplies.length > 0) {
      dbContext += `\n[SUMBER DATA 2: DATABASE PENGETAHUAN INTERNAL (FAQ & HISTORI)]\nBerikut adalah catatan historis, keunggulan teknis, atau kebijakan perusahaan terkait mesin tersebut:\n`
      relevantReplies.forEach((r, i) => {
        dbContext += `- Topik: ${r.machines?.name} | Tanya/Judul: "${r.question}" | Jawab/Fakta: "${r.answer}"\n`
      })
      dbContext += `\n`
    }
  } catch (err) {
    console.warn('Gagal memuat konteks mesin database:', err)
  }

  let toneDescription = 'seimbang'
  if (toneValue < 30) toneDescription = 'sangat formal dan profesional'
  else if (toneValue < 45) toneDescription = 'sedikit formal tapi sopan'
  else if (toneValue > 70) toneDescription = 'sangat santai, ramah, layaknya teman'
  else if (toneValue > 55) toneDescription = 'sedikit santai dan akrab'

  const prompt = `Kamu adalah AI Sales Assistant ahli untuk perusahaan CV Asianindo (produsen mesin industri makanan/pertanian).

ATURAN PALING PENTING (CRITICAL):
1. DILARANG KERAS berhalusinasi (mengarang) HARGA, KAPASITAS, ATAU SPESIFIKASI.
2. BACA SELURUH [SUMBER DATA] di bawah dengan TELITI sebelum menjawab.
3. Jika pelanggan bertanya tentang produk/mesin, cari data yang cocok di SUMBER DATA lalu gunakan harga, kapasitas, dan spesifikasi PERSIS seperti yang tertulis.
4. Jika ada BEBERAPA varian kapasitas, SEBUTKAN SEMUA varian beserta harganya masing-masing.
5. Jika produk yang ditanyakan TIDAK ADA di sumber data, jawab dengan ramah bahwa Anda perlu mengecek dulu ke gudang dan akan segera memberikan info.
6. PENTING: DILARANG menggunakan kata sapaan "Anda", "Bapak", atau "Ibu". SELALU gunakan sapaan "Kak" atau "Kakak" di semua varian balasan.

---
PESAN PELANGGAN: "${customerMessage}"
${chatContext ? `KONTEKS OBROLAN SEBELUMNYA: "${chatContext}"\n` : ''}
${leadContext ? `INFO PELANGGAN: ${leadContext.company} (${leadContext.category})\n` : ''}
${dbContext}
---

Instruksi Penulisan:
- Tone Bahasa: ${toneDescription} (Tingkat Santai: ${toneValue}/100, di mana 1=Kaku Formal, 100=Teman Akrab).
- Pastikan angka Rupiah dan satuan (kg, liter, watt) ditulis AKURAT PERSIS seperti data referensi.
- Jika ada beberapa varian kapasitas mesin yang dimaksud, WAJIB sebutkan semuanya.

Berikan 3 opsi balasan (yang berbeda gaya penyampaiannya namun ISI INFORMASINYA TETAP SAMA sesuai referensi data).
Balas dengan format JSON murni tanpa format markdown/kode backtick:
{
  "replies": {
    "hard": ["balasan penjualan agresif/mendesak 1", "balasan mendesak 2", "balasan mendesak 3"],
    "soft": ["balasan ramah/konsultatif 1", "balasan ramah 2", "balasan ramah 3"],
    "authority": ["balasan menonjolkan kualitas/jaminan garansi pabrik 1", "balasan otoritas/ahli 2", "balasan otoritas 3"],
    "scarcity": ["balasan menonjolkan promo/kelangkaan stok 1", "balasan kelangkaan 2", "balasan kelangkaan 3"]
  }
}`

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { 
      temperature: 0.7, 
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'
    },
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
        console.warn(`[Gemini] Rate limited pada ${model}. Pindah model...`)
        continue
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      // Bersihkan jika AI mengembalikan format markdown
      rawText = rawText.trim()
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '')
      }

      // Hapus karakter kontrol seperti literal newline/tab yang sering merusak JSON string
      rawText = rawText.replace(/[\n\r\t]+/g, ' ')

      if (!rawText) {
        throw new Error("AI mengembalikan respons kosong (Mungkin karena diblokir filter keamanan).")
      }

      try {
        const result = JSON.parse(rawText)
        return result.replies
      } catch (parseErr) {
        console.warn('JSON Parse Error di Generator Balasan, mencoba memperbaiki...', parseErr)
        // Auto-heal jika terpotong
        const lastBraceIndex = rawText.lastIndexOf('}')
        if (lastBraceIndex !== -1) {
          const fixedText = rawText.substring(0, lastBraceIndex + 1)
          const result = JSON.parse(fixedText)
          if (result.replies) return result.replies
        }
        throw parseErr
      }
    } catch (err) {
      lastError = err
    }
  }

  throw new Error('Gagal generate balasan: ' + (lastError?.message || 'Semua model gagal'))
}

/**
 * Ekstrak histori chat WhatsApp mentah menjadi daftar Q&A
 * @param {string} chatHistory - Teks mentah ekspor WA
 * @returns {Promise<Array>} Array of {question, answer}
 */
export async function extractFAQFromChat(chatHistory) {
  // 1. Pecah histori chat yang sangat panjang menjadi blok-blok berukuran 15,000 karakter
  // Ini memastikan TIDAK ADA DATA yang terlewat atau terpotong karena batas sistem AI
  const chunkSize = 15000;
  const chunks = [];
  for (let i = 0; i < chatHistory.length; i += chunkSize) {
    chunks.push(chatHistory.substring(i, i + chunkSize));
  }

  console.log(`[Gemini] Memproses ${chunks.length} blok teks WhatsApp...`);
  const allExtracted = [];

  // 2. Proses secara berurutan agar tidak terkena Rate Limit (Terlalu Banyak Request)
  for (let index = 0; index < chunks.length; index++) {
    const chunkText = chunks[index];
    const prompt = `Kamu adalah Ahli Data Mining dan Customer Service Engineer.
Tugasmu adalah menganalisis histori obrolan mentah dari e-commerce (Shopee/WA) dan mengekstrak SEMUA INFORMASI PENTING menjadi basis data Pengetahuan (Knowledge Base).

Fokus pada 3 kategori informasi:
1. SPESIFIKASI PRODUK/MESIN: Segala detail tentang nama mesin, tipe, kapasitas, dimensi, daya listrik, bahan, harga, varian, dan fungsinya.
2. KEBIJAKAN & OPERASIONAL TOKO: Aturan garansi, alamat bengkel/pabrik, sistem pembayaran (DP), ongkos kirim, sistem pre-order (PO), dan waktu pengerjaan.
3. PERTANYAAN UMUM & SOLUSI (FAQ): Pertanyaan spesifik/unik dari pelanggan dan jawaban dari penjual.

Aturan EKSTRAKSI:
1. JANGAN LEWATKAN DETAIL APAPUN. Sekecil apapun detail ukuran, bahan, custom harga, atau waktu PO wajib dicatat.
2. Format "question" (Judul): Buat sespesifik mungkin. 
   - Jika tentang produk: "[Nama Mesin] - [Kapasitas/Varian]"
   - Jika tentang toko/kebijakan: "Info Toko: [Topik]"
   - Jika berupa FAQ spesifik: "Pertanyaan: [Topik Pertanyaan Pelanggan]"
3. Format "answer" (Jawaban): Rangkum dengan SANGAT LENGKAP dan DETAIL. Kamu bebas menggunakan garis datar (-) atau format paragraf agar data terbaca jelas.
4. Jawab HANYA dengan format JSON Array murni, contoh format:
   [
     { "question": "Mesin Spinner Peniris Minyak - Kapasitas 5 Kg", "answer": "- Harga: Rp X\\n- Material: Stainless 304\\n- Daya: X Watt\\n- Bisa custom ukuran tabung" },
     { "question": "Info Toko: Sistem Pembayaran & DP", "answer": "Pemesanan mesin harus menggunakan DP 50%, pelunasan setelah mesin jadi dan siap kirim." }
   ]
5. DILARANG KERAS menggunakan tag markdown (\`\`\`). Output harus langsung dimulai dengan tanda kurung siku buka ([) dan ditutup dengan kurung siku tutup (]).
6. PENTING: Jika di potongan obrolan ini benar-benar tidak ada data penting, balas dengan array kosong: []

Histori Chat Mentah (Bagian ${index + 1} dari ${chunks.length}):
"""
${chunkText}
"""`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.1, 
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      },
    }

    let lastError = null;
    let successForThisChunk = false;

    // Coba memanggil API
    for (const model of MODELS) {
      if (successForThisChunk) break;
      try {
        const url = getApiUrl(model)
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        if (response.status === 429) continue; // Rate limit, coba model lain
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
        
        // Pembersihan Markdown Block
        rawText = rawText.trim()
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '')
        }

        try {
          const parsedArray = JSON.parse(rawText)
          if (Array.isArray(parsedArray)) {
            allExtracted.push(...parsedArray)
          }
          successForThisChunk = true;
        } catch (parseErr) {
          // Auto-Heal JSON jika terpotong
          const lastBraceIndex = rawText.lastIndexOf('}')
          if (lastBraceIndex !== -1) {
            const fixedText = rawText.substring(0, lastBraceIndex + 1) + '\n]'
            const fixedArray = JSON.parse(fixedText)
            if (Array.isArray(fixedArray)) {
              allExtracted.push(...fixedArray)
            }
            successForThisChunk = true;
          } else {
            console.warn(`[Gemini] Gagal parse JSON di chunk ${index + 1}. Melewati chunk ini.`);
            successForThisChunk = true; // Kita skip agar tidak memblokir chunk selanjutnya
          }
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  if (allExtracted.length === 0) {
    console.warn("[Gemini] Selesai, tapi tidak ada mesin yang ditemukan atau terjadi error beruntun.");
  }

  return allExtracted;
}
