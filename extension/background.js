// ============================================
// LeadGenius AI — Background Service Worker v2.2
// Auto-capture → Auto-send ke web app
// ============================================

function detectPlatform(url) {
  if (!url) return { id: 'unknown', name: 'Tidak Dikenal', color: '#6B7280' };
  if (url.includes('seller.shopee') || url.includes('shopee.co'))
    return { id: 'shopee', name: 'Shopee', color: '#EE4D2D' };
  if (url.includes('facebook.com') || url.includes('messenger.com'))
    return { id: 'facebook', name: 'Facebook', color: '#1877F2' };
  if (url.includes('instagram.com'))
    return { id: 'instagram', name: 'Instagram', color: '#E4405F' };
  if (url.includes('whatsapp.com'))
    return { id: 'whatsapp', name: 'WhatsApp', color: '#25D366' };
  if (url.includes('tiktok.com'))
    return { id: 'tiktok', name: 'TikTok', color: '#000000' };
  return { id: 'other', name: 'Lainnya', color: '#6B7280' };
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

  if (message.type === 'CAPTURE_SCREENSHOT') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) {
        sendResponse({ success: false, error: 'Tidak ada tab aktif' });
        return;
      }

      var tab = tabs[0];
      var platform = detectPlatform(tab.url);

      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, function(dataUrl) {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        if (!dataUrl) {
          sendResponse({ success: false, error: 'Screenshot kosong' });
          return;
        }

        // Simpan log
        chrome.storage.local.get(['captureLog', 'captureCount'], function(result) {
          var log = result.captureLog || [];
          var count = (result.captureCount || 0) + 1;
          log.unshift({
            id: Date.now(),
            platform: platform,
            timestamp: new Date().toISOString(),
            status: 'captured'
          });
          chrome.storage.local.set({
            captureLog: log.slice(0, 30),
            captureCount: count,
            lastCapture: { dataUrl: dataUrl, platform: platform, timestamp: new Date().toISOString() }
          });
          chrome.action.setBadgeText({ text: String(count) });
          chrome.action.setBadgeBackgroundColor({ color: platform.color });
        });

        sendResponse({ success: true, dataUrl: dataUrl, platform: platform });
      });
    });
    return true;
  }

  // === CAPTURE + LANGSUNG KIRIM KE WEB ===
  if (message.type === 'CAPTURE_AND_ANALYZE') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) {
        sendResponse({ success: false, error: 'Tidak ada tab aktif' });
        return;
      }

      var tab = tabs[0];
      var platform = detectPlatform(tab.url);

      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, function(dataUrl) {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        if (!dataUrl) {
          sendResponse({ success: false, error: 'Screenshot kosong' });
          return;
        }

        // Simpan log
        chrome.storage.local.get(['captureCount'], function(result) {
          var count = (result.captureCount || 0) + 1;
          chrome.storage.local.set({ captureCount: count });
          chrome.action.setBadgeText({ text: String(count) });
          chrome.action.setBadgeBackgroundColor({ color: platform.color });
        });

        // Buka tab analyzer di BACKGROUND (GANTI KE VERCEL)
        var analyzerUrl = 'https://leadgenius-ai-puce.vercel.app/analyzer?from=extension&platform=' + platform.id + '&t=' + Date.now();
        
        chrome.tabs.create({ url: analyzerUrl, active: false }, function(newTab) {
          // Tunggu tab selesai load, lalu inject data ke localStorage
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === newTab.id && info.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              
              // Inject dataUrl ke localStorage halaman web
              chrome.scripting.executeScript({
                target: { tabId: newTab.id },
                func: function(data, plat) {
                  window.localStorage.setItem('extensionCapture', JSON.stringify({
                    dataUrl: data,
                    platform: plat,
                    timestamp: new Date().toISOString()
                  }));
                  // Trigger custom event agar React bisa detect
                  window.dispatchEvent(new CustomEvent('extensionCapture', { detail: { ready: true } }));
                },
                args: [dataUrl, platform]
              });
            }
          });
        });

        sendResponse({ success: true, platform: platform });
      });
    });
    return true;
  }

  if (message.type === 'DETECT_PLATFORM') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) {
        sendResponse({ platform: { id: 'unknown', name: 'Tidak ada tab', color: '#6B7280' } });
        return;
      }
      sendResponse({ platform: detectPlatform(tabs[0].url), url: tabs[0].url });
    });
    return true;
  }

  if (message.type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: 'https://leadgenius-ai-puce.vercel.app/analyzer' });
  }

  return false;
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.action.setBadgeText({ text: '' });
  chrome.storage.local.set({ captureCount: 0, captureLog: [] });
});
