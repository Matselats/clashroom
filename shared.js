// ─── SHARED UTILITIES ────────────────────────────────────────

const COLORS = ['#e63946','#2176ae','#f5a623','#2a9d5c','#9b5de5','#f77f00','#4cc9f0','#e9c46a','#ef476f','#06d6a0'];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function colorFor(name) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function initials(name) { return name.charAt(0).toUpperCase(); }

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function avHtml(name, sz) {
  sz = sz || 26;
  return '<div style="background:' + colorFor(name) + ';width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:' + Math.round(sz * 0.34) + 'px;flex-shrink:0;">' + initials(name) + '</div>';
}

function updateRing(cur, max, el) {
  var circ = 113;
  el.style.strokeDashoffset = circ - (cur / max) * circ;
}

// ─── LANGUAGE ────────────────────────────────────────────────

var _lang = localStorage.getItem('clashroom_lang') || 'no';

function getLang() { return _lang; }

function setLang(lang) {
  _lang = lang;
  localStorage.setItem('clashroom_lang', lang);
  document.documentElement.lang = lang;
  var flagEl = document.getElementById('lang-flag');
  var txtEl = document.getElementById('lang-txt');
  if (flagEl) flagEl.textContent = lang === 'no' ? '\u{1F1F3}\u{1F1F4}' : '\u{1F1EC}\u{1F1E7}';
  if (txtEl) txtEl.textContent = lang === 'no' ? 'Norsk' : 'English';
  if (typeof onLangChange === 'function') onLangChange();
}

function toggleLang() {
  setLang(_lang === 'no' ? 'en' : 'no');
}
