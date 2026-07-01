// ─── SHARED UTILITIES ────────────────────────────────────────

const COLORS = ['#FF9E33','#4A9E96','#4A7EC2','#3D8C5C','#8B6EC0','#B87333','#A85050','#F5A623','#C25A8A','#5FA8D3'];

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

// ─── FOX MASCOT ─────────────────────────────────────────────
// Brand fox as a reusable SVG. Parts are classed so CSS mood
// classes on a wrapper (.fox--happy, .fox--sad, .fox--worry,
// .fox--cheer, .fox--cheer-loop, .fox-blink) can animate them.

function foxSvg(size) {
  var w = size || 76, h = Math.round(w * 130 / 120);
  return '<svg class="fox" viewBox="0 0 120 130" width="' + w + '" height="' + h + '" aria-hidden="true">'
    + '<path d="M60 36 L46 42 L26 6 L14 54 L26 84 L60 116 L94 84 L106 54 L94 6 L74 42 Z" fill="#FF9E33" stroke="#FF9E33" stroke-width="4" stroke-linejoin="round"/>'
    + '<path class="fox-ear-l" d="M31 18 L23 48 L43 41 Z" fill="#2B1338" stroke="#2B1338" stroke-width="3" stroke-linejoin="round"/>'
    + '<path class="fox-ear-r" d="M89 18 L97 48 L77 41 Z" fill="#2B1338" stroke="#2B1338" stroke-width="3" stroke-linejoin="round"/>'
    + '<path d="M60 46 L42 58 L34 80 L60 110 L86 80 L78 58 Z" fill="#FFF6EC" stroke="#FFF6EC" stroke-width="3" stroke-linejoin="round"/>'
    + '<g class="fox-eyes">'
    + '<ellipse class="fox-eye fox-eye-l" cx="48" cy="68" rx="5" ry="5" fill="#2B1338"/>'
    + '<ellipse class="fox-eye fox-eye-r" cx="72" cy="68" rx="5" ry="5" fill="#2B1338"/>'
    + '</g>'
    + '<path class="fox-nose" d="M53 78 H67 L60 90 Z" fill="#2B1338" stroke="#2B1338" stroke-width="3" stroke-linejoin="round"/>'
    + '</svg>';
}

// ─── ANSWER VALIDATION ──────────────────────────────────────

function normalizeAnswer(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  var m = a.length, n = b.length;
  var d = [];
  for (var i = 0; i <= m; i++) d[i] = [i];
  for (var j = 0; j <= n; j++) d[0][j] = j;
  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      var cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

function checkAnswer(input, accepted) {
  var inp = normalizeAnswer(input);
  if (!inp) return false;
  if (!Array.isArray(accepted)) accepted = [accepted];
  for (var i = 0; i < accepted.length; i++) {
    var ans = normalizeAnswer(accepted[i]);
    if (inp === ans) return true;
    if (Math.abs(inp.length - ans.length) > 2) continue;
    var maxDist = ans.length <= 3 ? 0 : ans.length <= 4 ? 1 : 2;
    if (levenshtein(inp, ans) <= maxDist) return true;
  }
  return false;
}

// ─── GAME JUICE — WEB AUDIO API ─────────────────────────────

var _audioCtx = null;
function _ctx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { return null; }
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function _tone(freq, type, dur, vol) {
  var c = _ctx(); if (!c) return;
  var o = c.createOscillator();
  var g = c.createGain();
  o.type = type || 'sine';
  o.frequency.value = freq;
  g.gain.value = vol || 0.12;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g); g.connect(c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + dur);
}

function sfxCorrect() {
  _tone(880, 'sine', 0.12, 0.1);
  setTimeout(function() { _tone(1100, 'sine', 0.18, 0.1); }, 80);
}

function sfxWrong() {
  _tone(200, 'sawtooth', 0.25, 0.08);
}

function sfxTick() {
  _tone(600, 'square', 0.05, 0.06);
}

function sfxSteal() {
  var c = _ctx(); if (!c) return;
  var o = c.createOscillator();
  var g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(300, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.25);
  g.gain.value = 0.1;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  o.connect(g); g.connect(c.destination);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.3);
}

function sfxCountdown() {
  _tone(440, 'sine', 0.1, 0.08);
}

// ─── CONFETTI ───────────────────────────────────────────────

function spawnConfetti(container, count) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  count = count || 20;
  var colors = ['#e63946','#f5a623','#2a9d5c','#2176ae','#9b5de5','#f0f0f0'];
  for (var i = 0; i < count; i++) {
    var p = document.createElement('div');
    p.className = 'confetti-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    p.style.animationDelay = (Math.random() * 0.4) + 's';
    container.appendChild(p);
    (function(el) {
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 4200);
    })(p);
  }
}

// ─── SCORE POP ──────────────────────────────────────────────

function showScorePop(container, pts) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var el = document.createElement('div');
  el.className = 'score-pop';
  el.textContent = (pts >= 0 ? '+' : '') + pts;
  if (pts < 0) el.classList.add('neg');
  container.style.position = 'relative';
  container.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
}

// ─── ACCESSIBILITY ──────────────────────────────────────────

function setupA11y() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var active = document.querySelector('.screen.active');
      if (active && active.id !== 'screen-setup' && active.id !== 'screen-start') {
        var home = document.querySelector('.home-link');
        if (home) home.click();
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupA11y);
} else {
  setupA11y();
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
  if (flagEl) flagEl.textContent = lang === 'no' ? 'NO' : 'EN';
  if (txtEl) txtEl.textContent = lang === 'no' ? 'Norsk' : 'English';
  if (typeof onLangChange === 'function') onLangChange();
}

function toggleLang() {
  setLang(_lang === 'no' ? 'en' : 'no');
}
