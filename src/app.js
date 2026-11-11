(function () {
  'use strict';

  /* ───────── Outils ───────── */
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const typo = s => String(s == null ? '' : s)
    .replace(/(\p{L})'/gu, '$1’')
    .replace(/ ([?!:;»])/g, ' $1')
    .replace(/« /g, '« ');
  const plain = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const clone = o => JSON.parse(JSON.stringify(o));
  const debounce = (fn, ms) => { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

  const NIVEAUX = [
    { n: 'Étayé', d: 'avec des aides' },
    { n: 'Standard', d: 'la proposition du guide' },
    { n: 'Expert', d: 'avec des contraintes en plus' },
  ];
  const ICON = {
    proj: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    print: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
    ai: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.9L19 9.5l-4.4 2.9L16 18l-4-3-4 3 1.4-5.6L5 9.5l5.2-1.6z"/></svg>',
    undo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h10a5 5 0 010 10H8"/><path d="M8 5L4 9l4 4"/></svg>',
  };
  const dots = i => '<span class="dots" aria-hidden="true">' + [0, 1, 2].map(j => '<i class="' + (j <= i ? 'on' : '') + '"></i>').join('') + '</span>';

  /* ───────── Données ───────── */
  const FAM = {}; FAMILLES.forEach(f => { FAM[f.id] = f; });
  const BASE = ACTIVITES.map(a => ({
    id: a.id, f: a.f, g: typo(a.g), p: a.p, d: typo(a.d), m: typo(a.m), mat: typo(a.mat || ''),
    t: typo(a.t), o: typo(a.o), e: a.e.map(typo), k: a.k.map(typo), prof: typo(a.prof || ''),
    n: a.n.map(l => ({ c: typo(l.c || a.c), s: typo(l.s || ''), a: typo(l.a || ''), r: typo(l.r || a.r || '') })),
  }));
  const BY_ID = {}; BASE.forEach(a => { BY_ID[a.id] = a; });

  const KEY = 'gammes-ecriture-c3-v1';
  let store = { edits: {}, lv: 1, f: 'toutes' };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') store = Object.assign(store, s); } catch (e) { /* stockage indisponible */ }
  if (!store.edits || typeof store.edits !== 'object') store.edits = {};
  Object.keys(store.edits).forEach(id => { if (!BY_ID[id] || !validAct(store.edits[id])) delete store.edits[id]; });
  if (store.f !== 'toutes' && !FAM[store.f]) store.f = 'toutes';
  if (![0, 1, 2].includes(store.lv)) store.lv = 1;
  const persist = debounce(() => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* idem */ } }, 250);

  function validAct(a) {
    return a && typeof a.t === 'string' && Array.isArray(a.e) && Array.isArray(a.k) && Array.isArray(a.n) && a.n.length === 3 &&
      a.n.every(l => l && typeof l.c === 'string' && typeof l.s === 'string');
  }
  const act = id => store.edits[id] || BY_ID[id];
  const editable = id => store.edits[id] || (store.edits[id] = clone(BY_ID[id]));
  const isEdited = id => !!store.edits[id];

  /* ───────── État ───────── */
  const STANDALONE = !(window.claude && typeof window.claude.use === 'function');
  const state = { id: null, q: '', sample: null, downloads: null, capsKnown: STANDALONE };
  const main = $('#main'), rail = $('#rail');

  if (!STANDALONE) {
    Promise.all([
      window.claude.use('sample').catch(() => null),
      window.claude.use('downloads').catch(() => null),
    ]).then(([s, d]) => { state.sample = s; state.downloads = d; state.capsKnown = true; if (state.id) renderFiche(); });
  }
  // Polices en ligne uniquement : hors connexion, les polices du système prennent le relais.
  if (/^https?:$/.test(location.protocol)) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&display=swap';
    document.head.appendChild(l);
  }

  /* ───────── Navigation ───────── */
  function route() {
    const h = decodeURIComponent((location.hash || '').slice(1));
    state.id = BY_ID[h] ? h : null;
    render();
  }
  function go(id) {
    if (id) location.hash = id;
    else if (location.hash) { try { history.pushState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; } route(); }
    else route();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  function render() {
    renderRail();
    if (state.id) renderFiche(); else renderCatalogue();
  }

  function renderRail() {
    const count = f => BASE.filter(a => f === 'toutes' || a.f === f).length;
    const cur = state.id ? BY_ID[state.id].f : store.f;
    rail.innerHTML = '<p class="rail-label">Familles d’activités</p>' +
      '<button class="tab" data-fam="toutes" aria-current="' + (cur === 'toutes') + '"><b>Toutes les activités</b><i>' + count('toutes') + '</i></button>' +
      FAMILLES.map(f => '<button class="tab" data-fam="' + f.id + '" aria-current="' + (cur === f.id) + '"><b>' + esc(typo(f.t)) + '</b><i>' + count(f.id) + '</i><small>' + esc(typo(f.d)) + '</small></button>').join('') +
      '<p class="rail-note">D’après « L’écriture au cycle 3 », collection Les guides fondamentaux pour enseigner, ministère de l’Éducation nationale.</p>';
  }

  /* ───────── Catalogue ───────── */
  function renderCatalogue() {
    const q = plain(state.q.trim());
    const list = BASE.map(b => act(b.id)).filter(a => (q || store.f === 'toutes' || a.f === store.f) && (!q || plain(a.t + ' ' + a.o + ' ' + a.g + ' ' + FAM[a.f].t).includes(q)));
    const byFam = q || store.f === 'toutes';
    const groups = [];
    list.forEach(a => {
      const key = byFam ? a.f : a.g;
      let g = groups.find(x => x.key === key);
      if (!g) groups.push(g = { key, label: byFam ? typo(FAM[a.f].t) : a.g, sub: byFam ? typo(FAM[a.f].d) : '', items: [] });
      g.items.push(a);
    });
    const head = q
      ? '<h1>' + list.length + ' activité' + (list.length > 1 ? 's' : '') + ' pour « ' + esc(state.q.trim()) + ' »</h1>'
      : store.f === 'toutes'
        ? '<h1>Des gammes d’écriture prêtes pour la classe</h1><p>' + BASE.length + ' exercices courts tirés du guide ministériel, chacun en trois niveaux. Ouvrez une activité pour adapter ses textes, la projeter au tableau ou l’imprimer.</p>'
        : '<h1>' + esc(typo(FAM[store.f].t)) + '</h1><p>' + esc(typo(FAM[store.f].d)) + '. ' + list.length + ' activités, chacune en trois niveaux.</p>';
    main.innerHTML = '<div class="intro">' + head + '</div>' +
      (groups.length ? groups.map(g =>
        '<section class="group"><h2>' + esc(g.label) + (g.sub ? '<span>' + esc(g.sub) + '</span>' : '') + '</h2><div class="cards">' +
        g.items.map(a => '<button class="card" data-open="' + a.id + '"><b>' + esc(a.t) + '</b><p>' + esc(a.o) + '</p><footer><span>' + esc(a.d) + '</span><span>' + esc(a.m) + '</span><span>Guide p. ' + a.p + '</span>' + (isEdited(a.id) ? '<span class="mod">modifiée</span>' : '') + '</footer></button>').join('') +
        '</div></section>').join('')
        : '<p class="empty">Aucune activité ne correspond à cette recherche. Essayez « connecteurs », « accord », « plan » ou « dictée ».</p>');
  }

  /* ───────── Fiche ───────── */
  function ed(path, val, o) {
    o = o || {};
    return '<' + (o.tag || 'div') + ' class="' + (o.multi ? 'multi ' : '') + (o.cls || '') + '" contenteditable="plaintext-only" spellcheck="true" lang="fr" data-edit="' + path + '"' +
      (o.multi ? '' : ' data-single') + ' data-ph="' + esc(o.ph || 'Cliquez pour écrire') + '" role="textbox" aria-label="' + esc(o.label || 'Texte modifiable') + '">' + esc(val) + '</' + (o.tag || 'div') + '>';
  }
  function listEd(key, arr, cls, label) {
    return '<ol class="' + cls + '">' + arr.map((v, i) =>
      '<li>' + ed(key + '.' + i, v, { tag: 'span', label }) + '<button class="rm" data-rm="' + key + '.' + i + '" title="Supprimer cette ligne" aria-label="Supprimer cette ligne">×</button></li>').join('') + '</ol>' +
      '<button class="add" data-add="' + key + '">+ Ajouter une ligne</button>';
  }

  function renderFiche() {
    const a = act(state.id), lv = store.lv, L = a.n[lv], f = FAM[a.f];
    const canPrint = STANDALONE || state.downloads;
    main.innerHTML =
      '<button class="back" data-back>← ' + esc(typo(f.t)) + '</button>' +
      '<header class="fhead"><p class="eyebrow">' + esc(typo(f.t)) + ' · ' + esc(a.g) + '</p>' +
      ed('t', a.t, { tag: 'h1', label: 'Titre de l’activité' }) +
      '<ul class="meta"><li>' + esc(a.d) + '</li><li>' + esc(a.m) + '</li><li>Guide, page ' + a.p + '</li></ul></header>' +
      '<div class="bar"><div class="levels" role="group" aria-label="Niveau de l’exercice">' +
      NIVEAUX.map((n, i) => '<button class="lv" data-lv="' + i + '" aria-pressed="' + (i === lv) + '" title="' + n.n + ' : ' + n.d + '">' + dots(i) + n.n + '</button>').join('') + '</div>' +
      '<div class="actions">' +
      '<button class="btn primary" data-do="proj">' + ICON.proj + 'Projeter</button>' +
      '<button class="btn" data-do="print">' + ICON.print + (STANDALONE ? 'Imprimer' : 'Fiche à imprimer') + '</button>' +
      (state.sample ? '<button class="btn" data-do="ai">' + ICON.ai + 'Nouveau support (IA)</button>' : '') +
      '</div></div>' +
      '<p class="hint"><span>Cliquez sur un texte pour le modifier : vos changements sont gardés dans ce navigateur.</span>' +
      (isEdited(a.id) ? '<span class="mod">Fiche modifiée</span><button class="btn quiet danger" data-do="reset">' + ICON.undo + 'Rétablir le texte d’origine</button>' : '') + '</p>' +
      '<div class="cols"><article class="sheet" aria-label="Fiche élève">' +
      '<p class="sheet-level" data-lv="' + lv + '">' + dots(lv) + 'Niveau ' + (lv + 1) + ' · ' + NIVEAUX[lv].n + '</p>' +
      '<section class="sec"><h3>Objectif</h3>' + ed('o', a.o, { cls: 'big', label: 'Objectif' }) + '</section>' +
      '<section class="sec"><h3>Consigne</h3>' + ed('n.' + lv + '.c', L.c, { cls: 'consigne', multi: true, label: 'Consigne' }) + '</section>' +
      '<section class="sec"><h3>Pour réussir</h3>' + listEd('e', a.e, 'steps', 'Étape') + '</section>' +
      '<section class="sec"><h3>Support de l’exercice</h3>' + ed('n.' + lv + '.s', L.s, { cls: 'support', multi: true, ph: 'Texte, phrases ou cadre de travail donné aux élèves', label: 'Support de l’exercice' }) + '</section>' +
      '<section class="sec"><h3>Coup de pouce</h3>' + ed('n.' + lv + '.a', L.a, { cls: 'aide', multi: true, ph: 'Aucune aide à ce niveau. Cliquez pour en ajouter une (banque de mots, astuce, modèle de phrase…)', label: 'Coup de pouce' }) + '</section>' +
      '<section class="sec"><h3>Je vérifie</h3>' + listEd('k', a.k, 'checks', 'Critère de réussite') + '</section>' +
      '</article>' +
      '<aside class="prof" aria-label="Côté enseignant">' +
      '<div class="prof-box"><h2>Côté enseignant</h2>' +
      '<section class="sec"><h3>Réponses attendues · niveau ' + (lv + 1) + '</h3>' + ed('n.' + lv + '.r', L.r, { multi: true, ph: 'Réponses attendues, texte à dicter ou points à observer', label: 'Réponses attendues' }) + '</section>' +
      '<section class="sec"><h3>Conseils de mise en œuvre</h3>' + ed('prof', a.prof, { multi: true, ph: 'Vos notes pour la séance', label: 'Conseils de mise en œuvre' }) + '</section>' +
      '</div>' +
      '<div class="prof-box"><h2>Repères</h2><dl class="kv"><dt>Durée</dt><dd>' + esc(a.d) + '</dd><dt>Modalité</dt><dd>' + esc(a.m) + '</dd>' +
      (a.mat ? '<dt>Matériel</dt><dd>' + esc(a.mat) + '</dd>' : '') + '<dt>Source</dt><dd>L’écriture au cycle 3, page ' + a.p + '</dd></dl></div>' +
      (!canPrint && state.capsKnown ? '<p class="src">L’impression n’est pas disponible dans cet affichage : utilisez la version fichier de l’application.</p>' : '') +
      (STANDALONE ? '<p class="src">Version hors ligne : la création de nouveaux supports par l’IA est proposée dans la version en ligne.</p>' : '') +
      '</aside></div>';
    main.querySelectorAll('[data-edit]').forEach(el => { if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true'; });
    document.title = a.t + ' · Gammes d’écriture cycle 3';
  }

  function setPath(obj, path, val) {
    const ks = path.split('.'); let o = obj;
    for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
    o[ks[ks.length - 1]] = val;
  }

  /* ───────── Édition ───────── */
  main.addEventListener('input', e => {
    const el = e.target.closest && e.target.closest('[data-edit]'); if (!el || !state.id) return;
    let v = el.innerText.replace(/​/g, '').replace(/\n+$/, '');
    if (!v.trim()) { v = ''; if (el.innerHTML) el.innerHTML = ''; }
    const first = !isEdited(state.id);
    setPath(editable(state.id), el.dataset.edit, v);
    persist();
    if (first) {
      const h = $('.hint', main);
      if (h && !$('.mod', h)) h.insertAdjacentHTML('beforeend', '<span class="mod">Fiche modifiée</span><button class="btn quiet danger" data-do="reset">' + ICON.undo + 'Rétablir le texte d’origine</button>');
    }
  });
  main.addEventListener('keydown', e => {
    const el = e.target.closest && e.target.closest('[data-edit]'); if (!el) return;
    if (e.key === 'Enter' && el.hasAttribute('data-single')) { e.preventDefault(); el.blur(); }
    if (e.key === 'Escape') el.blur();
  });
  main.addEventListener('paste', e => {
    const el = e.target.closest && e.target.closest('[data-edit]'); if (!el || el.contentEditable === 'plaintext-only') return;
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, el.hasAttribute('data-single') ? t.replace(/\s+/g, ' ') : t);
  });

  let resetArmed = 0;
  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.fam !== undefined) { store.f = t.dataset.fam; persist(); state.q = ''; $('#q').value = ''; go(null); return; }
    if (t.dataset.open) return go(t.dataset.open);
    if (t.hasAttribute('data-back')) { store.f = BY_ID[state.id].f; persist(); return go(null); }
    if (t.hasAttribute('data-home')) { store.f = 'toutes'; persist(); state.q = ''; $('#q').value = ''; return go(null); }
    if (t.dataset.lv !== undefined && t.classList.contains('lv')) { store.lv = +t.dataset.lv; persist(); return renderFiche(); }
    if (t.dataset.add) { editable(state.id)[t.dataset.add].push(''); persist(); renderFiche(); const els = main.querySelectorAll('[data-edit^="' + t.dataset.add + '."]'); if (els.length) els[els.length - 1].focus(); return; }
    if (t.dataset.rm) { const [k, i] = t.dataset.rm.split('.'); editable(state.id)[k].splice(+i, 1); persist(); return renderFiche(); }
    const d = t.dataset.do;
    if (d === 'proj') return openProj();
    if (d === 'print') return openPrint();
    if (d === 'ai') return openAI();
    if (d === 'reset') {
      if (Date.now() - resetArmed < 5000) { delete store.edits[state.id]; persist(); resetArmed = 0; renderFiche(); toast('Texte d’origine rétabli.'); }
      else { resetArmed = Date.now(); t.lastChild.textContent = 'Confirmer : effacer mes modifications'; }
    }
  });
  $('#q').addEventListener('input', e => { state.q = e.target.value; if (state.id) go(null); else renderCatalogue(); });

  /* ───────── Message bref ───────── */
  let toastT;
  function toast(msg, label, fn) {
    const el = $('#toast'); clearTimeout(toastT);
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (label ? '<button>' + esc(label) + '</button>' : '');
    el.hidden = false;
    if (label) $('button', el).onclick = () => { el.hidden = true; fn(); };
    toastT = setTimeout(() => { el.hidden = true; }, label ? 12000 : 4000);
  }

  /* ───────── Projection ───────── */
  const pz = $('#pz');
  const P = { slide: 0, k: 1, dark: false, aide: false, dur: 0, acc: 0, t0: 0, tick: 0, lock: null };
  const DUREES = [[0, 'Chronomètre'], [60, 'Minuteur 1 min'], [120, '2 min'], [180, '3 min'], [300, '5 min'], [600, '10 min'], [900, '15 min']];

  function slides(a, L) {
    const s = [
      { k: 'Objectif', h: '<p class="pz-kicker">Objectif</p><p class="pz-big">' + esc(a.o) + '</p>' },
      { k: 'Consigne', h: '<p class="pz-kicker">Consigne</p><p class="pz-big">' + esc(L.c).replace(/\n/g, '<br>') + '</p>' },
      { k: 'Pour réussir', h: '<p class="pz-kicker">Pour réussir</p><ol class="pz-steps">' + a.e.filter(Boolean).map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>' },
    ];
    if (L.s) s.push({ k: 'Support', h: '<p class="pz-consigne">' + esc(L.c) + '</p><div class="pz-support">' + esc(L.s) + '</div>' +
      (L.a ? (P.aide ? '<div class="pz-aide"><b>Coup de pouce</b>\n' + esc(L.a) + '</div>' : '<button class="pb pz-aide-btn" data-pz="aide">Afficher le coup de pouce</button>') : '') });
    if (a.k.filter(Boolean).length) s.push({ k: 'Je vérifie', h: '<p class="pz-kicker">Je vérifie</p><ul class="pz-checks">' + a.k.filter(Boolean).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' });
    return s;
  }
  const elapsed = () => P.acc + (P.t0 ? Date.now() - P.t0 : 0);
  function clockText() {
    let ms = P.dur ? Math.max(0, P.dur * 1000 - elapsed()) : elapsed();
    const s = P.dur ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function beep() {
    try {
      const C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(.2, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + 1.1);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 1.1);
    } catch (e) { /* pas de son disponible */ }
  }
  function tick() {
    const el = $('.pz-time', pz); if (!el) return;
    el.textContent = clockText();
    if (P.dur && P.t0 && elapsed() >= P.dur * 1000) { P.acc = P.dur * 1000; P.t0 = 0; el.classList.add('end'); beep(); renderProj(); }
  }
  function renderProj() {
    const a = act(state.id), L = a.n[store.lv], S = slides(a, L);
    if (P.slide >= S.length) P.slide = S.length - 1;
    const done = P.dur && elapsed() >= P.dur * 1000;
    pz.className = 'pz' + (P.dark ? ' dark' : '');
    pz.innerHTML =
      '<div class="pz-top"><div class="pz-title">' + esc(a.t) + '<small>Niveau ' + (store.lv + 1) + ' · ' + NIVEAUX[store.lv].n + '</small></div>' +
      '<div class="pz-clock"><select data-pz="dur" aria-label="Chronomètre ou minuteur">' + DUREES.map(d => '<option value="' + d[0] + '"' + (d[0] === P.dur ? ' selected' : '') + '>' + d[1] + '</option>').join('') + '</select>' +
      '<span class="pz-time' + (done ? ' end' : '') + '" aria-live="off">' + clockText() + '</span>' +
      '<button class="pb go" data-pz="run">' + (P.t0 ? 'Pause' : 'Démarrer') + '</button><button class="pb" data-pz="zero" title="Remettre à zéro">Zéro</button></div>' +
      '<button class="pb" data-pz="close">Fermer ✕</button></div>' +
      '<div class="pz-stage"><div class="pz-slide" style="--k:' + P.k + '">' + S[P.slide].h + '</div></div>' +
      '<div class="pz-bot"><div class="pz-nav"><button class="pb" data-pz="prev"' + (P.slide ? '' : ' disabled') + ' aria-label="Écran précédent">◀</button>' +
      S.map((s, i) => '<button class="pb' + (i === P.slide ? ' on' : '') + '" data-pz="go" data-i="' + i + '">' + s.k + '</button>').join('') +
      '<button class="pb" data-pz="next"' + (P.slide < S.length - 1 ? '' : ' disabled') + ' aria-label="Écran suivant">▶</button></div>' +
      '<div class="pz-tools">' + NIVEAUX.map((n, i) => '<button class="pb' + (i === store.lv ? ' on' : '') + '" data-pz="lv" data-i="' + i + '" title="Niveau ' + (i + 1) + ' : ' + n.n + '">N' + (i + 1) + '</button>').join('') +
      '<button class="pb" data-pz="minus" aria-label="Réduire le texte">A−</button><button class="pb" data-pz="plus" aria-label="Agrandir le texte">A+</button>' +
      '<button class="pb" data-pz="dark">' + (P.dark ? 'Fond clair' : 'Fond sombre') + '</button><button class="pb" data-pz="full">Plein écran</button></div></div>';
  }
  function openProj() {
    P.slide = 0; P.aide = false; P.acc = 0; P.t0 = 0;
    pz.hidden = false; renderProj();
    clearInterval(P.tick); P.tick = setInterval(tick, 200);
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { P.lock = l; }).catch(() => {}); } catch (e) { /* facultatif */ }
    const b = $('[data-pz="next"]', pz); if (b) b.focus();
  }
  function closeProj() {
    pz.hidden = true; pz.innerHTML = ''; clearInterval(P.tick);
    try { if (P.lock) { P.lock.release(); P.lock = null; } } catch (e) { /* facultatif */ }
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* facultatif */ }
    if (state.id) renderFiche();
  }
  function pzAct(k, t) {
    if (k === 'close') return closeProj();
    if (k === 'prev') P.slide = Math.max(0, P.slide - 1);
    else if (k === 'next') P.slide++;
    else if (k === 'go') P.slide = +t.dataset.i;
    else if (k === 'lv') { store.lv = +t.dataset.i; persist(); P.aide = false; }
    else if (k === 'minus') P.k = Math.max(.5, +(P.k - .1).toFixed(2));
    else if (k === 'plus') P.k = Math.min(2, +(P.k + .1).toFixed(2));
    else if (k === 'dark') P.dark = !P.dark;
    else if (k === 'aide') P.aide = true;
    else if (k === 'run') { if (P.t0) { P.acc = elapsed(); P.t0 = 0; } else { if (P.dur && P.acc >= P.dur * 1000) P.acc = 0; P.t0 = Date.now(); } }
    else if (k === 'zero') { P.acc = 0; P.t0 = 0; }
    else if (k === 'full') { try { (document.fullscreenElement ? document.exitFullscreen() : pz.requestFullscreen()).catch(() => {}); } catch (e) { /* facultatif */ } return; }
    renderProj();
  }
  pz.addEventListener('click', e => { const t = e.target.closest('[data-pz]'); if (t && t.tagName === 'BUTTON') pzAct(t.dataset.pz, t); });
  pz.addEventListener('change', e => { if (e.target.dataset.pz === 'dur') { P.dur = +e.target.value; P.acc = 0; P.t0 = 0; renderProj(); } });
  document.addEventListener('keydown', e => {
    if (pz.hidden || e.target.tagName === 'SELECT') return;
    const m = { ArrowRight: 'next', PageDown: 'next', ArrowLeft: 'prev', PageUp: 'prev', Escape: 'close', '+': 'plus', '-': 'minus' }[e.key];
    if (!m) return;
    if (m === 'next' && $('[data-pz="next"]', pz).disabled) return;
    e.preventDefault(); pzAct(m);
  });

  /* ───────── Impression ───────── */
  const PRINT_CSS = '@page{size:A4;margin:14mm}*{box-sizing:border-box}' +
    'body{margin:0;background:#e6e9f3}.page,.barre{font:11.5pt/1.42 "Segoe UI","Helvetica Neue",Arial,sans-serif;color:#111}' +
    '.barre{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;padding:10px 18px;background:#18213f;color:#fff}' +
    '.barre button{font:inherit;font-weight:700;padding:8px 18px;border:0;border-radius:6px;background:#fff;color:#18213f;cursor:pointer}' +
    '.page{background:#fff;width:210mm;min-height:297mm;margin:8mm auto;padding:14mm;box-shadow:0 1px 8px rgba(0,0,0,.2)}' +
    '@media print{body{background:#fff}.barre{display:none}.page{width:auto;min-height:0;margin:0;padding:0;box-shadow:none;break-after:page}.page:last-child{break-after:auto}}' +
    '.tete{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;border-bottom:1.5pt solid #111;padding-bottom:5pt}' +
    'h1{font-size:17pt;line-height:1.15;margin:0}.niv{font-size:9.5pt;font-weight:700;white-space:nowrap;letter-spacing:.04em;text-transform:uppercase}' +
    '.niv i{display:inline-block;width:7pt;height:7pt;border:1pt solid #111;border-radius:50%;margin-right:2pt}.niv i.on{background:#111}' +
    '.nom{display:flex;gap:18pt;margin:8pt 0 2pt;font-size:10.5pt}.nom span{flex:1;border-bottom:.6pt dotted #555;padding-bottom:1pt}.nom span:last-child{flex:.5}' +
    'h2{font-size:8.5pt;letter-spacing:.1em;text-transform:uppercase;margin:12pt 0 3pt;color:#333}' +
    'p{margin:0}.consigne{font-weight:700;font-size:12.5pt;white-space:pre-wrap}' +
    'ol,ul{margin:0;padding:0;list-style:none}ol{counter-reset:e}ol li,ul li{display:grid;grid-template-columns:18pt 1fr;margin:2pt 0;break-inside:avoid}' +
    'ol li::before{counter-increment:e;content:counter(e) ".";font-weight:700}ul li::before{content:"";width:9pt;height:9pt;border:1pt solid #111;margin-top:3pt}' +
    '.support{border:1pt solid #555;border-radius:3pt;padding:8pt 10pt;white-space:pre-wrap;font-size:12.5pt;line-height:1.7}' +
    '.aide{border:1pt dashed #777;border-radius:3pt;padding:6pt 10pt;white-space:pre-wrap;font-size:11pt}' +
    '.lignes div{height:9mm;border-bottom:.5pt solid #8d97bd}.pre{white-space:pre-wrap}' +
    '.pied{margin-top:12pt;padding-top:4pt;border-top:.5pt solid #999;font-size:8pt;color:#555}' +
    '.kv{display:grid;grid-template-columns:auto 1fr;gap:2pt 12pt;font-size:10.5pt;margin-top:8pt}.kv b{font-weight:700}';

  function fitLines(pageHtml) {
    try {
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;left:-9999px;top:0;width:182mm;visibility:hidden';
      document.body.appendChild(host);
      const root = host.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' + PRINT_CSS + '.page{width:182mm!important;min-height:0!important;margin:0!important;padding:0!important}</style>' +
        pageHtml.replace(/<!--L\d-->/, '<h2>J’écris</h2>') + '<div id="mm" style="height:100mm"></div>';
      const mm = root.getElementById('mm').offsetHeight / 100, h = root.querySelector('.page').offsetHeight;
      host.remove();
      return Math.max(0, Math.min(26, Math.floor((265 * mm - h) / (9 * mm))));
    } catch (e) { return 8; }
  }

  function printDoc(a, o) {
    const lvs = o.all ? [0, 1, 2] : [store.lv];
    const niv = i => '<span class="niv">' + [0, 1, 2].map(j => '<i class="' + (j <= i ? 'on' : '') + '"></i>').join('') + ' Niveau ' + (i + 1) + ' · ' + NIVEAUX[i].n + '</span>';
    const pied = '<p class="pied">D’après « L’écriture au cycle 3 », Les guides fondamentaux pour enseigner, ministère de l’Éducation nationale, page ' + a.p + '.</p>';
    const eleve = lvs.map(i => {
      const L = a.n[i];
      return '<section class="page"><div class="tete"><h1>' + esc(a.t) + '</h1>' + niv(i) + '</div>' +
        '<div class="nom"><span>Prénom :</span><span>Date :</span></div>' +
        '<h2>Objectif</h2><p>' + esc(a.o) + '</p>' +
        '<h2>Consigne</h2><p class="consigne">' + esc(L.c) + '</p>' +
        (a.e.filter(Boolean).length ? '<h2>Pour réussir</h2><ol>' + a.e.filter(Boolean).map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>' : '') +
        (L.s ? '<h2>Support</h2><div class="support">' + esc(L.s) + '</div>' : '') +
        (o.aide && L.a ? '<h2>Coup de pouce</h2><div class="aide">' + esc(L.a) + '</div>' : '') +
        (o.lignes ? '<!--L' + i + '-->' : '') +
        (a.k.filter(Boolean).length ? '<h2>Je vérifie</h2><ul>' + a.k.filter(Boolean).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
        pied + '</section>';
    }).map((html, j) => {
      // Lignes d'écriture : nombre demandé, ou ce qui tient sur le reste de la page (mesuré hors écran).
      let n = o.lignes === 'fill' ? fitLines(html) : +o.lignes || 0;
      return html.replace(/<!--L\d-->/, n > 0 ? '<h2>J’écris</h2><div class="lignes">' + '<div></div>'.repeat(n) + '</div>' : '');
    }).join('');
    const prof = !o.prof ? '' : '<section class="page"><div class="tete"><h1>' + esc(a.t) + '</h1><span class="niv">Page enseignant</span></div>' +
      '<div class="kv"><b>Famille</b><span>' + esc(typo(FAM[a.f].t)) + ' · ' + esc(a.g) + '</span><b>Durée</b><span>' + esc(a.d) + '</span><b>Modalité</b><span>' + esc(a.m) + '</span>' + (a.mat ? '<b>Matériel</b><span>' + esc(a.mat) + '</span>' : '') + '</div>' +
      '<h2>Objectif</h2><p>' + esc(a.o) + '</p>' +
      lvs.map(i => a.n[i].r ? '<h2>Réponses attendues · niveau ' + (i + 1) + ' (' + NIVEAUX[i].n.toLowerCase() + ')</h2><p class="pre">' + esc(a.n[i].r) + '</p>' : '').join('') +
      (a.prof ? '<h2>Conseils de mise en œuvre</h2><p class="pre">' + esc(a.prof) + '</p>' : '') + pied + '</section>';
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(a.t) + ' – fiche</title><style>' + PRINT_CSS + '</style></head><body>' +
      '<div class="barre"><button onclick="window.print()">Imprimer</button><span>Format A4, portrait. Dans la fenêtre d’impression, vous pouvez aussi choisir « Enregistrer au format PDF ».</span></div>' +
      eleve + prof + '</body></html>';
  }

  const dlgPrint = $('#dlg-print'), dlgAI = $('#dlg-ai');
  function openPrint() {
    $('#print-status').hidden = true;
    $('#print-go').textContent = STANDALONE ? 'Imprimer' : 'Télécharger la fiche';
    $('#print-note').textContent = STANDALONE
      ? 'La fenêtre d’impression de votre navigateur va s’ouvrir.'
      : 'La fiche est téléchargée sous forme de page à ouvrir dans votre navigateur, puis à imprimer ou à enregistrer en PDF.';
    $('#print-one').nextElementSibling.textContent = 'Niveau affiché (' + NIVEAUX[store.lv].n.toLowerCase() + ')';
    dlgPrint.showModal();
  }
  $('#print-go').addEventListener('click', async () => {
    const a = act(state.id);
    const html = printDoc(a, { all: $('#print-all').checked, lignes: $('#print-lignes').value === '0' ? 0 : $('#print-lignes').value, aide: $('#print-aide').checked, prof: $('#print-prof').checked });
    const st = $('#print-status');
    if (STANDALONE) {
      dlgPrint.close();
      const old = $('#print-frame'); if (old) old.remove();
      const fr = document.createElement('iframe'); fr.id = 'print-frame'; fr.setAttribute('aria-hidden', 'true');
      fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
      fr.onload = () => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { toast('L’impression n’a pas pu démarrer dans ce navigateur.'); } };
      fr.srcdoc = html; document.body.appendChild(fr);
      return;
    }
    if (!state.downloads) { st.hidden = false; st.className = 'status'; st.textContent = 'Le téléchargement n’est pas disponible dans cet affichage. Utilisez la version fichier de l’application pour imprimer.'; return; }
    try {
      await state.downloads.save({ filename: 'fiche-' + a.id + ($('#print-all').checked ? '-3-niveaux' : '-niveau-' + (store.lv + 1)) + '.html', data: html });
      dlgPrint.close(); toast('Fiche téléchargée : ouvrez-la, puis cliquez sur « Imprimer ».');
    } catch (err) {
      if (err && err.code === 'declined') return;
      st.hidden = false; st.className = 'status';
      st.textContent = err && err.code === 'rate_limited' ? 'Un téléchargement est déjà en attente. Réessayez dans un instant.' : 'Le téléchargement n’a pas abouti. Réessayez, ou utilisez la version fichier de l’application.';
    }
  });

  /* ───────── Nouveau support par l'IA ───────── */
  let aiCtl = null;
  const AI_MSG = {
    not_granted: 'L’accès à Claude n’a pas été autorisé pour cette page.',
    sampling_disabled: 'Claude n’est pas disponible pour ce compte.',
    rate_limited: 'Trop de demandes pour le moment. Réessayez dans quelques minutes.',
    session_expired: 'Votre session a expiré : reconnectez-vous, puis réessayez.',
    refused: 'Cette demande n’a pas pu être traitée. Reformulez le thème.',
    invalid_json: 'La réponse reçue était incomplète. Réessayez.',
  };
  function openAI() {
    const a = act(state.id);
    $('#ai-title').textContent = 'Nouveau support pour « ' + a.t + ' »';
    $('#ai-status').hidden = true; aiBusy(false);
    dlgAI.showModal(); $('#ai-theme').focus();
  }
  function aiBusy(b) {
    $('#ai-go').hidden = b; $('#ai-stop').hidden = !b; $('#ai-theme').disabled = b; $('#ai-plus').disabled = b;
    if (b) { const st = $('#ai-status'); st.hidden = false; st.className = 'status work'; st.textContent = 'Claude rédige les trois niveaux… Cela peut prendre jusqu’à une minute.'; }
  }
  $('#ai-stop').addEventListener('click', () => { if (aiCtl) aiCtl.abort(); });
  $('#ai-form').addEventListener('submit', async e => {
    e.preventDefault();
    const theme = $('#ai-theme').value.trim(), plus = $('#ai-plus').value.trim(), st = $('#ai-status');
    if (!theme) { st.hidden = false; st.className = 'status'; st.textContent = 'Indiquez un thème, par exemple « les volcans » ou « le marché ».'; return; }
    if (!state.sample) return;
    const id = state.id, a = act(id);
    const prompt = 'Tu es conseiller pédagogique pour l’école primaire française. Tu rédiges des supports d’exercices d’écriture pour des élèves de cycle 3 (CM1, CM2, 6e, 9 à 12 ans), dans l’esprit du guide ministériel « L’écriture au cycle 3 » : exercices courts, ciblés, à la consigne claire.\n\n' +
      'ACTIVITÉ : ' + a.t + '\nOBJECTIF : ' + a.o + '\nÉTAPES POUR RÉUSSIR : ' + a.e.join(' | ') + '\n\n' +
      'SUPPORT ACTUEL, pour les trois niveaux (1 = étayé, avec des aides ; 2 = standard ; 3 = expert, avec des contraintes en plus) :\n' + JSON.stringify({ niveaux: a.n }, null, 1) + '\n\n' +
      'Champs : "c" = consigne adressée à l’élève (tutoiement) ; "s" = support de l’exercice (texte, phrases, cadre à compléter) ; "a" = coup de pouce pour l’élève (peut être vide) ; "r" = réponses attendues ou texte à dicter, pour l’enseignant.\n\n' +
      'TÂCHE : rédige un nouveau support pour les trois niveaux sur le thème suivant : « ' + theme + ' ».' + (plus ? ' Précisions de l’enseignant : ' + plus + '.' : '') + '\n' +
      'Contraintes : garde exactement la même forme d’exercice, la même mise en page (retours à la ligne, numérotation, points de suspension pour les blancs), une longueur comparable et la même progression de difficulté entre les niveaux. Le thème doit apparaître dans le support. Français irréprochable, vocabulaire adapté à l’âge des élèves ; si le support actuel contient des erreurs volontaires que l’élève doit corriger, le nouveau support en contient du même type et "r" donne la correction. Adapte "c", "a" et "r" au nouveau support. Aucun contenu inadapté à des enfants.\n\n' +
      'Réponds uniquement par un objet JSON de la forme {"niveaux":[{"c":"…","s":"…","a":"…","r":"…"},{…},{…}]}, sans aucun autre texte.';
    aiCtl = new AbortController(); aiBusy(true);
    try {
      const out = await state.sample.json(prompt, { signal: aiCtl.signal, cache: false });
      const nv = out && Array.isArray(out.niveaux) ? out.niveaux : null;
      if (!nv || nv.length !== 3 || !nv.every(l => l && typeof l.s === 'string' && l.s.trim())) throw { code: 'invalid_json' };
      const wasEdited = isEdited(id), target = editable(id), before = clone(target.n);
      target.n = nv.map((l, i) => ({ c: typo(String(l.c || before[i].c)), s: typo(String(l.s)), a: typo(String(l.a || '')), r: typo(String(l.r || '')) }));
      persist(); dlgAI.close(); if (state.id === id) renderFiche();
      toast('Nouveau support sur « ' + theme + ' ». Relisez-le avant de l’utiliser en classe.', 'Annuler', () => {
        if (wasEdited) store.edits[id].n = before; else delete store.edits[id];
        persist(); if (state.id === id) renderFiche();
      });
    } catch (err) {
      const code = err && err.code;
      if (code === 'cancelled') { st.hidden = true; }
      else { st.hidden = false; st.className = 'status'; st.textContent = AI_MSG[code] || 'La génération n’a pas abouti. Réessayez dans un instant.'; }
      if (code === 'not_granted' || code === 'sampling_disabled') { state.sample = null; }
    } finally { aiBusy(false); if ($('#ai-status').className === 'status work') $('#ai-status').hidden = true; aiCtl = null; }
  });
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { if (aiCtl) aiCtl.abort(); b.closest('dialog').close(); }));

  route();
})();
