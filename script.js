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
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(compose())}`;
    note.className = 'form-note ok';
    note.textContent = `Your email app should open with the enquiry filled in. If it doesn't, email ${EMAIL}.`;
  });
  $('wa-send').addEventListener('click', () => {
    if (!valid()) return;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(compose())}`, '_blank', 'noopener');
    note.className = 'form-note ok';
    note.textContent = 'WhatsApp should open in a new tab with your enquiry ready to send.';
  });
})();
