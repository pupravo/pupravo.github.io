/* ===== Речник по римско право — логика =====
   Данните (CATS, CH_SECTION, ROWS) са в data.js */

(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const collator = new Intl.Collator('bg', { sensitivity: 'base' });

  /* ---- производни данни ---- */
  const PARTIES = [...new Set(ROWS.flatMap(r => r[4].split(',')))]
    .sort((a, b) => collator.compare(a, b));
  const SECTIONS = [...new Set(Object.values(CH_SECTION))];
  const CAT_SECTION = {};
  ROWS.forEach(r => { CAT_SECTION[r[0]] = CH_SECTION[r[5]]; });
  const tagClass = p => 'tag-' + (PARTIES.indexOf(p) % 8);

  const COLS = [
    { k: 'term', label: 'Термин',      val: r => r[1] },
    { k: 'lat',  label: 'Латински',    val: r => r[2] },
    { k: 'def',  label: 'Определение', val: r => r[3] },
    { k: 'par',  label: 'Засегнати страни' },
    { k: 'cat',  label: 'Категория',   val: r => r[0] },
    // { k: 'ch',   label: 'Гл.',         val: r => r[5] }
  ];

  /* ---- икони ---- */
  const svg = (p, w = 14) =>
    `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    updown: svg('<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>'),
    up:     svg('<path d="M12 19V5M5 12l7-7 7 7"/>'),
    down:   svg('<path d="M12 5v14M19 12l-7 7-7-7"/>'),
    check:  svg('<path d="m5 12 5 5 9-10"/>', 14),
    dash:   svg('<path d="M6 12h12"/>', 14),
    prev:   svg('<path d="m15 6-6 6 6 6"/>', 16),
    next:   svg('<path d="m9 6 6 6-6 6"/>', 16)
  };

  /* ---- състояние ---- */
  const state = {
    q: '', section: '', cat: '',
    parties: new Set(),
    sort: { key: null, dir: 1 },
    page: 1, size: 15
  };

  /* ---- филтриране и сортиране ---- */
  function getRows() {
    const q = state.q.trim().toLowerCase();
    let rows = ROWS.filter(r =>
      (!state.section || CH_SECTION[r[5]] === state.section) &&
      (state.cat === '' || r[0] === +state.cat) &&
      (!state.parties.size || r[4].split(',').some(p => state.parties.has(p))) &&
      (!q || r.slice(1, 4).join(' ').toLowerCase().includes(q))
    );
    const { key, dir } = state.sort;
    const col = COLS.find(c => c.k === key);
    if (col && col.val) {
      rows = rows.slice().sort((a, b) => {
        const x = col.val(a), y = col.val(b);
        if (typeof x === 'number') return (x - y) * dir;
        const ex = x === '—', ey = y === '—';
        if (ex !== ey) return ex ? 1 : -1;      // „—“ винаги най-отзад
        return collator.compare(x, y) * dir;
      });
    }
    return rows;
  }

  /* ---- рендериране ---- */
  function renderTabs() {
    const items = [['', 'Всички'], ...SECTIONS.map(s => [s, s])];
    $('tabs').innerHTML = items.map(([v, l]) =>
      `<button type="button" class="tab" role="tab" data-section="${esc(v)}" aria-selected="${state.section === v}">${esc(l)}</button>`
    ).join('');
  }

  function renderCatSelect() {
    const cats = CATS.map((name, i) => [i, name])
      .filter(([i]) => !state.section || CAT_SECTION[i] === state.section);
    $('c').innerHTML = '<option value="">всички</option>' +
      cats.map(([i, n]) => `<option value="${i}">${esc(n)}</option>`).join('');
    $('c').value = state.cat;
  }

  function renderHead() {
    $('head').innerHTML = COLS.map(c => {
      if (!c.val) return `<th>${esc(c.label)}</th>`;
      const on = state.sort.key === c.k;
      const icon = on ? (state.sort.dir === 1 ? I.up : I.down) : I.updown;
      const aria = on ? (state.sort.dir === 1 ? 'ascending' : 'descending') : 'none';
      return `<th class="${on ? 'sorted' : ''}" aria-sort="${aria}"><button type="button" class="sort" data-sort="${c.k}">${esc(c.label)}${icon}</button></th>`;
    }).join('');
  }

  function renderBody(rows) {
    if (!rows.length) {
      $('b').innerHTML = '<tr><td class="empty" colspan="6">Няма намерени термини.</td></tr>';
      return;
    }
    $('b').innerHTML = rows.map(r => {
      const tags = r[4].split(',').map(p =>
        `<button type="button" class="tag ${tagClass(p)}${state.parties.has(p) ? ' on' : ''}" data-party="${esc(p)}">${esc(p)}</button>`
      ).join('');
      const lat = r[2] === '—' ? '<span class="none">—</span>' : `<span class="lat">${esc(r[2])}</span>`;
      return `<tr>
        <td class="term">${esc(r[1])}</td>
        <td>${lat}</td>
        <td>${esc(r[3])}</td>
        <td><div class="tags">${tags}</div></td>
        <td><span class="catname">${esc(CATS[r[0]])}</span><span class="pill">${esc(CH_SECTION[r[5]])}</span></td>
      </tr>`;
    }).join('');
  }

  function pageList(cur, total) {
    const keep = new Set([1, total, cur - 1, cur, cur + 1]);
    const nums = [...keep].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
    const out = [];
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] > 1) out.push('…');
      out.push(n);
    });
    return out;
  }

  function renderFooter(count, pages) {
    $('total').innerHTML = 'Общо <b>' + count + '</b>' +
      (count !== ROWS.length ? ` <span>от ${ROWS.length}</span>` : '');
    const items = pageList(state.page, pages).map(n =>
      n === '…'
        ? '<span class="gap">…</span>'
        : `<button type="button" class="pg" data-page="${n}"${n === state.page ? ' aria-current="page"' : ''}>${n}</button>`
    ).join('');
    $('pager').innerHTML =
      `<button type="button" class="pg" data-page="${state.page - 1}" aria-label="Предишна"${state.page <= 1 ? ' disabled' : ''}>${I.prev}</button>` +
      items +
      `<button type="button" class="pg" data-page="${state.page + 1}" aria-label="Следваща"${state.page >= pages ? ' disabled' : ''}>${I.next}</button>`;
  }

  function renderParties() {
    const n = state.parties.size;
    $('pCount').hidden = !n;
    $('pCount').textContent = n;
    $('pVal').textContent = n ? 'избрани' : 'всички';
    $('pClear').hidden = !n;
    $('pList').querySelectorAll('input').forEach(i => { i.checked = state.parties.has(i.value); });
    const all = $('pAll');
    const s = n === 0 ? 'none' : n === PARTIES.length ? 'all' : 'some';
    all.dataset.s = s;
    all.innerHTML = s === 'all' ? I.check : s === 'some' ? I.dash : '';
  }

  function buildPartyMenu() {
    $('pList').innerHTML = PARTIES.map(p =>
      `<label class="opt"><input type="checkbox" value="${esc(p)}"><span class="box">${I.check}</span><span class="tag ${tagClass(p)}">${esc(p)}</span></label>`
    ).join('');
  }

  function render() {
    const rows = getRows();
    const pages = Math.max(1, Math.ceil(rows.length / state.size));
    if (state.page > pages) state.page = pages;
    const start = (state.page - 1) * state.size;

    renderHead();
    renderBody(rows.slice(start, start + state.size));
    renderFooter(rows.length, pages);
    renderParties();
    $('reset').hidden = !(state.q || state.section || state.cat !== '' || state.parties.size);
  }

  /* ---- меню „Страни“ ---- */
  function toggleMenu(open) {
    const menu = $('pMenu');
    const show = open ?? menu.hidden;
    menu.hidden = !show;
    $('pBtn').setAttribute('aria-expanded', String(show));
  }

  function toggleParty(p) {
    state.parties.has(p) ? state.parties.delete(p) : state.parties.add(p);
    state.page = 1;
    render();
  }

  /* ---- събития ---- */
  $('q').addEventListener('input', e => { state.q = e.target.value; state.page = 1; render(); });

  $('tabs').addEventListener('click', e => {
    const t = e.target.closest('[data-section]');
    if (!t) return;
    state.section = t.dataset.section;
    if (state.cat !== '' && state.section && CAT_SECTION[state.cat] !== state.section) state.cat = '';
    state.page = 1;
    renderTabs(); renderCatSelect(); render();
  });

  $('c').addEventListener('change', e => { state.cat = e.target.value === '' ? '' : +e.target.value; state.page = 1; render(); });

  $('pBtn').addEventListener('click', () => toggleMenu());
  $('pClear').addEventListener('click', () => { state.parties.clear(); state.page = 1; render(); });
  $('pList').addEventListener('change', e => { if (e.target.matches('input')) toggleParty(e.target.value); });
  $('pAll').addEventListener('click', () => {
    if (state.parties.size === PARTIES.length) state.parties.clear();
    else PARTIES.forEach(p => state.parties.add(p));
    state.page = 1; render();
  });

  document.addEventListener('click', e => { if (!$('pWrap').contains(e.target)) toggleMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

  $('b').addEventListener('click', e => {
    const t = e.target.closest('[data-party]');
    if (t) toggleParty(t.dataset.party);
  });

  $('head').addEventListener('click', e => {
    const b = e.target.closest('[data-sort]');
    if (!b) return;
    const k = b.dataset.sort, s = state.sort;
    if (s.key !== k) { s.key = k; s.dir = 1; }
    else if (s.dir === 1) s.dir = -1;
    else { s.key = null; s.dir = 1; }
    state.page = 1;
    render();
  });

  $('size').addEventListener('change', e => { state.size = +e.target.value; state.page = 1; render(); });

  $('pager').addEventListener('click', e => {
    const b = e.target.closest('[data-page]');
    if (!b || b.disabled) return;
    state.page = +b.dataset.page;
    render();
    $('b').closest('.card').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  $('reset').addEventListener('click', () => {
    state.q = ''; state.section = ''; state.cat = ''; state.parties.clear(); state.page = 1;
    $('q').value = '';
    renderTabs(); renderCatSelect(); render();
  });

  /* ---- старт ---- */
  buildPartyMenu();
  renderTabs();
  renderCatSelect();
  render();
})();
