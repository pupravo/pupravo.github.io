// ---------- constants (defined once) ----------
const I = p => `<svg viewBox="0 0 24 24">${p}</svg>`;
const ICON = {
  menu:I('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  side:I('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>'),
  back:I('<path d="M15 6l-6 6 6 6"/>'),
  fwd:I('<path d="M9 6l6 6-6 6"/>'),
  chat:I('<path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z"/>'),
  code:I('<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>'),
  caret:I('<path d="M6 9l6 6 6-6"/>'),panel:I('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M14 4v16"/>'),
  term:I('<path d="M5 8l5 4-5 4M13 17h6"/>'),dl:I('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'),
  globe:I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
  folder:I('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'),
  plus:I('<path d="M12 5v14M5 12h14"/>'),search:I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
  doc:I('<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M3 7v12a2 2 0 002 2"/>'),
  clock:I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),brief:I('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2"/>'),
  phone:I('<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M11 18h2"/>'),laptop:I('<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 20h20"/>'),
  bell:I('<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>'),
  arrL:I('<path d="M20 12H4M10 6l-6 6 6 6"/>'),arrR:I('<path d="M4 12h16M14 6l6 6-6 6"/>'),sun:I('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>'),moon:I('<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>'),x:I('<path d="M6 6l12 12M18 6L6 18"/>'),sort:I('<path d="M8 4v16M4 16l4 4 4-4M16 20V4M12 8l4-4 4 4"/>')
};
const CATS = {D:['Design & UX','#5b7cf0'],P:['Programming','#9b6cf6'],B:['Business & Management','#3bb08f'],R:['Recruitment','#e0607e']};
const PEOPLE = {mb:['Manuel Blake','#8a5a44'],mp:['Margaret Powers','#d4607a'],ar:['Alex Rivera','#3f7ccc'],ls:['Lena Stoyanova','#2f9e7a'],dk:['Daniel Kim','#8a63c9'],ni:['Nikolay Ivanov','#c9843f']};
const TABS = [['rec','Recommended'],['new','Last added']];

const PANEL_EMPTY = 'Select a book from the table to see its details here.';
const PAGE_SIZES = [5, 8, 10, 15];
const state = {tab:'rec',q:'',cat:'',dir:0,page:1,size:8,sel:null};

const $         = id  => document.getElementById(id);
const fmt       = r   => `${String(r).replace('.',',')}<span>/5</span>`;
const initials  = n   => n.split(' ').map(w=>w[0]).join('');

// ---------- templates ----------
const cover = b => `<div class="cv" style="background:${b.bg};color:${b.fg};  background-size: cover;"></div>`;
const card = b => `<article class="bk">${cover(b)}<p class="bt">${b.t}</p><p class="ba">${b.a}</p><p class="br">${fmt(b.r)}</p></article>`;
const status = b => ({
  free:`<button class="st take" data-take="${b.id}">Take book</button>`,
  mine:`<button class="st ret" data-ret="${b.id}">Return book<small>You have ${b.d} days left</small></button>`,
  late:`<button class="st ret late" data-ret="${b.id}">Return book<small>You exceeded the time</small></button>`,
  taken:`<div class="who"><span class="av" style="background:${PEOPLE[b.p]?.[1]}">${initials(PEOPLE[b.p]?.[0]||'')}</span><span>Taken ${b.ago}<b>${PEOPLE[b.p]?.[0]}</b></span><button class="bell${b.n?' on':''}" data-tip="Notify when returned" data-bell="${b.id}" aria-label="Notify when returned">${ICON.bell}</button></div>`
}[b.s]);

const rowHTML = (b,i) => `<div class="g row${b.id===state.sel?' sel':''}" data-row="${b.id}" tabindex="0" style="animation-delay:${i*35}ms">
  <div class="ti">${cover(b)}<div><p>${b.t}</p><b>${b.a}</b></div></div>
  <div class="rt">${fmt(b.r)}</div>
  <div class="cat"><span class="dot" style="background:${CATS[b.c][1]}33;color:${CATS[b.c][1]}">${b.c}</span>${CATS[b.c][0]}</div>
  <div>${status(b)}</div></div>`;

