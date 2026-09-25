const MONTH_NAMES = [
    "Януари","Февруари","Март","Април","Май","Юни","Юли","Август","Септември","Октомври","Ноември","Декември"
];

const MONTH_ABBR = [
    "яну","фев","мар","апр","май","юни","юли","авг","сеп","окт","ное","дек"
];

const DOW_FULL = [
    "Неделя","Понеделник","Вторник","Сряда","Четвъртък","Петък","Събота"
];

const TYPES = [
    "Всички","Лекция","Упражнение","Спорт"
];


function pad(n) { 
    return n<10 ? '0'+n : ''+n; 
}

function toKey(y,m,d) { 
    return `${y}-${pad(m+1)}-${pad(d)}`; 
}

function parseDate(s) { 

    const [y,m,d] = s.split('-').map(Number); 
    return new Date(y,m-1,d); 
}

const REAL_TODAY = new Date();
const todayKey = toKey(REAL_TODAY.getFullYear(), REAL_TODAY.getMonth(), REAL_TODAY.getDate());

// index events by date
const eventsByDate = new Map();
EVENTS.forEach(e=>{
  if(!eventsByDate.has(e.date)) eventsByDate.set(e.date, []);
  eventsByDate.get(e.date).push(e);
});
eventsByDate.forEach(list=>list.sort((a,b)=>a.start.localeCompare(b.start)));

// default view: first month that actually has events
const firstEventDate = parseDate(EVENTS.slice().sort((a,b)=>a.date.localeCompare(b.date))[0].date);

const state = {
  view  : "list", // "grid" | "list"
  year  : firstEventDate.getFullYear(),
  month : firstEventDate.getMonth(), // 0-indexed
  type  : "Всички",
  group : "Всички",
  search: ""
};

function eventMatches(e) {

  if(state.type !== "Всички" && e.type !== state.type) return false;
  if(state.group !== "Всички" && e.group !== "Всички" && e.group !== state.group) return false;
  if(state.search){
    const q = state.search.toLowerCase();
    const hay = (e.subject+" "+e.teacher+" "+e.room).toLowerCase();
    if(!hay.includes(q)) return false;
  }
  return true;
}

// ---------- Type tabs ----------
const typeTabsEl = document.getElementById('typeTabs');
TYPES.forEach(t=>{
  const btn = document.createElement('button');
  btn.className = 'type-tab' + (t===state.type ? ' active':'');
  btn.textContent = t;
  btn.dataset.type = t;
  btn.addEventListener('click', ()=>{
    state.type = t;
    [...typeTabsEl.children].forEach(c=>c.classList.toggle('active', c.dataset.type===t));
    renderAll();
  });
  typeTabsEl.appendChild(btn);
});

// ---------- Group select (topbar) ----------
const groupSelectEl = document.getElementById('groupSelect');
["Всички","1","2","3","4","5","6"].forEach(g=>{
  const opt = document.createElement('option');
  opt.value = g;
  opt.textContent = g==="Всички" ? "Всички групи" : "Група "+g;
  groupSelectEl.appendChild(opt);
});
groupSelectEl.addEventListener('change', ()=>{
  state.group = groupSelectEl.value;
  //syncGroupPills();
  renderAll();
});

// ---------- Group pills (right panel) ----------
// const groupPillsEl = document.getElementById('groupPills');
// ["Всички","1","2","3","4","5","6"].forEach(g=>{
//   const btn = document.createElement('button');
//   btn.className = 'pill' + (g===state.group ? ' active':'');
//   btn.textContent = g==="Всички" ? "Всички" : g;
//   btn.dataset.group = g;
//   btn.addEventListener('click', ()=>{
//     state.group = g;
//     groupSelectEl.value = g;
//     syncGroupPills();
//     renderAll();
//   });
//   groupPillsEl.appendChild(btn);
// });
// function syncGroupPills(){
//   [...groupPillsEl.children].forEach(c=>c.classList.toggle('active', c.dataset.group===state.group));
// }

// ---------- Search ----------
// document.getElementById('searchInput').addEventListener('input', (e)=>{
//   state.search = e.target.value.trim();
//   renderAll();
// });

