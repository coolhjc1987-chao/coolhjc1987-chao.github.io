/* 第 5 节 · 成果：五张表 → 要素档案、知识图谱、RDF 数据（部件化）
   部件：results.deliverables / results.view（四页签，opts.tab 选初始页签）/ results.dossier / results.graph / results.ttl / results.tables */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el, esc = ui.esc;
  const MOD = 'results';
  const REC = 'dyh:records-changed';
  const IMG_TYPES = ['测绘图', '舆图', '照片'];
  const ELEMENT_CLS = ['E24', 'E25', 'E22', 'E26', 'E27'];

  /* ---------- 样式（每个部件都会调用；只注入一次） ---------- */
  const STYLE = `
.rs-part{padding:40px 0}
.rs-head h2{margin:0 0 6px}
.rs-why{color:var(--text2);font-size:17px;margin:0;max-width:820px;text-wrap:pretty}
.rs-hint{margin:16px 0 20px}
.rs-hint .hintbar{margin:0}
.rs-part .btn.pulse{border-radius:980px}
.rs-part .seg button.pulse{border-radius:8px}
.rs-part select.pulse{border-color:var(--accent)}
.rs-link{border:0;background:none;color:var(--accent);font:inherit;font-size:14px;font-weight:500;cursor:pointer;padding:0;text-decoration:none}
.rs-link::after{content:" ›"}
.rs-link:hover{text-decoration:underline}
.rs-src{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;color:var(--text2);margin:0 0 20px}
.rs-src i{width:8px;height:8px;border-radius:50%;background:var(--text3);flex:none}
.rs-src.mine i{background:#34C759}
.rs-src b{color:var(--text);font-weight:600}
.rs-seg{margin:0 0 24px}
.rs-seg button{padding:8px 20px;font-size:15px}
.rs-seg .ck{color:var(--ok);font-size:12px;margin-left:5px;font-weight:700}
.rs-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.rs-bar label{font-weight:600;color:var(--text);font-size:15px}
.rs-bar .note{font-size:14px;color:var(--text2)}
/* 交付 */
.rs-deliv td{vertical-align:middle}
.rs-deliv td.n{color:var(--text3);font-weight:600;width:36px}
.rs-deliv td.fn{font-family:var(--mono);font-size:12.5px;white-space:nowrap;color:var(--text2)}
.rs-deliv b{color:var(--text);font-weight:600}
.rs-lab{display:inline-block;font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-soft);border-radius:980px;padding:0 9px;line-height:1.8;margin-left:8px}
/* 档案 */
.dz{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:24px;box-shadow:var(--shadow);overflow:hidden}
.dz-head{padding:32px 36px 28px}
.dz-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dz-chip{font-family:var(--mono);font-size:12px;background:var(--bg2);color:var(--text2);padding:3px 10px;border-radius:980px}
.dz-kind{font-size:13px;color:var(--text3);font-weight:500}
.dz-name{font-size:44px;font-weight:700;color:var(--text);margin:12px 0 12px;letter-spacing:-.01em;line-height:1.1}
.dz-tags{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.dz-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:24px}
.dz-meta>div{background:var(--bg2);border-radius:16px;padding:14px 16px;font-size:14px;min-width:0}
.dz-meta .k{font-size:12px;color:var(--text3);display:block;margin-bottom:4px;font-weight:500}
.dz-meta .v{color:var(--text)}
.dz-meta .vline{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:3px}
.dz-link{color:var(--accent);cursor:pointer;font-weight:500}
.dz-link:hover{text-decoration:underline}
.dz-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--bg3)}
.dz-col{padding:24px 24px 28px;border-left:1px solid var(--bg3);min-width:0}
.dz-col:first-child{border-left:0;padding-left:36px}
.dz-colh{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.dz-glyph{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:19px;font-weight:700;color:#fff;flex:none}
.dz-colh b{display:block;color:var(--text);font-size:16px}
.dz-colh div span{font-size:12px;color:var(--text3)}
.dz-item{background:var(--bg2);border-radius:14px;padding:12px 14px;margin-bottom:10px}
.dz-item .t{font-size:15px;color:var(--text);font-weight:600;line-height:1.45}
.dz-item .m{font-size:12.5px;color:var(--text2);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.dz-item .m code{color:var(--text)}
.dz-fig{margin:0 0 14px}
.dz-fig svg{display:block;width:100%;max-width:440px;height:auto;border-radius:14px}
.dz-fig figcaption{font-size:14px;color:var(--text);margin-top:8px}
.dz-fig figcaption .m{font-size:12px;color:var(--text2)}
.dz-empty{border:1.5px dashed var(--sep);border-radius:14px;padding:14px;color:var(--text2);font-size:13.5px;text-align:center;margin-bottom:10px}
.dz-empty b{display:block;color:var(--text);font-size:14px;font-weight:600;margin-bottom:2px}
.dz-empty .rs-link{display:inline-block;margin-top:4px;font-size:13px}
.dz-tl{position:relative;margin:0 0 18px;padding-left:22px}
.dz-tl::before{content:"";position:absolute;left:5px;top:8px;bottom:8px;width:2px;background:var(--bg3);border-radius:1px}
.dz-ev{position:relative;margin-bottom:14px}
.dz-ev::before{content:"";position:absolute;left:-21px;top:6px;width:10px;height:10px;border-radius:50%;background:#1D1D1F;box-shadow:0 0 0 3px #fff}
.dz-ev .y{font-size:20px;font-weight:700;color:var(--text);line-height:1;letter-spacing:-.01em}
.dz-ev .y small{font-size:12px;color:var(--text3);font-weight:500;margin-left:6px;letter-spacing:0}
.dz-ev .nm{font-weight:600;color:var(--text);margin:6px 0 4px}
.dz-ev .m{font-size:12.5px;color:var(--text2);display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.dz-rels{list-style:none;padding:0;margin:0;font-size:13px}
.dz-rels li{padding:8px 0;border-top:1px solid var(--bg3);display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;color:var(--text)}
.dz-rels li:first-child{border-top:0}
.dz-sub{font-size:12px;color:var(--text3);font-weight:600;margin:4px 0 10px}
.dz-foot{border-top:1px solid var(--bg3);padding:12px 36px;font-size:12px;color:var(--text3);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;background:var(--bg2)}
.rs-conf{font-size:12px;font-weight:600}
.rs-conf.hi{color:var(--ok)} .rs-conf.mid{color:var(--warn)} .rs-conf.lo{color:var(--err)}
/* 图谱 */
.kg-wrap{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:20px;align-items:start}
.kg-box{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:22px;padding:10px;box-shadow:var(--shadow)}
.kg-box svg{display:block;width:100%;height:auto;user-select:none}
.kg-box svg .nd{cursor:pointer;outline:none}
.kg-box svg .nd:focus-visible .ring{stroke:#0071E3;stroke-width:3}
.kg-box svg .nd:hover .shape{filter:brightness(1.12)}
.kg-box svg.focus .nd,.kg-box svg.focus .eg{opacity:.12;transition:opacity .15s}
.kg-box svg.focus .nd.hl,.kg-box svg.focus .eg.hl{opacity:1}
.kg-box svg .nd.sel .ring{stroke:#0071E3;stroke-width:3.5}
.kg-box svg .nd.pulse .ring{animation:kgp 1.6s ease-out infinite}
@keyframes kgp{0%{stroke:#0071E3;stroke-width:2}50%{stroke:#0071E3;stroke-width:7;stroke-opacity:.5}100%{stroke:#0071E3;stroke-width:2}}
.kg-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--text2);padding:10px 12px 4px;border-top:1px solid var(--bg3);margin-top:6px}
.kg-legend span{display:inline-flex;align-items:center;gap:6px}
.kg-legend i{display:inline-block;width:12px;height:12px}
.kg-panel{position:sticky;top:76px}
.kg-panel .card{padding:20px}
.kg-panel h3{font-size:22px;margin:8px 0 8px}
.kg-panel ul{list-style:none;margin:0;padding:0}
.kg-panel li{font-size:13.5px;padding:8px 0;border-top:1px solid var(--bg3);line-height:1.6}
.kg-panel li:first-child{border-top:0}
.kg-panel li .from{font-size:11.5px;color:var(--text3);display:block}
.kg-panel .hd{font-size:12px;color:var(--text3);font-weight:600;margin:16px 0 4px}
.kg-stats{display:flex;gap:20px;flex-wrap:wrap;align-items:baseline;font-size:13px;color:var(--text2);margin:0 0 12px}
.kg-stats b{font-size:22px;color:var(--text);margin-right:3px;font-weight:700}
/* RDF */
.ttl-wrap{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px;align-items:start}
.ttl-wrap .codebox{max-height:620px;font-size:12.5px;border-radius:18px}
.ttl-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.ttl-bar .cnt{margin-left:auto;font-size:13px;color:var(--text2)}
.ttl-bar .cnt b{font-size:22px;color:var(--text);margin-right:3px;font-weight:700}
.ttl-side{display:grid;gap:12px}
.ttl-map{list-style:none;margin:0;padding:0}
.ttl-map li{padding:10px 0;border-top:1px solid var(--bg3);font-size:13.5px}
.ttl-map li:first-child{border-top:0;padding-top:0}
.ttl-map li b{color:var(--text);font-weight:600}
.ttl-map li .arr{color:var(--accent);font-weight:700;margin:0 4px}
/* 五张表 */
.rs-tbl tr.isnew td{background:var(--accent-soft)}
.rs-tbl tr.isnew td:first-child{box-shadow:inset 3px 0 0 var(--accent)}
.rs-tbl td{white-space:nowrap}
.rs-new{display:inline-block;font-family:var(--sans);font-size:11px;font-weight:700;color:#fff;background:var(--accent);border-radius:980px;padding:0 7px;line-height:1.7;margin-left:6px}
@media (max-width:1100px){.kg-wrap,.ttl-wrap{grid-template-columns:1fr}.kg-panel{position:static}}
@media (max-width:1000px){.dz-cols{grid-template-columns:1fr}.dz-col{border-left:0;border-top:1px solid var(--bg3);padding-left:36px}.dz-meta{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
  function injectCss() { if (!document.getElementById('mod-results-css')) document.head.appendChild(el('style', { id: 'mod-results-css' }, STYLE)); }

  /* ---------- 小工具 ---------- */
  const today = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const todayDash = () => { const t = today(); return t.slice(0, 4) + '-' + t.slice(4, 6) + '-' + t.slice(6); };
  const CODE_RE = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
  const str = v => String(v == null ? '' : v).trim();
  /* “EV-0101 重开会通河” → {code, name} */
  function ref(s) {
    s = str(s); if (!s) return null;
    const i = s.search(/\s/); const first = i < 0 ? s : s.slice(0, i); const rest = i < 0 ? '' : s.slice(i + 1).trim();
    if (CODE_RE.test(first)) return { code: first, name: rest };
    return { code: '', name: s };
  }
  /* “P14 由…执行（主持）” → {code, zh, role} */
  function propOf(s) {
    const m = str(s).match(/^(P\d+[a-z]?)\s*([^（(]*)\s*(?:[（(]([^）)]*)[）)])?/);
    return m ? { code: m[1], zh: (m[2] || '').trim(), role: (m[3] || '').trim() } : null;
  }
  const clsCode = s => { const m = str(s).match(/^E\d+/); return m ? m[0] : ''; };
  const splitCodes = s => str(s).split(/[;；,，、\s]+/).map(x => x.trim()).filter(Boolean);
  const visibleCols = rows => { const cols = []; rows.forEach(r => Object.keys(r).forEach(k => { if (k[0] !== '_' && !cols.includes(k)) cols.push(k); })); return cols; };
  const startsCode = (s, code) => { const r = ref(s); return !!(r && r.code === code); };
  const isImg = row => IMG_TYPES.includes(str(row.资料类型));
  function guessCls(code) {
    const c = str(code);
    if (/^SRC-(YT|CH|ZP)-/.test(c)) return 'E36';
    if (/^SRC-/.test(c)) return 'E31';
    if (/^PER-/.test(c)) return 'E21';
    if (/^ORG-/.test(c)) return 'E74';
    if (/^PL-/.test(c)) return 'E53';
    if (/^NAT-/.test(c)) return 'E26';
    if (/^VA-/.test(c)) return 'E13';
    if (/^T-/.test(c)) return 'E55';
    if (/^DYH-[A-Z]+-HD-/.test(c)) return 'E25';
    if (/^DYH-[A-Z]+-SN-/.test(c)) return 'E27';
    if (/^DYH-[A-Z]+-BK-/.test(c)) return 'E22';
    if (/^DYH-/.test(c)) return 'E24';
    if (/^EV-/.test(c)) return 'E7';
    return '';
  }
  function groupOf(cls, code) {
    const c = ui.cls(cls); if (c) return c.group;
    if (/^EV-/.test(code || '')) return 'event';
    if (cls === 'E52') return 'time';
    return 'other';
  }
  const textW = (s, size) => { let w = 0; for (const ch of String(s)) w += /[\u0000-ÿ]/.test(ch) ? size * 0.6 : size; return w; };

  /* ---------- 读取五张表，建立索引 ---------- */
  function model() {
    const R = ui.records() || {};
    const M = { ent: R.entities || [], evs: R.events || [], rel: R.relations || [], val: R.values || [], src: R.sources || [], info: {} };
    const put = (code, o) => { if (code && !M.info[code]) M.info[code] = Object.assign({ code }, o); };
    M.ent.forEach(r => put(str(r.实体编码), { name: str(r.名称), cls: clsCode(r.类), kind: '实体表', row: r }));
    M.evs.forEach(r => put(str(r.事件编码), { name: str(r.事件名称), cls: clsCode(r.事件类), kind: '事件表', row: r }));
    M.src.forEach(r => put(str(r.来源编码), { name: str(r.题名), cls: isImg(r) ? 'E36' : 'E31', kind: '来源表', row: r }));
    M.val.forEach(r => { const e = ref(r.要素); put(str(r.评估编码), { name: (e && e.name ? e.name : '') + '价值评估', cls: 'E13', kind: '价值表', row: r }); });
    M.name = code => (M.info[code] && M.info[code].name) || '';
    return M;
  }
  const valueLabel = r => [str(r.价值一级), str(r.价值二级)].filter(Boolean).join('·');

  /* ---------- 由五张表推出全部“边” ---------- */
  function graphData(M) {
    const nodes = new Map(), edges = [], keys = new Set();
    const node = (r) => {
      if (!r) return null;
      let id, name, cls;
      if (r.code) { id = r.code; const i = M.info[id]; name = i ? i.name : (r.name || ''); cls = i ? i.cls : guessCls(id); }
      else { id = 'N:' + r.name; name = r.name; cls = /^-?\d{3,4}$/.test(r.name) ? 'E52' : ''; }
      if (!nodes.has(id)) nodes.set(id, { id, code: r.code || '', name, cls, group: groupOf(cls, r.code) });
      else if (!nodes.get(id).name && name) nodes.get(id).name = name;
      return id;
    };
    const add = (s, p, o, role, from) => {
      if (!s || !o) return; const k = s + '|' + p + '|' + o;
      if (keys.has(k)) return; keys.add(k); edges.push({ s, p, o, role: role || '', from });
    };
    // 先登记所有行，保证孤立的行也出现在图里
    M.ent.forEach(r => node({ code: str(r.实体编码), name: str(r.名称) }));
    M.evs.forEach(r => node({ code: str(r.事件编码), name: str(r.事件名称) }));
    M.src.forEach(r => node({ code: str(r.来源编码), name: str(r.题名) }));
    M.val.forEach(r => node({ code: str(r.评估编码) }));
    M.rel.forEach((r, i) => {
      const p = propOf(r.属性); if (!p) return;
      add(node(ref(r.主体)), p.code, node(ref(r.客体)), p.role, '关系表第 ' + (i + 1) + ' 行');
    });
    M.evs.forEach((r, i) => {
      const ev = node({ code: str(r.事件编码) }); const from = '事件表第 ' + (i + 1) + ' 行';
      str(r.执行者).split(/[;；]/).map(ref).filter(Boolean).forEach(a => add(ev, 'P14', node(a), str(r.角色), from));
      const c = clsCode(r.事件类); const p = { E12: 'P108', E11: 'P31', E6: 'P13', E81: 'P124' }[c];
      if (p) str(r.对象要素).split(/[;；]/).map(ref).filter(Boolean).forEach(o => add(ev, p, node(o), '', from));
    });
    M.ent.forEach((r, i) => {
      const id = node({ code: str(r.实体编码) }); const c = clsCode(r.类); const from = '实体表第 ' + (i + 1) + ' 行';
      const loc = ref(r.所在地点), up = ref(r.上级要素);
      if (loc) add(id, c === 'E53' ? 'P89' : 'P53', node(loc), '', from);
      if (up) add(id, c === 'E53' ? 'P89' : 'P46i', node(up), '', from);
    });
    M.val.forEach((r, i) => {
      const va = node({ code: str(r.评估编码) }); const from = '价值表第 ' + (i + 1) + ' 行';
      add(va, 'P140', node(ref(r.要素)), '', from);
      const lab = valueLabel(r);
      if (lab) {
        const vid = 'VAL:' + lab;
        if (!nodes.has(vid)) nodes.set(vid, { id: vid, code: '', name: str(r.价值二级) || str(r.价值一级), sub: str(r.价值二级) ? str(r.价值一级) : '价值', cls: 'E55', group: 'value' });
        add(va, 'P141', vid, '', from);
      }
      if (/^SRC-/.test(str(r.依据))) splitCodes(r.依据).filter(x => /^SRC-/.test(x)).forEach(s => add(va, 'P16', node({ code: s }), '', from));
    });
    M.src.forEach((r, i) => {
      const s = node({ code: str(r.来源编码) }); const from = '来源表第 ' + (i + 1) + ' 行';
      splitCodes(r.涉及要素).filter(x => CODE_RE.test(x)).forEach(c => add(s, isImg(r) ? 'P138' : 'P70', node({ code: c }), '', from));
    });
    return { nodes: [...nodes.values()], edges };
  }

  /* ---------- 部件公共件 ---------- */
  let cur = { tab: 'dossier', el: 'DYH-HTH-ZB-0012', table: 'entities', sel: null };
  function consumeOpen() { if (DYH.resultsOpen) { Object.assign(cur, DYH.resultsOpen); DYH.resultsOpen = null; } }
  function part(name, title, why) {
    injectCss();
    return el('div', { class: 'section rs-part', 'data-part': name },
      el('div', { class: 'rs-head' }, el('h2', null, title), el('p', { class: 'rs-why' }, '为什么：' + why)));
  }
  function mkHint() {
    const wrap = el('div', { class: 'rs-hint' }); let key = '';
    return { node: wrap, set(done, content) {
      const k = (done ? 1 : 0) + JSON.stringify(content); if (k === key) return; key = k;
      wrap.innerHTML = '';
      wrap.appendChild(done ? ui.hint('已完成：' + content, { done: true }) : ui.hint(content, { title: '怎么做' }));
    } };
  }
  function pulseIn(root, node) { root.querySelectorAll('.pulse').forEach(n => n.classList.remove('pulse')); if (node && !node.disabled) ui.pulse(node); }
  function onEvt(node, name, fn) {
    const h = () => { if (!node.isConnected) { document.removeEventListener(name, h); return; } fn(); };
    document.addEventListener(name, h);
  }
  const linkTo = (text, href) => el('a', { class: 'rs-link', href }, text);
  const linkBtn = (text, fn) => el('button', { class: 'rs-link', on: { click: fn } }, text);
  /* 当前数据来源：示例 or 你写入的 */
  function sourceNote() {
    const mine = !!DYH.state.records;
    const nNew = mine ? Object.values(DYH.state.records).reduce((a, rows) => a + (rows || []).filter(r => r && r._new).length, 0) : 0;
    return el('div', { class: 'rs-src' + (mine ? ' mine' : '') }, el('i'),
      mine ? [el('b', null, '当前数据：你写入的表格'), nNew ? `其中 ${nNew} 行是你新增的（审核写入或元数据卡），在「五张表」里以浅蓝色标出。` : '下面的成果都按你的表格实时生成。']
        : [el('b', null, '当前数据：示例数据'), '在「AI 审核」写入正式表，或在「归档」填一张元数据卡后，这里会改用你的表格。']);
  }

  /* ---------- 最终交付 8 项 ---------- */
  function partDeliverables() {
    const s = part('results.deliverables', '最终交付：8 项成果', '先知道终点长什么样，就明白每天填表、命名、归档是在为哪一项成果打底。');
    const rows = D.deliverables.map(d => {
      const mother = d.n === '③', auto = d.n === '④' || d.n === '⑦';
      return el('tr', null,
        el('td', { class: 'n' }, d.n),
        el('td', null, el('b', null, d.name), mother ? el('span', { class: 'rs-lab' }, '母本') : null, auto ? el('span', { class: 'rs-lab' }, '自动导出') : null),
        el('td', null, d.fmt), el('td', { class: 'fn' }, d.file), el('td', null, d.who));
    });
    s.appendChild(el('div', { class: 'tablewrap', style: 'margin-top:24px' }, el('table', { class: 'tbl rs-deliv' },
      el('thead', null, el('tr', null, ['', '成果', '格式', '文件名示例', '给谁用'].map(h => el('th', null, h)))), el('tbody', null, rows))));
    s.appendChild(el('div', { class: 'callout info', style: 'margin-top:16px' },
      el('b', null, '③ 五张表是母本。'), '④ 图谱数据和 ⑦ 要素档案都从五张表自动导出——发现错误就回表格里改，再重新导出，不要手改导出文件。'));
    return s;
  }

  /* ---------- 四种视图的说明 ---------- */
  const VIEWS = {
    dossier: { label: '要素档案', n: '①', title: '要素档案：一个要素的全部资料', why: '档案给人读：把五张表里和这个要素有关的行，按编码“捞”到一页上。',
      steps: ['在“选择要素”里换一个要素，或点档案里的蓝色名字跳过去', '对照看三栏：志（文献）、图（图像）、数（事件与关系）', '虚线框＝表里还没填的内容，也就是还没做的工作'],
      tip: '档案：换一个要素，或点蓝色名字跳到相关要素；虚线框＝还没填的', done: '会看档案了：每一格都是从五张表里按编码捞出来的。', pulse: b => b.querySelector('#rs-el-select') },
    graph: { label: '知识图谱', n: '②', title: '知识图谱：要素之间的关系网', why: '图谱给人看关系：表里的每一行、每一格编码，都变成一条带方向的边。',
      steps: ['点图里任意一个节点（圆点、方块）', '右侧会用大白话列出“它连向谁、谁连向它”', '点图里的空白处，恢复全图'],
      tip: '图谱：点任意节点，高亮它的全部关系；点空白处恢复', done: '会看图谱了：每条边都来自表里的一行或一格。', pulse: b => b.querySelector('#kg-svg .nd[data-id="DYH-HTH-ZB-0012"]') || b.querySelector('#kg-svg .nd') },
    ttl: { label: 'RDF 数据', n: '③', title: 'RDF 数据：给机器和平台用', why: '图谱平台读的是 RDF（Turtle 格式）；它由五张表自动生成，内容和档案、图谱完全一致。',
      steps: ['看右边“表格怎样变成 RDF”：每张表的一行变成什么', '在左边找到 dyh:DYH-HTH-ZB-0012 这一块，读一读', '点“下载 .ttl”拿到文件（或“复制”）'],
      tip: 'RDF：每块以编码开头，“a”读作“是一个”；可复制或下载 .ttl', done: '已拿到 .ttl 文件。不要手改它，错了回表格里改再导出。', pulse: b => b.querySelector('#ttl-dl') },
    tables: { label: '五张表', n: '④', title: '五张表：一切成果的母本', why: '人只维护这五张表；档案、图谱、RDF 都只是它们的不同“排版”。',
      steps: ['点上方表名，在五张表之间切换', '浅蓝色行是你写入的（审核写入或元数据卡）', '点“下载 CSV”拿到这张表，Excel 可直接打开'],
      tip: '五张表：点表名切换；浅蓝色行是你写入的；可下载 CSV', done: '已下载 CSV。五张表就是母本，改表格，成果跟着变。', pulse: b => b.querySelector('#tbl-csv') }
  };
  const RENDER = { dossier: (b, M, c) => renderDossier(b, M, c), graph: (b, M, c) => renderGraph(b, M, c), ttl: (b, M, c) => renderTtl(b, M, c), tables: (b, M, c) => renderTables(b, M, c) };

  /* 单个视图部件 */
  function partSingle(id) {
    consumeOpen();
    const v = VIEWS[id];
    const s = part('results.' + id, v.title, v.why);
    const H = mkHint(); s.appendChild(H.node);
    const src = el('div'); s.appendChild(src);
    const body = el('div', { class: 'rs-body' }); s.appendChild(body);
    let acted = false;
    const guide = () => {
      if (acted) H.set(true, v.done); else H.set(false, v.steps);
      pulseIn(s, acted ? null : v.pulse(body));
    };
    const draw = () => {
      src.innerHTML = ''; src.appendChild(sourceNote());
      body.innerHTML = '';
      RENDER[id](body, model(), { act: () => { if (!acted) { acted = true; guide(); } }, refresh: () => guide() });
      DYH.progress.mark(MOD, id);
      guide();
    };
    draw();
    onEvt(s, REC, draw);
    return s;
  }

  /* 四页签视图部件 */
  const TABS = ['dossier', 'graph', 'ttl', 'tables'];
  function partView(opts) {
    consumeOpen();
    if (opts && TABS.includes(opts.tab)) cur.tab = opts.tab;
    const s = part('results.view', '看一看：同一份数据的四种样子', '档案给人读，图谱给人看关系，RDF 给机器用，表格给人维护——四者内容完全一致。');
    const H = mkHint(); s.appendChild(H.node);
    const src = el('div'); s.appendChild(src);
    const bar = el('div', { class: 'seg rs-seg', role: 'tablist' });
    const body = el('div', { class: 'rs-body' });
    s.append(bar, body);
    const guide = () => {
      const seen = TABS.filter(t => DYH.progress.has(MOD, t)).length;
      [...bar.children].forEach(b => { b.querySelector('.ck').textContent = DYH.progress.has(MOD, b.dataset.id) ? '✓' : ''; });
      if (seen === TABS.length) H.set(true, '四种样子都看过了：内容完全一致，只是排版不同。' + VIEWS[cur.tab].tip.replace(/^[^：]+：/, '这一页：'));
      else H.set(false, [`点上方「要素档案 / 知识图谱 / RDF 数据 / 五张表」切换（已看 ${seen} / 4）`, VIEWS[cur.tab].tip, '四个都看过就完成']);
      const next = TABS.find(t => !DYH.progress.has(MOD, t));
      pulseIn(s, next ? bar.querySelector(`button[data-id="${next}"]`) : null);
    };
    const show = id => {
      cur.tab = id;
      [...bar.children].forEach(b => b.classList.toggle('on', b.dataset.id === id));
      src.innerHTML = ''; src.appendChild(sourceNote());
      body.innerHTML = '';
      RENDER[id](body, model(), { act: () => {} });
      DYH.progress.mark(MOD, id);
      guide();
    };
    TABS.forEach(id => bar.appendChild(el('button', { 'data-id': id, role: 'tab', on: { click: () => show(id) } }, VIEWS[id].label, el('span', { class: 'ck' }))));
    show(TABS.includes(cur.tab) ? cur.tab : 'dossier');
    onEvt(s, REC, () => show(cur.tab));
    return s;
  }

  /* =====================================================================
     ① 要素档案
     ===================================================================== */
  function renderDossier(body, M, ctl) {
    const els = M.ent.filter(r => ELEMENT_CLS.includes(clsCode(r.类)) && str(r.实体编码));
    if (!els.length) { body.appendChild(emptyBox('实体表里还没有遗产要素', '先在实体表登记 E24 / E25 / E22 / E26 / E27 类的要素', ['去审核写入', '#/review'])); return; }
    if (!els.some(r => str(r.实体编码) === cur.el)) cur.el = els.some(r => r.实体编码 === 'DYH-HTH-ZB-0012') ? 'DYH-HTH-ZB-0012' : str(els[0].实体编码);
    const sel = el('select', { id: 'rs-el-select', style: 'max-width:420px;width:auto' }, els.map(r => {
      const c = ui.cls(clsCode(r.类));
      const o = el('option', { value: str(r.实体编码) }, `${str(r.名称)}（${str(r.实体编码)}）· ${c ? c.code + ' ' + c.zh : str(r.类)}`);
      if (str(r.实体编码) === cur.el) o.selected = true; return o;
    }));
    const holder = el('div');
    const draw = () => { holder.innerHTML = ''; holder.appendChild(dossier(M, cur.el, code => { cur.el = code; sel.value = code; draw(); ctl.act(); })); };
    sel.addEventListener('change', () => { cur.el = sel.value; draw(); ctl.act(); });
    body.appendChild(el('div', { class: 'rs-bar' }, el('label', { for: 'rs-el-select' }, '选择要素'), sel,
      el('span', { class: 'note' }, '每一格都从五张表里按编码“捞”出来；虚线框＝还没做的工作。')));
    body.appendChild(holder);
    draw();
  }

  function emptyBox(title, hint, link) {
    return el('div', { class: 'dz-empty' }, el('b', null, title), hint ? el('div', null, hint) : null, link ? linkTo(link[0], link[1]) : null);
  }
  const confCls = s => /确定/.test(str(s)) ? 'hi' : /存疑|低/.test(str(s)) ? 'lo' : 'mid';
  const confTag = s => str(s) ? el('span', { class: 'rs-conf ' + confCls(s) }, str(s)) : null;

  function dossier(M, code, go) {
    const row = M.ent.find(r => str(r.实体编码) === code) || {};
    const cls = clsCode(row.类);
    const link = c => { const r = ref(c); if (!r) return null; const nm = (r.code && M.name(r.code)) || r.name || r.code;
      const isEl = r.code && M.ent.some(x => str(x.实体编码) === r.code && ELEMENT_CLS.includes(clsCode(x.类)));
      return isEl ? el('span', { class: 'dz-link', title: r.code, on: { click: () => go(r.code) } }, nm) : el('span', { title: r.code }, nm); };
    const codeSm = c => el('code', { style: 'font-size:11.5px;color:var(--text3)' }, c);

    const vals = M.val.filter(v => startsCode(v.要素, code));
    const up = ref(row.上级要素);
    const kids = M.ent.filter(r => startsCode(r.上级要素, code));
    const evCodes = new Set(M.evs.filter(e => str(e.对象要素).split(/[;；]/).some(x => startsCode(x, code))).map(e => str(e.事件编码)));
    M.rel.forEach(r => { const p = propOf(r.属性), s = ref(r.主体), o = ref(r.客体);
      if (p && ['P108', 'P31', 'P13', 'P124', 'P123'].includes(p.code) && o && o.code === code && s && s.code) evCodes.add(s.code); });
    const targets = new Set([code, ...evCodes]);
    const zhi = new Map(), tu = new Map();
    M.src.forEach(r => { const c = str(r.来源编码); if (!splitCodes(r.涉及要素).includes(code)) return;
      (isImg(r) ? tu : zhi).set(c, { row: r, code: c, via: '来源表“涉及要素”' }); });
    M.rel.forEach(r => { const p = propOf(r.属性), s = ref(r.主体), o = ref(r.客体); if (!p || !s || !o || !targets.has(o.code)) return;
      const sc = s.code || s.name; const srow = M.src.find(x => str(x.来源编码) === s.code);
      const via = '关系表 ' + p.code + (o.code === code ? '' : ' → ' + (M.name(o.code) || o.code));
      if (p.code === 'P70' && !zhi.has(sc)) zhi.set(sc, { row: srow, code: s.code, name: s.name, via });
      if (p.code === 'P138' && !tu.has(sc)) tu.set(sc, { row: srow, code: s.code, name: s.name, via });
    });

    const typeTag = str(row.类型词) ? el('span', { class: 'tag t-type' }, '类型：' + str(row.类型词)) : null;
    const head = el('div', { class: 'dz-head' },
      el('div', { class: 'dz-top' }, el('span', { class: 'dz-chip' }, code), el('span', { class: 'dz-kind' }, '要素档案 · 示范')),
      el('h2', { class: 'dz-name' }, str(row.名称) || code),
      el('div', { class: 'dz-tags' }, cls ? ui.classTag(cls) : el('span', { class: 'tag t-type' }, str(row.类) || '未定类'), typeTag,
        vals.map(v => el('span', { class: 'tag t-value', title: '价值表 ' + str(v.评估编码) }, valueLabel(v) || '价值待填'))),
      el('div', { class: 'dz-meta' },
        el('div', null, el('span', { class: 'k' }, '所在地点 · P53'), el('div', { class: 'v' }, ref(row.所在地点) ? link(row.所在地点) : el('span', { class: 'muted' }, '未填'), ref(row.所在地点) && ref(row.所在地点).code ? [' ', codeSm(ref(row.所在地点).code)] : null)),
        el('div', null, el('span', { class: 'k' }, '上级要素 · P46i'), el('div', { class: 'v' }, up ? [link(row.上级要素), ' ', codeSm(up.code || '')] : el('span', { class: 'muted' }, '无（本身是顶层）'))),
        el('div', null, el('span', { class: 'k' }, '下级要素 · P46'), el('div', { class: 'v' }, kids.length ? kids.map((k, i) => [i ? '、' : '', link(str(k.实体编码) + ' ' + str(k.名称))]) : el('span', { class: 'muted' }, '无'))),
        el('div', null, el('span', { class: 'k' }, '价值评估 · E13'), vals.length ? vals.map(v => el('div', { class: 'vline' },
          el('span', { class: 'v' }, valueLabel(v)), str(v.世遗标准) ? el('span', { class: 'muted small', title: ouvZh(v.世遗标准) }, '世遗标准 ' + str(v.世遗标准)) : null,
          el('span', { class: 'rs-conf ' + statusCls(v.状态) }, str(v.状态) || '未审'))) : el('div', { class: 'v muted' }, '暂无，去价值表登记')))
    );

    const colZhi = column('志', '文献记载', 'var(--c-thing)', zhi.size ? [...zhi.values()].map(z => el('div', { class: 'dz-item' },
      el('div', { class: 't' }, z.row ? str(z.row.题名) : (z.name || z.code)),
      el('div', { class: 'm' }, z.code ? el('code', null, z.code) : null, z.row ? el('span', null, str(z.row.资料类型)) : el('span', { class: 'rs-conf lo' }, '来源表未登记'),
        z.row && str(z.row.出处位置) ? el('span', null, '出处：' + str(z.row.出处位置)) : null),
      el('div', { class: 'm' }, el('span', null, '依据：' + z.via)))) : [emptyBox('暂无文献记载', '在来源表登记志书 / 档案，“涉及要素”填 ' + code, ['去填元数据卡', '#/archive'])]);
    const colTu = column('图', '图像资料', 'var(--c-place)', tu.size ? [...tu.values()].map(z => {
      const kind = z.row ? str(z.row.资料类型) : '图像';
      return el('figure', { class: 'dz-fig' }, ui.html(figSvg(kind, str(row.名称))),
        el('figcaption', null, el('b', null, z.row ? str(z.row.题名) : (z.name || z.code)),
          el('div', { class: 'm' }, [z.code, kind, z.row && str(z.row.出处位置) ? '出处：' + str(z.row.出处位置) : ''].filter(Boolean).join(' · '), ' · 依据：' + z.via)));
    }) : [emptyBox('暂无图像资料', '在来源表登记测绘图、舆图或照片', ['去填元数据卡', '#/archive'])]);
    const evRows = [...evCodes].map(c => M.evs.find(e => str(e.事件编码) === c) || { 事件编码: c, 事件名称: M.name(c) || c })
      .sort((a, b) => (Number(a.起始年) || 99999) - (Number(b.起始年) || 99999));
    const tl = evRows.length ? el('div', { class: 'dz-tl' }, evRows.map(e => {
      const y1 = str(e.起始年), y2 = str(e.结束年); const ecls = clsCode(e.事件类);
      return el('div', { class: 'dz-ev' },
        el('div', { class: 'y' }, y1 ? (y2 && y2 !== y1 ? y1 + '—' + y2 : y1) : '年代待考', el('small', null, [str(e.朝代), str(e.时间原文)].filter(Boolean).join(' · '))),
        el('div', { class: 'nm' }, str(e.事件名称), ' ', codeSm(str(e.事件编码))),
        el('div', { class: 'm' }, ecls ? ui.classTag(ecls) : null,
          str(e.执行者) ? el('span', null, '执行者：' + str(e.执行者).split(/[;；]/).map(x => (ref(x) || {}).name || x).join('、') + (str(e.角色) ? '（' + str(e.角色) + '）' : '')) : null,
          confTag(e.置信度)));
    })) : emptyBox('暂无事件', '在事件表登记以 ' + code + ' 为“对象要素”的事件');
    const rels = M.rel.filter(r => { const s = ref(r.主体), o = ref(r.客体); return (s && s.code === code) || (o && o.code === code); });
    const relList = rels.length ? el('ul', { class: 'dz-rels' }, rels.map(r => { const p = propOf(r.属性); const s = ref(r.主体), o = ref(r.客体);
      return el('li', null, el('b', null, (s && (s.name || M.name(s.code))) || str(r.主体)), p ? ui.propTag(p.code, p.role) : el('span', { class: 'tag t-type' }, str(r.属性)), '→', el('b', null, (o && (o.name || M.name(o.code))) || str(r.客体)),
        confTag(r.置信度));
    })) : emptyBox('暂无关系', '在关系表登记以 ' + code + ' 为主体或客体的关系');
    const colShu = column('数', '事件与关系', '#1D1D1F', [el('div', { class: 'dz-sub' }, '事件时间线'), tl, el('div', { class: 'dz-sub' }, `关系表（${rels.length} 条）`), relList]);

    return el('div', { class: 'dz', id: 'rs-dossier' }, head, el('div', { class: 'dz-cols' }, colZhi, colTu, colShu),
      el('div', { class: 'dz-foot' }, el('span', null, '示意数据 · 由五张表按编码自动汇编 · 史实、年代、页码以《中国运河志》原文为准'), el('span', null, '生成于 ' + todayDash())));
  }
  function column(glyph, sub, color, kids) {
    return el('div', { class: 'dz-col' }, el('div', { class: 'dz-colh' }, el('span', { class: 'dz-glyph', style: 'background:' + color }, glyph),
      el('div', null, el('b', null, glyph + ' · ' + sub), el('span', null, { 志: '志书、档案、论著 · E31 —P70→', 图: '测绘图、舆图、照片 · E36 —P138→', 数: '事件表 · 关系表' }[glyph]))), kids);
  }
  const ouvZh = c => { const o = D.ouv.find(x => x.code === str(c)); return o ? o.zh : ''; };
  const statusCls = s => /通过|已审|确认/.test(str(s)) ? 'hi' : /驳回/.test(str(s)) ? 'lo' : 'mid';

  /* 装饰性线描占位图（不是真实图像） */
  function figSvg(kind, name) {
    const lab = esc(kind) + ' · 示意占位';
    let art;
    if (kind === '舆图') {
      art = `<rect x="14" y="14" width="212" height="112" rx="4" fill="none" stroke="#D2D2D7" stroke-width="1.5"/>
        <path d="M30 110 C 70 90, 60 60, 110 58 S 170 40, 210 28" fill="none" stroke="#B9C8F0" stroke-width="9" stroke-linecap="round"/>
        <path d="M30 110 C 70 90, 60 60, 110 58 S 170 40, 210 28" fill="none" stroke="#5856D6" stroke-width="1.2"/>
        <g fill="none" stroke="#AEAEB2" stroke-width="1.2"><path d="M40 40 l8 -10 l8 10"/><path d="M52 44 l8 -10 l8 10"/><path d="M160 100 l8 -10 l8 10"/></g>
        <rect x="104" y="51" width="16" height="14" rx="2" fill="#1D1D1F"/>`;
    } else if (kind === '照片') {
      art = `<rect x="0" y="0" width="240" height="70" fill="#E8EEF5"/><path d="M0 70 L240 70 L240 140 L0 140Z" fill="#D5E2EC"/>
        <path d="M0 64 C 50 54, 90 62, 140 56 S 210 52, 240 58 L240 70 L0 70Z" fill="#C3CDBF"/>
        <path d="M20 96 L220 84 L220 96 L20 108Z" fill="#8E8E93"/><path d="M20 108 L220 96" stroke="#636366" stroke-width="2"/>
        <g stroke="#A7BCCB" stroke-width="1.2"><path d="M30 120 h40"/><path d="M90 126 h50"/><path d="M160 118 h40"/></g>`;
    } else {
      art = `<g stroke="#E8E8ED" stroke-width="1">${Array.from({ length: 11 }, (_, i) => `<path d="M${i * 24} 0 V140"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 28} H240"/>`).join('')}</g>
        <path d="M0 52 C 60 44, 120 60, 240 46 L240 94 C 120 108, 60 92, 0 100Z" fill="#E3ECFA" stroke="#0071E3" stroke-width="1.2"/>
        <g stroke="#0071E3" stroke-width=".8" opacity=".5"><path d="M20 70 q10 -4 20 0 t20 0"/><path d="M150 78 q10 -4 20 0 t20 0"/></g>
        <path d="M96 34 L132 30 L150 110 L114 114Z" fill="#1D1D1F" opacity=".88"/>
        <g stroke="#86868B" stroke-width="1.2"><path d="M90 24 L156 18"/><path d="M90 20 v8"/><path d="M156 14 v8"/></g>
        <text x="123" y="14" font-size="9" fill="#6E6E73" text-anchor="middle" font-family="sans-serif">L = [__] m</text>`;
    }
    return `<svg viewBox="0 0 240 140" role="img" aria-label="${esc(name)} ${lab}"><rect width="240" height="140" fill="#F5F5F7"/>${art}
      <rect x="6" y="118" width="${textW(kind + ' · 示意占位', 10) + 12}" height="16" rx="8" fill="#fff"/><text x="12" y="130" font-size="10" fill="#6E6E73">${lab}</text></svg>`;
  }

  /* =====================================================================
     ② 知识图谱（纯 SVG，分层布局）
     ===================================================================== */
  const GCOLOR = { thing: '#0E7C86', event: '#1D1D1F', actor: '#C2410C', place: '#5856D6', doc: '#6E6E73', assign: '#B8460B', value: '#B8460B', time: '#D70015', period: '#D70015', type: '#8E8E93', name: '#8E8E93', other: '#8E8E93' };
  const COLX = [62, 222, 404, 586, 748, 910], GW = 980;
  const COLNAMES = ['人物 / 机构', '事件', '遗产要素', '地点', '价值评估', '价值标签'];
  const colOf = n => n.group === 'doc' ? -1 : n.group === 'actor' ? 0 : n.group === 'event' ? 1 : n.group === 'thing' ? 2 : n.group === 'assign' ? 4 : n.group === 'value' ? 5 : 3;
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;

  /* 分层布局：列固定（人 | 事 | 物 | 地 | 评估 | 价值），文献在上方一排；
     每列按“邻居的平均高度”排序并就位，再消除重叠——确定性、无随机数 */
  function layout(G) {
    const byId = new Map(G.nodes.map(n => [n.id, n]));
    const nb = new Map(G.nodes.map(n => [n.id, []]));
    G.edges.forEach(e => { nb.get(e.s).push(e.o); nb.get(e.o).push(e.s); });
    const cols = COLX.map(() => []), top = [];
    G.nodes.slice().sort((a, b) => a.id.localeCompare(b.id)).forEach(n => { n.col = colOf(n); (n.col < 0 ? top : cols[n.col]).push(n); });
    const GAP = 96, TOPGAP = 100, PER_ROW = 5, TOPSP = 180;
    cols.forEach((c, i) => c.forEach((n, j) => { n.x = COLX[i]; n.y = j * GAP; }));
    const settle = c => {
      if (!c.length) return;
      c.forEach(n => { const ys = nb.get(n.id).map(id => byId.get(id)).filter(m => m.col >= 0 && m.col !== n.col).map(m => m.y); n.want = ys.length ? avg(ys) : n.y; });
      c.sort((a, b) => a.want - b.want || a.id.localeCompare(b.id));
      let prev = -Infinity; c.forEach(n => { n.y = Math.max(n.want, prev + GAP); prev = n.y; });
      const shift = avg(c.map(n => n.want)) - avg(c.map(n => n.y)); c.forEach(n => n.y += shift);
    };
    for (let it = 0; it < 8; it++) [2, 1, 0, 3, 4, 5].forEach(i => settle(cols[i]));
    const all = cols.flat();
    const topRows = Math.ceil(top.length / PER_ROW);
    const y0 = top.length ? 88 + topRows * TOPGAP : 60;
    const minY = all.length ? Math.min(...all.map(n => n.y)) : 0;
    all.forEach(n => n.y = Math.round(n.y - minY + y0));
    // 文献排：按所连节点的平均 x 排序，再等距摆开
    top.forEach(n => { const xs = nb.get(n.id).map(id => byId.get(id)).filter(m => m.col >= 0).map(m => m.x); n.want = xs.length ? avg(xs) : GW / 2; });
    top.sort((a, b) => a.want - b.want || a.id.localeCompare(b.id));
    for (let r = 0; r < topRows; r++) {
      const row = top.slice(r * PER_ROW, (r + 1) * PER_ROW);
      let cx = avg(row.map(n => n.want)); const half = (row.length - 1) / 2 * TOPSP;
      cx = Math.min(Math.max(cx, 90 + half), GW - 90 - half);
      row.forEach((n, j) => { n.x = Math.round(cx + (j - (row.length - 1) / 2) * TOPSP); n.y = 66 + r * TOPGAP; });
    }
    const maxY = all.length ? Math.max(...all.map(n => n.y)) : y0;
    return { byId, H: maxY + 92, y0, topRows };
  }

  function bez(p, t) { const u = 1 - t; return [u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6], u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7]]; }
  const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

  function shapeSvg(n) {
    const c = GCOLOR[n.group] || GCOLOR.other;
    switch (n.group) {
      case 'event': return `<rect class="shape ring" x="-18" y="-13" width="36" height="26" rx="8" fill="${c}" stroke="#fff" stroke-width="2"/><path d="M-5 -5 L6 0 L-5 5Z" fill="#fff"/>`;
      case 'doc': return `<path class="shape ring" d="M-12 -15 H6 L12 -9 V15 H-12Z" fill="${c}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M-7 -6 H6 M-7 0 H6 M-7 6 H3" stroke="#fff" stroke-width="1.6"/>`;
      case 'assign': return `<path class="shape ring" d="M0 -16 L16 0 L0 16 L-16 0Z" fill="${c}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text y="4" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">评</text>`;
      case 'value': return `<rect class="shape ring" x="-17" y="-11" width="34" height="22" rx="11" fill="#fff" stroke="${c}" stroke-width="2.5"/><circle r="4" fill="${c}"/>`;
      case 'place': return `<circle class="shape ring" r="15" fill="${c}" stroke="#fff" stroke-width="2"/><circle r="5" fill="#fff"/>`;
      case 'actor': return `<circle class="shape ring" r="15" fill="${c}" stroke="#fff" stroke-width="2"/><circle cy="-4" r="4.2" fill="#fff"/><path d="M-7.5 8 a7.5 6 0 0 1 15 0Z" fill="#fff"/>`;
      case 'thing': return `<circle class="shape ring" r="16" fill="${c}" stroke="#fff" stroke-width="2"/><path d="M-8 4 H8 M-6 4 V-3 H6 V4 M-9 -3 H9" stroke="#fff" stroke-width="1.8" fill="none"/>`;
      default: return `<circle class="shape ring" r="13" fill="${c}" stroke="#fff" stroke-width="2"/>`;
    }
  }

  function renderGraph(body, M, ctl) {
    const G = graphData(M);
    const { byId, H, y0, topRows } = layout(G);
    const R = 17;
    const boxes = [];
    G.nodes.forEach(n => {
      const sub = n.code || n.sub || '';
      n.disp = n.group === 'assign' ? '价值评估' : (n.name || n.code);
      const w = Math.max(textW(n.disp, 13), textW(sub, 10.5), 34) + 6;
      n.sub2 = sub;
      if (n.col < 0) boxes.push({ x: n.x - w / 2, y: n.y - R - 36, w, h: 36 + 2 * R });
      else boxes.push({ x: n.x - w / 2, y: n.y - R, w, h: 2 * R + 36 });
    });
    const placed = []; const labelSvg = [];
    const edgeSvg = G.edges.map((e, i) => {
      const a = byId.get(e.s), b = byId.get(e.o);
      let p;
      if (a.col < 0 || b.col < 0) {
        const dy = b.y - a.y, sgn = dy >= 0 ? 1 : -1;
        const lo = a.col < 0 ? a : b, hi = a.col < 0 ? b : a;
        const blockedV = hi.col >= 0 && G.nodes.some(n => n !== hi && n.col === hi.col && n.y < hi.y && n.y > lo.y);
        if (blockedV) {
          const side = hi.col === 0 ? -1 : 1, ex = hi.x + side * (R + 6);
          const y1 = lo.y + R - 2;
          p = a === lo ? [a.x, y1, a.x, y1 + (hi.y - y1) * 0.7, ex + side * 70, hi.y, ex, hi.y]
            : [hi.x + side * R, hi.y, hi.x + side * 76, hi.y, lo.x, y1 + (hi.y - y1) * 0.7, lo.x, y1 + 4];
        } else {
          const y1 = a.y + sgn * (R - 2), y2 = b.y - sgn * (R + 5);
          p = [a.x, y1, a.x, y1 + (y2 - y1) * 0.55, b.x, y2 - (y2 - y1) * 0.45, b.x, y2];
        }
      } else if (a.col === b.col) {
        const side = a.col === 0 ? -1 : 1, off = 74;
        p = [a.x + side * R, a.y, a.x + side * off, a.y, b.x + side * off, b.y, b.x + side * (R + 5), b.y];
      } else {
        const dir = b.x > a.x ? 1 : -1;
        const x1 = a.x + dir * (R + 1), x2 = b.x - dir * (R + 6);
        const dx = (x2 - x1) * 0.5;
        const blocked = Math.abs(a.col - b.col) > 1 && G.nodes.some(n => n.col >= 0 && (n.col - a.col) * (n.col - b.col) < 0 &&
          (y => y > n.y - 24 && y < n.y + 52)(a.y + (b.y - a.y) * (n.x - x1) / (x2 - x1)));
        if (blocked) { const ym = Math.min(a.y, b.y) - 58; p = [x1, a.y, x1 + dx * 0.5, ym, x2 - dx * 0.5, ym, x2, b.y]; }
        else p = [x1, a.y, x1 + dx, a.y, x2 - dx, b.y, x2, b.y];
      }
      const pr = ui.prop(e.p);
      const label = e.p + ' ' + (pr ? pr.zh : '') + (e.role ? '（' + e.role + '）' : '');
      const lw = textW(label, 10.5) + 12, lh = 17;
      let pos = null;
      for (const t of [0.5, 0.42, 0.58, 0.34, 0.66, 0.28, 0.72, 0.22, 0.78, 0.16, 0.84, 0.1, 0.9]) {
        const [x, y] = bez(p, t); const bx = { x: x - lw / 2, y: y - lh / 2, w: lw, h: lh };
        if (!placed.some(q => overlap(q, bx)) && !boxes.some(q => overlap(q, bx))) { pos = [x, y, bx]; break; }
      }
      if (!pos) { for (const t of [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8]) { const [x, y] = bez(p, t); const bx = { x: x - lw / 2, y: y - lh / 2, w: lw, h: lh }; if (!placed.some(q => overlap(q, bx))) { pos = [x, y, bx]; break; } } }
      if (!pos) { const [x, y] = bez(p, 0.5); pos = [x, y, { x: x - lw / 2, y: y - lh / 2, w: lw, h: lh }]; }
      placed.push(pos[2]);
      e.i = i;
      labelSvg.push(`<g class="eg lab" data-i="${i}"><rect x="${pos[2].x.toFixed(1)}" y="${pos[2].y.toFixed(1)}" width="${lw.toFixed(1)}" height="${lh}" rx="8.5" fill="#fff" stroke="#E8E8ED"/>
        <text x="${pos[0].toFixed(1)}" y="${(pos[1] + 3.8).toFixed(1)}" text-anchor="middle" font-size="10.5" fill="#0071E3" style="font-family:var(--mono)">${esc(label)}</text></g>`);
      return `<g class="eg" data-i="${i}" data-s="${esc(e.s)}" data-o="${esc(e.o)}"><path d="M${p[0].toFixed(1)} ${p[1].toFixed(1)} C${p[2].toFixed(1)} ${p[3].toFixed(1)} ${p[4].toFixed(1)} ${p[5].toFixed(1)} ${p[6].toFixed(1)} ${p[7].toFixed(1)}" fill="none" stroke="#C7C7CC" stroke-width="1.5" marker-end="url(#kg-arr)"/></g>`;
    }).join('');
    const nodeSvg = G.nodes.map(n => {
      const above = n.col < 0;
      const ty1 = above ? -R - 23 : R + 16, ty2 = above ? -R - 7 : R + 32;
      return `<g class="nd" data-id="${esc(n.id)}" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)})" tabindex="0">${shapeSvg(n)}
        <text y="${ty1}" text-anchor="middle" font-size="13" font-weight="600" fill="#1D1D1F" stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round">${esc(n.disp)}</text>
        <text y="${ty2}" text-anchor="middle" font-size="10.5" fill="#86868B" style="font-family:var(--mono)" stroke="#fff" stroke-width="3" paint-order="stroke">${esc(n.sub2)}</text></g>`;
    }).join('');
    const hasTop = topRows > 0;
    const colHead = COLNAMES.map((t, i) => `<text x="${COLX[i]}" y="${H - 12}" text-anchor="middle" font-size="11" fill="#86868B">${t}</text>`).join('') + `<path d="M12 ${H - 30} H${GW - 12}" stroke="#E8E8ED"/>`;
    const svg = `<svg id="kg-svg" viewBox="0 0 ${GW} ${H}" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--sans)">
      <defs><marker id="kg-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#C7C7CC"/></marker>
      <marker id="kg-arr-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#0071E3"/></marker></defs>
      <rect class="bg" width="${GW}" height="${H}" fill="transparent"/>${hasTop ? `<text x="16" y="20" font-size="11" fill="#86868B">文献 / 图像（来源）</text><path d="M12 ${y0 - 70} H${GW - 12}" stroke="#E8E8ED" stroke-dasharray="4 4"/>` : ''}
      ${colHead}<g class="edges">${edgeSvg}</g><g class="labels">${labelSvg.join('')}</g><g class="nodes">${nodeSvg}</g></svg>`;

    const legendItems = [['thing', '遗产要素（物）', 'border-radius:50%'], ['event', '事件', 'border-radius:3px'], ['actor', '人物 / 机构', 'border-radius:50%'], ['place', '地点', 'border-radius:50%'], ['doc', '文献 / 图像', 'border-radius:2px'], ['assign', '价值评估 E13', 'transform:rotate(45deg) scale(.8)'], ['value', '价值标签 E55', 'border-radius:7px;background:#fff!important;box-shadow:inset 0 0 0 2.5px #B8460B']];
    const box = el('div', { class: 'kg-box' }, ui.html(svg),
      el('div', { class: 'kg-legend' }, legendItems.map(([g, t, st]) => el('span', null, el('i', { style: `background:${GCOLOR[g]};${st}` }), t)),
        el('span', { style: 'margin-left:auto' }, '箭头＝属性方向（主体 → 客体）')));
    const panel = el('div', { class: 'kg-panel' });
    body.appendChild(el('div', { class: 'kg-stats' }, el('span', null, el('b', null, G.nodes.length), '个节点'), el('span', null, el('b', null, G.edges.length), '条边'),
      el('span', null, '每条边都来自表里的一行或一格。')));
    body.appendChild(el('div', { class: 'kg-wrap' }, box, panel));

    const svgEl = box.querySelector('svg');
    const showInfo = id => {
      panel.innerHTML = '';
      svgEl.querySelectorAll('.hl,.sel').forEach(x => x.classList.remove('hl', 'sel'));
      svgEl.querySelectorAll('.eg path').forEach(p => { p.setAttribute('marker-end', 'url(#kg-arr)'); p.setAttribute('stroke', '#C7C7CC'); p.setAttribute('stroke-width', '1.5'); });
      if (!id) {
        svgEl.classList.remove('focus'); cur.sel = null;
        panel.appendChild(el('div', { class: 'card soft' }, el('h4', null, '点一个节点试试'), el('p', { class: 'small muted', style: 'margin:0' },
          '点任意圆点或方块，会高亮它的全部关系，其余变淡；这里用大白话列出“它连向谁、谁连向它”。点空白处恢复。')));
        return;
      }
      const n = byId.get(id); if (!n) return showInfo(null);
      cur.sel = id; svgEl.classList.add('focus');
      const g = svgEl.querySelector(`.nd[data-id="${CSS.escape(id)}"]`); g.classList.add('hl', 'sel');
      const outs = G.edges.filter(e => e.s === id), ins = G.edges.filter(e => e.o === id);
      [...outs, ...ins].forEach(e => {
        svgEl.querySelectorAll(`.eg[data-i="${e.i}"]`).forEach(x => x.classList.add('hl'));
        const p = svgEl.querySelector(`.eg[data-i="${e.i}"] path`); p.setAttribute('marker-end', 'url(#kg-arr-h)'); p.setAttribute('stroke', '#0071E3'); p.setAttribute('stroke-width', '2.4');
        const other = e.s === id ? e.o : e.s; svgEl.querySelector(`.nd[data-id="${CSS.escape(other)}"]`).classList.add('hl');
      });
      const nm = x => byId.get(x).name || byId.get(x).code;
      const item = (e, outward) => el('li', null,
        el('b', null, outward ? nm(id) : el('a', { href: 'javascript:void(0)', on: { click: () => showInfo(e.s) } }, nm(e.s))), ' ',
        ui.propTag(e.p, e.role), ' ',
        el('b', null, outward ? el('a', { href: 'javascript:void(0)', on: { click: () => showInfo(e.o) } }, nm(e.o)) : nm(id)),
        el('span', { class: 'from' }, '来自 ' + e.from));
      const cdef = ui.cls(n.cls);
      panel.appendChild(el('div', { class: 'card', id: 'kg-info' },
        n.code ? el('span', { class: 'dz-chip' }, n.code) : el('span', { class: 'tag t-value' }, '价值标签'),
        el('h3', null, n.name || n.code),
        el('div', null, n.cls ? ui.classTag(n.cls) : el('span', { class: 'tag t-type' }, '未定类'), n.group === 'value' ? el('span', { class: 'muted small' }, ' ' + (n.sub || '')) : null),
        cdef ? el('p', { class: 'muted small', style: 'margin:8px 0 0' }, cdef.hint) : null,
        el('div', { class: 'hd' }, `它 → 别人（${outs.length}）`), outs.length ? el('ul', null, outs.map(e => item(e, true))) : el('p', { class: 'muted small' }, '无'),
        el('div', { class: 'hd' }, `别人 → 它（${ins.length}）`), ins.length ? el('ul', null, ins.map(e => item(e, false))) : el('p', { class: 'muted small' }, '无'),
        el('button', { class: 'btn light sm', style: 'margin-top:14px', on: { click: () => showInfo(null) } }, '取消高亮')));
    };
    svgEl.addEventListener('click', ev => { const g = ev.target.closest('.nd'); showInfo(g ? g.dataset.id : null); if (g) ctl.act(); });
    svgEl.addEventListener('keydown', ev => { if (ev.key === 'Enter') { const g = ev.target.closest('.nd'); if (g) { showInfo(g.dataset.id); ctl.act(); } } });
    showInfo(cur.sel && byId.has(cur.sel) ? cur.sel : null);
  }

  /* =====================================================================
     ③ RDF / Turtle
     ===================================================================== */
  const CLS_IRI = { E1: 'E1_CRM_Entity', E4: 'E4_Period', E5: 'E5_Event', E6: 'E6_Destruction', E7: 'E7_Activity', E11: 'E11_Modification', E12: 'E12_Production', E13: 'E13_Attribute_Assignment', E18: 'E18_Physical_Thing',
    E21: 'E21_Person', E22: 'E22_Human-Made_Object', E24: 'E24_Physical_Human-Made_Thing', E25: 'E25_Human-Made_Feature', E26: 'E26_Physical_Feature', E27: 'E27_Site', E31: 'E31_Document', E36: 'E36_Visual_Item',
    E39: 'E39_Actor', E41: 'E41_Appellation', E42: 'E42_Identifier', E52: 'E52_Time-Span', E53: 'E53_Place', E55: 'E55_Type', E73: 'E73_Information_Object', E74: 'E74_Group', E81: 'E81_Transformation' };
  const PROP_IRI = { P1: 'P1_is_identified_by', P2: 'P2_has_type', P4: 'P4_has_time-span', P7: 'P7_took_place_at', P9i: 'P9i_forms_part_of', P10: 'P10_falls_within', P13: 'P13_destroyed', P14: 'P14_carried_out_by',
    P16: 'P16_used_specific_object', P31: 'P31_has_modified', P46: 'P46_is_composed_of', P46i: 'P46i_forms_part_of', P48: 'P48_has_preferred_identifier', P53: 'P53_has_former_or_current_location', P70: 'P70_documents',
    P89: 'P89_falls_within', P108: 'P108_has_produced', P123: 'P123_resulted_in', P124: 'P124_transformed', P138: 'P138_represents', P139: 'P139_has_alternative_form', P140: 'P140_assigned_attribute_to', P141: 'P141_assigned' };
  function hash(s) { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0').slice(0, 8); }
  function localName(code) {
    code = str(code);
    if (/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(code)) return code;
    let s = code.replace(/[^A-Za-z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^[-_]+|[-_]+$/g, '');
    return (s && /[A-Za-z0-9]/.test(s) ? s + '-' : 'X-') + hash(code);
  }
  const lit = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"@zh';
  const gYear = y => { const n = parseInt(y, 10); if (!isFinite(n)) return null; return '"' + (n < 0 ? '-' : '') + String(Math.abs(n)).padStart(4, '0') + '"^^xsd:gYear'; };

  function buildTtl(M) {
    const out = [], triples = new Set(), declared = new Set(), referenced = new Map(), types = new Map();
    const iriOf = r => { if (!r) return null; if (r.code) { const ln = localName(r.code); if (!M.info[r.code]) referenced.set(ln, r); return 'dyh:' + ln; } const ln = 'N-' + hash(r.name); referenced.set(ln, r); return 'dyh:' + ln; };
    const typeIri = zh => { zh = str(zh); if (!zh) return null; const v = D.vocab.find(x => x.zh === zh); const ln = v ? v.code : 'T-X-' + hash(zh); if (!types.has(ln)) types.set(ln, { zh, known: !!v }); return 'dyh:' + ln; };
    const block = (comment, subj, pairs) => {
      pairs = pairs.filter(p => p && p[1]);
      if (comment) out.push('# ' + comment);
      if (!pairs.length) return;
      declared.add(subj);
      const lines = pairs.map((p, i) => { triples.add(subj + ' ' + p[0] + ' ' + p[1]); return (i ? '    ' : subj + ' ') + p[0] + ' ' + p[1]; });
      out.push(lines.join(' ;\n') + ' .', '');
    };
    const C = c => 'crm:' + (CLS_IRI[c] || 'E1_CRM_Entity');
    const P = p => PROP_IRI[p] ? 'crm:' + PROP_IRI[p] : null;

    out.push('# 大运河课题一 · 知识图谱数据（由五张表自动导出，示意数据）', '# 生成日期：' + todayDash() + '；不要手工修改本文件，错误请回到表格里改后重新导出', '',
      '@prefix crm: <http://www.cidoc-crm.org/cidoc-crm/> .', '@prefix dyh: <https://example.org/dyh/> .  # 正式命名空间待定',
      '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .', '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .', '');

    out.push('# ===== 实体表：一行 → 一个块 =====', '');
    M.ent.forEach((r, i) => {
      const code = str(r.实体编码); if (!code) return;
      const c = clsCode(r.类); const s = 'dyh:' + localName(code);
      const isThing = c && ui.isA(c, 'E18'), isPlace = c === 'E53';
      const loc = ref(r.所在地点), up = ref(r.上级要素);
      const pairs = [['a', C(c)], ['rdfs:label', str(r.名称) ? lit(r.名称) : null], ['crm:P2_has_type', typeIri(r.类型词)]];
      if (loc && isThing) pairs.push(['crm:P53_has_former_or_current_location', iriOf(loc)]);
      if (loc && isPlace) pairs.push(['crm:P89_falls_within', iriOf(loc)]);
      if (up && isThing) pairs.push(['crm:P46i_forms_part_of', iriOf(up)]);
      if (up && isPlace) pairs.push(['crm:P89_falls_within', iriOf(up)]);
      block(`实体表第 ${i + 1} 行：${str(r.名称)}（${str(r.类) || '未定类'}）` + (c && CLS_IRI[c] ? '' : ' —— 类未识别，暂记 E1'), s, pairs);
    });

    out.push('# ===== 事件表：一行 → 事件块 ＋ 时间跨度块 =====', '');
    M.evs.forEach((r, i) => {
      const code = str(r.事件编码); if (!code) return;
      const c = clsCode(r.事件类); const s = 'dyh:' + localName(code);
      const ts = gYear(r.起始年) || gYear(r.结束年) ? 'dyh:' + localName(code) + '-TS' : null;
      const pairs = [['a', C(c)], ['rdfs:label', str(r.事件名称) ? lit(r.事件名称) : null]];
      if (ts) pairs.push(['crm:P4_has_time-span', ts]);
      const actors = str(r.执行者).split(/[;；]/).map(ref).filter(Boolean);
      actors.forEach(a => pairs.push(['crm:P14_carried_out_by', iriOf(a)]));
      const op = { E12: 'P108', E11: 'P31', E6: 'P13', E81: 'P124' }[c];
      str(r.对象要素).split(/[;；]/).map(ref).filter(Boolean).forEach(o => pairs.push(op ? [P(op), iriOf(o)] : null));
      if (str(r.角色)) actors.forEach(a => pairs.push(['rdfs:comment', lit(`执行者 ${a.code} ${a.name} 的角色（P14.1）：${str(r.角色)}`.replace(/\s+/g, ' '))]));
      const meta = [str(r.置信度) ? '置信度：' + str(r.置信度) : '', str(r.朝代) ? '朝代：' + str(r.朝代) : ''].filter(Boolean).join('；');
      if (meta) pairs.push(['rdfs:comment', lit(meta)]);
      block(`事件表第 ${i + 1} 行：${str(r.事件名称)}（${str(r.事件类)}）` + (str(r.角色) ? '；角色 P14.1 在正式数据中需“具体化”（属性节点），这里先写成 rdfs:comment' : ''), s, pairs);
      if (ts) {
        const y1 = gYear(r.起始年) || gYear(r.结束年), y2 = gYear(r.结束年) || y1;
        block(`  └ 时间跨度：${str(r.时间原文) || ''}（${str(r.起始年)}${str(r.结束年) && str(r.结束年) !== str(r.起始年) ? '—' + str(r.结束年) : ''}）`, ts,
          [['a', 'crm:E52_Time-Span'], ['rdfs:label', str(r.时间原文) ? lit(r.时间原文) : null], ['crm:P82a_begin_of_the_begin', y1], ['crm:P82b_end_of_the_end', y2]]);
      }
    });

    out.push('# ===== 关系表：一行 → 一条三元组 =====', '');
    M.rel.forEach((r, i) => {
      const p = propOf(r.属性), s = iriOf(ref(r.主体)), o = iriOf(ref(r.客体));
      const tag = `关系表第 ${i + 1} 行：${str(r.主体)} —${str(r.属性)}→ ${str(r.客体)}`.replace(/\s+/g, ' ');
      if (!p || !P(p.code) || !s || !o) { out.push('# ' + tag + ' —— 属性或编码无法识别，未导出', ''); return; }
      const t = s + ' ' + P(p.code) + ' ' + o;
      if (triples.has(t)) { out.push('# ' + tag + '（上文已生成，不重复）'); return; }
      const pairs = [[P(p.code), o]];
      if (p.role) { const ob = ref(r.客体); pairs.push(['rdfs:comment', lit(`执行者 ${ob.code} ${ob.name} 的角色（P14.1）：${p.role}`.replace(/\s+/g, ' '))]); }
      if (str(r.置信度) && str(r.置信度) !== '确定') out.push('# ' + tag + '（置信度：' + str(r.置信度) + '）'); else out.push('# ' + tag);
      block('', s, pairs);
    });
    if (out[out.length - 1] !== '') out.push('');

    out.push('# ===== 价值表：一行 → 一次 E13 评估 =====', '');
    M.val.forEach((r, i) => {
      const code = str(r.评估编码); if (!code) return;
      const s = 'dyh:' + localName(code);
      const basis = splitCodes(r.依据).filter(x => CODE_RE.test(x));
      const pairs = [['a', 'crm:E13_Attribute_Assignment'], ['rdfs:label', lit((ref(r.要素) || {}).name ? ref(r.要素).name + ' 价值评估' : '价值评估')],
        ['crm:P140_assigned_attribute_to', iriOf(ref(r.要素))], ['crm:P141_assigned', typeIri(str(r.价值二级) || str(r.价值一级))]];
      basis.forEach(b => pairs.push(['crm:P16_used_specific_object', iriOf({ code: b })]));
      const meta = [str(r.价值一级) ? '价值一级：' + str(r.价值一级) : '', str(r.世遗标准) ? '世遗标准：' + str(r.世遗标准) : '', str(r.判定人) ? '判定人：' + str(r.判定人) : '', str(r.状态) ? '状态：' + str(r.状态) : ''].filter(Boolean).join('；');
      if (meta) pairs.push(['rdfs:comment', lit(meta)]);
      block(`价值表第 ${i + 1} 行：${str(r.要素)} · ${valueLabel(r)}` + (/待审/.test(str(r.状态)) ? '（待审：正式交付前须由判定人确认）' : ''), s, pairs);
    });

    out.push('# ===== 来源表：一行 → 一个文献 / 图像块 =====', '');
    M.src.forEach((r, i) => {
      const code = str(r.来源编码); if (!code) return;
      const img = isImg(r); const s = 'dyh:' + localName(code);
      const pairs = [['a', img ? 'crm:E36_Visual_Item' : 'crm:E31_Document'], ['rdfs:label', str(r.题名) ? lit(r.题名) : null], ['crm:P2_has_type', typeIri(r.资料类型)]];
      splitCodes(r.涉及要素).filter(x => CODE_RE.test(x)).forEach(c => pairs.push([img ? 'crm:P138_represents' : 'crm:P70_documents', iriOf({ code: c })]));
      const meta = [['责任者', r.责任者], ['形成时间', r.形成时间], ['出处位置', r.出处位置], ['存放路径', r.存放路径]].filter(x => str(x[1])).map(x => x[0] + '：' + str(x[1])).join('；');
      if (meta) pairs.push(['rdfs:comment', lit(meta)]);
      block(`来源表第 ${i + 1} 行：${str(r.题名)}（${str(r.资料类型)}）`, s, pairs);
    });

    const undeclared = [...referenced.entries()].filter(([ln]) => !declared.has('dyh:' + ln));
    if (undeclared.length) {
      out.push('# ===== 被引用、但五张表里还没有登记的对象（应补登记） =====', '');
      undeclared.forEach(([ln, r]) => block(`引用：${r.code || ''} ${r.name || ''}`.trim(), 'dyh:' + ln,
        [['a', C(guessCls(r.code) || 'E1')], ['rdfs:label', lit(r.name || r.code)]]));
    }
    out.push('# ===== 词表（E55 类型）：被用到的词 =====', '');
    types.forEach((t, ln) => block(t.known ? `词表 ${ln}：${t.zh}` : `“${t.zh}”不在词表里 —— 临时编号，请补进 E55 词表`, 'dyh:' + ln, [['a', 'crm:E55_Type'], ['rdfs:label', lit(t.zh)]]));
    return { text: out.join('\n').replace(/\n{3,}/g, '\n\n'), count: triples.size };
  }

  function highlight(ttl) {
    const re = /("(?:[^"\\\n]|\\.)*"(?:@[A-Za-z-]+|\^\^[A-Za-z]+:[A-Za-z0-9_]+)?)|(#[^\n]*)|(@prefix\b)|(<[^>\s]*>)|\b(crm|dyh|rdfs|xsd):([A-Za-z0-9_\-]*)|((?<=\s)a(?=\s))/g;
    let html = '', last = 0, m;
    while ((m = re.exec(ttl))) {
      html += esc(ttl.slice(last, m.index)); last = re.lastIndex;
      if (m[1]) html += '<span class="c-str">' + esc(m[1]) + '</span>';
      else if (m[2]) html += '<span class="c-com">' + esc(m[2]) + '</span>';
      else if (m[3]) html += '<span class="c-pre">' + esc(m[3]) + '</span>';
      else if (m[4]) html += '<span class="c-str">' + esc(m[4]) + '</span>';
      else if (m[5]) html += '<span class="c-ns">' + m[5] + ':</span>' + (m[5] === 'dyh' ? esc(m[6]) : '<span class="c-cls">' + esc(m[6]) + '</span>');
      else if (m[7]) html += '<span class="c-pre">a</span>';
    }
    return html + esc(ttl.slice(last));
  }

  function renderTtl(body, M, ctl) {
    const { text, count } = buildTtl(M);
    const fname = 'DYH_KG_' + today() + '_V01.ttl';
    const code = el('div', { class: 'codebox', id: 'ttl-code' }); code.innerHTML = highlight(text);
    const left = el('div', null,
      el('div', { class: 'ttl-bar' },
        el('button', { class: 'btn primary', id: 'ttl-dl', on: { click: () => { ui.download(fname, text, 'text/turtle'); ctl.act(); } } }, '下载 .ttl'),
        el('button', { class: 'btn light', id: 'ttl-copy', on: { click: () => { ui.copy(text); ctl.act(); } } }, '复制'),
        el('span', { class: 'cnt' }, el('b', { id: 'ttl-count' }, count), '条三元组 · ' + fname)),
      code);
    const map = [['实体表一行', '一个块', '“a 类”＋名称＋类型（P2）＋位置（P53）＋上级（P46i）'], ['事件表一行', '事件块 ＋ 时间跨度块', '类＋执行者（P14）＋对象（P108 / P31 / P13）＋ P4 → E52'],
      ['关系表一行', '一条三元组', '主体 —属性→ 客体；与上文重复的自动合并'], ['价值表一行', '一个 E13 评估块', '评给谁（P140）、评了什么（P141）、依据（P16）'], ['来源表一行', '一个文献 / 图像块', 'E31 —P70 记载→ 要素；E36 —P138 表示→ 要素'], ['用到的类型词', 'E55 类型块', '按《词表》编号（T-…）；词表没有的词会提示补词']];
    const right = el('div', { class: 'ttl-side' },
      el('div', { class: 'card soft' }, el('h4', null, '表格怎样变成 RDF'), el('ul', { class: 'ttl-map' }, map.map(([a, b, c]) => el('li', null, el('b', null, a), el('span', { class: 'arr' }, '→'), el('b', null, b), el('div', { class: 'muted small' }, c))))),
      el('div', { class: 'callout info small' }, el('b', null, '怎么读　'), '每块以编码开头（dyh:编码），“a”读作“是一个”，分号＝同一主体继续说，句号＝这一块说完了。'),
      el('div', { class: 'callout small' }, 'dyh: 是示意命名空间，正式地址待定。角色（P14.1）在正式数据中要“具体化”，这里先写成注释。'));
    body.appendChild(el('div', { class: 'ttl-wrap' }, left, right));
  }

  /* =====================================================================
     ④ 五张表
     ===================================================================== */
  function renderTables(body, M, ctl) {
    const R = ui.records() || {};
    const keys = Object.keys(D.tableNames);
    if (!keys.includes(cur.table)) cur.table = 'entities';
    const sub = el('div', { class: 'seg', role: 'tablist' });
    const holder = el('div');
    const show = k => {
      cur.table = k;
      [...sub.children].forEach(b => b.classList.toggle('on', b.dataset.k === k));
      holder.innerHTML = '';
      const rows = R[k] || []; const cols = visibleCols(rows);
      const nNew = rows.filter(r => r._new).length;
      const fname = '课题一_' + D.tableNames[k] + '_' + today() + '_V01.csv';
      holder.appendChild(el('div', { class: 'rs-bar', style: 'margin-top:20px' },
        el('b', { style: 'font-size:19px;color:var(--text)' }, D.tableNames[k]),
        el('span', { class: 'note' }, `${rows.length} 行` + (nNew ? `，其中 ${nNew} 行是你新增的（浅蓝色）` : '')),
        el('button', { class: 'btn light sm', id: 'tbl-csv', style: 'margin-left:auto', disabled: rows.length ? null : true,
          on: { click: () => { ui.download(fname, ui.csv(rows.map(r => { const o = {}; cols.forEach(c => o[c] = r[c]); return o; }), cols), 'text/csv'); ctl.act(); } } }, '下载 CSV')));
      if (!rows.length) { holder.appendChild(emptyBox('这张表还是空的', '在「AI 审核」写入，或在「归档」填写元数据卡', ['去审核写入', '#/review'])); return; }
      holder.appendChild(el('div', { class: 'tablewrap' }, el('table', { class: 'tbl rs-tbl', id: 'rs-table' },
        el('thead', null, el('tr', null, cols.map(c => el('th', null, c)))),
        el('tbody', null, rows.map(r => el('tr', { class: r._new ? 'isnew' : '' }, cols.map((c, j) => el('td', { class: j === 0 || /编码$/.test(c) ? 'code' : '' }, str(r[c]), j === 0 && r._new ? el('span', { class: 'rs-new' }, '新') : null))))))));
    };
    keys.forEach(k => sub.appendChild(el('button', { 'data-k': k, on: { click: () => { show(k); if (ctl.refresh) ctl.refresh(); } } }, D.tableNames[k], el('span', { class: 'muted', style: 'font-size:12px;margin-left:4px' }, String((R[k] || []).length)))));
    body.appendChild(sub); body.appendChild(holder);
    show(cur.table);
  }

  /* ---------- 注册部件 ---------- */
  DYH.parts = DYH.parts || {};
  DYH.parts['results.deliverables'] = () => partDeliverables();
  DYH.parts['results.view'] = opts => partView(opts || {});
  DYH.parts['results.dossier'] = () => partSingle('dossier');
  DYH.parts['results.graph'] = () => partSingle('graph');
  DYH.parts['results.ttl'] = () => partSingle('ttl');
  DYH.parts['results.tables'] = () => partSingle('tables');

  DYH.modules = DYH.modules || {};
  DYH.modules.results = {
    title: '成果长什么样',
    steps: ['dossier', 'graph', 'ttl', 'tables'],
    next: 'quiz',
    parts: ['results.deliverables', 'results.view'],
    mount(box) {
      injectCss();
      box.appendChild(ui.pageHead('第 5 节 · 成果', '五张表 → 档案、图谱、RDF',
        '人只维护五张表格；要素档案、知识图谱、RDF 数据都由表格自动生成。表里改一处，所有成果跟着变。'));
      this.parts.forEach(n => box.appendChild(ui.part(n)));
    }
  };

  DYH._results = { buildTtl: () => buildTtl(model()), graphData: () => graphData(model()) };
})();