$('lib').innerHTML = `
  <div class="filters">
    <label class="search"><input id="q" placeholder="Type book name or author" autocomplete="off">${ICON.search}</label>
    <div class="sel"><select id="cat"><option value="">Category</option>${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('')}</select>${ICON.caret}</div>
  </div>
  <div class="tabs" id="tabs"></div>
  <div class="car" id="car"></div>
  <div class="ctl"><button class="ib" id="prev" aria-label="Previous">${ICON.arrL}</button><div class="track"><i id="thumb"></i></div><button class="ib" id="next" aria-label="Next">${ICON.arrR}</button></div>
  <div class="tw"><div class="tbl">
    <div class="g th"><button data-sort>Title ${ICON.sort}</button><span>Rating</span><span>Category</span><span>Status</span></div>
    <div id="rows"></div>
  </div></div>
  <div class="pager" id="pager"></div>`;

const matches = b => (!state.cat || b.c===state.cat) && (b.t+' '+b.a).toLowerCase().includes(state.q);

const drawTabs = () => $('tabs').innerHTML = TABS.map(([k,t])=>`<button class="tab${state.tab===k?' on':''}" data-tab="${k}">${t}</button>`).join('');

const drawCar = () => {
  const list = BOOKS.filter(matches);
  $('car').innerHTML = (state.tab==='new' ? [...list].reverse() : list).map(card).join('') || '<p class="empty">No books found</p>';
  $('car').scrollTo({left:0}); thumb();
};
const pageList = (cur, total) => {

  if (total <= 7) return Array.from({length:total}, (_, i) => i + 1);
  const set = new Set([1, total, cur - 1, cur, cur + 1]);
  const nums = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
  return nums.flatMap((n, i) => i && n - nums[i - 1] > 1 ? ['…', n] : [n]);
};
const pagerHTML = (total, pages) => {
  const from = total ? (state.page - 1) * state.size + 1 : 0, to = Math.min(total, state.page * state.size);
  return `<div class="per">Rows per page <select id="size">${PAGE_SIZES.map(n=>`<option${n===state.size?' selected':''}>${n}</option>`).join('')}</select><span>${from}–${to} of ${total}</span></div>
  <nav class="pages" aria-label="Pagination">
    <button class="pg" data-page="${state.page-1}" ${state.page<=1?'disabled':''} aria-label="Previous page">${ICON.back}</button>
    ${pageList(state.page, pages).map(n => n==='…' ? '<span class="dots">…</span>' : `<button class="pg${n===state.page?' on':''}" data-page="${n}" ${n===state.page?'aria-current="page"':''}>${n}</button>`).join('')}
    <button class="pg" data-page="${state.page+1}" ${state.page>=pages?'disabled':''} aria-label="Next page">${ICON.fwd}</button>
  </nav>`;
};
const drawRows = () => {
  const list = BOOKS.filter(matches).sort((a,b)=>state.dir*a.t.localeCompare(b.t) || a.id-b.id);
  const pages = Math.max(1, Math.ceil(list.length / state.size));
  state.page = Math.min(Math.max(1, state.page), pages);
  const start = (state.page - 1) * state.size;
  $('rows').innerHTML = list.slice(start, start + state.size).map(rowHTML).join('') || '<p class="empty">No books found</p>';
  $('pager').innerHTML = pagerHTML(list.length, pages);
};
const thumb = () => {
  const c = $('car'), t = $('thumb'), w = c.scrollWidth || 1;
  t.style.width = Math.min(100, c.clientWidth/w*100) + '%';
  t.style.left = c.scrollLeft/w*100 + '%';
};
drawTabs(); drawCar(); drawRows();

// ---------- shell ----------
const kv = (k,v) => `<div class="kv"><span>${k}</span><span>${v}</span></div>`;
const panelHTML = b => `
  <div class="phead"><span>Book details</span><button class="ib" data-close aria-label="Close details">${ICON.x}</button></div>
  <div class="pcover">${cover(b)}</div>
  <h2 class="ptitle">${b.t}</h2><p class="pauthor">${b.a}</p>
  <div class="pmeta"><span class="rt">${fmt(b.r)}</span><span class="cat"><span class="dot" style="background:${CATS[b.c][1]}33;color:${CATS[b.c][1]}">${b.c}</span>${CATS[b.c][0]}</span></div>
  <div class="sec"><div class="head">Status</div>${status(b)}</div>
  <div class="sec"><div class="head">About</div><p class="pdesc">${DESC[b.c]}</p></div>
  <div class="sec"><div class="head">Details</div>
    ${kv('Pages',160+(b.id*73)%400)}${kv('Published',2008+(b.id*7)%16)}${kv('Language','English')}${kv('Shelf',`${b.c}-${100+b.id}`)}</div>`;

