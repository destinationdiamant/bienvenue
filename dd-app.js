/* ═══════════════════════════════════════════════════════════
   DESTINATION 💎 — Script Partagé v1.0
   À charger après search-index.js dans chaque module :
   <script src="search-index.js"></script>
   <script src="dd-app.js"></script>
   Puis appeler ddInit('ID_CHAPITRE_COURANT') en bas de page.
   ex : ddInit('m1-3')
═══════════════════════════════════════════════════════════ */

/* ── CONSTANTES ─────────────────────────────────────────── */
const DD_PW      = 'Diamant';
const DD_PW_KEY  = 'dd_auth';
const DD_ALL_IDS = [
  'm1-1','m1-2','m1-3','m1-4','m1-5','m1-6',
  'm2',
  'm3a','m3b','m3c','m3d','m3e',
  'm4a','m4b','m4c','m4d','m4e','m4f',
  'm4bis'
];

/* ── PASSWORD ───────────────────────────────────────────── */
function ddCheckPw() {
  const input = document.getElementById('pw-input');
  if (!input) return;
  if (input.value === DD_PW) {
    localStorage.setItem(DD_PW_KEY, '1');
    const ov = document.getElementById('pw-overlay');
    if (ov) ov.style.display = 'none';
  } else {
    const err = document.getElementById('pw-err');
    if (err) err.style.display = 'block';
    input.value = '';
    input.focus();
  }
}

function ddInitPw() {
  const ov = document.getElementById('pw-overlay');
  if (!ov) return;
  if (localStorage.getItem(DD_PW_KEY) === '1') {
    ov.style.display = 'none';
    return;
  }
  const input = document.getElementById('pw-input');
  const btn   = document.getElementById('pw-btn');
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') ddCheckPw(); });
  if (btn)   btn.addEventListener('click', ddCheckPw);
}

/* ── SIDEBAR ────────────────────────────────────────────── */
function ddToggleSidebar() {
  const sb  = document.getElementById('sidebar');
  const ov  = document.getElementById('sb-overlay');
  if (!sb) return;
  const open = sb.classList.toggle('open');
  if (ov) ov.classList.toggle('open', open);
}

function ddToggleGroup(hdr) {
  if (hdr.classList.contains('coming')) return;
  hdr.classList.toggle('open');
  const items = hdr.nextElementSibling;
  if (items) items.classList.toggle('open');
}

/* ── CHECKBOXES + PROGRESSION ───────────────────────────── */
function ddToggleChk(e, id) {
  e.preventDefault();
  e.stopPropagation();
  const el = document.querySelector(`.sb-chk[data-id="${id}"]`);
  if (!el) return;
  const done = el.classList.toggle('done');
  el.textContent = done ? '✓' : '';
  localStorage.setItem('dd_chk_' + id, done ? '1' : '0');
  ddUpdateProgress();
}

function ddLoadChk() {
  DD_ALL_IDS.forEach(id => {
    const done = localStorage.getItem('dd_chk_' + id) === '1';
    const el = document.querySelector(`.sb-chk[data-id="${id}"]`);
    if (el && done) { el.classList.add('done'); el.textContent = '✓'; }
  });
  ddUpdateProgress();
}

function ddUpdateProgress() {
  const done = DD_ALL_IDS.filter(id => localStorage.getItem('dd_chk_' + id) === '1').length;
  const pct  = Math.round((done / DD_ALL_IDS.length) * 100);
  const fill  = document.getElementById('sb-pfill');
  const label = document.getElementById('sb-pct-label');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = pct + '% complété';
}

/* ── MARQUER COMME LU ───────────────────────────────────── */
function ddMarkDone(chapterId, btnEl) {
  const el = document.querySelector(`.sb-chk[data-id="${chapterId}"]`);
  if (el && !el.classList.contains('done')) {
    el.classList.add('done');
    el.textContent = '✓';
    localStorage.setItem('dd_chk_' + chapterId, '1');
    ddUpdateProgress();
  }
  if (btnEl) {
    btnEl.textContent = '✅ Chapitre complété !';
    btnEl.classList.add('done-btn');
    btnEl.classList.remove('primary');
    btnEl.style.borderColor = '#86EFAC';
  }
}

/* ── CHECKLIST INTERNE PAGE ─────────────────────────────── */
function ddToggleCl(li) {
  li.classList.toggle('checked');
  const box = li.querySelector('.cl-box');
  if (box) box.textContent = li.classList.contains('checked') ? '✓' : '';
}

