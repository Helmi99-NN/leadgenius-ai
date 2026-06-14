const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Fungsi Helper untuk mengupload file (Video) ke Gemini File API
async function uploadToGemini(file) {
  const mimeType = file.type;
  const numBytes = file.size;

  // Simple Upload Request untuk file di bawah 20MB (atau bisa juga dipakai untuk video)
  const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'raw',
      'X-Goog-Upload-Command': 'start, upload',
      'X-Goog-Upload-Header-Content-Length': numBytes,
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': mimeType
    },
    body: file
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('Gagal upload file media ke Gemini: ' + err);
  }

  const data = await response.json();
  return data.file; // berisi uri, name, state
}

// Menunggu hingga video selesai diproses oleh server Google
async function waitForFileActive(fileName) {
  const getUrl = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GEMINI_API_KEY}`;
  
  let isActive = false;
  let attempts = 0;
  while (!isActive && attempts < 15) { // Maksimal tunggu 30 detik (15 x 2 dtk)
    const res = await fetch(getUrl);
    const data = await res.json();
    if (data.state === 'ACTIVE') {
      isActive = true;
      return data;
    } else if (data.state === 'FAILED') {
      throw new Error("Gagal memproses video di server Gemini.");
    }
    // Tunggu 2 detik sebelum cek lagi
    await new Promise(r => setTimeout(r, 2000));
    attempts++;
  }
  throw new Error("Timeout menunggu pemrosesan video.");
}

// Convert File Gambar ke Base64 (untuk gambar lebih cepat pakai inlineData tanpa upload)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Ambil bagian base64-nya saja
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}

export async function analyzeSocialMedia(profileUrl, files = []) {
  if (files.length === 0) {
    throw new Error("Mohon unggah setidaknya 1 video rekaman layar profil atau beberapa gambar screenshot untuk dianalisis.");
  }

  // Siapkan 'parts' untuk payload Gemini
  const parts = [];

  // Proses semua file yang diupload pengguna
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      // Jika gambar, konversi ke Base64 (Inline Data)
      const base64Data = await fileToBase64(file);
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    } else if (file.type.startsWith('video/')) {
      // Jika video, upload ke Gemini File API (Video butuh upload)
      const geminiFile = await uploadToGemini(file);
      // Tunggu sampai status video ACTIVE
      await waitForFileActive(geminiFile.name);
      
      parts.push({
        fileData: {
          fileUri: geminiFile.uri,
          mimeType: file.type
        }
      });
    } else {
      throw new Error(`Format file tidak didukung: ${file.type}. Harap gunakan JPG/PNG atau MP4.`);
    }
  }

  const systemPrompt = `Anda adalah seorang Senior Meta Ads Consultant, Social Media Auditor, dan Digital Marketing Strategist dengan pengalaman lebih dari 10 tahun.
Tugas Anda adalah melakukan audit dan analisis menyeluruh (360° Facebook Audit) dengan tujuan mempersiapkan akun Facebook agar siap digunakan untuk menjalankan iklan Facebook Ads/Meta Ads secara optimal.

URL Profil (Sebagai referensi nama): ${profileUrl || "Tidak Diberikan"}

PENTING: Pengguna telah menyertakan rekaman layar (video) ATAU kumpulan gambar (screenshot) dari halaman Facebook mereka.
TUGAS UTAMA ANDA ADALAH: TONTON VIDEO TERSEBUT / LIHAT GAMBAR TERSEBUT.
Lakukan analisis VISUAL secara mendalam tentang:
1. Kualitas Branding (Apakah warna, logo, dan foto cover terlihat profesional/elegan?)
2. Kelengkapan Profil (Apakah bio, alamat, tombol CTA, dan kontak terlihat lengkap di layar?)
3. Kualitas Konten (Baca tulisan/copywriting pada postingan yang terlihat, cek jumlah interaksi/likes/komen jika terlihat).
4. Funneling (Apakah postingan yang terlihat cenderung edukatif, hiburan, atau jualan keras/hard-selling?)

BERIKAN KRITIK DAN PUJIAN SECARA NYATA BERDASARKAN APA YANG ANDA LIHAT DI VIDEO/GAMBAR TERSEBUT! Jangan berhalusinasi. Jika videonya buram, katakan buram. Jika bagus, katakan bagus.

BERIKAN HASIL AUDIT DALAM FORMAT JSON BERIKUT (TIDAK ADA TEKS LAIN SELAIN JSON INI):
{
  "scores": {
    "brandingScore": number (0-100),
    "trustScore": number (0-100),
    "contentScore": number (0-100),
    "engagementScore": number (0-100),
    "adsReadinessScore": number (0-100)
  },
  "conclusion": {
    "status": "string (misal: SANGAT LAYAK / BUTUH PERBAIKAN / BELUM LAYAK)",
    "risks": "string (penjelasan risiko/peluang berdasarkan tampilan visual yang Anda lihat)",
    "successEstimate": "string (estimasi peluang keberhasilan)"
  },
  "identity": [
    { "title": "Nama Akun & Username", "desc": "string (hasil pengamatan Anda)", "ok": boolean },
    { "title": "Foto Profil & Cover", "desc": "string (hasil pengamatan visual Anda)", "ok": boolean },
    { "title": "Kelengkapan Bio & Kontak", "desc": "string (hasil pengamatan kelengkapan di layar)", "ok": boolean },
    { "title": "Social Proof & Interaksi", "desc": "string (hasil pengamatan jumlah likes/komen pada postingan yang terlihat)", "ok": boolean }
  ],
  "funnel": {
    "tofu": number (estimasi % konten Awareness yang terlihat, 0-100),
    "mofu": number (estimasi % konten Consideration yang terlihat, 0-100),
    "bofu": number (estimasi % konten Conversion/Jualan yang terlihat, 0-100),
    "evaluation": "string (evaluasi berdasarkan pola konten yang terlihat pada rekaman/gambar)"
  },
  "roadmap": {
    "high": ["string (minimal 3 tindakan perbaikan visual/konten wajib)"],
    "medium": ["string (minimal 3 tindakan optimasi menengah)"],
    "low": ["string (minimal 2 tindakan optimasi jangka panjang)"]
  }
}`;

  // Tambahkan prompt ke dalam parts
  parts.push({ text: systemPrompt });

  let model = 'gemini-2.5-flash';
  let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: parts }],
        generationConfig: { temperature: 0.5, responseMimeType: 'application/json' }
      })
    });

    // Fallback jika 2.5-flash sedang sibuk (high demand 503)
    if (!response.ok && response.status === 503) {
      console.warn("Gemini 2.5 Flash sibuk, mencoba Gemini 1.5 Flash...");
      model = 'gemini-1.5-flash';
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: parts }],
          generationConfig: { temperature: 0.5, responseMimeType: 'application/json' }
        })
      });
    }

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Gagal terhubung ke Gemini API');
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResult) throw new Error('Format balasan AI tidak valid atau kosong.');

    const parsedJson = JSON.parse(textResult);
    return { success: true, data: parsedJson };
  } catch (error) {
    console.error('Audit Error:', error);
    return { success: false, error: error.message };
  }
}