const drawPanel = () => {
  const b = BOOKS.find(x => x.id === state.sel);
  $('right').innerHTML = `<div class="rin">${b ? panelHTML(b) : `<div class="phead"><span>Book details</span><button class="ib" data-close aria-label="Close details">${ICON.x}</button></div><div class="pempty">${ICON.doc}<p>${PANEL_EMPTY}</p></div>`}</div>`;
};
drawPanel();

// ---------- behavior ----------
const THEME_KEY = 'theme';
const body = $('body');
const setTheme = (t, save) => {
  document.documentElement.dataset.theme = t;
  $('themeBtn').innerHTML = t === 'dark' ? ICON.sun : ICON.moon;
  $('themeBtn').setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  if (save) try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
};
setTheme(document.documentElement.dataset.theme || 'dark');
const wide = () => matchMedia('(min-width:1181px)').matches;
const setPanel = open => wide() ? body.classList.toggle('no-r', !open) : body.classList.toggle('show-r', open);
const selectBook = id => {
  state.sel = id; drawPanel(); setPanel(true);
  document.querySelectorAll('.row').forEach(r => r.classList.toggle('sel', +r.dataset.row === id));
};
const find = id => BOOKS.find(b=>b.id===+id);

document.addEventListener('click', e => {
  const t = e.target, hit = s => t.closest(s);
  const act = hit('[data-act]')?.dataset.act;
  if (act==='left') matchMedia('(max-width:760px)').matches ? body.classList.toggle('show-l') : body.classList.toggle('no-l');
  if (act==='theme') setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
  if (act==='right') wide() ? body.classList.toggle('no-r') : body.classList.toggle('show-r');
  if (hit('.pin')) { document.querySelectorAll('.pin').forEach(p=>p.classList.remove('on')); hit('.pin').classList.add('on'); }
  if (hit('[data-nav]')) { document.querySelectorAll('[data-nav]').forEach(p=>p.classList.remove('on')); hit('[data-nav]').classList.add('on'); }
  if (hit('[data-close]')) setPanel(false);
  if (hit('.row') && !hit('button')) selectBook(+hit('.row').dataset.row);
  if (hit('[data-tab]')) { state.tab = hit('[data-tab]').dataset.tab; drawTabs(); drawCar(); }
  if (hit('[data-sort]')) { state.dir = state.dir===1 ? -1 : 1; state.page = 1; drawRows(); }
  if (hit('[data-page]') && !hit('[data-page]').disabled) { state.page = +hit('[data-page]').dataset.page; drawRows(); document.querySelector('.tw').scrollIntoView({behavior:'smooth',block:'start'}); }
  if (hit('#prev')) $('car').scrollBy({left:-$('car').clientWidth*.8,behavior:'smooth'});
  if (hit('#next')) $('car').scrollBy({left:$('car').clientWidth*.8,behavior:'smooth'});
  if (hit('[data-take]')) { Object.assign(find(hit('[data-take]').dataset.take),{s:'mine',d:14}); drawRows(); drawPanel(); }
  if (hit('[data-ret]'))  { find(hit('[data-ret]').dataset.ret).s = 'free'; drawRows(); drawPanel(); }
  if (hit('[data-bell]')) { const b = find(hit('[data-bell]').dataset.bell); b.n = b.n ? 0 : 1; drawRows(); drawPanel(); }
});

$('pager').addEventListener('change', e => { if (e.target.id === 'size') { 
    state.size = +e.target.value; state.page = 1; drawRows(); } 
  });

$('rows').addEventListener('keydown', e => { 
  const r = e.target.closest('.row'); 
  if (r && e.target === r && (e.key === 'Enter' || e.key === ' ')) { 
    e.preventDefault(); selectBook(+r.dataset.row); } 
  });

addEventListener('keydown', e => { 
  if (e.key === 'Escape') setPanel(false); 
});

$('car').addEventListener('scroll', thumb, {passive:true});
addEventListener('resize', thumb);

$('q').addEventListener('input', e => { 

  state.q = e.target.value.trim().toLowerCase(); 
  state.page = 1; 
  drawCar(); 
  drawRows(); 
});

$('cat').addEventListener('change', e => { 

  state.cat = e.target.value; 
  state.page = 1; 
  drawCar(); 
  drawRows(); 
});
