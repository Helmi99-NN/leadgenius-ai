// ── LeadGenius Content Script (Berjalan di dalam tab Shopee) ──

console.log("[LeadGenius] Shopee Chat Observer Aktif!");

// Variabel untuk melacak pesan terakhir agar tidak duplikat
// Variabel untuk melacak pesan terakhir agar tidak duplikat
let lastMessageId = "";
// ID unik per sesi agar pelanggan tanpa nama tidak tertumpuk dengan yang lama
const sessionCustomerId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

function extractLatestChat() {
  // Metode Leaf Node ternyata mengabaikan chat yang ada emoji-nya (karena emoji = tag <img>, sehingga children.length > 0)
  // Kita kembali menggunakan Selector berbasis Class/Style yang sangat luas agar semua pesan tertangkap meskipun mengandung emoji/br.
  const chatBubbles = document.querySelectorAll(
    'pre, ' + 
    '[class*="message-text"], [class*="text-message"], [class*="chat-text"], ' +
    '[class*="message-content"], [class*="Message_"], [class*="Text_"], ' +
    '[class*="pre-wrap"], [style*="pre-wrap"]'
  );

  if (chatBubbles.length === 0) return null;

  let messageText = '';
  const ignoreTexts = ['tulis pesan', 'tutup', 'rekomendasikan', 'belum dibaca', 'chat hari ini', 'semua chat', 'kirim', 'belum dibalas', 'dibalas manual'];

  // Loop mundur mencari pesan terakhir yang bermakna
  for (let i = chatBubbles.length - 1; i >= 0; i--) {
    const text = chatBubbles[i].textContent.trim();
    const textLower = text.toLowerCase();
    
    // Syarat pesan valid:
    // 1. Panjang > 2
    // 2. Bukan format jam (08:28 atau 00:47)
    // 3. Bukan kata-kata UI statis Shopee
    if (
      text.length > 2 && 
      !/^\d{1,2}:\d{2}(\s*\d{1,2}:\d{2})?$/.test(text) &&
      !ignoreTexts.some(word => textLower === word || textLower.includes('tulis pesan'))
    ) {
      messageText = text;
      break;
    }
  }

  if (!messageText) return null;

  // Coba cari nama pelanggan dengan spesifik agar tidak salah ambil header halaman
  let customerName = `Pelanggan #${sessionCustomerId}`;
  
  // Cari di daftar chat aktif di sebelah kiri (khusus Shopee Seller Centre)
  const activeChatItem = document.querySelector('div[class*="list-item"][class*="active"], div[class*="conversation"][class*="active"]');
  if (activeChatItem) {
    // Biasanya ada div dengan class name atau title di dalamnya
    const nameEl = activeChatItem.querySelector('[class*="name"], [class*="title"], span');
    if (nameEl && nameEl.innerText) {
      customerName = nameEl.innerText.split('\n')[0].trim();
    } else {
      customerName = activeChatItem.innerText.split('\n')[0].trim();
    }
  } 
  
  // Jika masih gagal (atau menggunakan popup kecil di pojok), cari di header chat
  if (customerName.startsWith('Pelanggan #')) {
    // Cari elemen avatar yang bersebelahan dengan teks nama
    const chatHeaders = document.querySelectorAll('div[class*="chat-header"], div[class*="conversation-header"], div[class*="window-header"]');
    if (chatHeaders.length > 0) {
      const nameEl = chatHeaders[0].querySelector('[class*="name"], span');
      if (nameEl && nameEl.innerText) {
        customerName = nameEl.innerText.split('\n')[0].trim();
      }
    }
  }

  // Fallback pengaman mutlak: jika tidak sengaja menangkap teks Seller Centre, buang
  if (customerName.toLowerCase().includes('seller centre')) {
    customerName = `Pelanggan Anonim #${sessionCustomerId}`;
  }

  // Coba cari konteks produk (banner "Pembeli sedang menanyakan produk ini")
  let productContext = '';
  try {
    const allTexts = document.body.innerText.split('\n');
    const contextIndex = allTexts.findIndex(text => text.includes('Pembeli sedang menanyakan produk ini'));
    if (contextIndex !== -1) {
      for (let i = 1; i <= 5; i++) {
         const line = allTexts[contextIndex + i];
         if (line && line.trim().length > 10 && !line.includes('Tutup') && !line.includes('Rp') && !line.includes('Rekomendasikan')) {
             productContext = line.trim();
             break;
         }
      }
    }
  } catch (e) {
    // Abaikan jika error
  }

  const currentMessageId = customerName + "|" + messageText;
  if (currentMessageId === lastMessageId) return null;

  lastMessageId = currentMessageId;

  // Sisipkan konteks produk ke dalam pesan agar terbaca oleh AI dan penjual
  let finalMessage = messageText;
  if (productContext) {
     // Hanya tambahkan jika pesan belum mengandung info ini (mencegah duplikasi jika chat lama ditarik lagi)
     finalMessage = `[Sistem: Pembeli menanyakan produk "${productContext}"]\n${messageText}`;
  }

  return {
    customerName: customerName,
    message: finalMessage,
    timestamp: new Date().toISOString()
  };
}

