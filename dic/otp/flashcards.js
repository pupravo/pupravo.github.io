(function () {
  const NONE = '—';
  const T = {
    open: 'Карти',
    close: 'Затвори',
    shuffle: 'Разбъркай',
    reverse: 'Обратно',
    prev: 'Предишна',
    next: 'Следваща',
    empty: 'Няма термини за текущите филтри.',
    noDef: 'Няма определение.',
    hint: 'Интервал – обръщане · ← → – навигация · Esc – затваряне'
  };

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  let deck = [], idx = 0, flipped = false, reverse = false;

  /* ---- DOM ---- */
  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'fc-open';
  openBtn.textContent = T.open;
  const bar = $('reset').parentNode;
  bar.prepend(openBtn);

  const overlay = document.createElement('div');
  overlay.className = 'fc';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="fc-box">' +
      '<div class="fc-top">' +
        '<span id="fcPos"></span>' +
        '<div class="fc-actions">' +
          `<button type="button" class="fc-btn" id="fcRev">${T.reverse}</button>` +
          `<button type="button" class="fc-btn" id="fcShuf">${T.shuffle}</button>` +
          `<button type="button" class="fc-btn" id="fcClose">${T.close}</button>` +
        '</div>' +
      '</div>' +
      '<div class="fc-card" id="fcCard"><div class="fc-in" id="fcIn"></div></div>' +
      '<div class="fc-nav">' +
        `<button type="button" class="fc-btn" id="fcPrev">${T.prev}</button>` +
        `<span class="fc-hint">${T.hint}</span>` +
        `<button type="button" class="fc-btn" id="fcNext">${T.next}</button>` +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  /* ---- рендериране ---- */
  const termSide = r =>
    `<div class="fc-term">${esc(r.term)}</div>` +
    (r.lat !== NONE ? `<div class="lat fc-lat">${esc(r.lat)}</div>` : '');

  const defSide = r => {
    const tags = r.parties.map(p =>
      `<span class="tag ${window.RP.tagClass(p)}">${esc(p)}</span>`
    ).join('');
    return `<div class="fc-def">${r.def === NONE ? T.noDef : esc(r.def)}</div>` +
      `<div class="fc-meta"><span class="catname">${esc(window.RP.catName(r.cat))}</span>` +
      `<span class="pill">${esc(r.section)}</span></div>` +
      (tags ? `<div class="tags fc-tags">${tags}</div>` : '');
  };

  function render(animate) {
    const card = $('fcCard');
    if (!deck.length) {
      $('fcIn').innerHTML = `<div class="fc-face"><div class="fc-def">${T.empty}</div></div>`;
      $('fcPos').textContent = '';
      return;
    }
    const r = deck[idx];
    if (!animate) card.classList.add('nt');
    flipped = false;
    card.classList.remove('flip');
    $('fcIn').innerHTML =
      `<div class="fc-face">${reverse ? defSide(r) : termSide(r)}</div>` +
      `<div class="fc-face fc-back">${reverse ? termSide(r) : defSide(r)}</div>`;
    void card.offsetWidth;
    card.classList.remove('nt');
    $('fcPos').textContent = `${idx + 1} / ${deck.length}`;
    $('fcRev').classList.toggle('on', reverse);
  }

  /* ---- действия ---- */
  function flip() {
    if (!deck.length) return;
    flipped = !flipped;
    $('fcCard').classList.toggle('flip', flipped);
  }

  function go(d) {
    if (!deck.length) return;
    idx = (idx + d + deck.length) % deck.length;
    render(false);
  }

  function shuffle() {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    idx = 0;
    render(false);
  }

  function open() {
    deck = window.RP.getRows().slice();
    idx = 0;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    render(false);
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    openBtn.focus();
  }

  /* ---- събития ---- */
  openBtn.addEventListener('click', open);
  $('fcClose').addEventListener('click', close);
  $('fcCard').addEventListener('click', flip);
  $('fcPrev').addEventListener('click', e => { go(-1); e.currentTarget.blur(); });
  $('fcNext').addEventListener('click', e => { go(1); e.currentTarget.blur(); });
  $('fcShuf').addEventListener('click', e => { shuffle(); e.currentTarget.blur(); });
  $('fcRev').addEventListener('click', e => { reverse = !reverse; render(false); e.currentTarget.blur(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  });
})();