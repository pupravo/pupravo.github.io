const CASES = ['Именителен', 'Родителен', 'Дателен', 'Винителен', 'Творителен'];
const NUMBERS = [['sg', 'Единствено число'], ['pl', 'Множествено число']];
const DECLS = [[1, 'I скл.', 'ж. р.'], [2, 'II скл.', 'м. р. / ср. р.'], [3, 'III скл.', 'ж. р. / ср. р.'], [4, 'IV скл.', 'м. р. / ср. р.'], [5, 'V скл.', '']];
const DECL_NAMES = {1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V'};
const GENDERS = {m: 'м. р.', f: 'ж. р.', n: 'ср. р.'};
// null = именителен ед.ч. (дадената форма) или винителен = именителен (ср. р.)
const ENDINGS = {
  1: {mf: {sg: ['a', 'ae', 'ae', 'am', 'a'], pl: ['ae', 'arum', 'is', 'as', 'is']}},
  2: {mf: {sg: ['us', 'i', 'o', 'um', 'o'], pl: ['i', 'orum', 'is', 'os', 'is']},
      n:  {sg: ['um', 'i', 'o', 'um', 'o'], pl: ['a', 'orum', 'is', 'a', 'is']}},
  3: {mf: {sg: [null, 'is', 'i', 'em', 'e'], pl: ['es', 'um', 'ibus', 'es', 'ibus']},
      n:  {sg: [null, 'is', 'i', null, 'e'], pl: ['a', 'um', 'ibus', 'a', 'ibus']}},
  4: {mf: {sg: ['us', 'us', 'ui', 'um', 'u'], pl: ['us', 'uum', 'ibus', 'us', 'ibus']},
      n:  {sg: ['u', 'us', 'u', 'u', 'u'], pl: ['ua', 'uum', 'ibus', 'ua', 'ibus']}},
  5: {mf: {sg: ['es', 'ei', 'ei', 'em', 'e'], pl: ['es', 'erum', 'ebus', 'es', 'ebus']}}
};
const GEN_SUFFIX = [['ae', 1], ['ei', 5], ['us', 4], ['is', 3], ['i', 2]];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

function analyze(w) {
  const hit = w.decl ? GEN_SUFFIX.find(([, d]) => d === w.decl) : GEN_SUFFIX.find(([suf]) => w.gen.endsWith(suf));
  if (!hit) { console.warn('Непознато склонение за', w.nom, w.gen); return null; }
  return {...w, decl: hit[1], suffix: hit[0], stem: w.gen.slice(0, -hit[0].length)};
}
const ENTRIES = WORDS.map(analyze).filter(Boolean);
const state = {sel: ENTRIES.length ? ENTRIES[0].nom : null, query: '', decl: 0};

const endingsFor = w => (w.gender === 'n' && ENDINGS[w.decl].n) || ENDINGS[w.decl].mf;

// цялата форма на избраната дума (в нейната колонка)
function wordForm(w, num, i) {
  const end = endingsFor(w)[num][i];
  return end === null ? esc(w.nom) : esc(w.stem) + '<b>' + end + '</b>';
}
// само окончанията (в останалите колонки)
function endingsOnly(decl, num, i) {
  const e = ENDINGS[decl], mf = e.mf[num][i], n = e.n && e.n[num][i];
  const lab = x => x === null ? `<span class="var">${i === 0 ? 'различна' : '= им.'}</span>` : `<b>-${x}</b>`;
  return !e.n || mf === n ? lab(mf) : lab(mf) + ' <span class="sep">/</span> ' + lab(n);
}

function tableFor(w, num, title) {
  const cls = k => k === w.decl ? ' class="col"' : '';
  const head = DECLS.map(([k, name, sub]) => `<th${cls(k)}>${name}<small>${sub}</small></th>`).join('');
  const rows = CASES.map((c, i) => `<tr><td>${c}</td>` +
    DECLS.map(([k]) => `<td${cls(k)}>${k === w.decl ? wordForm(w, num, i) : endingsOnly(k, num, i)}</td>`).join('') + '</tr>').join('');
  return `<h2>${title}</h2><div class="wrap"><table><thead><tr><th>Падеж</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderDetail() {
  const w = ENTRIES.find(x => x.nom === state.sel);
  if (!w) { $('info').innerHTML = ''; $('tables').innerHTML = ''; return; }
  $('info').innerHTML = `<span class="word">${esc(w.nom)}, ${esc(w.gen)}</span>
    <span class="badge">${DECL_NAMES[w.decl]} склонение</span>
    <span class="meta">${GENDERS[w.gender]} · ${esc(w.bg)}</span>`;
  $('tables').innerHTML = NUMBERS.map(([num, title]) => tableFor(w, num, title)).join('');
}

function renderChips() {
  const items = [[0, 'Всички'], ...DECLS.map(([k, name]) => [k, name])];
  $('chips').innerHTML = items.map(([k, label]) =>
    `<button class="chip${state.decl === k ? ' on' : ''}" data-decl="${k}" type="button">${label}</button>`).join('');
}

function filtered() {
  const q = state.query.trim().toLowerCase();
  return ENTRIES
    .filter(w => !state.decl || w.decl === state.decl)
    .filter(w => !q || (w.nom + ' ' + w.gen + ' ' + w.bg).toLowerCase().includes(q))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'la'));
}

function renderList() {
  const list = filtered();
  $('list').innerHTML = list.map(w => `<div class="item${w.nom === state.sel ? ' sel' : ''}" data-nom="${esc(w.nom)}">
    <b>${esc(w.nom)}</b><span class="bg">${esc(w.bg)}</span><span class="badge">${DECL_NAMES[w.decl]}</span></div>`).join('')
    || '<div class="item">Няма резултати.</div>';
  $('count').textContent = `${list.length} от ${ENTRIES.length} думи`;
}

function select(nom) { state.sel = nom; renderList(); renderDetail(); }

$('chips').addEventListener('click', e => {
  const b = e.target.closest('[data-decl]'); if (!b) return;
  state.decl = Number(b.dataset.decl); renderChips(); renderList();
});
$('list').addEventListener('click', e => {
  const it = e.target.closest('[data-nom]'); if (it) select(it.dataset.nom);
});
$('q').addEventListener('input', e => { state.query = e.target.value; renderList(); });

renderChips(); renderList(); renderDetail();