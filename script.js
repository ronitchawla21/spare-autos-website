// Spare Autos — small, dependency-free interactions.
(function () {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header background after scrolling
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal-on-enter (elements are visible at rest; this only adds a lift)
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('.reveal, #steps').forEach((el) => io ? io.observe(el) : el.classList.add('in'));

  // Parallax on hero and statement band
  const layers = [...document.querySelectorAll('[data-parallax]')];
  if (!reduce && layers.length) {
    let ticking = false;
    const update = () => {
      layers.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        const rect = el.parentElement.getBoundingClientRect();
        const lim = el.offsetHeight * 0.1;
        const offset = Math.max(-lim, Math.min(lim, (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed));
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Count-up for hero stats (final value is already in the HTML)
  if (!reduce) {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const end = +el.dataset.count; const t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  // Live enquiry slip
  const $ = (id) => document.getElementById(id);
  const today = new Date();
  $('slip-date').textContent = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const yr = $('yr'); if (yr) yr.textContent = today.getFullYear();
  const sync = () => {
    $('s-business').textContent = $('f-business').value.trim() || 'Your garage';
    $('s-city').textContent = $('f-city').value.trim() || '—';
    const v = [$('f-make').value, $('f-model').value.trim()].filter(Boolean).join(' ');
    $('s-vehicle').textContent = v || '—';
    $('s-parts').textContent = $('f-parts').value.trim();
  };
  ['f-business', 'f-city', 'f-make', 'f-model', 'f-parts'].forEach((id) => $(id).addEventListener('input', sync));

  // Enquiry → email or WhatsApp (no backend)
  const EMAIL = 'spareautos2025@gmail.com';
  const WHATSAPP = '91XXXXXXXXXX'; // TODO: owner to fill in, digits only with country code
  const form = $('enquiry-form'); const note = $('form-note');
  const compose = () => {
    const f = new FormData(form);
    return [
      `Enquiry from ${f.get('name')} (${f.get('business')})`,
      f.get('city') && `City: ${f.get('city')}`,
      `Phone: ${f.get('phone')}`,
      f.get('email') && `Email: ${f.get('email')}`,
      (f.get('make') || f.get('model')) && `Vehicle: ${[f.get('make'), f.get('model')].filter(Boolean).join(' ')}`,
      '', 'Parts:', f.get('parts'),
      f.get('message') && `\nNotes: ${f.get('message')}`,
    ].filter((x) => x !== null && x !== undefined && x !== false).join('\n');
  };
  const valid = () => {
    const missing = ['f-name', 'f-business', 'f-phone', 'f-parts'].filter((id) => !$(id).value.trim());
    if (missing.length) {
      note.className = 'form-note err';
      note.textContent = 'Please fill in your name, business, phone and at least one part number.';
      $(missing[0]).focus();
      return false;
    }
    return true;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valid()) return;
    const subject = `Parts enquiry – ${$('f-business').value.trim()}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent((window.__saCompose||compose)())}`;
    note.className = 'form-note ok';
    note.textContent = `Your email app should open with the enquiry filled in. If it doesn't, email ${EMAIL}.`;
  });
  $('wa-send').addEventListener('click', () => {
    if (!valid()) return;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent((window.__saCompose||compose)())}`, '_blank', 'noopener');
    note.className = 'form-note ok';
    note.textContent = 'WhatsApp should open in a new tab with your enquiry ready to send.';
  });

  /* ============ v2 features ============ */
  const toastEl = $('toast'); let toastT;
  const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2400); };

  // Scroll progress
  const bar = $('progress');
  const prog = () => { const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); bar.style.transform = `scaleX(${p.toFixed(4)})`; };
  window.addEventListener('scroll', prog, { passive: true }); prog();

  // ---------- Data ----------
  // A sample of fast-moving lines. Fitment is confirmed per enquiry.
  const PARTS = [
    { b: 'ATE', pn: '13.0460-2785.2', g: 'Brakes', d: 'Brake pad set, front', s: 'stock' },
    { b: 'ATE', pn: '13.0460-2792.2', g: 'Brakes', d: 'Brake pad set', s: 'stock' },
    { b: 'ATE', pn: '13.0460-2601.2', g: 'Brakes', d: 'Brake pad set', s: 'stock' },
    { b: 'ATE', pn: '13.0460-2781.2', g: 'Brakes', d: 'Brake pad set', s: 'order' },
    { b: 'ATE', pn: '13.0460-7282.2', g: 'Brakes', d: 'Brake pad set', s: 'order' },
    { b: 'ATE', pn: '13.0460-7329.2', g: 'Brakes', d: 'Brake pad set', s: 'stock' },
    { b: 'Textar', pn: '92082205', g: 'Brakes', d: 'Brake disc', s: 'stock' },
    { b: 'Textar', pn: '92330805', g: 'Brakes', d: 'Brake disc', s: 'stock' },
    { b: 'MANN', pn: 'HU 7008 z', g: 'Filters', d: 'Oil filter element', s: 'stock' },
    { b: 'MANN', pn: 'HU 6004 x', g: 'Filters', d: 'Oil filter element', s: 'stock' },
    { b: 'MANN', pn: 'HU 7020 z', g: 'Filters', d: 'Oil filter element', s: 'stock' },
    { b: 'MANN', pn: 'CU 25 002', g: 'Filters', d: 'Cabin air filter', s: 'stock' },
    { b: 'MANN', pn: 'C 26 014', g: 'Filters', d: 'Air filter', s: 'order' },
    { b: 'MANN', pn: 'C 12 133', g: 'Filters', d: 'Air filter', s: 'order' },
    { b: 'Corteco', pn: '49373828', g: 'Engine & mounts', d: 'Engine mount', s: 'stock' },
  ];
  const VEHICLES = {
    'Mercedes-Benz': ['A-Class (W177)', 'C-Class (W205)', 'C-Class (W206)', 'E-Class (W213)', 'S-Class (W222)', 'GLA (H247)', 'GLC (X253)', 'GLE (V167)', 'GLS (X167)'],
    'BMW': ['3 Series (G20)', '3 Series (F30)', '5 Series (G30)', '7 Series (G11)', 'X1 (F48/U11)', 'X3 (G01)', 'X5 (G05)', 'X7 (G07)'],
    'Audi': ['A4 (B9)', 'A6 (C8)', 'A8 (D5)', 'Q3 (F3)', 'Q5 (FY)', 'Q7 (4M)', 'Q8 (4M)'],
    'Volkswagen': ['Polo', 'Vento', 'Virtus', 'Taigun', 'Tiguan', 'Passat'],
    'Skoda': ['Octavia', 'Superb', 'Kodiaq', 'Kushaq', 'Slavia'],
    'Volvo': ['S60', 'S90', 'XC40', 'XC60', 'XC90'],
    'Land Rover': ['Discovery Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Defender'],
    'Jaguar': ['XE', 'XF', 'F-Pace'],
    'Porsche': ['Macan', 'Cayenne', 'Panamera', '911'],
    'Mini': ['Cooper', 'Countryman'],
  };

  // ---------- Quote list (kept in this browser only) ----------
  const KEY = 'sa-quote-v1';
  let quote = [];
  try { quote = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { quote = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(quote)); } catch (e) {} };
  const norm = (x) => x.toLowerCase().replace(/[\s.\-]/g, '');
  const find = (pn) => PARTS.find((p) => norm(p.pn) === norm(pn));

  const renderQuote = () => {
    const n = quote.reduce((a, l) => a + l.qty, 0);
    ['q-count', 'q-count-m'].forEach((id) => { const el = $(id); if (el) el.textContent = quote.length; });
    const ul = $('q-lines'); ul.textContent = '';
    $('q-empty').hidden = quote.length > 0;
    ['q-whatsapp', 'q-form'].forEach((id) => { $(id).disabled = !quote.length; });
    quote.forEach((l, i) => {
      const li = document.createElement('li');
      const main = document.createElement('div'); main.className = 'q-main';
      const pn = document.createElement('span'); pn.className = 'q-pn'; pn.textContent = l.label;
      const meta = document.createElement('span'); meta.className = 'q-meta'; meta.textContent = l.meta || 'Part number';
      main.append(pn, meta);
      const st = document.createElement('div'); st.className = 'stepper';
      const minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '−'; minus.setAttribute('aria-label', `Decrease quantity of ${l.label}`);
      const out = document.createElement('output'); out.textContent = l.qty;
      const plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', `Increase quantity of ${l.label}`);
      minus.onclick = () => { l.qty = Math.max(1, l.qty - 1); save(); renderQuote(); };
      plus.onclick = () => { l.qty = Math.min(999, l.qty + 1); save(); renderQuote(); };
      st.append(minus, out, plus);
      const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'linklike q-remove'; rm.textContent = 'Remove';
      rm.onclick = () => { quote.splice(i, 1); save(); renderQuote(); syncParts(); };
      li.append(main, st, rm); ul.append(li);
    });
    document.querySelectorAll('.add-btn').forEach((b) => {
      const inList = quote.some((l) => norm(l.label) === norm(b.dataset.pn));
      b.classList.toggle('added', inList); b.textContent = inList ? 'Added ✓' : 'Add to quote';
    });
    void n;
  };
  const addLine = (label, meta, qty = 1, silent) => {
    label = label.trim(); if (!label) return;
    const ex = quote.find((l) => norm(l.label) === norm(label));
    if (ex) ex.qty = Math.min(999, ex.qty + qty); else quote.push({ label, meta, qty });
    save(); renderQuote(); syncParts();
    const qb = $('open-quote'); qb.classList.remove('bump'); void qb.offsetWidth; qb.classList.add('bump');
    if (!silent) toast(`Added ${label} to your quote list`);
  };
  const quoteText = () => quote.map((l) => `${l.label}${l.meta ? ' (' + l.meta + ')' : ''} x ${l.qty}`).join('\n');
  const syncParts = () => { const ta = $('f-parts'); if (ta && quote.length) { ta.value = quoteText(); ta.dispatchEvent(new Event('input')); } };

  // Drawer
  const drawer = $('drawer'), scrim = $('scrim'); let lastFocus = null;
  const openDrawer = () => { lastFocus = document.activeElement; scrim.hidden = false; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); drawer.focus(); };
  const closeDrawer = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.hidden = true; if (lastFocus) lastFocus.focus(); };
  $('open-quote').onclick = openDrawer; $('m-quote').onclick = openDrawer; $('close-quote').onclick = closeDrawer; scrim.onclick = closeDrawer;
  $('q-clear').onclick = () => { quote = []; save(); renderQuote(); };
  $('q-whatsapp').onclick = () => { window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hello Spare Autos, please quote for:\n' + quoteText())}`, '_blank', 'noopener'); };
  $('q-form').onclick = () => { syncParts(); closeDrawer(); document.getElementById('enquiry').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); setTimeout(() => $('f-name').focus({ preventScroll: true }), 600); };

  // Tabs (keyboard accessible)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (t) => { tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $(x.getAttribute('aria-controls')).hidden = !on; }); t.focus(); };
  tabs.forEach((t, i) => { t.onclick = () => selectTab(t); t.onkeydown = (e) => { if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]); if (e.key === 'ArrowLeft') selectTab(tabs[(i + tabs.length - 1) % tabs.length]); }; });

  // Vehicle selector
  const vMake = $('v-make'), vModel = $('v-model'), vYear = $('v-year'), vGroup = $('v-group');
  Object.keys(VEHICLES).forEach((m) => vMake.add(new Option(m, m)));
  const yNow = new Date().getFullYear();
  vMake.onchange = () => {
    vModel.length = 1; vYear.length = 1;
    (VEHICLES[vMake.value] || []).forEach((m) => vModel.add(new Option(m, m)));
    vModel.disabled = !vMake.value; vYear.disabled = true;
  };
  vModel.onchange = () => { vYear.length = 1; for (let y = yNow; y >= 2008; y--) vYear.add(new Option(y, y)); vYear.disabled = !vModel.value; };
  $('v-add').onclick = () => {
    if (!vMake.value) { toast('Choose a make first'); vMake.focus(); return; }
    const veh = [vMake.value, vModel.value, vYear.value].filter(Boolean).join(' ');
    addLine(`${vGroup.value || 'Parts'} for ${veh}`, 'By vehicle, fitment to confirm');
    const fm = $('f-make'); if ([...fm.options].some((o) => o.value === vMake.value)) fm.value = vMake.value;
    $('f-model').value = [vModel.value, vYear.value].filter(Boolean).join(', ');
    $('f-model').dispatchEvent(new Event('input')); fm.dispatchEvent(new Event('input'));
  };

  // Part-number search with suggestions
  const pnIn = $('pn-input'), sug = $('pn-suggest');
  const renderSug = () => {
    const q = norm(pnIn.value); sug.textContent = '';
    if (q.length < 2) return;
    PARTS.filter((p) => norm(p.pn).includes(q) || p.b.toLowerCase().includes(pnIn.value.toLowerCase())).slice(0, 5).forEach((p) => {
      const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<span class="b"></span><span class="pn"></span><span class="d"></span>';
      b.querySelector('.b').textContent = p.b; b.querySelector('.pn').textContent = p.pn; b.querySelector('.d').textContent = p.d;
      b.onclick = () => { addLine(p.pn, `${p.b} · ${p.d}`); pnIn.value = ''; renderSug(); };
      li.append(b); sug.append(li);
    });
  };
  pnIn.addEventListener('input', renderSug);
  pnIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('pn-add').click(); } });
  $('pn-add').onclick = () => {
    const v = pnIn.value.trim(); if (!v) { toast('Type a part number'); pnIn.focus(); return; }
    const p = find(v); addLine(p ? p.pn : v, p ? `${p.b} · ${p.d}` : 'To cross-reference'); pnIn.value = ''; renderSug();
  };

  // Bulk list parser: "PN x 4", "PN, 4", "PN 4", "PN"
  $('bulk-add').onclick = () => {
    const lines = $('bulk-input').value.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    let n = 0;
    lines.forEach((l) => {
      const m = l.match(/^(.*?)(?:\s*(?:[x×*,;\t]|\s)\s*(\d{1,4}))?\s*(?:pcs|nos|qty)?\.?$/i);
      let pn = (m && m[1] ? m[1] : l).replace(/[,;]+$/, '').trim(); let qty = m && m[2] ? parseInt(m[2], 10) : 1;
      if (!pn) return; const p = find(pn);
      addLine(p ? p.pn : pn, p ? `${p.b} · ${p.d}` : 'To cross-reference', qty, true); n++;
    });
    if (n) { toast(`Added ${n} line${n > 1 ? 's' : ''} to your quote list`); $('bulk-input').value = ''; openDrawer(); } else toast('Paste at least one part number');
  };

  // Catalogue with filter chips
  const state = { g: 'All', b: 'All', q: '' };
  const mkChips = (el, values, key) => {
    ['All', ...values].forEach((v) => {
      const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = v; c.setAttribute('aria-pressed', v === 'All');
      c.onclick = () => { state[key] = v; el.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === c)); renderCat(); };
      el.append(c);
    });
  };
  mkChips($('chips-group'), [...new Set(PARTS.map((p) => p.g))], 'g');
  mkChips($('chips-brand'), [...new Set(PARTS.map((p) => p.b))], 'b');
  const grid = $('cat-grid');
  const renderCat = () => {
    const q = norm(state.q);
    const list = PARTS.filter((p) => (state.g === 'All' || p.g === state.g) && (state.b === 'All' || p.b === state.b) && (!q || norm(p.pn).includes(q)));
    grid.textContent = '';
    list.forEach((p) => {
      const c = document.createElement('article'); c.className = 'pcard';
      c.innerHTML = '<div class="top"><span class="brand-l"></span><span class="grp"></span></div><div><div class="pn"></div><p class="desc"></p></div><div class="row"><span class="stock"></span><button type="button" class="add-btn">Add to quote</button></div>';
      c.querySelector('.brand-l').textContent = p.b; c.querySelector('.grp').textContent = p.g;
      c.querySelector('.pn').textContent = p.pn; c.querySelector('.desc').textContent = p.d;
      const st = c.querySelector('.stock'); st.textContent = 'Price & stock on quote';
      const btn = c.querySelector('.add-btn'); btn.dataset.pn = p.pn; btn.setAttribute('aria-label', `Add ${p.b} ${p.pn} to quote list`);
      btn.onclick = () => addLine(p.pn, `${p.b} · ${p.d}`);
      c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`); });
      grid.append(c);
    });
    $('cat-empty').hidden = list.length > 0;
    renderQuote();
  };
  $('cat-q').addEventListener('input', (e) => { state.q = e.target.value; renderCat(); });
  $('cat-add-q').onclick = () => { if (state.q.trim()) addLine(state.q.trim(), 'To cross-reference'); };
  renderCat();

  // Command palette (Ctrl/Cmd + K or "/")
  const pal = $('palette'), palQ = $('pal-q'), palR = $('pal-results');
  const SECTIONS = [['Brands', '#brands'], ['Part groups', '#parts'], ['Fast movers catalogue', '#catalogue'], ['Why Spare Autos', '#why'], ['FAQ', '#faq'], ['Locations: Mumbai & Delhi', '#locations'], ['Request a quote', '#enquiry']];
  let palSel = 0, palItems = [];
  const renderPal = () => {
    const q = palQ.value.trim().toLowerCase(), nq = norm(q);
    const parts = PARTS.filter((p) => !q || norm(p.pn).includes(nq) || p.b.toLowerCase().includes(q) || p.d.toLowerCase().includes(q) || p.g.toLowerCase().includes(q)).slice(0, 8)
      .map((p) => ({ k: p.b, t: `${p.pn}`, h: `${p.d} · add to quote`, run: () => addLine(p.pn, `${p.b} · ${p.d}`) }));
    const secs = SECTIONS.filter(([t]) => !q || t.toLowerCase().includes(q)).map(([t, href]) => ({ k: 'Go to', t, h: 'Section', run: () => document.querySelector(href).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }) }));
    palItems = [...parts, ...secs];
    if (q && !parts.length) palItems.unshift({ k: 'Quote', t: `Add "${palQ.value.trim()}"`, h: 'We will cross-reference it', run: () => addLine(palQ.value.trim(), 'To cross-reference') });
    palSel = 0; palR.textContent = '';
    palItems.forEach((it, i) => {
      const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'option');
      b.innerHTML = '<span class="k"></span><span class="t"></span><span class="hint"></span>';
      b.querySelector('.k').textContent = it.k; b.querySelector('.t').textContent = it.t; b.querySelector('.hint').textContent = it.h;
      b.setAttribute('aria-selected', i === palSel); b.onclick = () => { closePal(); it.run(); };
      li.append(b); palR.append(li);
    });
  };
  const openPal = () => { lastFocus = document.activeElement; pal.hidden = false; palQ.value = ''; renderPal(); palQ.focus(); };
  const closePal = () => { pal.hidden = true; if (lastFocus) lastFocus.focus(); };
  $('open-search').onclick = openPal;
  pal.addEventListener('click', (e) => { if (e.target === pal) closePal(); });
  palQ.addEventListener('input', renderPal);
  palQ.addEventListener('keydown', (e) => {
    const btns = [...palR.querySelectorAll('button')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); palSel = (palSel + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % Math.max(1, btns.length); btns.forEach((b, i) => b.setAttribute('aria-selected', i === palSel)); btns[palSel] && btns[palSel].scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter' && palItems[palSel]) { e.preventDefault(); const it = palItems[palSel]; closePal(); it.run(); }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
    else if (e.key === '/' && pal.hidden && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openPal(); }
    else if (e.key === 'Escape') { if (!pal.hidden) closePal(); else if (drawer.classList.contains('open')) closeDrawer(); }
  });

  // Include VIN in composed enquiry
  const baseCompose = compose;
  window.__saCompose = () => { const v = $('f-vin').value.trim(); return baseCompose() + (v ? `\nVIN: ${v}` : ''); };

  renderQuote();
})();
