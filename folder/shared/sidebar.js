/* ======================================================
   shared/sidebar.js — Composant sidebar partage
   Source unique pour les 3 protos :
     - Public & private locations
     - Run queue
     - Root Cause Analysis
   ====================================================== */
(function () {

  /* ---------- CSS ---------- */
  var SIDEBAR_CSS = '\
.sidebar{\
  --sidebar:#1c4a47;\
  --sidebar-hover:rgba(255,255,255,0.06);\
  --sidebar-active:#285c59;\
  --sidebar-text:#ffffff;\
  --sidebar-label:rgba(255,255,255,0.6);\
  --sidebar-white:#ffffff;\
  --sidebar-line:rgba(255,255,255,0.12);\
  width:223px;background:var(--sidebar);flex-shrink:0;display:flex;flex-direction:column;padding:14px 12px;overflow-y:auto\
}\
.sidebar .brand{display:flex;align-items:center;justify-content:space-between;padding:4px 8px 0}\
.sidebar .brand .logo{display:flex;align-items:center;gap:8px;color:var(--sidebar-white);font-weight:700;font-size:16px}\
.sidebar .brand .mark{width:20px;height:20px;color:#ed7846}\
.sidebar .collapse{color:var(--sidebar-label);cursor:pointer;background:none;border:none;font-size:14px}\
.sidebar .nav-sep{height:1px;background:var(--sidebar-line);margin:12px -12px}\
.sidebar .ws{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:8px;margin-bottom:16px}\
.sidebar .ws .avatar{width:32px;height:32px;border-radius:4px;background:#f6ede2;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}\
.sidebar .ws .name{color:var(--sidebar-white);font-weight:500;font-size:14px;line-height:1.2}\
.sidebar .ws .sub{color:var(--sidebar-white);opacity:.7;font-size:9px;line-height:1.2;margin-top:1px}\
.sidebar .nav-label{color:var(--sidebar-label);font-size:9px;font-weight:600;letter-spacing:.45px;text-transform:uppercase;padding:0 8px 8px}\
.sidebar .nav-item{display:flex;align-items:center;gap:12px;color:var(--sidebar-text);font-size:13px;font-weight:500;padding:7px 8px;border-radius:6px;width:100%;text-align:left;margin-bottom:4px;cursor:pointer;border:none;background:none;font-family:inherit}\
.sidebar .nav-item svg{width:14px;height:14px;flex-shrink:0}\
.sidebar .nav-item:hover{background:var(--sidebar-hover)}\
.sidebar .nav-item.active{background:var(--sidebar-active);color:#fff}\
.sidebar .nav-item.boxed{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.2);justify-content:space-between;padding:8px 16px;margin-bottom:8px}\
.sidebar .nav-item.boxed .lead{display:flex;align-items:center;gap:8px}\
.sidebar .spacer{flex:1}\
.sidebar .help-btn{width:32px;height:32px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);color:var(--sidebar-text);display:flex;align-items:center;justify-content:center;margin-top:12px;background:none;cursor:pointer}\
';

  /* ---------- HTML ---------- */
  var SIDEBAR_HTML = '\
<aside class="sidebar">\
  <div class="brand">\
    <div class="logo">\
      <svg class="mark" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.5 3.2 2.3 5 5.5 5.5C14.3 8 12.5 9.8 12 13c-.5-3.2-2.3-5-5.5-5.5C9.7 7 11.5 5.2 12 2zm5.5 10c.3 2 1.4 3.1 3.5 3.5-2.1.4-3.2 1.5-3.5 3.5-.3-2-1.4-3.1-3.5-3.5 2.1-.4 3.2-1.5 3.5-3.5zM6 13c.3 2 1.4 3.1 3.5 3.5C7.4 16.9 6.3 18 6 20c-.3-2-1.4-3.1-3.5-3.5C4.6 16.1 5.7 15 6 13z"/></svg>\
      kapptivate\
    </div>\
    <span class="collapse">\u229F</span>\
  </div>\
  <div class="nav-sep"></div>\
  <div class="ws">\
    <div class="avatar">\uD83D\uDC19</div>\
    <div><div class="name">kapptivate</div><div class="sub">Workspace</div></div>\
  </div>\
\
  <div class="nav-label">Overview</div>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/></svg>Realtime status</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>Incidents</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>Analytics</button>\
\
  <div class="nav-sep"></div>\
  <div class="nav-label">By product</div>\
  <button class="nav-item boxed"><span class="lead"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Julio</span><svg viewBox="0 0 24 24" width="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v12H4z"/><path d="M8 20h8M12 16v4"/></svg>Live session</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>Tests</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>Executions</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4 12H2m20 0h-2"/><circle cx="12" cy="12" r="5"/></svg>Monitors</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2"/></svg>Configurations</button>\
\
  <div class="nav-sep"></div>\
  <div class="nav-label">Equipments</div>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>Locations</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>Browser presets</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>Devices lab</button>\
  <button class="nav-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="6" rx="1"/><rect x="3" y="13" width="18" height="6" rx="1"/><path d="M7 8h.01M7 16h.01"/></svg>Hardware</button>\
\
  <div class="spacer"></div>\
  <div class="nav-sep"></div>\
  <button class="help-btn">?</button>\
</aside>';

  /* ---------- initSidebar ---------- */
  window.initSidebar = function (opts) {
    opts = opts || {};
    var active = opts.active;

    // 1. Inject <style> into <head>
    if (!document.getElementById('shared-sidebar-css')) {
      var style = document.createElement('style');
      style.id = 'shared-sidebar-css';
      style.textContent = SIDEBAR_CSS;
      document.head.appendChild(style);
    }

    // 2. Find layout container(s) and inject sidebar as first child
    var containers = document.querySelectorAll('.app, .layout, .page-shell');
    for (var i = 0; i < containers.length; i++) {
      containers[i].insertAdjacentHTML('afterbegin', SIDEBAR_HTML);
    }

    // 3. Mark the matching nav-item as .active
    if (active) {
      var items = document.querySelectorAll('.sidebar .nav-item');
      for (var j = 0; j < items.length; j++) {
        if (items[j].textContent.trim() === active) {
          items[j].classList.add('active');
        }
      }
    }
  };

})();
