// ============================================
// LeadGenius AI — Content Script v2.3
// Dengan safety check chrome.runtime
// ============================================

(function() {
  if (document.getElementById('leadgenius-fab')) return;

  // Safety check: pastikan chrome.runtime tersedia
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
    console.warn('[LeadGenius] Extension context tidak tersedia. Refresh halaman ini.');
    return;
  }

  var url = window.location.href;
  var platformName = 'Chat';
  var platformColor = '#076653';

  if (url.includes('seller.shopee') || url.includes('shopee.co')) {
    platformName = 'Shopee';
    platformColor = '#EE4D2D';
  } else if (url.includes('facebook.com') || url.includes('messenger.com')) {
    platformName = 'Facebook';
    platformColor = '#1877F2';
  } else if (url.includes('instagram.com')) {
    platformName = 'Instagram';
    platformColor = '#E4405F';
  } else if (url.includes('whatsapp.com')) {
    platformName = 'WhatsApp';
    platformColor = '#25D366';
  } else if (url.includes('tiktok.com')) {
    platformName = 'TikTok';
    platformColor = '#000000';
  }

  var fab = document.createElement('div');
  fab.id = 'leadgenius-fab';
  fab.innerHTML = '<div id="lg-fab-btn" style="' +
    'position:fixed;bottom:24px;left:24px;z-index:999999;' +
    'display:flex;align-items:center;gap:8px;padding:12px 20px;' +
    'background:' + platformColor + ';color:white;border-radius:100px;' +
    'cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);' +
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;font-weight:600;' +
    'transition:all 0.2s;user-select:none;">' +
    '<span style="font-size:16px;">📸</span>' +
    '<span id="lg-fab-label">Capture ' + platformName + '</span>' +
    '</div>';

  document.body.appendChild(fab);

  var btn = document.getElementById('lg-fab-btn');
  var label = document.getElementById('lg-fab-label');

  btn.addEventListener('click', function() {
    // Cek ulang apakah extension masih terkoneksi
    if (!chrome.runtime || !chrome.runtime.sendMessage) {
      label.textContent = '⚠️ Refresh halaman dulu (F5)';
      btn.style.background = '#dc2626';
      setTimeout(function() {
        btn.style.background = platformColor;
        label.textContent = 'Capture ' + platformName;
      }, 4000);
      return;
    }

    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';
    label.textContent = '⏳ Capturing & Analyzing...';

    var timeout = setTimeout(function() {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      label.textContent = '⚠️ Timeout';
      setTimeout(function() { label.textContent = 'Capture ' + platformName; }, 3000);
    }, 10000);

    try {
      chrome.runtime.sendMessage({ type: 'CAPTURE_AND_ANALYZE' }, function(response) {
        clearTimeout(timeout);
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';

        // Cek error koneksi extension
        if (chrome.runtime.lastError) {
          label.textContent = '⚠️ Refresh halaman (F5)';
          btn.style.background = '#dc2626';
          setTimeout(function() {
            btn.style.background = platformColor;
            label.textContent = 'Capture ' + platformName;
          }, 4000);
          return;
        }

        if (response && response.success) {
          btn.style.background = '#059669';
          label.textContent = '✅ Terkirim ke Analyzer!';
          setTimeout(function() {
            btn.style.background = platformColor;
            label.textContent = 'Capture ' + platformName;
          }, 4000);
        } else {
          label.textContent = '❌ ' + (response ? response.error : 'Gagal');
          setTimeout(function() { label.textContent = 'Capture ' + platformName; }, 3000);
        }
      });
    } catch(err) {
      clearTimeout(timeout);
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      label.textContent = '⚠️ Refresh halaman (F5)';
      btn.style.background = '#dc2626';
      setTimeout(function() {
        btn.style.background = platformColor;
        label.textContent = 'Capture ' + platformName;
      }, 4000);
    }
  });

  btn.addEventListener('mouseenter', function() { btn.style.transform = 'scale(1.05)'; });
  btn.addEventListener('mouseleave', function() { btn.style.transform = 'scale(1)'; });
})();
