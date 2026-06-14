// ── LeadGenius Background Script ──

// PENTING: Kredensial ini akan diganti setelah Anda memberikannya
const SUPABASE_URL = "https://whztcbzjyugmcfcvbpsc.supabase.co";
const SUPABASE_KEY = "sb_publishable_MTGU_WJ31myy-w1A4NgYVA_Cok5UyeP";

console.log("[LeadGenius] Background Worker berjalan.");

// Menerima pesan dari content script (Shopee tab)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "NEW_SHOPEE_MESSAGE") {
    console.log("[LeadGenius] Menerima data dari Shopee:", request.payload);
    
    // Kirim ke Supabase via REST API
    saveToSupabase(request.payload)
      .then(() => console.log("[LeadGenius] Berhasil disimpan ke Supabase!"))
      .catch(err => console.error("[LeadGenius] Gagal menyimpan ke Supabase:", err));
  }
  return true;
});

async function saveToSupabase(chatData) {
  if (SUPABASE_URL === "ISI_SUPABASE_URL_ANDA_NANTI") {
    console.warn("Supabase URL belum disetting!");
    return;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/incoming_chats`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      customer_name: chatData.customerName,
      message: chatData.message,
      source: "shopee",
      status: "unread",
      received_at: chatData.timestamp
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
}

// Polling Supabase setiap 3 detik untuk mencari balasan yang sudah di-Approve
setInterval(async () => {
  if (SUPABASE_URL === "ISI_SUPABASE_URL_ANDA_NANTI") return;
  
  try {
    // Ambil pesan dengan status 'approved' yang belum dieksekusi (is_sent = false)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/incoming_chats?status=eq.approved&is_sent=is.false&select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const approvedChat = data[0];
        console.log("[LeadGenius] Ditemukan balasan yang di-approve!", approvedChat);
        
        // Teruskan pesan ke content script di tab Shopee
        chrome.tabs.query({ url: "*://seller.shopee.co.id/*" }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "SEND_REPLY",
              payload: { text: approvedChat.reply_text }
            });
            
            // Tandai pesan sebagai sudah dikirim di Supabase
            fetch(`${SUPABASE_URL}/rest/v1/incoming_chats?id=eq.${approvedChat.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ is_sent: true, status: 'sent' })
            });
          }
        });
      }
    }
  } catch (err) {
    // Abaikan error polling agar tidak menuh-menuhin console
  }
}, 3000);