/* ── AUDIO ──────────────────────────────────────────────── */
let _ddSpeaking = false;
let _ddUtterance = null;

function ddToggleAudio() {
  const btn = document.getElementById('audio-btn');
  if (_ddSpeaking) {
    speechSynthesis.cancel();
    _ddSpeaking = false;
    if (btn) { btn.textContent = '🔊 Écouter'; btn.classList.remove('active'); }
    return;
  }
  const content = document.getElementById('main-content');
  if (!content) return;
  // Extraire le texte lisible (sans emojis)
  const raw = content.innerText.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').replace(/\s+/g, ' ').trim();
  _ddUtterance = new SpeechSynthesisUtterance(raw);
  _ddUtterance.lang = 'fr-FR';
  _ddUtterance.rate = 0.92;
  // Sélectionner voix française si dispo
  const voices = speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang.startsWith('fr') && v.localService) ||
                  voices.find(v => v.lang.startsWith('fr'));
  if (frVoice) _ddUtterance.voice = frVoice;
  _ddUtterance.onend = _ddUtterance.onerror = () => {
    _ddSpeaking = false;
    if (btn) { btn.textContent = '🔊 Écouter'; btn.classList.remove('active'); }
  };
  speechSynthesis.speak(_ddUtterance);
  _ddSpeaking = true;
  if (btn) { btn.textContent = '⏹ Arrêter'; btn.classList.add('active'); }
}

/* ── RECHERCHE ──────────────────────────────────────────── */
function ddOpenSrch() {
  const ov = document.getElementById('srch-ov');
  if (ov) ov.classList.add('open');
  setTimeout(() => {
    const inp = document.getElementById('srch-input');
    if (inp) inp.focus();
  }, 80);
}

function ddCloseSrch(e) {
  const ov = document.getElementById('srch-ov');
  if (!ov) return;
  if (!e || e.target === ov) {
    ov.classList.remove('open');
    const inp = document.getElementById('srch-input');
    if (inp) inp.value = '';
    const res = document.getElementById('srch-results');
    if (res) res.innerHTML = '<div class="srch-hint">Tapez un mot-clé pour chercher dans tous les modules</div>';
  }
}

function ddDoSearch(q) {
  const res = document.getElementById('srch-results');
  if (!res) return;
  if (!q.trim()) {
    res.innerHTML = '<div class="srch-hint">Tapez un mot-clé pour chercher dans tous les modules</div>';
    return;
  }
  const terms = q.toLowerCase().split(' ').filter(Boolean);
  const hits  = (typeof SEARCH_INDEX !== 'undefined' ? SEARCH_INDEX : []).filter(item => {
    const hay = (item.title + ' ' + item.keywords.join(' ')).toLowerCase();
    return terms.every(t => hay.includes(t));
  });
  if (!hits.length) {
    res.innerHTML = `<div class="srch-empty">Aucun résultat pour « ${q} »</div>`;
    return;
  }
  res.innerHTML = hits.map(h => {
    const coming = h.url === '#';
    return `<a class="srch-item" href="${coming ? 'javascript:void(0)' : h.url}" style="${coming ? 'opacity:.5;cursor:default' : ''}">
      <span class="srch-item-mod">${h.module}</span>
      <div>
        <div class="srch-item-title">${h.title}</div>
        <div class="srch-item-kw">${h.keywords.slice(0, 4).join(' · ')}</div>
      </div>
    </a>`;
  }).join('');
}

/* ── INIT GLOBAL ────────────────────────────────────────── */
function ddInit(currentChapterId) {
  // Password
  ddInitPw();

  // Sidebar overlay clic extérieur
  const sbOv = document.getElementById('sb-overlay');
  if (sbOv) sbOv.addEventListener('click', ddToggleSidebar);

  // Search overlay clic extérieur
  const srchOv = document.getElementById('srch-ov');
  if (srchOv) srchOv.addEventListener('click', ddCloseSrch);

  // Escape ferme search
  document.addEventListener('keydown', e => { if (e.key === 'Escape') ddCloseSrch({}); });

  // Chargement checkboxes
  ddLoadChk();

  // Voix : charger les voix dispo (asynchrone sur certains navigateurs)
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
  }

  // Marquer le chapitre courant comme actif dans la sidebar
  if (currentChapterId) {
    const activeSbChk = document.querySelector(`.sb-chk[data-id="${currentChapterId}"]`);
    if (activeSbChk && localStorage.getItem('dd_chk_' + currentChapterId) === '1') {
      // déjà géré par loadChk
    }
  }
}
