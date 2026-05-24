// ============================================
// LeadGenius AI — Popup v2.1
// ============================================

var PLATFORM_ICONS = {
  shopee: '🛒', facebook: '📘', instagram: '📸',
  whatsapp: '💬', tiktok: '🎵', other: '🌐', unknown: '❓'
};

var WEBAPP = 'http://localhost:5173'; // Default
var currentPlatform = null;

document.addEventListener('DOMContentLoaded', function() {
  // Init Env Selector
  chrome.storage.local.get(['targetEnv'], function(result) {
    if (result.targetEnv) {
      WEBAPP = result.targetEnv;
      document.getElementById('env-select').value = WEBAPP;
    }
  });

  document.getElementById('env-select').addEventListener('change', function(e) {
    WEBAPP = e.target.value;
    chrome.storage.local.set({ targetEnv: WEBAPP });
  });

  detectPlatform();
  loadStats();
  loadLog();

  document.getElementById('capture-btn').addEventListener('click', handleCapture);
  document.getElementById('btn-dashboard').addEventListener('click', function() {
    chrome.tabs.create({ url: WEBAPP + '/dashboard' });
  });
  document.getElementById('btn-analyzer').addEventListener('click', function() {
    chrome.tabs.create({ url: WEBAPP + '/analyzer' });
  });
  document.getElementById('open-dashboard').addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({ url: WEBAPP + '/dashboard' });
  });
});

function detectPlatform() {
  chrome.runtime.sendMessage({ type: 'DETECT_PLATFORM' }, function(response) {
    if (chrome.runtime.lastError || !response) {
      document.getElementById('platform-name').textContent = 'Extension error';
      return;
    }

    currentPlatform = response.platform;
    document.getElementById('platform-dot').style.background = currentPlatform.color;
    document.getElementById('platform-name').textContent = currentPlatform.name;

    var btn = document.getElementById('capture-btn');
    var btnText = document.getElementById('capture-text');

    if (currentPlatform.id === 'unknown') {
      document.getElementById('platform-status').textContent = 'Tidak didukung';
      btnText.textContent = 'Buka platform chat dulu';
      btn.disabled = true;
    } else {
      document.getElementById('platform-status').textContent = '✓ Siap';
      btnText.textContent = 'Capture Chat ' + currentPlatform.name;
      document.getElementById('capture-icon').textContent = '📸';
      btn.disabled = false;
    }
  });
}

function handleCapture() {
  var btn = document.getElementById('capture-btn');
  var btnText = document.getElementById('capture-text');
  var btnIcon = document.getElementById('capture-icon');

  btn.disabled = true;
  btnText.textContent = 'Capturing & mengirim ke Analyzer...';
  btnIcon.innerHTML = '<div class="spinner"></div>';

  // Langsung capture + kirim ke web app
  chrome.runtime.sendMessage({ type: 'CAPTURE_AND_ANALYZE' }, function(response) {
    if (chrome.runtime.lastError) {
      btnIcon.textContent = '❌';
      btnText.textContent = chrome.runtime.lastError.message;
      setTimeout(resetBtn, 3000);
      return;
    }

    if (response && response.success) {
      btn.classList.add('success');
      btnIcon.textContent = '✅';
      btnText.textContent = 'Berhasil! Membuka hasil analisis...';
      btn.disabled = false;

      loadStats();
      loadLog();
      setTimeout(resetBtn, 5000);
    } else {
      btnIcon.textContent = '❌';
      btnText.textContent = response ? response.error : 'Gagal capture';
      setTimeout(resetBtn, 3000);
    }
  });
}

function resetBtn() {
  var btn = document.getElementById('capture-btn');
  var btnText = document.getElementById('capture-text');
  var btnIcon = document.getElementById('capture-icon');
  btn.classList.remove('success');
  btnIcon.textContent = '📸';
  btnText.textContent = 'Capture Chat ' + (currentPlatform ? currentPlatform.name : '');
  btn.disabled = false;
  btn.onclick = handleCapture;
}

function loadStats() {
  chrome.storage.local.get(['captureCount', 'captureLog'], function(result) {
    var count = result.captureCount || 0;
    var log = result.captureLog || [];
    var analyzed = 0;
    for (var i = 0; i < log.length; i++) {
      if (log[i].status === 'analyzed') analyzed++;
    }
    document.getElementById('stat-captures').textContent = count;
    document.getElementById('stat-analyzed').textContent = analyzed;
    document.getElementById('stat-leads').textContent = analyzed;
  });
}

function loadLog() {
  chrome.storage.local.get(['captureLog'], function(result) {
    var log = result.captureLog || [];
    var container = document.getElementById('log-list');

    if (log.length === 0) {
      container.innerHTML = '<div class="empty-state">Belum ada capture.<br/>Buka chat di platform manapun lalu klik "Capture Chat".</div>';
      return;
    }

    var html = '';
    var max = Math.min(log.length, 5);
    for (var i = 0; i < max; i++) {
      var item = log[i];
      var icon = PLATFORM_ICONS[item.platform ? item.platform.id : 'unknown'] || '🌐';
      var time = getTimeAgo(item.timestamp);
      var statusClass = item.status === 'analyzed' ? 'status-analyzed' : 'status-captured';
      var statusText = item.status === 'analyzed' ? 'Dianalisis' : 'Tercapture';
      var bgColor = item.platform ? item.platform.color : '#6B7280';

      html += '<div class="log-item">' +
        '<div class="log-platform" style="background:' + bgColor + '">' + icon + '</div>' +
        '<div class="log-info"><div class="log-name">' + (item.platform ? item.platform.name : 'Unknown') + '</div>' +
        '<div class="log-meta">' + time + '</div></div>' +
        '<span class="log-status ' + statusClass + '">' + statusText + '</span>' +
        '</div>';
    }
    container.innerHTML = html;
  });
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '-';
  var diffMs = Date.now() - new Date(dateStr).getTime();
  var min = Math.floor(diffMs / 60000);
  var hr = Math.floor(diffMs / 3600000);
  if (min < 1) return 'Baru saja';
  if (min < 60) return min + ' mnt lalu';
  if (hr < 24) return hr + ' jam lalu';
  return Math.floor(diffMs / 86400000) + ' hari lalu';
}
