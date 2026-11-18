const W = 900;                          // ширина на платното; AX е вертикалната ос на симетрия
const AX = W / 2;
const MARKERS = { o: 'var(--orange)', g: 'var(--green)', r: 'var(--red)' };

// Кутийките нямат фиксирана ширина: тя се изчислява от текста (виж fitNodes)
const NH = 52, PAD_X = 22, GAP = 3;
const FONT = '600 20px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// Връзките се задават с кутийки (a -> b). Пътят се изчислява автоматично:
//  - ако кутийките са точно една до друга/една над друга -> права стрелка
//  - иначе (диагонал или има кутийка между тях) -> дъга
//  bow: 1 = дъгата е навън от оста (по подразбиране), -1 = навътре, 0.5 = по-плитка

// --- Ширина на кутийките според текста ---------------------------------
const measure = (() => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = FONT;
  return t => ctx.measureText(t).width;
})();
const fitNodes = () => CASES.forEach(c => {
  c.map = {};
  c.NODES.forEach(n => {
    n.w = 2 * Math.ceil((measure(n.t) + 2 * PAD_X) / 2);   // четна ширина = текст + отстъп
    n.h = NH;
    c.map[n.id] = n;
  });
});

// --- Геометрия на стрелките -------------------------------------------
const r1 = v => Math.round(v * 10) / 10;
// точка върху контура на кутията n по лъча от центъра ѝ към (tx,ty)
const border = (n, tx, ty) => {
  const dx = tx - n.x, dy = ty - n.y;
  const t = Math.min((n.w / 2 + GAP) / Math.abs(dx), (n.h / 2 + GAP) / Math.abs(dy));
  return [n.x + dx * t, n.y + dy * t];
};
// пресича ли отсечката p0-p1 някоя от другите кутийки?
const blocked = (p0, p1, others) => {
  for (let i = 1; i < 40; i++) {
    const x = p0[0] + (p1[0] - p0[0]) * i / 40, y = p0[1] + (p1[1] - p0[1]) * i / 40;
    if (others.some(o => Math.abs(x - o.x) < o.w / 2 + 8 && Math.abs(y - o.y) < o.h / 2 + 8)) return true;
  }
  return false;
};
const edgeGeom = e => {
  const nodes = C.map, A = nodes[e.a], B = nodes[e.b];
  const others = C.NODES.filter(n => n !== A && n !== B);
  const dx = B.x - A.x, dy = B.y - A.y;
  // 1) кутийките са непосредствено вляво/вдясно/горе/долу -> права стрелка
  if (Math.abs(dx) < 2 || Math.abs(dy) < 2) {
    const p0 = border(A, B.x, B.y), p1 = border(B, A.x, A.y);
    if (!blocked(p0, p1, others))
      return { d: `M${r1(p0[0])},${r1(p0[1])} L${r1(p1[0])},${r1(p1[1])}`, mid: [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2] };
  }
  // 2) иначе -> дъга (квадратична крива). Огъването е огледално спрямо оста AX
  const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux, mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
  const bow = e.bow ?? 1;
  let sgn = Math.abs(nx) > .3 ? (nx * (mx - AX) >= 0 ? 1 : -1) : (ny < 0 ? 1 : -1);
  sgn *= Math.sign(bow);
  const k = Math.min(.28 * len, 110) * Math.abs(bow);
  const cx = mx + sgn * nx * k, cy = my + sgn * ny * k;
  const p0 = border(A, cx, cy), p1 = border(B, cx, cy);
  return {
    d: `M${r1(p0[0])},${r1(p0[1])} Q${r1(cx)},${r1(cy)} ${r1(p1[0])},${r1(p1[1])}`,
    mid: [.25 * p0[0] + .5 * cx + .25 * p1[0], .25 * p0[1] + .5 * cy + .25 * p1[1]]
  };
};

let cur = 0, C = CASES[0];
const $ = id => document.getElementById(id);

