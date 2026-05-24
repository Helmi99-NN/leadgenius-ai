// ============================================
// LeadGenius AI — Content Script v2.4
// Optimized for WhatsApp & Cross-Platform
// ============================================

(function() {
  // Tunggu sampai body ada
  if (!document.body) return;
  if (document.getElementById('leadgenius-fab')) return;

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
  fab.style.all = 'initial'; // Reset semua style agar tidak bentrok dengan CSS web aslinya
  fab.innerHTML = '<div id="lg-fab-btn" style="' +
    'position:fixed;bottom:24px;left:24px;z-index:2147483647;' + // Z-index maksimal
    'display:flex;align-items:center;gap:8px;padding:12px 20px;' +
    'background:' + platformColor + ';color:white;border-radius:100px;' +
    'cursor:grab;box-shadow:0 4px 20px rgba(0,0,0,0.4);' +
    'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:13px;font-weight:600;' +
    'transition:all 0.2s;user-select:none;border:1px solid rgba(255,255,255,0.2);">' +
    '<span style="font-size:16px;">📸</span>' +
    '<span id="lg-fab-label">Capture ' + platformName + '</span>' +
    '</div>';

  document.body.appendChild(fab);

  var btn = document.getElementById('lg-fab-btn');
  var label = document.getElementById('lg-fab-label');

  function updateStatus(text, color, resetAfter) {
    label.textContent = text;
    if (color) btn.style.background = color;
    if (resetAfter) {
      setTimeout(function() {
        label.textContent = 'Capture ' + platformName;
        btn.style.background = platformColor;
      }, resetAfter);
    }
  }

  var isDragging = false;
  var startX, startY, initialX, initialY;

  btn.addEventListener('mousedown', function(e) {
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    var rect = btn.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    btn.style.cursor = 'grabbing';
    btn.style.transition = 'none';

    function onMouseMove(e) {
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDragging = true;
      }
      
      btn.style.left = (initialX + dx) + 'px';
      btn.style.top = (initialY + dy) + 'px';
      btn.style.bottom = 'auto'; // override bottom
      btn.style.right = 'auto'; // override right
    }

    function onMouseUp() {
      btn.style.cursor = 'grab';
      btn.style.transition = 'all 0.2s';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  btn.addEventListener('click', function(e) {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Re-check connection
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
      updateStatus('⚠️ Refresh (F5)', '#dc2626', 4000);
      return;
    }

    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';
    updateStatus('⏳ Memproses...', null);

    try {
      chrome.runtime.sendMessage({ type: 'CAPTURE_AND_ANALYZE' }, function(response) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';

        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          updateStatus('⚠️ Koneksi Putus (F5)', '#dc2626', 4000);
          return;
        }

        if (response && response.success) {
          updateStatus('✅ Terkirim!', '#059669', 4000);
        } else {
          updateStatus('❌ ' + (response ? response.error : 'Gagal'), '#dc2626', 4000);
        }
      });
    } catch(err) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      updateStatus('⚠️ Error (F5)', '#dc2626', 4000);
    }
  });

  btn.addEventListener('mouseenter', function() { btn.style.transform = 'scale(1.05)'; });
  btn.addEventListener('mouseleave', function() { btn.style.transform = 'scale(1)'; });
})();