// Gunakan Polling sebagai ganti MutationObserver karena DOM Shopee sering menahan event
setInterval(() => {
  try {
    const newChat = extractLatestChat();
    if (newChat) {
      console.log("[LeadGenius] Pesan baru terdeteksi via Polling:", newChat);
      chrome.runtime.sendMessage({
        type: "NEW_SHOPEE_MESSAGE",
        payload: newChat
      });
    }
  } catch (err) {
    // Abaikan error
  }
}, 2000);

console.log("[LeadGenius] Polling chat diaktifkan. Memeriksa pesan setiap 2 detik...");

// Mendengarkan perintah dari Background (misalnya perintah untuk menekan tombol kirim)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SEND_REPLY") {
    console.log("[LeadGenius] Menerima perintah membalas:", request.payload);
    
    // 1. Cari kotak input teks (biasanya textarea)
    const inputBox = document.querySelector('textarea, [contenteditable="true"]');
    if (inputBox) {
      if (inputBox.tagName.toLowerCase() === 'textarea') {
        inputBox.value = request.payload.text;
      } else {
        inputBox.innerText = request.payload.text;
      }
      
      // Memicu event agar framework React/Vue milik Shopee menyadari perubahan
      inputBox.dispatchEvent(new Event('input', { bubbles: true }));
      inputBox.dispatchEvent(new Event('change', { bubbles: true }));
      
      // 2. Klik tombol kirim (Tombol kirim biasanya muncul setelah kita mengetik)
      // Coba cari tombol kirim menggunakan heuristic (biasanya ada ikon pesawat kertas atau teks 'Kirim')
      setTimeout(() => {
        const sendBtns = Array.from(document.querySelectorAll('button, div')).filter(el => 
          el.innerHTML.includes('svg') || el.innerText.toLowerCase().includes('kirim')
        );
        // Ambil tombol yang terakhir/paling relevan di area bawah
        const sendBtn = sendBtns[sendBtns.length - 1]; 
        
        if (sendBtn) {
          sendBtn.click();
          console.log("[LeadGenius] Balasan otomatis terkirim!");
          sendResponse({ success: true });
        } else {
          // Fallback: Kirim event tombol Enter
          inputBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
          console.log("[LeadGenius] Balasan otomatis terkirim via tombol Enter!");
          sendResponse({ success: true });
        }
      }, 500);
    } else {
      sendResponse({ success: false, error: "Kotak input tidak ditemukan" });
    }
  }
  return true;
});

// ── AUTO SCRAPER UI & LOGIC ──