// ---------- View toggle ----------
const viewToggleEl  = document.getElementById('viewToggle');
const gridWrapEl    = document.getElementById('gridWrap');
const listWrapEl    = document.getElementById('listWrap');

viewToggleEl.addEventListener('click', (e) => {

  const btn = e.target.closest('.view-btn');
  if(!btn) return;
  const v   = btn.dataset.view;
  if(v === state.view) return;
  state.view = v;

  console.log("@@@@@@@@@@@");
    console.log(state.view);
    console.log(viewToggleEl.children);
    console.log("@@@@@@@@@@@");



  [...viewToggleEl.children].forEach(c=>c.classList.toggle('active', c.dataset.view===v));
  gridWrapEl.style.display = v==='grid' ? 'block' : 'none';
  listWrapEl.style.display = v==='list' ? 'block' : 'none';
  renderAll();
});

// ---------- Nav ----------
document.getElementById('prevBtn').addEventListener('click', ()=>{
  if(state.view === 'list'){ navigateListMonth(-1); return; }
  state.month--;
  if(state.month<0){ state.month=11; state.year--; }
  renderAll();
});
document.getElementById('nextBtn').addEventListener('click', ()=>{
  if(state.view === 'list'){ navigateListMonth(1); return; }
  state.month++;
  if(state.month>11){ state.month=0; state.year++; }
  renderAll();
});
document.getElementById('todayBtn').addEventListener('click', ()=>{
  if(state.view === 'list'){
    state.year = REAL_TODAY.getFullYear();
    state.month = REAL_TODAY.getMonth();
    renderAll();
    scrollListToToday();
    return;
  }
  state.year = REAL_TODAY.getFullYear();
  state.month = REAL_TODAY.getMonth();
  renderAll();
});

// ---------- Grid rendering ----------
const calGridEl  = document.getElementById('calGrid');
const calTitleEl = document.getElementById('calTitle');

function renderGrid() {

  calTitleEl.textContent = `${MONTH_NAMES[state.month]} ${state.year}`;
  calGridEl.innerHTML = '';

  DOW_FULL.forEach(d=>{
    const cell          = document.createElement('div');
    cell.className      = 'dow-cell';
    cell.textContent    = d.slice(0,3);
    calGridEl.appendChild(cell);
  });

  const firstOfMonth = new Date(state.year, state.month, 1);
  const startOffset = firstOfMonth.getDay(); // 0=Sun
  const gridStart = new Date(state.year, state.month, 1 - startOffset);

  const totalCells = 42; // 6 weeks
  for(let i=0;i<totalCells;i++) {

    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate()+i);
    const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
    const isOutside = d.getMonth() !== state.month;
    const isToday = key === todayKey;

    const cell = document.createElement('div');
    cell.className = 'day-cell' + (isOutside?' outside':'') + (isToday?' today':'');
    cell.dataset.date = key;

    const num = document.createElement('span');
    num.className = 'day-num';
    if(d.getDate()===1 && isOutside){
      num.textContent = MONTH_ABBR[d.getMonth()] + ' 1';
    } else {
      num.textContent = d.getDate();
    }
    cell.appendChild(num);

    const dayEvents = (eventsByDate.get(key) || []).filter(eventMatches);
    //const shown = dayEvents.slice(0,3);
    dayEvents.forEach(e=> {
    //   const chip        = document.createElement('div');
    //   chip.className    = 'chip type-'+e.type;
    //   chip.textContent  = `${e.start} ${e.subject}`;
    //   cell.appendChild(chip);
        cell.innerHTML += `
            <div class="chip type-${e.type}" style="display: flex">
                <div>
                    <div>${e.start} - ${e.end}</div>
                    <div>${e.subject}</div>
                </div>
            </div>
        `


    });
    // if(dayEvents.length > 3){
    //   const more = document.createElement('div');
    //   more.className = 'more-chip';
    //   more.textContent = `+${dayEvents.length-3} още`;
    //   cell.appendChild(more);
    // }

    cell.addEventListener('click', ()=> openDayModal(key));
    calGridEl.appendChild(cell);
  }
}


// ---------- Day modal ----------
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

