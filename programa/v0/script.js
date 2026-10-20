// const EVENTS = JSON.parse(document.getElementById('events-data').textContent);

const MONTH_NAMES = ["януари","февруари","март","април","май","юни","юли","август","септември","октомври","ноември","декември"];
const DOW_NAMES = ["нед","пон","вт","ср","чет","пет","съб"];

function parseDate(s){
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}

// ---------- Build filter option sets ----------
const groups = ["Всички","1","2","3","4","5","6"];
const types = [
  {key:"Лекция", label:"Лекции", cls:"type-lecture"},
  {key:"Упражнение", label:"Упражнения", cls:"type-exercise"},
  {key:"Спорт", label:"Спорт", cls:"type-sport"}
];
const subjectsSet = Array.from(new Set(EVENTS.map(e=>e.subject))).sort((a,b)=>a.localeCompare(b,'bg'));

const state = {
  group: "Всички",
  types: new Set(types.map(t=>t.key)),
  subject: "Всички"
};

// ---------- Render filter controls ----------
const groupChipsEl = document.getElementById('groupChips');
groups.forEach(g=>{
  const btn = document.createElement('button');
  btn.className = 'chip' + (g===state.group ? ' active':'');
  btn.textContent = g==="Всички" ? "Всички" : "Гр. "+g;
  btn.dataset.group = g;
  btn.addEventListener('click', ()=>{
    state.group = g;
    [...groupChipsEl.children].forEach(c=>c.classList.toggle('active', c.dataset.group===g));
    render();
  });
  groupChipsEl.appendChild(btn);
});

const typeChipsEl = document.getElementById('typeChips');
types.forEach(t=>{
  const btn = document.createElement('button');
  btn.className = 'chip ' + t.cls + ' active';
  btn.textContent = t.label;
  btn.dataset.type = t.key;
  btn.addEventListener('click', ()=>{
    if(state.types.has(t.key)){
      if(state.types.size>1){ state.types.delete(t.key); }
    } else {
      state.types.add(t.key);
    }
    btn.classList.toggle('active', state.types.has(t.key));
    render();
  });
  typeChipsEl.appendChild(btn);
});

const subjectSelectEl = document.getElementById('subjectSelect');
const allOpt = document.createElement('option');
allOpt.value = "Всички";
allOpt.textContent = "Всички предмети";
subjectSelectEl.appendChild(allOpt);
subjectsSet.forEach(s=>{
  const opt = document.createElement('option');
  opt.value = s;
  opt.textContent = s;
  subjectSelectEl.appendChild(opt);
});
subjectSelectEl.addEventListener('change', ()=>{
  state.subject = subjectSelectEl.value;
  render();
});

// ---------- Filtering ----------
function filterEvents(){
  return EVENTS.filter(e=>{
    if(!state.types.has(e.type)) return false;
    if(state.subject !== "Всички" && e.subject !== state.subject) return false;
    if(state.group !== "Всички"){
      if(e.group !== "Всички" && e.group !== state.group) return false;
    }
    return true;
  });
}

// ---------- Rendering ----------
const root = document.getElementById('calendarRoot');
const resultsCountEl = document.getElementById('resultsCount');

function groupByMonthAndDate(list){
  const byMonth = new Map(); // key "YYYY-MM" -> Map(date -> [events])
  list.forEach(e=>{
    const monthKey = e.date.slice(0,7);
    if(!byMonth.has(monthKey)) byMonth.set(monthKey, new Map());
    const byDate = byMonth.get(monthKey);
    if(!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date).push(e);
  });
  return byMonth;
}

function render(){
  const filtered = filterEvents();
//   resultsCountEl.innerHTML = `<strong>${filtered.length}</strong> занятия в изгледа`;
  root.innerHTML = '';

  if(filtered.length === 0){
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `<div class="big">Няма съвпадения</div><div>Опитайте с друга комбинация от филтри.</div>`;
    root.appendChild(empty);
    return;
  }

  const byMonth = groupByMonthAndDate(filtered);
  const monthKeys = Array.from(byMonth.keys()).sort();

  monthKeys.forEach(mk=>{
    const [y,m] = mk.split('-').map(Number);
    const section = document.createElement('section');
    section.className = 'month-section';

    const dateMap = byMonth.get(mk);
    const dateKeys = Array.from(dateMap.keys()).sort();
    const totalCount = dateKeys.reduce((sum,dk)=>sum+dateMap.get(dk).length,0);

    const header = document.createElement('div');
    header.className = 'month-header';
    header.innerHTML = `<h2>${MONTH_NAMES[m-1]} ${y}</h2><span class="month-count">${totalCount} занятия</span>`;
    section.appendChild(header);

    dateKeys.forEach(dk=>{
      const d = parseDate(dk);
      const dayRow = document.createElement('div');
      dayRow.className = 'day-row';

      const badge = document.createElement('div');
      badge.className = 'day-badge';
      badge.innerHTML = `<span class="num">${d.getDate()}</span><span class="dow">${DOW_NAMES[d.getDay()]}</span>`;
      dayRow.appendChild(badge);

      const list = document.createElement('div');
      list.className = 'event-list';

      const dayEvents = dateMap.get(dk).slice().sort((a,b)=> a.start.localeCompare(b.start));
      dayEvents.forEach(e=>{
        const card = document.createElement('div');
        card.className = 'event-card type-' + e.type;

        const groupLabel = e.group === "Всички" ? "Всички групи" : "Гр. " + e.group;
        const metaParts = [];
        if(e.teacher) metaParts.push(e.teacher);
        if(e.room) metaParts.push(e.room);

        card.innerHTML = `
          <div class="event-top">
            <span class="event-time">${e.start}\u2013${e.end}</span>
            <div class="event-badges">
              <span class="badge type-${e.type}">${e.type}</span>
              <span class="badge group-badge">${groupLabel}</span>
            </div>
          </div>
          <div class="event-subject">${e.subject}</div>
          <div class="event-meta">${metaParts.map(p=>`<span>${p}</span>`).join('')}</div>
          ${e.note ? `<div class="event-note">${e.note}</div>` : ''}
        `;
        list.appendChild(card);
      });

      dayRow.appendChild(list);
      section.appendChild(dayRow);
    });

    root.appendChild(section);
  });
}

render();