const nodeStr = (n, anim) => {
  const cls = ['node',
    anim && n.s === cur ? 'enter' : '',
    n.dead <= cur ? 'dead' : '',
    anim && n.dead === cur ? 'dying' : '',
    n.ok <= cur ? 'ok' : '',
    cur === C.STEPS.length - 1 && n.ok ? 'win' : ''].join(' ');
  return `<g class="${cls}"><rect x="${n.x - n.w / 2}" y="${n.y - n.h / 2}" width="${n.w}" height="${n.h}" rx="10"/><text x="${n.x}" y="${n.y}" dy=".35em">${n.t}</text></g>`;
};
const edgeStr = (e, g, anim) =>
  `<path class="edge ${e.c} ${e.dash ? 'dashed' : 'solid'} ${anim && e.s === cur ? 'enter' : ''}" d="${g.d}" ${e.dash ? '' : 'pathLength="1"'} marker-end="url(#ar-${e.c})"/>`;
const markStr = (m, g, anim) => {
  const [x, y] = g[m.e].mid;
  return `<g class="mark ${anim && m.s === cur ? 'enter' : ''}"><path d="M${r1(x - 12)},${r1(y - 12)} l24,24 m0,-24 l-24,24"/></g>`;
};
const noteStr = (n, anim) =>
  `<text class="note ${n.c} ${anim && n.s === cur ? 'enter' : ''}" x="${n.x}" text-anchor="${n.a}">${n.l.map((t, i) => `<tspan x="${n.x}" y="${n.y + i * 22}">${t}</tspan>`).join('')}</text>`;

const draw = anim => {
  const vis = a => a.filter(e => e.s <= cur);
  const geo = {};
  C.EDGES.forEach(e => geo[e.id] = edgeGeom(e));
  $('stage').innerHTML = `<svg viewBox="0 0 ${W} ${C.H}" role="img" aria-label="Схема на казуса">
    <defs>
      <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="var(--hatch)"/><line x1="0" y1="0" x2="0" y2="8" stroke="var(--red)" stroke-width="2" opacity=".45"/></pattern>
      ${Object.entries(MARKERS).map(([k, v]) => `<marker id="ar-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${v}"/></marker>`).join('')}
    </defs>
    ${vis(C.EDGES).map(e => edgeStr(e, geo[e.id], anim)).join('')}
    ${vis(C.MARKS).map(m => markStr(m, geo, anim)).join('')}
    ${vis(C.NODES).map(n => nodeStr(n, anim)).join('')}
    ${vis(C.NOTES).map(n => noteStr(n, anim)).join('')}
  </svg>`;
};

const side = () => {
  const st = C.STEPS[cur], last = cur === C.STEPS.length - 1;
  $('side').innerHTML = `<h1>Казус</h1>
    <select class="sel" onchange="setCase(+this.value)">${CASES.map((c, i) => `<option value="${i}" ${c === C ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
    <div class="dots">${C.STEPS.map((_, i) => `<i class="${i < cur ? 'done' : i === cur ? 'now' : ''}" onclick="go(${i})"></i>`).join('')}</div>
    <h2 class="st">${cur + 1}. ${st.title}</h2>
    <div class="txt">${st.p.map(t => `<p>${t}</p>`).join('')}${st.rule ? `<div class="rule"><b>${st.rule[0]}</b>${st.rule[1]}</div>` : ''}</div>
    <div class="row">
      <button class="btn ghost" onclick="go(${cur - 1})" ${cur ? '' : 'disabled'}>Назад</button>
      <button class="btn" onclick="go(${last ? 0 : cur + 1})">${last ? 'Отначало' : 'Следваща стъпка'}</button>
    </div>`;
};
const go = i => {
  const anim = i === cur + 1;
  cur = i;
  draw(anim);
  side();
};

const setCase = i => { C = CASES[i]; go(0); };

fitNodes();
go(0);