function openDayModal(key) {

  const dayEvents = (eventsByDate.get(key) || []).filter(eventMatches);
  const d = parseDate(key);
  modalTitle.textContent = `${DOW_FULL[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
  modalBody.innerHTML = '';

  if(dayEvents.length===0) {

    const empty = document.createElement('div');
    empty.className = 'upcoming-empty';
    empty.textContent = 'Няма занятия за този ден.';
    modalBody.appendChild(empty);
  } else {
    dayEvents.forEach(e=>{
      const groupLabel = e.group==="Всички" ? "Всички групи" : "Гр. "+e.group;
      const card = document.createElement('div');
      card.className = 'modal-event type-'+e.type;
      card.innerHTML = `
        <div class="m-top">
          <span class="m-time">${e.start}\u2013${e.end}</span>
          <span class="modal-badge">${e.type}</span>
        </div>
        <div class="m-subject">${e.subject}</div>
        <div class="m-meta">${groupLabel}${e.teacher? ' · '+e.teacher:''}${e.room? ' · '+e.room:''}</div>
        ${e.note? `<div class="m-note">${e.note}</div>` : ''}
      `;
      modalBody.appendChild(card);
    });
  }
  modalOverlay.classList.add('open');
}
document.getElementById('modalClose').addEventListener('click', ()=> modalOverlay.classList.remove('open'));
modalOverlay.addEventListener('click', (e)=>{ if(e.target===modalOverlay) modalOverlay.classList.remove('open'); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') modalOverlay.classList.remove('open'); });

// ---------- ICS export ----------
function toICSDate(dateStr, timeStr){
  const [y,m,d] = dateStr.split('-');
  const [hh,mm] = timeStr.split(':');
  return `${y}${m}${d}T${hh}${mm}00`;
}
function escapeICS(s){
  return String(s||'').replace(/([,;])/g,'\\$1');
}
// document.getElementById('icsBtn').addEventListener('click', ()=>{
//   const list = EVENTS.filter(eventMatches);
//   let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Pravo Raspisanie//BG\r\nCALSCALE:GREGORIAN\r\n';
//   list.forEach(e=>{
//     const groupLabel = e.group==="Всички" ? "всички групи" : "гр. "+e.group;
//     ics += 'BEGIN:VEVENT\r\n';
//     ics += `UID:${e.id}-${e.date}@raspisanie-pravo\r\n`;
//     ics += `DTSTART:${toICSDate(e.date, e.start)}\r\n`;
//     ics += `DTEND:${toICSDate(e.date, e.end)}\r\n`;
//     ics += `SUMMARY:${escapeICS(e.subject+' ('+e.type+')')}\r\n`;
//     ics += `DESCRIPTION:${escapeICS(groupLabel + (e.teacher? ', '+e.teacher:''))}\r\n`;
//     ics += `LOCATION:${escapeICS(e.room)}\r\n`;
//     ics += 'END:VEVENT\r\n';
//   });
//   ics += 'END:VCALENDAR\r\n';
//   const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'raspisanie-pravo.ics';
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// });

// ---------- List (agenda) rendering ----------
let listMonthKeys = [];

function renderList() {

    listWrapEl.style.display = "block";

  const filtered = EVENTS.filter(eventMatches).slice().sort((a,b)=> (a.date+a.start).localeCompare(b.date+b.start));
  listWrapEl.innerHTML = '';

  if(filtered.length === 0) {

    listMonthKeys = [];
    const empty = document.createElement('div');
    empty.className = 'list-empty';
    empty.innerHTML = `<div class="le-big">Няма съвпадения</div><div>Опитайте с друга комбинация от филтри.</div>`;
    listWrapEl.appendChild(empty);
    calTitleEl.textContent = 'Няма резултати';
    return;
  }

  const byMonth = new Map();
  filtered.forEach(e=>{
    const mk = e.date.slice(0,7);
    if(!byMonth.has(mk)) byMonth.set(mk, new Map());
    const byDate = byMonth.get(mk);
    if(!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date).push(e);
  });
  listMonthKeys = Array.from(byMonth.keys()).sort();

  listMonthKeys.forEach(mk=>{
    const [y,m] = mk.split('-').map(Number);
    const dateMap = byMonth.get(mk);
    const dateKeys = Array.from(dateMap.keys()).sort();
    const totalCount = dateKeys.reduce((sum,dk)=>sum+dateMap.get(dk).length,0);

    const monthEl = document.createElement('div');
    monthEl.className = 'list-month';
    monthEl.dataset.monthKey = mk;

    const header = document.createElement('div');
    header.className = 'list-month-header';
    header.innerHTML = `<h4>${MONTH_NAMES[m-1]} ${y}</h4><span class="lm-count">${totalCount} занятия</span>`;
    monthEl.appendChild(header);

    dateKeys.forEach(dk=>{
      const d = parseDate(dk);
      const row = document.createElement('div');
      row.className = 'list-day-row' + (dk===todayKey ? ' is-today' : '');
      row.dataset.date = dk;

      const badge = document.createElement('div');
      badge.className = 'list-day-badge';
      badge.innerHTML = `<span class="ld-num">${d.getDate()}</span><span class="ld-dow">${DOW_FULL[d.getDay()].slice(0,3)}</span>`;
      row.appendChild(badge);

      const eventsCol = document.createElement('div');
      eventsCol.className = 'list-events';
      dateMap.get(dk).forEach(e=>{
        const groupLabel = e.group==="Всички" ? "Всички групи" : "Гр. "+e.group;
        const card = document.createElement('div');
        card.className = 'modal-event type-'+e.type;
        card.innerHTML = `
          <div class="m-top">
            <span class="m-time">${e.start}\u2013${e.end}</span>
            <span class="modal-badge">${e.type}</span>
          </div>
          <div class="m-subject">${e.subject}</div>
          <div class="m-meta">${groupLabel}${e.teacher? ' · '+e.teacher:''}${e.room? ' · '+e.room:''}</div>
          ${e.note? `<div class="m-note">${e.note}</div>` : ''}
        `;
        eventsCol.appendChild(card);
      });
      row.appendChild(eventsCol);
      monthEl.appendChild(row);
    });

    listWrapEl.appendChild(monthEl);
  });

  // keep title in sync with the closest rendered month to state.year/month
  const stateKey = `${state.year}-${pad(state.month+1)}`;
  if(!listMonthKeys.includes(stateKey)){
    const stateNum = state.year*12 + state.month;
    const nearest = listMonthKeys.reduce((best,k)=>{
      const [ky,km] = k.split('-').map(Number);
      const kNum = ky*12 + (km-1);
      const bestNum = (()=>{ const [by,bm]=best.split('-').map(Number); return by*12+(bm-1); })();
      return Math.abs(kNum-stateNum) < Math.abs(bestNum-stateNum) ? k : best;
    }, listMonthKeys[0]);
    const [y,m] = nearest.split('-').map(Number);
    state.year = y; state.month = m-1;
  }
  calTitleEl.textContent = `${MONTH_NAMES[state.month]} ${state.year}`;
}

function navigateListMonth(direction) {

  if(listMonthKeys.length===0) return;
  const stateKey = `${state.year}-${pad(state.month+1)}`;
  let idx = listMonthKeys.indexOf(stateKey);
  if(idx===-1){ idx = direction>0 ? -1 : listMonthKeys.length; }
  let newIdx = Math.max(0, Math.min(listMonthKeys.length-1, idx+direction));
  const key = listMonthKeys[newIdx];
  const [y,m] = key.split('-').map(Number);
  state.year = y; state.month = m-1;
  calTitleEl.textContent = `${MONTH_NAMES[state.month]} ${state.year}`;
  const el = listWrapEl.querySelector(`[data-month-key="${key}"] .list-month-header`);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}

function scrollListToToday(){
  const rows = [...listWrapEl.querySelectorAll('.list-day-row')];
  if(rows.length===0) return;
  const target = rows.find(r=> r.dataset.date >= todayKey) || rows[rows.length-1];
  target.scrollIntoView({behavior:'smooth', block:'center'});
}

// ---------- Render all ----------
function renderAll(){

  if(state.view === 'grid'){
    renderGrid();
  } else {
    renderList();
  }
}
renderAll();