function initAutoScraper() {
  if (document.getElementById('leadgenius-scraper-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'leadgenius-scraper-btn';
  btn.innerHTML = '🤖 Auto-Ekstrak Histori ke AI';
  btn.style.cssText = `
    position: fixed;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999999;
    background: #EE4D2D;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    font-family: sans-serif;
    font-size: 13px;
    transition: all 0.3s;
  `;

  btn.onmouseover = () => btn.style.background = '#d74123';
  btn.onmouseout = () => btn.style.background = '#EE4D2D';

  btn.onclick = async () => {
    const confirmRun = confirm("Peringatan: Robot akan mulai mengklik chat Anda satu per satu secara otomatis untuk disedot isinya.\n\nTolong JANGAN KLIK apapun di halaman ini selama proses berjalan.\nLanjutkan?");
    if (!confirmRun) return;

    btn.innerHTML = '⏳ Menyiapkan Robot...';
    btn.style.background = '#f59e0b'; // Amber
    btn.disabled = true;

    try {
      await autoScrapeHistory(btn);
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
      btn.innerHTML = '🤖 Auto-Ekstrak Histori ke AI';
      btn.style.background = '#EE4D2D';
      btn.disabled = false;
    }
  };

  document.body.appendChild(btn);
}

async function autoScrapeHistory(btn) {
  // Karena algoritma otomatis selalu diblokir/obfuscated oleh framework React Shopee,
  // kita ubah menjadi mode interaktif. User menunjukkan ke robot mana daftar chatnya.
  
  btn.innerHTML = '👉 Klik 1 Nama Pelanggan di Daftar Kiri...';
  btn.style.background = '#f59e0b'; // Amber
  btn.disabled = true;

  // Tunggu user mengklik elemen chat list
  const clickHandler = async (e) => {
      // Hentikan event klik agar tidak memicu hal lain di Shopee
      e.preventDefault();
      e.stopPropagation();
      document.removeEventListener('click', clickHandler, true);
      
      const clickedElement = e.target;
      
      // Temukan item list: naik ke elemen parent sampai menemukan parent yang punya anak banyak (>3)
      let listItem = clickedElement;
      while (listItem && listItem.parentElement && listItem.parentElement.children.length < 3) {
          listItem = listItem.parentElement;
      }
      
      const container = listItem ? listItem.parentElement : null;
      
      const resetBtn = () => {
        btn.innerHTML = '🤖 Auto-Ekstrak Histori ke AI';
        btn.style.background = '#EE4D2D';
        btn.disabled = false;
      };

      if (!container || container.children.length < 3) {
          alert("Gagal mendeteksi daftar. Pastikan Anda mengklik NAMA PELANGGAN di daftar sebelah kiri.");
          resetBtn();
          return;
      }
      
      // Berhasil menemukan container list! Ambil semua elemen anaknya.
      const validChats = Array.from(container.children).slice(0, 50);

      let fullExtractedText = "";
      
      for (let i = 0; i < validChats.length; i++) {
        btn.innerHTML = `🔄 Mengekstrak ${i + 1} dari ${validChats.length} Chat...`;
        
        // Scroll item list ke tampilan
        validChats[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Klik chat (trigger event klik pada elemen list)
        validChats[i].click();
        
        // Tunggu loading awal (2 detik)
        await new Promise(r => setTimeout(r, 2000));

        // -- AUTO SCROLL UP & VIRTUALIZED EXTRACTION --
        btn.innerHTML = `🔄 Menarik riwayat lama ${i + 1}/${validChats.length}...`;
        
        let lastTopMessageText = "";
        let noNewMessagesCount = 0;
        let allMessagesArray = [];
        
        // Coba scroll ke atas maksimal 20 kali per pelanggan 
        for (let scrollAttempt = 0; scrollAttempt < 20; scrollAttempt++) {
            const currentBubbles = document.querySelectorAll(
                'pre, [class*="message-text"], [class*="text-message"], [class*="chat-text"], [class*="pre-wrap"]'
            );
            
            if (currentBubbles.length === 0) break;
            
            // 1. Ekstrak Teks Saat Ini (Karena Shopee mungkin menghapus pesan bawah jika kita scroll ke atas)
            const currentTexts = [];
            currentBubbles.forEach(b => {
                const text = b.textContent.trim();
                const textLower = text.toLowerCase();
                const ignoreTexts = ['tulis pesan', 'tutup', 'rekomendasikan', 'belum dibaca', 'chat hari ini', 'semua chat', 'kirim', 'belum dibalas', 'dibalas manual'];
                if (text.length > 2 && !ignoreTexts.some(word => textLower === word || textLower.includes('tulis pesan'))) {
                    currentTexts.push(text);
                }
            });
            
            // Jahit (stitch) teks baru ke bagian depan (atas) dari array utama untuk menjaga urutan kronologis
            for (let j = currentTexts.length - 1; j >= 0; j--) {
                const txt = currentTexts[j];
                // Cek apakah pesan ini sudah ada di 30 pesan teratas array (menghindari duplikasi area beririsan)
                const isDuplicate = allMessagesArray.slice(0, 30).includes(txt);
                if (!isDuplicate) {
                    allMessagesArray.unshift(txt);
                }
            }

            // 2. Deteksi apakah kita sudah mentok di atas (pesan teratas tidak berubah lagi)
            const currentTopMessage = currentTexts.length > 0 ? currentTexts[0] : "";
            if (currentTopMessage === lastTopMessageText && currentTopMessage !== "") {
                noNewMessagesCount++;
                if (noNewMessagesCount >= 4) break; // Benar-benar mentok atas
            } else {
                noNewMessagesCount = 0; 
            }
            lastTopMessageText = currentTopMessage;

            // 3. Tembak Scroll Up
            try {
                let firstChatChild = currentBubbles[0];
                while (firstChatChild && firstChatChild.parentElement && firstChatChild.parentElement.children.length === 1) {
                    firstChatChild = firstChatChild.parentElement;
                }
                if (firstChatChild && firstChatChild.parentElement) {
                     const absoluteFirstItem = firstChatChild.parentElement.children[0]; 
                     if (absoluteFirstItem) absoluteFirstItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } catch(e) {}

            // METODE BUTA (BLIND SCROLL): 
            // Jangan cek scrollHeight lagi, karena CSS Flexbox sering menipu.
            // Langsung paksa scroll ke atas pada SEMUA elemen parent sampai mentok layar!
            let el = currentBubbles[0];
            while (el && el.tagName !== 'BODY') {
                try {
                    // Paksa scroll
                    el.scrollTop = 0;
                    // Trigger scroll event
                    el.dispatchEvent(new Event('scroll', { bubbles: true }));
                    // Trigger roda mouse (Wheel)
                    el.dispatchEvent(new WheelEvent('wheel', { deltaY: -2000, bubbles: true }));
                } catch(e) {}
                el = el.parentElement;
            }

            // METODE KEYBOARD: Simulasikan pencet tombol PageUp di dalam chat
            try {
                const focusTarget = currentBubbles[0].closest('div');
                if (focusTarget) {
                    focusTarget.setAttribute('tabindex', '0');
                    focusTarget.focus();
                    focusTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', code: 'PageUp', keyCode: 33, bubbles: true }));
                    focusTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', code: 'Home', keyCode: 36, bubbles: true }));
                }
            } catch(e) {}
            
            // Tunggu 2 detik
            await new Promise(r => setTimeout(r, 2000));
        }
        
        // Ambil nama
        let chatName = "Pelanggan Anonim";
        const nameEl = validChats[i].querySelector('.name, [class*="name"]');
        if (nameEl && nameEl.innerText) {
           chatName = nameEl.innerText.split('\n')[0].trim();
        } else {
           chatName = validChats[i].innerText.split('\n')[0].trim();
        }

        // Gabungkan seluruh teks yang sudah direkonstruksi
        let currentChatText = `\n\n--- OBRALAN DENGAN: ${chatName} ---\n`;
        currentChatText += allMessagesArray.join("\n");
        fullExtractedText += currentChatText;
      }

      // Copy seluruh hasil gabungan chat ke clipboard
      try {
        await navigator.clipboard.writeText(fullExtractedText);
        btn.innerHTML = '✅ Sukses! 100% Disalin';
        btn.style.background = '#10b981'; // Green
        alert("Proses Selesai! Seluruh histori chat berhasil ditarik dan disalin (di-Copy).\n\nLangkah Selanjutnya:\n1. Buka Dasbor LeadGenius > Database Pengetahuan\n2. Pilih Topik/Mesin\n3. Klik 'Paste Teks' lalu paste di sana\n4. AI akan memilahnya otomatis!");
      } catch(e) {
        // Fallback metode copy lama jika navigator clipboard ditolak (tidak focus)
        const textArea = document.createElement("textarea");
        textArea.value = fullExtractedText;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          btn.innerHTML = '✅ Sukses! 100% Disalin';
          btn.style.background = '#10b981';
          alert("Proses Selesai! Seluruh histori chat berhasil ditarik dan disalin (di-Copy).\n\nLangkah Selanjutnya:\n1. Buka Dasbor LeadGenius > Database Pengetahuan\n2. Pilih Topik/Mesin\n3. Klik 'Paste Teks' lalu paste di sana\n4. AI akan memilahnya otomatis!");
        } catch (err) {
          console.error('Gagal copy', err);
          alert("Robot selesai menyedot chat, tetapi gagal menyalin teks secara otomatis. Silakan tekan F12 (Console) untuk melihat hasil teksnya.");
          console.log(fullExtractedText);
        }
        document.body.removeChild(textArea);
      }

      // Kembalikan tombol ke mode awal setelah 5 detik
      setTimeout(resetBtn, 5000);
  };
  
  // Daftarkan event listener penangkap klik
  document.addEventListener('click', clickHandler, true);
}

// Pasang tombol secara agresif (mengantisipasi jika Shopee me-reload DOM)
setInterval(initAutoScraper, 3000);
