(function () {
  const sel  = document.getElementById('c');
  const wrap = sel.closest('.chip.sel');
  const chev = wrap.querySelector('.chev');

  /* --- изграждане на бутона и менюто --- */
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chip-main';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML =
    '<span class="chip-l">Категория</span>' +
    '<span class="chip-v trunc" id="cVal"></span>' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="m6 9 6 6 6-6"/></svg>';

  const menu = document.createElement('div');
  menu.className = 'menu wide';
  menu.hidden = true;

  const list = document.createElement('div');
  list.className = 'cgroup';
  list.setAttribute('role', 'listbox');
  menu.appendChild(list);

  wrap.querySelector('.chip-l').remove();   // старият етикет
  if (chev) chev.remove();
  wrap.prepend(btn);
  wrap.appendChild(menu);

  const val = btn.querySelector('#cVal');

  /* --- синхронизация със select-а --- */
  function render() {
    list.innerHTML = '';
    Array.from(sel.options).forEach(function (o) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'copt';
      b.setAttribute('role', 'option');
      b.dataset.value = o.value;
      b.setAttribute('aria-selected', String(o.value === sel.value));
      b.innerHTML = '<span class="radio"></span><span></span>';
      b.lastChild.textContent = o.textContent;
      list.appendChild(b);
    });
    const cur = sel.options[sel.selectedIndex];
    val.textContent = cur ? cur.textContent : '';
    val.title = val.textContent;
  }

  function open(state) {
    menu.hidden = !state;
    btn.setAttribute('aria-expanded', String(state));
    if (state) {
      const s = list.querySelector('[aria-selected="true"]') || list.firstChild;
      if (s) { s.scrollIntoView({ block: 'nearest' }); s.focus(); }
    }
  }

  /* --- събития --- */
  btn.addEventListener('click', function () { open(menu.hidden); });

  list.addEventListener('click', function (e) {
    const o = e.target.closest('.copt');
    if (!o) return;
    sel.value = o.dataset.value;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    render();
    open(false);
    btn.focus();
  });

  /* клавиатура: стрелки, Home/End, Escape */
  menu.addEventListener('keydown', function (e) {
    const items = Array.from(list.querySelectorAll('.copt'));
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(i + 1, items.length - 1)].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(i - 1, 0)].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === 'Escape') { open(false); btn.focus(); }
  });

  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) open(false);
  });

  /* ако app.js напълни/промени опциите или нулира стойността */
  new MutationObserver(render).observe(sel, { childList: true, subtree: true });
  sel.addEventListener('change', render);
  const reset = document.getElementById('reset');
  if (reset) reset.addEventListener('click', function () { setTimeout(render, 0); });

  render();
})();