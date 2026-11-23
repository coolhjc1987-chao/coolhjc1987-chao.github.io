/* 第 4 节 · AI 抽取 · 人工审核（部件化）
   部件：review.flow / review.prompt / review.import / review.rules / review.bench / review.write / review.export
   各部件可单独嵌入“试用测试”向导；彼此通过 DYH.state.review 共享数据，用自定义事件互相刷新。 */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el;
  const MOD = 'review';
  const EVT = 'dyh:review-changed';   // 审核结论 / 队列变化
  const REC = 'dyh:records-changed';  // 五张表变化（写入、恢复、归档卡）

  /* ---------- 常量 ---------- */
  const BTNS = [['通过', '通过', 'pass'], ['修改后通过', '修改', 'edit'], ['驳回', '驳回', 'rej'], ['待定', '待定', 'hold']];
  const SUF = { 通过: 'pass', 修改后通过: 'edit', 驳回: 'rej', 待定: 'hold' };
  const KIND_COLOR = { 实体: 'var(--c-thing)', 事件: 'var(--c-event)', 关系: 'var(--c-place)', 价值: 'var(--c-value)' };
  const CONF_COLOR = { 高: 'var(--ok)', 中: 'var(--warn)', 低: 'var(--err)' };
  const TRAPS = [
    ['AI-0004', '角色错', '白英是“建议者”，被写成了“主持者”'],
    ['AI-0005', '地点与遗址', '这里的“南旺”是地点 E53，不是遗址 E27'],
    ['AI-0007', '籍贯陷阱', '“汶上”是白英的籍贯，不是坝址']
  ];
  /* 审核员“直接通过”了本该修改或驳回的候选时，按 AI 原样写进表里（让后果看得见） */
  const NAIVE = {
    'AI-0004': { table: 'relations', row: { 主体: 'EV-0101 重开会通河', 属性: 'P14 由…执行（主持）', 客体: 'PER-0008 白英', 置信度: '确定' } },
    'AI-0005': { table: 'entities', row: { 实体编码: 'PL-0034', 名称: '南旺', 类: 'E27 场址', 类型词: '', 所在地点: '', 上级要素: '' } },
    'AI-0007': { table: 'relations', row: { 主体: 'DYH-HTH-ZB-0012 戴村坝', 属性: 'P53 具有位置', 客体: 'PL-0033 汶上县', 置信度: '存疑' } }
  };
  const SECS = { entities: '实体', events: '事件', relations: '关系', value_candidates: '价值' };

  /* ---------- 共享数据（都存在 DYH.state.review） ---------- */
  function R() {
    if (!DYH.state.review || typeof DYH.state.review !== 'object') DYH.state.review = { decisions: {}, edits: {}, imported: null };
    const r = DYH.state.review;
    if (!r.decisions) r.decisions = {};
    if (!r.edits) r.edits = {};
    if (r.imported === undefined) r.imported = null;
    return r;
  }
  const isImp = () => !!(R().imported && R().imported.items);
  const queue = () => isImp() ? R().imported.items : D.candidates;
  const keyOf = c => (isImp() ? 'imp:' : '') + c.id;
  const decOf = c => R().decisions[keyOf(c)] || '';
  const editOf = c => R().edits[keyOf(c)] || {};
  const accepted = d => d === '通过' || d === '修改后通过';
  const srcText = () => isImp() ? (R().imported.text || '') : D.sample.text;
  const srcInfo = () => isImp() ? { code: R().imported.code || '', page: R().imported.page || '' } : { code: D.sample.sourceCode, page: D.sample.page };
  const findCand = id => id ? queue().find(c => c.id === id) : null;
  function counts() {
    const q = queue(), c = { 通过: 0, 修改后通过: 0, 驳回: 0, 待定: 0 }; let done = 0;
    q.forEach(x => { const d = decOf(x); if (d) { done++; c[d]++; } });
    return { total: q.length, done, c };
  }
  const expertRight = () => D.candidates.filter(c => decOf(c) === c.expect).length;
  /* 审核结论的“指纹”：写入后若结论又改了，提示重新写入 */
  const sig = () => (isImp() ? 'imp|' : 'demo|') + queue().map(c => decOf(c) + ':' + (decOf(c) === '修改后通过' ? (editOf(c).text || '') : '')).join(',');
  const writtenState = () => { const r = R(); const w = !!DYH.state.records && r.writeSig != null; return { written: w, stale: w && r.writeSig !== sig() }; };

  /* ---------- 小工具 ---------- */
  const today = () => { const d = new Date(); return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const pad = (n, w) => String(n).padStart(w || 3, '0');
  const stripWS = s => String(s).replace(/\s+/g, '');
  const inText = (q, text) => !!q && (text.includes(q) || stripWS(text).includes(stripWS(q)));
  const cols = rows => { const out = []; rows.forEach(r => Object.keys(r).forEach(k => { if (k[0] !== '_' && !out.includes(k)) out.push(k); })); return out; };
  const cleanRows = rows => rows.map(r => { const o = {}; Object.keys(r).forEach(k => { if (k[0] !== '_') o[k] = r[k]; }); return o; });
  function scrollTo(node) { if (!node) return; const y = node.getBoundingClientRect().top + window.scrollY - 76; window.scrollTo({ top: y, behavior: 'smooth' }); }
  let uidN = 0; const uid = () => 'rv' + (++uidN);
  const fire = (name, src) => document.dispatchEvent(new CustomEvent(name, { detail: { src } }));
  /* 监听共享事件；部件离开页面后自动解绑；自己发出的事件忽略 */
  function onEvt(node, name, fn, me) {
    const h = e => { if (!node.isConnected) { document.removeEventListener(name, h); return; } if (me && e.detail && e.detail.src === me) return; fn(); };
    document.addEventListener(name, h);
  }
  /* 提示条：未完成显示“怎么做”，完成后换成绿色 ✓ */
  function mkHint() {
    const wrap = el('div', { class: 'rv-hint' }); let key = '';
    return { node: wrap, set(done, content) {
      const k = (done ? 1 : 0) + JSON.stringify(content); if (k === key) return; key = k;
      wrap.innerHTML = '';
      wrap.appendChild(done ? ui.hint('已完成：' + content, { done: true }) : ui.hint(content, { title: '怎么做' }));
    } };
  }
  /* 同一部件里只让一个元素闪烁 */
  function pulseIn(root, node) { root.querySelectorAll('.pulse').forEach(n => n.classList.remove('pulse')); if (node && !node.disabled) ui.pulse(node); }
  const whoAI = () => el('span', { class: 'who ai' }, 'AI');
  const whoHu = t => el('span', { class: 'who human' }, t || '人');
  const pill = d => el('span', { class: 'rv-pill ' + (d ? SUF[d] : 'none') }, d || '未审');
  const why = t => el('p', { class: 'rv-why' }, '为什么：' + t);
  function head(title, w, who) { return el('div', { class: 'rv-head' }, el('h2', null, el('span', null, title), who || null), why(w)); }
  function part(name) { injectCSS(); return el('div', { class: 'section rv-part', 'data-part': name }); }
  const linkBtn = (text, fn) => el('button', { class: 'rv-link', on: { click: fn } }, text);
  const reason = t => el('span', { class: 'rv-reason' }, t);

  function form() {
    const r = R();
    const def = { code: D.sample.sourceCode, page: '[__]', vocab: vocabText(), text: D.sample.text };
    if (!r.form || typeof r.form !== 'object') r.form = {};
    Object.keys(def).forEach(k => { if (typeof r.form[k] !== 'string') r.form[k] = def[k]; });
    return r.form;
  }
  function vocabText() {
    return D.vocab.map(v => {
      const bits = [];
      if (v.parent) bits.push('上位：' + v.parent);
      if (v.cls === '角色') bits.push('用作 P14.1 角色');
      else if (v.cls) bits.push('适用 ' + v.cls);
      return v.code + ' ' + v.zh + (bits.length ? '（' + bits.join('；') + '）' : '');
    }).join('\n');
  }
  function vocabWords(txt) {
    const set = new Set();
    String(txt).split('\n').forEach(l => { const m = l.trim().match(/^\S+\s+([^（(\s]+)/); if (m) set.add(m[1]); });
    return set;
  }
  const PH = ['{{来源编码}}', '{{页码}}', '{{词表}}', '{{原文}}'];
  function promptParts(f) {
    const val = { '{{来源编码}}': f.code, '{{页码}}': f.page, '{{词表}}': f.vocab, '{{原文}}': f.text };
    return String((window.DYH_KIT || {}).prompt || '').split(/(\{\{来源编码\}\}|\{\{页码\}\}|\{\{词表\}\}|\{\{原文\}\})/).map(t => PH.includes(t) ? { fill: true, t: val[t] } : { t });
  }
  const promptText = f => promptParts(f).map(p => p.t).join('');

  /* ---------- 样式（每个部件都会调用；只注入一次） ---------- */
  function injectCSS() {
    if (document.getElementById('mod-review-css')) return;
    const css = `
.rv-part{padding:40px 0}
.rv-head h2{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 6px}
.rv-head h2 .who{font-size:12px;position:relative;top:1px}
.rv-why{color:var(--text2);font-size:17px;margin:0 0 4px;max-width:820px;text-wrap:pretty}
.rv-hint{margin:16px 0 24px}
.rv-hint .hintbar{margin:0}
.rv-part .btn.pulse{border-radius:980px}
.rv-part .seg button.pulse{border-radius:8px}
.rv-link{border:0;background:none;color:var(--accent);font:inherit;font-size:15px;font-weight:500;cursor:pointer;padding:0}
.rv-link::after{content:" ›"}
.rv-link:hover{text-decoration:underline}
.rv-reason{font-size:14px;color:var(--text2)}
.rv-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.rv-note{font-size:14px;color:var(--text2);margin:16px 0 0}
.rv-empty{border-radius:16px;background:var(--bg2);padding:32px 24px;text-align:center;color:var(--text2);font-size:15px}
.rv-empty .rv-link{display:inline-block;margin-top:6px}
/* 流程条 */
.rv-flow{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;margin-top:24px}
.rv-brk{grid-column:3/8;grid-row:1;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--accent);margin-bottom:2px}
.rv-brk::before,.rv-brk::after{content:"";flex:1;height:1px;background:rgba(0,113,227,.35)}
.rv-st{grid-row:2;background:var(--bg2);border-radius:16px;padding:14px 14px 16px;display:flex;flex-direction:column;gap:8px;min-width:0;transition:transform .2s,box-shadow .2s}
.rv-st.off{opacity:.55}
.rv-st.go{cursor:pointer}
.rv-st.go:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.rv-st.key{background:#fff;box-shadow:0 0 0 2px var(--accent)}
.rv-st .n{width:26px;height:26px;border-radius:50%;background:#fff;color:var(--text);display:grid;place-items:center;font-size:13px;font-weight:600}
.rv-st.key .n{background:var(--accent);color:#fff}
.rv-st.ok .n{background:#34C759;color:#fff}
.rv-st .nm{font-weight:600;font-size:15px;color:var(--text);line-height:1.3}
.rv-st .wh{display:flex;gap:4px;flex-wrap:wrap}
.rv-st .who{margin:0;white-space:nowrap}
@media (max-width:900px){.rv-flow{grid-template-columns:repeat(4,minmax(0,1fr))}.rv-brk{display:none}.rv-st{grid-row:auto}}
/* 提示词 */
.rv-fields{display:grid;gap:16px}
.rv-fields .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rv-fields textarea.rv-src{font-family:"Songti SC","STSong","Noto Serif CJK SC","SimSun",serif;font-size:16px;line-height:1.8}
.rv-boxhead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}
.rv-boxhead h4{margin:0}
.rv-codebox{white-space:pre-wrap;word-break:break-word;max-height:470px;font-size:12.5px;border-radius:18px;padding:20px 22px}
.rv-codebox .rv-fill{background:rgba(10,132,255,.28);color:#fff;border-radius:4px;box-shadow:0 0 0 1px rgba(100,170,255,.55)}
/* 导入 */
.rv-imp{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;align-items:start}
.rv-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}
.rv-stat{background:var(--bg2);border-radius:14px;padding:12px 14px}
.rv-stat b{display:block;font-size:26px;font-weight:700;color:var(--text);line-height:1.15;letter-spacing:-.01em}
.rv-stat span{font-size:13px;color:var(--text2)}
.rv-issues{max-height:320px;overflow:auto;display:grid;gap:8px}
.rv-issues .callout{padding:10px 14px;font-size:14px}
.rv-issues ul{margin:4px 0 0;padding-left:18px}
.rv-status{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:24px;background:var(--bg2);border-radius:14px;padding:12px 16px;font-size:14px;color:var(--text2)}
.rv-status b{color:var(--text)}
@media (max-width:900px){.rv-imp{grid-template-columns:1fr}.rv-stats{grid-template-columns:repeat(2,1fr)}}
/* 工作台 */
.rv-wb{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:24px;align-items:start}
.rv-left{position:sticky;top:72px;max-height:calc(100vh - 88px);overflow:auto;display:grid;gap:16px}
@media (max-width:900px){.rv-wb{grid-template-columns:1fr}.rv-left{position:static;max-height:none}}
.rv-srchead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.rv-srchead h3{margin:0;font-size:19px}
.rv-chip{font-family:var(--mono);font-size:12px;color:var(--text2);background:var(--bg2);border-radius:980px;padding:2px 10px;white-space:nowrap}
.rv-left .srctext{font-size:21px;line-height:2.1;margin:0;padding:20px 22px}
.rv-left .srctext .rv-hl{background:#FFE58A;box-shadow:0 0 0 2px #FFE58A;border-radius:4px;cursor:default;border-bottom:0}
.rv-cap{font-size:13px;color:var(--text2);margin-top:10px;min-height:20px}
.rv-cap.bad{color:var(--err);font-weight:600}
.rv-rulebox{background:var(--bg2);border-radius:18px;padding:16px 18px}
.rv-rulebox h4{font-size:14px;color:var(--text2);margin:0 0 10px;font-weight:600}
.rv-rules{margin:0;padding:0;list-style:none;display:grid;gap:8px;font-size:14px}
.rv-rules li{display:grid;grid-template-columns:86px 1fr;gap:8px;align-items:baseline}
.rv-pill{display:inline-block;font-size:12px;font-weight:600;padding:0 10px;border-radius:980px;line-height:1.9;white-space:nowrap;text-align:center}
.rv-pill.pass{background:var(--ok-soft);color:var(--ok)}
.rv-pill.edit{background:var(--warn-soft);color:var(--warn)}
.rv-pill.rej{background:var(--err-soft);color:var(--err)}
.rv-pill.hold{background:var(--c-event-soft);color:var(--text)}
.rv-pill.none{background:var(--bg2);color:var(--text3)}
.rv-qhead{background:var(--bg2);border-radius:20px;padding:18px 20px}
.rv-qtop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.rv-qtop h3{margin:0;font-size:19px}
.rv-qtop .sub{font-size:13px;color:var(--text2)}
.rv-qtop .exp{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.rv-prog{display:flex;align-items:center;gap:12px;margin:14px 0 12px}
.rv-prog .pbar{flex:1;background:#fff}
.rv-prog b{font-size:15px;color:var(--text);white-space:nowrap}
.rv-prog b small{color:var(--text3);font-weight:500}
.rv-tools{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.rv-tools .seg{background:var(--bg3)}
.rv-tools .seg .cnt{font-size:12px;color:var(--text3);margin-left:4px}
.rv-counts{display:flex;gap:6px;flex-wrap:wrap}
.rv-list{display:grid;gap:12px;margin-top:16px}
.rv-card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:18px;padding:16px 18px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.03);transition:box-shadow .2s,border-color .2s}
.rv-card:hover{box-shadow:0 2px 6px rgba(0,0,0,.04),0 10px 28px rgba(0,0,0,.07)}
.rv-card.active{border-color:transparent;box-shadow:0 0 0 2px var(--accent),0 10px 28px rgba(0,0,0,.07)}
.rv-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px;color:var(--text3)}
.rv-id{font-family:var(--mono);font-size:12px}
.rv-kind,.rv-conf{display:inline-flex;align-items:center;gap:5px;color:var(--text2)}
.rv-kind i,.rv-conf i{width:7px;height:7px;border-radius:50%;display:inline-block}
.rv-flag{color:var(--warn);font-weight:600}
.rv-top .rv-pill{margin-left:auto}
.rv-content{font-size:17px;font-weight:600;color:var(--text);margin:8px 0 4px;line-height:1.5;word-break:break-word}
.rv-card.is-rej .rv-content{text-decoration:line-through;text-decoration-color:rgba(215,0,21,.5);color:var(--text2)}
.rv-quote{font-family:"Songti SC","STSong","Noto Serif CJK SC","SimSun",serif;color:var(--text2);font-size:15px;line-height:1.6}
.rv-quote::before{content:"“"}.rv-quote::after{content:"”"}
.rv-quote.miss{color:var(--err)}
.rv-aside{font-size:13px;color:var(--text2);margin-top:4px;line-height:1.55}
.rv-aside.warn{color:var(--warn)}
.rv-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.rv-acts .btn{min-width:64px;background:var(--bg2);color:var(--text)}
.rv-acts .btn:hover{background:var(--bg3)}
.rv-acts .btn.on-pass{background:var(--ok);color:#fff}
.rv-acts .btn.on-edit{background:var(--warn);color:#fff}
.rv-acts .btn.on-rej{background:var(--err);color:#fff}
.rv-acts .btn.on-hold{background:#1D1D1F;color:#fff}
.rv-extra{display:grid;grid-template-columns:3fr 2fr;gap:10px;margin-top:12px}
.rv-extra.one{grid-template-columns:1fr}
.rv-extra input{font-size:14px}
@media (max-width:1100px){.rv-extra{grid-template-columns:1fr}}
.rv-expert{margin-top:12px;border-radius:14px;padding:12px 14px;font-size:14px;line-height:1.65;cursor:default}
.rv-expert.ok{background:var(--ok-soft);color:#1B5E2B}
.rv-expert.bad{background:var(--err-soft);color:#9A0010}
.rv-expert.none{background:var(--bg2);color:var(--text)}
.rv-expert .hd{font-weight:600}
.rv-expert .fx{font-weight:600;background:rgba(255,255,255,.75);border-radius:6px;padding:1px 6px}
.rv-score{background:#1D1D1F;color:#E8E8ED;border-radius:20px;padding:22px 24px;margin-top:16px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:28px;align-items:center}
.rv-score .big{font-size:52px;font-weight:700;line-height:1;color:#fff;letter-spacing:-.02em}
.rv-score .big small{font-size:20px;color:#86868B;font-weight:500}
.rv-score .cap{font-size:13px;color:#A1A1A6;margin-top:6px}
.rv-score h4{color:#fff;margin:0 0 8px;font-size:15px}
.rv-traps{display:grid;gap:6px;font-size:14px}
.rv-traps div{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.rv-traps .mk{font-weight:600;min-width:48px}
.rv-traps .mk.ok{color:#30D158}.rv-traps .mk.bad{color:#FF6961}.rv-traps .mk.none{color:#86868B}
.rv-traps .t{color:#fff;font-weight:600}
.rv-traps .d{color:#A1A1A6}
.rv-score .foot{font-size:13px;color:#A1A1A6;margin-top:10px}
/* 写入 */
.rv-plan{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 16px;font-size:14px;color:var(--text2)}
.rv-plan .ch{display:inline-flex;align-items:center;gap:6px;background:var(--bg2);border-radius:980px;padding:4px 12px;color:var(--text);font-weight:500}
.rv-plan .ch i{width:7px;height:7px;border-radius:50%}
.rv-plan .ch b{font-weight:700}
.rv-tblhead{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:32px 0 12px}
.rv-tblhead .seg .cnt{font-size:12px;color:var(--text3);margin-left:4px}
.rv-tblhead .seg .plus{font-size:12px;color:var(--accent);font-weight:700;margin-left:3px}
.rv-legend{font-size:13px;color:var(--text2);display:inline-flex;align-items:center;gap:6px}
.rv-legend i{width:14px;height:14px;border-radius:4px;background:var(--accent-soft);box-shadow:inset 3px 0 0 var(--accent)}
.tbl tr.rv-new td{background:var(--accent-soft)}
.tbl tr.rv-new:hover td{background:#DCEBFC}
.tbl tr.rv-new td:first-child{box-shadow:inset 3px 0 0 var(--accent)}
.tbl td.rv-bad{color:var(--err);font-weight:600}
/* 导出 */
.rv-exports{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.rv-exp{background:var(--bg2);border-radius:22px;padding:24px;display:flex;flex-direction:column;gap:6px}
.rv-exp h4{margin:0}
.rv-exp p{font-size:14px;color:var(--text2);margin:0 0 10px;flex:1}
.rv-exp .rv-row{gap:6px}
@media (max-width:900px){.rv-exports{grid-template-columns:1fr}}
/* 规则 */
.rv-rgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:12px}
.rv-rt{background:var(--bg2);border-radius:20px;padding:20px}
.rv-rt .rv-pill{font-size:13px;padding:2px 12px}
.rv-rt p{font-size:14px;color:var(--text);margin:12px 0 0;line-height:1.6}
.rv-rt p.ex{color:var(--text2);margin-top:6px;font-size:13px}
.rv-order{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:12px}
.rv-order .step{background:#fff}
.rv-sub{font-size:15px;font-weight:600;color:var(--text2);margin:28px 0 0}
@media (max-width:900px){.rv-rgrid,.rv-order{grid-template-columns:1fr 1fr}}
`;
    document.head.appendChild(el('style', { id: 'mod-review-css' }, css));
  }

  /* ================= 七步流程 ================= */
  function partFlow() {
    const s = part('review.flow');
    s.appendChild(head('七步流程：AI 先抽，人来把关', 'AI 读得快，但会“看起来很对地”出错；人懂运河但录入慢。所以 AI 先抽候选，人逐条审核，没过审核的一律不进正式表。'));
    const grid = el('div', { class: 'rv-flow' });
    s.appendChild(grid);
    s.appendChild(el('p', { class: 'rv-note' }, '第 1、2 步在「归档命名」里练过；第 3—7 步是本节的动手练习，点方块可以跳过去。'));
    const steps = [
      ['1', '登记归档', [whoHu()], null, null],
      ['2', '切分校字', [whoAI(), whoHu()], null, null],
      ['3', 'AI 抽取', [whoAI()], 'review.prompt', () => DYH.progress.has(MOD, 'prompt')],
      ['4', '进审核表', [whoHu()], 'review.import', () => isImp()],
      ['5', '人工审核', [whoHu('人 · 关键')], 'review.bench', () => DYH.progress.has(MOD, 'review')],
      ['6', '写入五张表', [whoHu()], 'review.write', () => DYH.progress.has(MOD, 'write')],
      ['7', '汇总导出', [whoHu('人＋技术方')], 'review.export', () => DYH.progress.has(MOD, 'export')]
    ];
    const draw = () => {
      grid.innerHTML = '';
      grid.appendChild(el('div', { class: 'rv-brk' }, '本节动手练'));
      steps.forEach(([n, nm, who, target, done]) => {
        const ok = done && done();
        const st = el('div', { class: 'rv-st' + (target ? '' : ' off') + (n === '5' ? ' key' : '') + (ok ? ' ok' : ''), title: ok ? '已完成' : '' },
          el('span', { class: 'n' }, ok ? '✓' : n), el('span', { class: 'nm' }, nm), el('div', { class: 'wh' }, who.map(w => w.cloneNode(true))));
        if (target) st.addEventListener('click', () => { const t = document.querySelector(`[data-part="${target}"]`); if (t && t !== s) scrollTo(t); });
        if (target) st.addEventListener('mouseenter', () => st.classList.toggle('go', !!document.querySelector(`[data-part="${target}"]`)));
        grid.appendChild(st);
      });
    };
    draw();
    DYH.onProgress(() => { if (s.isConnected) draw(); });
    onEvt(s, EVT, draw);
    return s;
  }

  /* ================= 第 3 步 · 生成提示词 ================= */
  function partPrompt() {
    const s = part('review.prompt');
    s.appendChild(head('生成提示词（流程第 3 步）', 'AI 只知道你告诉它的东西。提示词把规则、可用的类、词表和原文一次交代清楚，AI 才不容易凭空编造。', whoAI()));
    const H = mkHint(); s.appendChild(H.node);
    const f = form();
    const inp = (k, attrs) => { const n = el(attrs.rows ? 'textarea' : 'input', Object.assign({ type: attrs.rows ? null : 'text' }, attrs)); n.value = f[k]; n.addEventListener('input', () => { form()[k] = n.value; DYH.save(); refresh(); }); return n; };
    const fCode = inp('code', { spellcheck: 'false' }), fPage = inp('page', { spellcheck: 'false' });
    const fVocab = inp('vocab', { rows: 8, spellcheck: 'false' }), fText = inp('text', { rows: 4, class: 'rv-src' });
    const textLen = el('span', { class: 'rv-reason' });
    const reset = linkBtn('恢复示例内容', () => { R().form = null; const g = form(); fCode.value = g.code; fPage.value = g.page; fVocab.value = g.vocab; fText.value = g.text; DYH.save(); refresh(); ui.toast('已恢复示例内容'); });
    const left = el('div', { class: 'rv-fields' },
      el('div', { class: 'two' },
        el('div', { class: 'field' }, el('label', null, '来源编码'), fCode),
        el('div', { class: 'field' }, el('label', null, '页码'), fPage)),
      el('div', { class: 'field' }, el('label', null, '原文（已人工校字，一次只贴一个条目）'), fText),
      el('div', { class: 'field' }, el('label', null, '词表（词表管理员发布的当前版）'), fVocab),
      el('div', { class: 'rv-row', style: 'justify-content:space-between' }, textLen, reset));

    const code = el('div', { class: 'codebox rv-codebox' });
    const len = el('span', { class: 'rv-reason' });
    const done = () => { DYH.progress.mark(MOD, 'prompt'); guide(); };
    const copy = el('button', { class: 'btn primary', id: 'rv-copy', on: { click: () => { ui.copy(promptText(form())); done(); } } }, '复制提示词');
    const dl = el('button', { class: 'btn light', on: { click: () => { const g = form(); const safe = String(g.code || '未填编码').replace(/[\\/:*?"<>|\[\]\s]/g, ''); ui.download('课题一_AI抽取提示词_' + safe + '_' + today() + '.txt', promptText(g)); done(); } } }, '下载 .txt');
    const right = el('div', null,
      el('div', { class: 'rv-boxhead' }, el('div', null, el('h4', null, '生成的提示词'), len), el('div', { class: 'rv-row', style: 'gap:8px' }, copy, dl)),
      code,
      el('p', { class: 'rv-note', style: 'margin-top:10px' }, '蓝色框里是左边填的内容，其余是课题组统一模板，不要改动。'));
    s.appendChild(el('div', { class: 'split' }, left, right));
    s.appendChild(el('div', { class: 'callout warn', style: 'margin-top:24px' }, el('b', null, '三条要求　'), '一次只贴一个条目 · 原文先人工校字（OCR 错字会被 AI 当真）· 未公开资料上传云端 AI 前，先确认甲方允许。'));

    function refresh() {
      const g = form();
      if (!window.DYH_KIT || !window.DYH_KIT.prompt) { code.textContent = '（没有找到提示词模板 kit.js）'; return; }
      code.innerHTML = promptParts(g).map(p => p.fill ? '<span class="rv-fill">' + ui.esc(p.t) + '</span>' : ui.esc(p.t)).join('');
      len.textContent = '共 ' + promptText(g).length + ' 字';
      textLen.textContent = '原文 ' + Array.from(g.text).length + ' 字';
    }
    function guide() {
      if (DYH.progress.has(MOD, 'prompt')) H.set(true, '提示词已复制 / 下载。把它粘贴进 Claude 对话发送，再把回复带到下一步「导入 AI 输出」。');
      else H.set(false, ['左边已填好示例：来源编码、页码、原文、词表，可以先不改', '点右上角“复制提示词”（或“下载 .txt”）', '打开 Claude 对话粘贴、发送，复制它回复的 JSON，带到下一步「导入」']);
      pulseIn(s, DYH.progress.has(MOD, 'prompt') ? null : copy);
    }
    refresh(); guide();
    return s;
  }

  /* ================= 第 4 步 · 导入 AI 输出 ================= */
  function extractJSON(txt) {
    const fence = String(txt).match(/```[a-zA-Z]*\s*\n?([\s\S]*?)```/);
    const s = fence && fence[1].includes('{') ? fence[1] : String(txt);
    const a = s.indexOf('{'), b = s.lastIndexOf('}');
    return a < 0 || b <= a ? null : s.slice(a, b + 1);
  }

  function validate(obj, ctx) {
    const issues = [];
    const add = (lvl, id, msg) => issues.push({ lvl, id, msg });
    const classSet = new Set(D.classes.map(c => c.code + ' ' + c.zh));
    const isEventCls = v => { const c = ui.cls(String(v).split(' ')[0]); return c && c.group === 'event'; };
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { add('err', null, '最外层应该是一个 { } 对象'); return issues; }
    ['来源编码', '页码', 'entities', 'events', 'relations', 'value_candidates'].forEach(k => { if (!(k in obj)) add('err', null, `缺少顶层字段“${k}”`); });
    Object.keys(SECS).forEach(k => { if (k in obj && !Array.isArray(obj[k])) add('err', null, `“${k}”应该是数组 [ ]`); });
    if ('来源编码' in obj && ctx.code && String(obj.来源编码) !== String(ctx.code)) add('warn', null, `顶层来源编码“${obj.来源编码}”与第 3 步填写的“${ctx.code}”不一致，确认是不是贴错了条目`);
    if ('页码' in obj && ctx.page && String(obj.页码) !== String(ctx.page)) add('warn', null, `顶层页码“${obj.页码}”与第 3 步填写的“${ctx.page}”不一致`);
    const arr = k => Array.isArray(obj[k]) ? obj[k] : [];
    const names = new Map();
    arr('entities').forEach(it => it && it.名称 && names.set(String(it.名称), String(it.类 || '').split(' ')[0]));
    arr('events').forEach(it => it && it.名称 && names.set(String(it.名称), String(it.类 || '').split(' ')[0]));
    const seen = new Set();
    const vocabOK = w => !w || ctx.vocab.has(String(w)) || /^词表外[：:]/.test(String(w));

    Object.keys(SECS).forEach(sec => arr(sec).forEach((it, i) => {
      if (!it || typeof it !== 'object') { add('err', null, `${sec} 第 ${i + 1} 条不是对象`); return; }
      const id = it.候选编号 ? String(it.候选编号) : `${SECS[sec]}第 ${i + 1} 条`;
      if (!it.候选编号) add('err', id, '缺少“候选编号”');
      else if (seen.has(id)) add('warn', id, '候选编号重复'); else seen.add(id);
      if (!['高', '中', '低'].includes(it.置信度)) add('err', id, `置信度只能是 高 / 中 / 低，现在是“${it.置信度 == null ? '空' : it.置信度}”`);
      else if (it.置信度 !== '高' && !String(it.说明 || '').trim()) add('warn', id, '置信度为中或低时，“说明”不能为空');
      const q = it.原文引文 == null ? '' : String(it.原文引文);
      if (!q) add('err', id, '缺少“原文引文”');
      else {
        const n = Array.from(q).length;
        if (n > 40) add('err', id, `原文引文超过 40 字（现在 ${n} 字）`);
        if (!inText(q, ctx.text)) add('warn', id, `引文在原文中找不到 → 可能是编造：「${q}」`);
      }
      if (it.页码 != null && obj.页码 != null && String(it.页码) !== String(obj.页码)) add('warn', id, `页码“${it.页码}”与顶层页码不一致`);

      if (sec === 'entities' || sec === 'events') {
        const v = it.类;
        if (!v) add('err', id, '缺少“类”');
        else if (!classSet.has(String(v))) {
          const m = String(v).match(/^E\d+/); const c = m && ui.cls(m[0]);
          add('err', id, c ? `类的写法应为“${c.code} ${c.zh}”，现在是“${v}”` : `“${v}”不在可用类里`);
        } else if (sec === 'events' && !isEventCls(v)) add('warn', id, `事件的类应为 E12 / E11 / E6 / E81，现在是“${v}”`);
        else if (sec === 'entities' && isEventCls(v)) add('warn', id, `“${v}”是事件类，应该放在 events 里`);
        if (!it.名称) add('err', id, '缺少“名称”');
        if (!vocabOK(it.类型)) add('warn', id, `类型“${it.类型}”不在词表里（词表外的词应写成“词表外：${it.类型}”）`);
        if (sec === 'events' && it.时间依据 === '推定' && it.置信度 === '高') add('warn', id, '时间是“推定”的，置信度不能为“高”');
      }
      if (sec === 'relations') {
        const m = String(it.属性 || '').trim().match(/^(P\d+i?)(?![0-9a-z])/);
        const p = m && ui.prop(m[1]);
        if (!p) add('err', id, `属性“${it.属性 || '空'}”不在可用属性里`);
        if (p && p.code === 'P14' && !String(it.角色 || '').trim()) add('warn', id, 'P14 必须同时填“角色”（如 主持、建议）');
        if (p && p.code === 'P14' && it.角色 && !vocabOK(it.角色)) add('warn', id, `角色“${it.角色}”不在词表里`);
        ['主体名称', '客体名称'].forEach(k => { if (!names.has(String(it[k] || ''))) add('warn', id, `${k}“${it[k] || '空'}”与本次输出的实体 / 事件名称对不上`); });
        const sc = names.get(String(it.主体名称 || '')), oc = names.get(String(it.客体名称 || ''));
        if (p && sc && oc && ui.cls(sc) && ui.cls(oc)) { const ck = ui.checkTriple(sc, p.code, oc); if (!ck.ok) add('warn', id, '方向或类型不对：' + ck.msg); }
      }
      if (sec === 'value_candidates') {
        if (it.判定状态 !== '待定') add('err', id, `价值候选的“判定状态”必须是“待定”，现在是“${it.判定状态 == null ? '空' : it.判定状态}”`);
        if (!names.has(String(it.对象名称 || ''))) add('warn', id, `对象名称“${it.对象名称 || '空'}”与本次输出的实体名称对不上`);
        if (!vocabOK(it.价值类别)) add('warn', id, `价值类别“${it.价值类别}”不在词表里`);
        if (!vocabOK(it.价值子项)) add('warn', id, `价值子项“${it.价值子项}”不在词表里`);
      }
    }));
    return issues;
  }

  function summarize(sec, it) {
    if (sec === 'entities') return [it.名称, it.类, it.类型 ? '类型=' + it.类型 : ''].filter(Boolean).join(' · ');
    if (sec === 'events') {
      let t = '';
      if (it.时间原文) t = String(it.时间原文) + (it.起始年 && !String(it.时间原文).includes(String(it.起始年)) ? `（${it.起始年}）` : '');
      else if (it.起始年) t = String(it.起始年) + (it.结束年 && it.结束年 !== it.起始年 ? '—' + it.结束年 : '');
      if (t && it.时间依据 === '推定') t += '（推定）';
      return [it.名称, it.类, t].filter(Boolean).join(' · ');
    }
    if (sec === 'relations') return `${it.主体名称 || '?'} —${it.属性 || '?'}${it.角色 ? '（' + it.角色 + '）' : ''}→ ${it.客体名称 || '?'}`;
    return `${it.对象名称 || '?'} · ${it.价值类别 || '?'}${it.价值子项 ? ' / ' + it.价值子项 : ''}`;
  }
  function toCandidates(obj, issues) {
    const out = [], used = new Set(); let n = 0;
    Object.keys(SECS).forEach(sec => (Array.isArray(obj[sec]) ? obj[sec] : []).forEach((it, i) => {
      if (!it || typeof it !== 'object') return;
      n++;
      let id = it.候选编号 ? String(it.候选编号) : 'AI-' + pad(n, 4);
      const flagKey = it.候选编号 ? String(it.候选编号) : `${SECS[sec]}第 ${i + 1} 条`;
      while (used.has(id)) id += '′';
      used.add(id);
      out.push({ id, kind: SECS[sec], sec, content: summarize(sec, it), quote: it.原文引文 == null ? '' : String(it.原文引文), conf: ['高', '中', '低'].includes(it.置信度) ? it.置信度 : '低', note: it.说明 || '', raw: it,
        flags: issues.filter(x => x.id === flagKey).map(x => x.msg) });
    }));
    return out;
  }

  function partImport() {
    const s = part('review.import');
    const me = uid();
    let parsed = null;
    s.appendChild(head('导入 AI 输出（流程第 4 步，可选）', 'AI 的回复不能直接用：先让机器查一遍格式和引文，再交给人审。没调用 AI 也没关系，可以用示例输出体验，或直接跳到审核。', whoHu()));
    const H = mkHint(); s.appendChild(H.node);
    const ta = el('textarea', { rows: 13, spellcheck: 'false', placeholder: '把 AI 的整段回复粘贴到这里（含 ```json 代码块也可以，会自动找出 JSON）' });
    ta.value = R().paste || '';
    const report = el('div');
    const parseBtn = el('button', { class: 'btn primary', id: 'rv-parse', on: { click: doParse } }, '解析');
    const parseWhy = reason('');
    const fillBtn = el('button', { class: 'btn light', id: 'rv-fill', on: { click: fillSample } }, '填入示例 AI 输出');
    const clearBtn = linkBtn('清空', () => { ta.value = ''; R().paste = ''; DYH.save(); parsed = null; emptyReport(); sync(); });
    const loadBtn = el('button', { class: 'btn primary', id: 'rv-load', disabled: true, on: { click: loadQueue } }, '载入审核队列');
    const loadWhy = reason('先点左边的“解析”');
    const status = el('div', { class: 'rv-status' });
    ta.addEventListener('input', () => { R().paste = ta.value; DYH.save(); if (parsed) { parsed = null; emptyReport('内容改过了，请重新点“解析”。'); } sync(); });

    s.appendChild(el('div', { class: 'rv-imp' },
      el('div', null, el('div', { class: 'field' }, el('label', null, 'AI 的回复'), ta),
        el('div', { class: 'rv-row', style: 'margin-top:12px' }, parseBtn, fillBtn, clearBtn, parseWhy)),
      el('div', null, el('div', { class: 'field' }, el('label', null, '校验报告')), report,
        el('div', { class: 'rv-row', style: 'margin-top:12px' }, loadBtn, loadWhy))));
    s.appendChild(status);

    function fillSample() {
      const m = String((window.DYH_KIT || {}).promptDoc || '').match(/```json\s*\n([\s\S]*?)```/);
      if (!m) { ui.toast('没有找到示例输出', 'err'); return; }
      ta.value = m[1].trim(); R().paste = ta.value; DYH.save(); parsed = null; emptyReport(); sync();
      ui.toast('已填入示例 AI 输出，点“解析”试试');
    }
    function emptyReport(msg) {
      report.innerHTML = '';
      report.appendChild(el('div', { class: 'rv-empty' }, msg || '粘贴 AI 回复后点“解析”，这里会显示条数、格式错误和需要留意的地方。',
        !ta.value.trim() ? el('div', null, linkBtn('手边没有 AI 回复？填入示例', fillSample)) : null));
    }
    function sync() {
      const has = !!ta.value.trim();
      parseBtn.disabled = !has;
      clearBtn.style.display = has ? '' : 'none';
      parseWhy.textContent = has ? '' : '先粘贴 AI 回复';
      const total = parsed ? Object.keys(SECS).reduce((a, k) => a + (Array.isArray(parsed.obj[k]) ? parsed.obj[k].length : 0), 0) : 0;
      loadBtn.disabled = !total;
      loadBtn.textContent = total ? `载入审核队列（${total} 条）` : '载入审核队列';
      loadWhy.textContent = !parsed ? '先点左边的“解析”' : !total ? '解析结果是 0 条，没有可载入的内容' : '';
      // 提示与脉冲
      if (isImp()) H.set(true, `已载入 ${R().imported.items.length} 条导入候选。下一步去「审核工作台」逐条判断。`);
      else H.set(false, ['把 AI 的回复粘贴到左边框里（手边没有就点“填入示例 AI 输出”）', '点“解析”，右边会列出格式错误和需要留意的地方', '点“载入审核队列”，再去「审核工作台」逐条审核']);
      pulseIn(s, isImp() && !parsed ? null : !has ? fillBtn : !parsed ? parseBtn : total ? loadBtn : null);
      renderStatus();
    }
    function renderStatus() {
      status.innerHTML = '';
      if (isImp()) {
        const im = R().imported;
        status.append(el('div', null, el('b', null, '当前审核队列：导入的候选 '), `${im.items.length} 条 · 来源 ${im.code || '未填'} · 页码 ${im.page || '未填'}（没有专家参考答案）`),
          linkBtn('改回示例候选（带专家答案）', () => { R().imported = null; DYH.save(); fire(EVT, me); sync(); ui.toast('已改回示例候选'); }));
      } else status.append(el('div', null, el('b', null, '当前审核队列：示例候选 7 条 '), '（带专家参考答案，故意藏了三个典型错误）'));
    }

    function doParse() {
      parsed = null; report.innerHTML = '';
      const raw = ta.value.trim();
      if (!raw) { emptyReport(); sync(); return; }
      const js = extractJSON(raw);
      if (!js) { report.appendChild(el('div', { class: 'callout err' }, '没有找到 { … } 形式的 JSON。请确认复制了 AI 回复里的 JSON 代码块。')); sync(); return; }
      let obj;
      try { obj = JSON.parse(js); } catch (e) {
        report.appendChild(el('div', { class: 'callout err' }, el('b', null, 'JSON 格式有误，无法解析。'), el('div', { class: 'small' }, '常见原因：少了逗号或引号、用了中文引号“”、回复被截断。错误信息：' + e.message)));
        sync(); return;
      }
      const f = form();
      const issues = validate(obj, { text: f.text, code: f.code, page: f.page, vocab: vocabWords(f.vocab) });
      const errs = issues.filter(x => x.lvl === 'err'), warns = issues.filter(x => x.lvl === 'warn');
      parsed = { obj, issues, text: f.text };
      const cnt = k => Array.isArray(obj[k]) ? obj[k].length : 0;
      report.appendChild(el('div', { class: 'rv-stats' }, Object.keys(SECS).map(k => el('div', { class: 'rv-stat' }, el('b', null, String(cnt(k))), el('span', null, SECS[k] + '候选')))));
      const list = el('div', { class: 'rv-issues' });
      const group = (items, cls, title) => {
        if (!items.length) return;
        list.appendChild(el('div', { class: 'callout ' + cls }, el('b', null, title + `（${items.length}）`),
          el('ul', null, items.map(x => el('li', null, x.id ? el('span', { class: 'mono', style: 'font-weight:600' }, x.id + '  ') : null, x.msg)))));
      };
      if (!errs.length && !warns.length) list.appendChild(el('div', { class: 'callout ok' }, el('b', null, '格式全部通过。'), '格式对不等于内容对，仍要逐条人工审核。'));
      else {
        if (!errs.length) list.appendChild(el('div', { class: 'callout ok' }, el('b', null, '没有格式错误，'), '但下面这些地方审核时要重点看。'));
        group(errs, 'err', '错误：必须改正或让 AI 重新输出');
        group(warns, 'warn', '提醒：审核时重点核对');
      }
      report.appendChild(list);
      sync();
    }

    function loadQueue() {
      if (!parsed) return;
      const errs = parsed.issues.filter(x => x.lvl === 'err').length;
      const go = () => {
        const obj = parsed.obj;
        const items = toCandidates(obj, parsed.issues);
        const r = R();
        r.imported = { code: obj.来源编码 == null ? '' : String(obj.来源编码), page: obj.页码 == null ? '' : String(obj.页码), text: parsed.text, items, at: new Date().toISOString() };
        Object.keys(r.decisions).forEach(k => { if (k.indexOf('imp:') === 0) delete r.decisions[k]; });
        Object.keys(r.edits).forEach(k => { if (k.indexOf('imp:') === 0) delete r.edits[k]; });
        DYH.save(); parsed = null; emptyReport('已载入。要换一批，重新粘贴后再解析。');
        fire(EVT, me); sync();
        ui.toast(`已载入 ${items.length} 条导入候选`, 'ok');
        const wb = document.querySelector('[data-part="review.bench"]'); if (wb) setTimeout(() => scrollTo(wb), 60);
      };
      if (errs) ui.modal('有格式错误，仍要载入吗？', `<p>校验发现 <b>${errs}</b> 处格式错误。正式工作中应当让 AI 重新输出，或退回修正后再导入。</p><p class="muted">练习时可以继续载入，看看这些错误在审核时会是什么样子。</p>`, [{ text: '取消', cls: 'light' }, { text: '仍然载入', cls: 'primary', onClick: go }]);
      else go();
    }
    emptyReport(); sync();
    onEvt(s, EVT, sync, me);
    return s;
  }

  /* ================= 判断规则 ================= */
  function partRules() {
    const s = part('review.rules');
    s.appendChild(head('审核规则：四种结论怎么选', '同一条候选，不同的人要判出同一个结论——靠的是统一的判断顺序和规则。'));
    s.appendChild(el('div', { class: 'rv-sub', style: 'margin-top:20px' }, '判断顺序：每条候选都按这四步看'));
    s.appendChild(el('div', { class: 'steps rv-order' },
      ['引文在不在原文里（逐字）', '类和属性方向对不对', '年代是写明的还是推定的', '价值判断一律待定'].map(t => el('div', { class: 'step' }, t))));
    s.appendChild(el('div', { class: 'rv-sub' }, '四种结论'));
    const R4 = [
      ['通过', '引文对得上原文，类、属性方向、角色都对。', '例：戴村坝 · E24 实体人造物'],
      ['修改后通过', '大体对，但类、角色或挂的事件错了 → 改正，并写修改理由。', '例：白英是“建议”，不是“主持”'],
      ['驳回', '引文找不到、原文没这么说、掉进修饰语陷阱。', '例：把白英的籍贯“汶上”当成坝址'],
      ['待定', '价值判断一律待定；需要查其他资料的，交负责人或判定人。', '例：戴村坝的科学价值']
    ];
    s.appendChild(el('div', { class: 'rv-rgrid' }, R4.map(([d, t, ex]) => el('div', { class: 'rv-rt' }, pill(d), el('p', null, t), el('p', { class: 'ex' }, ex)))));
    s.appendChild(el('div', { class: 'callout info', style: 'margin-top:24px' }, el('b', null, '抽检规则　'),
      '试点期 100% 人工审核；正式期高置信度候选可抽检（建议 30%），中、低置信度和全部价值候选仍 100% 审核；抽检发现同类错误，整批退回重审。'));
    return s;
  }

  /* ================= 第 5 步 · 人工审核工作台 ================= */
  function partBench() {
    const s = part('review.bench');
    const me = uid();
    let pinned = null, filter = 'all';
    const V = {};
    s.appendChild(head('人工审核工作台（流程第 5 步）', '这是整个流程最关键的一步：AI 最常犯“看起来很对”的错，只有懂运河的人逐条对照原文才能拦住。', whoHu('人 · 关键')));
    const H = mkHint(); s.appendChild(H.node);
    const wb = el('div', { class: 'rv-wb' });
    s.appendChild(wb);

    function render() {
      wb.innerHTML = '';
      if (pinned && !findCand(pinned)) pinned = null;
      const info = srcInfo();
      V.src = el('div', { class: 'srctext' });
      V.cap = el('div', { class: 'rv-cap' });
      const left = el('div', { class: 'rv-left' },
        el('div', null,
          el('div', { class: 'rv-srchead' }, el('h3', null, '原文'), el('span', { class: 'rv-chip', title: isImp() ? '导入时第 3 步填写的原文' : D.sample.note }, `${info.code || '未填编码'} · 页码 ${info.page || '—'}`)),
          V.src, V.cap),
        el('div', { class: 'rv-rulebox' }, el('h4', null, '四种结论'),
          el('ul', { class: 'rv-rules' },
            el('li', null, pill('通过'), el('span', null, '引文对得上，类、方向、角色都对')),
            el('li', null, pill('修改后通过'), el('span', null, '大体对，类 / 角色 / 事件有错 → 改正写理由')),
            el('li', null, pill('驳回'), el('span', null, '引文找不到、原文没这么说、籍贯当位置')),
            el('li', null, pill('待定'), el('span', null, '价值一律待定；要查资料的交负责人')))));
      V.qhead = el('div', { class: 'rv-qhead' });
      V.summary = el('div');
      V.list = el('div', { class: 'rv-list' });
      V.list.addEventListener('mouseleave', () => showQuote(findCand(pinned)));
      wb.append(left, el('div', null, V.qhead, V.summary, V.list));
      renderQHead(); renderSummary(); renderList(); showQuote(findCand(pinned)); guide();
    }

    function showQuote(c) {
      const text = srcText();
      V.cap.className = 'rv-cap';
      if (!c) { V.src.textContent = text; V.cap.textContent = '把鼠标移到右边的候选卡片上（点一下可以固定），这里会标出它引用的原文。'; return; }
      const q = c.quote || '';
      const i = q ? text.indexOf(q) : -1;
      if (i < 0) {
        V.src.textContent = text;
        V.cap.className = 'rv-cap bad';
        V.cap.textContent = `${c.id}：引文在原文中找不到「${q || '（空）'}」→ 可能是编造或改写，原则上驳回。`;
      } else {
        V.src.innerHTML = ui.esc(text.slice(0, i)) + '<span class="span hl rv-hl">' + ui.esc(q) + '</span>' + ui.esc(text.slice(i + q.length));
        V.cap.textContent = `黄底是 ${c.id} 的引文（${Array.from(q).length} 字，原文中逐字存在）${pinned === c.id ? ' · 已固定' : ''}`;
      }
    }

    function renderQHead() {
      const h = V.qhead; h.innerHTML = '';
      const { total, done, c } = counts();
      const showExp = !isImp() && R().showExpert;
      V.expBtn = isImp() ? null : el('button', { class: 'btn sm ' + (showExp || done < total ? 'light' : 'primary'), id: 'rv-expert', on: { click: () => {
        R().showExpert = !R().showExpert; DYH.save(); renderQHead(); renderSummary(); renderList(); guide();
        if (R().showExpert) setTimeout(() => scrollTo(V.summary), 40);
      } } }, showExp ? '收起专家答案' : '对照专家参考答案');
      const seg = el('div', { class: 'seg' }, [['all', '全部', total], ['todo', '未审', total - done], ['done', '已审', done]].map(([k, t, n]) =>
        el('button', { class: filter === k ? 'on' : '', 'data-f': k, on: { click: () => { filter = k; renderQHead(); renderList(); guide(); } } }, t, el('span', { class: 'cnt' }, String(n)))));
      h.append(
        el('div', { class: 'rv-qtop' },
          el('div', null, el('h3', null, '审核队列'), el('div', { class: 'sub' }, isImp() ? `导入的候选 · ${total} 条 · 没有专家答案` : `示例候选 · ${total} 条`)),
          el('div', { class: 'exp' }, V.expBtn, !isImp() && !showExp && done < total ? el('span', { class: 'rv-reason', style: 'font-size:12px' }, '建议全部判完再看') : null)),
        el('div', { class: 'rv-prog' },
          el('div', { class: 'pbar' }, el('i', { style: `width:${total ? done / total * 100 : 0}%` + (done === total && total ? ';background:var(--ok)' : '') })),
          el('b', null, done === total && total ? '✓ 全部审完 ' : '已审 ' + done, el('small', null, done === total && total ? '' : ` / ${total}`))),
        el('div', { class: 'rv-tools' }, seg,
          el('div', { class: 'rv-counts' }, ['通过', '修改后通过', '驳回', '待定'].filter(d => c[d]).map(d => el('span', { class: 'rv-pill ' + SUF[d] }, `${d} ${c[d]}`)))));
    }

    function renderList() {
      V.list.innerHTML = '';
      const items = queue().filter(c => filter === 'all' || (filter === 'todo' ? !decOf(c) : !!decOf(c)));
      if (!items.length) V.list.appendChild(el('div', { class: 'rv-empty' },
        filter === 'todo' ? '没有未审的候选了，做得好。' : filter === 'done' ? '还没有审过的候选。' : '队列是空的。',
        el('div', null, filter === 'all' ? linkBtn('改回示例候选', () => { R().imported = null; DYH.save(); fire(EVT, me); render(); })
          : linkBtn(filter === 'todo' ? '看看已审的' : '去审第一条', () => { filter = filter === 'todo' ? 'done' : 'todo'; renderQHead(); renderList(); guide(); }))));
      items.forEach(c => V.list.appendChild(cardEl(c)));
    }

    function cardEl(c) {
      const k = keyOf(c), d = decOf(c), ed = editOf(c);
      const card = el('div', { class: 'rv-card' + (d ? ' is-' + SUF[d] : '') + (pinned === c.id ? ' active' : ''), 'data-id': c.id });
      const quoteOK = inText(c.quote, srcText());
      card.append(...[
        el('div', { class: 'rv-top' },
          el('span', { class: 'rv-id' }, c.id),
          el('span', { class: 'rv-kind' }, el('i', { style: 'background:' + (KIND_COLOR[c.kind] || 'var(--text3)') }), c.kind),
          el('span', { class: 'rv-conf', title: 'AI 自评的置信度，只作参考' }, el('i', { style: 'background:' + (CONF_COLOR[c.conf] || 'var(--err)') }), 'AI 置信度 ' + c.conf),
          c.flags && c.flags.length ? el('span', { class: 'rv-flag', title: c.flags.join('\n') }, '⚠ 校验提醒 ' + c.flags.length) : null,
          pill(d)),
        el('div', { class: 'rv-content' }, c.content),
        el('div', { class: 'rv-quote' + (quoteOK ? '' : ' miss'), title: quoteOK ? '原文引文' : '引文在原文中找不到' }, c.quote || '（没有引文）'),
        c.note ? el('div', { class: 'rv-aside' }, 'AI 说明：' + c.note) : null,
        c.flags && c.flags.length ? el('div', { class: 'rv-aside warn' }, '校验提醒：' + c.flags.join('；')) : null].filter(Boolean));

      card.appendChild(el('div', { class: 'rv-acts' }, BTNS.map(([dv, label, suf]) => el('button', {
        class: 'btn sm' + (d === dv ? ' on-' + suf : ''), 'data-dec': dv, title: d === dv ? '再点一次取消' : '',
        on: { click: e => { e.stopPropagation(); decide(c, dv); } }
      }, (d === dv ? '✓ ' : '') + label))));

      if (d === '修改后通过') {
        const t = el('input', { type: 'text', placeholder: '把内容改成正确的写法', 'data-f': 'text' }); t.value = ed.text == null ? c.content : ed.text;
        const r = el('input', { type: 'text', placeholder: '为什么要改？例：白英是建议者', 'data-f': 'reason' }); r.value = ed.reason || '';
        [t, r].forEach(n => { n.addEventListener('click', e => e.stopPropagation()); n.addEventListener('input', () => saveEdit(c, t.value, r.value)); });
        card.appendChild(el('div', { class: 'rv-extra' }, el('div', { class: 'field' }, el('label', null, '修改后内容'), t), el('div', { class: 'field' }, el('label', null, '修改理由'), r)));
      } else if (d === '驳回' || d === '待定') {
        const r = el('input', { type: 'text', placeholder: d === '驳回' ? '例：汶上是籍贯，不是坝址' : '例：价值须判定人确认', 'data-f': 'reason' }); r.value = ed.reason || '';
        r.addEventListener('click', e => e.stopPropagation()); r.addEventListener('input', () => saveEdit(c, ed.text, r.value));
        card.appendChild(el('div', { class: 'rv-extra one' }, el('div', { class: 'field' }, el('label', null, d === '驳回' ? '驳回理由（可选）' : '待定理由（可选）'), r)));
      }

      if (!isImp() && R().showExpert && c.expect) {
        const ok = d === c.expect;
        const box = el('div', { class: 'rv-expert ' + (!d ? 'none' : ok ? 'ok' : 'bad') },
          el('div', { class: 'hd' }, !d ? `还没审。专家结论：${c.expect}` : ok ? `✓ 判对了：${c.expect}` : `✗ 专家结论是“${c.expect}”，你选了“${d}”`),
          c.fix ? el('div', null, '参考改法：', el('span', { class: 'fx' }, c.fix)) : null,
          c.fix && d === '修改后通过' && ed.text && ed.text !== c.content ? el('div', null, '你的改法：', el('span', { class: 'fx' }, ed.text)) : null,
          el('div', null, c.why));
        box.addEventListener('click', e => e.stopPropagation());
        card.appendChild(box);
      }

      card.addEventListener('mouseenter', () => showQuote(c));
      card.addEventListener('click', () => {
        pinned = pinned === c.id ? null : c.id;
        V.list.querySelectorAll('.rv-card').forEach(n => n.classList.toggle('active', n.getAttribute('data-id') === pinned));
        showQuote(pinned ? c : null);
      });
      return card;
    }

    function saveEdit(c, text, reason) {
      R().edits[keyOf(c)] = { text: text == null ? '' : text, reason: reason || '' };
      DYH.save();
    }

    function decide(c, dv) {
      const r = R(), k = keyOf(c);
      if (r.decisions[k] === dv) delete r.decisions[k];
      else {
        r.decisions[k] = dv;
        if (dv === '修改后通过' && (!r.edits[k] || r.edits[k].text == null || r.edits[k].text === '')) r.edits[k] = { text: c.content, reason: (r.edits[k] || {}).reason || '' };
      }
      DYH.save();
      const old = V.list.querySelector(`.rv-card[data-id="${CSS.escape(c.id)}"]`);
      const neu = cardEl(c);
      if (old) {
        const stillShown = filter === 'all' || (filter === 'todo' ? !decOf(c) : !!decOf(c));
        if (stillShown) old.replaceWith(neu); else old.remove();
      }
      if (dv === '修改后通过' && r.decisions[k]) { const t = neu.querySelector('input[data-f="text"]'); if (t && t.isConnected) { t.focus(); t.select(); } }
      showQuote(c);
      renderQHead(); renderSummary();
      const { total, done } = counts();
      if (total && done === total) {
        const first = !DYH.progress.has(MOD, 'review');
        DYH.progress.mark(MOD, 'review');
        if (first) ui.toast(isImp() ? '全部审完！下一步写入正式表。' : '全部审完！点“对照专家参考答案”看看判得对不对。', 'ok');
      }
      guide();
      fire(EVT, me);
    }

    function renderSummary() {
      const s2 = V.summary; s2.innerHTML = '';
      if (isImp() || !R().showExpert) return;
      const q = D.candidates, right = expertRight(), undone = q.filter(c => !decOf(c)).length;
      s2.appendChild(el('div', { class: 'rv-score', id: 'rv-score' },
        el('div', null, el('div', { class: 'big' }, String(right), el('small', null, ` / ${q.length}`)), el('div', { class: 'cap' }, '与专家结论一致')),
        el('div', null,
          el('h4', null, '三个经典陷阱'),
          el('div', { class: 'rv-traps' }, TRAPS.map(([id, name, desc]) => {
            const c = q.find(x => x.id === id); const d = decOf(c);
            const st = !d ? 'none' : d === c.expect ? 'ok' : 'bad';
            return el('div', null, el('span', { class: 'mk ' + st }, st === 'ok' ? '✓ 识破' : st === 'bad' ? '✗ 漏掉' : '· 未审'), el('span', { class: 't' }, name), el('span', { class: 'd' }, desc));
          })),
          el('div', { class: 'foot' }, undone ? `还有 ${undone} 条没审，先审完再看分数更准。` : right === q.length ? '全部判对，可以上岗了。' : '判错的条目下面有讲解。判错的“通过”会原样写进正式表——下一步就能看到后果。'))));
    }

    function guide() {
      const { total, done } = counts();
      const imp = isImp(), all = total && done === total;
      if (all) H.set(true, imp ? `${total} 条都判完了。下一步：写入正式表。`
        : R().showExpert ? `7 条都判完了，与专家一致 ${expertRight()} 条。下一步：写入正式表，看看判错的后果。`
          : '7 条都判完了。点右上角“对照专家参考答案”，看看判得对不对。');
      else H.set(false, imp
        ? ['把鼠标移到右侧卡片上，左侧原文会高亮它的引文（红字＝原文里找不到）', '对照原文判断，点“通过 / 修改 / 驳回 / 待定”', `${total} 条都判完后，去「写入正式表」`]
        : ['把鼠标移到右侧卡片上，左侧原文会高亮它的引文', '对照原文判断，点“通过 / 修改 / 驳回 / 待定”', '7 条都判完后，点右上角“对照专家参考答案”看看判得对不对']);
      let target = null;
      if (done === 0) target = V.list.querySelector('.rv-card button[data-dec]');
      else if (all && !imp && !R().showExpert) target = V.expBtn;
      pulseIn(s, target);
    }

    render();
    onEvt(s, EVT, render, me);
    return s;
  }

  /* ================= 第 6 步 · 写入正式表 ================= */
  function acceptedList() { return queue().filter(c => accepted(decOf(c))); }
  function matchRow(c, r) {
    const row = c.rec.row;
    if (c.id === 'AI-0004') return r.客体 === 'PER-0008 白英' && String(r.属性 || '').indexOf('P14') === 0;
    switch (c.rec.table) {
      case 'entities': return r.实体编码 === row.实体编码;
      case 'events': return r.事件编码 === row.事件编码;
      case 'values': return r.评估编码 === row.评估编码;
      case 'relations': return r.主体 === row.主体 && r.属性 === row.属性 && r.客体 === row.客体;
    }
    return false;
  }
  /* 写入：从示例表格重新生成；保留“归档命名”里登记的来源（元数据卡） */
  function doWriteData() {
    const prevRecs = DYH.state.records;
    const recs = JSON.parse(JSON.stringify(D.records));
    if (prevRecs && prevRecs.sources) {
      const base = new Set(recs.sources.map(x => String(x.来源编码)));
      prevRecs.sources.forEach(x => { if (x && !base.has(String(x.来源编码)) && (x._from === 'archive' || x._new)) { recs.sources.push(Object.assign({}, x)); base.add(String(x.来源编码)); } });
    }
    const r = R(); let added = 0; const touched = [];
    if (!isImp()) {
      D.candidates.forEach(c => {
        const d = decOf(c), e = editOf(c);
        let pos = -1, table = c.rec ? c.rec.table : null;
        if (c.rec) { pos = recs[table].findIndex(x => matchRow(c, x)); if (pos >= 0) recs[table].splice(pos, 1); }
        if (!accepted(d)) return;
        let row;
        const naive = d === '通过' && (c.expect === '修改后通过' || c.expect === '驳回');
        if (naive || !c.rec) {
          const w = NAIVE[c.id]; if (!w) return;
          if (w.table !== table) pos = -1;
          table = w.table;
          row = Object.assign({}, w.row, { 备注: d === '通过' ? '审核直接通过（AI 原样）' : '修改后通过：' + (e.text || c.content) });
        } else {
          row = Object.assign({}, c.rec.row);
          if (c.kind === '价值') row.备注 = '审核员已通过，仍须判定人确认';
          else if (d === '修改后通过') row.备注 = '修改后通过' + (e.reason ? '：' + e.reason : '');
        }
        row._new = true;
        if (pos >= 0) recs[table].splice(pos, 0, row); else recs[table].push(row);
        added++; touched.push(table);
      });
    } else {
      const im = r.imported;
      const acc = im.items.filter(c => accepted(decOf(c)));
      const codes = new Map(); let ne = 0, nv = 0, na = 0;
      acc.forEach(c => { if (c.sec === 'entities' && c.raw.名称) codes.set(String(c.raw.名称), 'TMP-E-' + pad(++ne)); if (c.sec === 'events' && c.raw.名称) codes.set(String(c.raw.名称), 'TMP-EV-' + pad(++nv)); });
      const ref = n => codes.has(String(n)) ? codes.get(String(n)) + ' ' + n : (n || '');
      const note = c => decOf(c) === '修改后通过' ? '导入候选（修改后通过：' + (editOf(c).text || c.content) + '）' : '导入候选';
      const evRows = {};
      acc.forEach(c => {
        const it = c.raw; let table, row;
        if (c.sec === 'entities') { table = 'entities'; row = { 实体编码: codes.get(String(it.名称)) || 'TMP-E-' + pad(++ne), 名称: it.名称 || '', 类: it.类 || '', 类型词: it.类型 || '', 所在地点: '', 上级要素: '' }; }
        else if (c.sec === 'events') { table = 'events'; row = { 事件编码: codes.get(String(it.名称)) || 'TMP-EV-' + pad(++nv), 事件名称: it.名称 || '', 事件类: it.类 || '', 时间原文: it.时间原文 || '', 起始年: it.起始年 == null ? '' : it.起始年, 结束年: it.结束年 == null ? '' : it.结束年, 朝代: it.朝代 || '', 执行者: '', 角色: '', 对象要素: '', 置信度: it.时间依据 === '推定' ? '推定' : '确定' }; evRows[it.名称] = row; }
        else if (c.sec === 'relations') { table = 'relations'; row = { 主体: ref(it.主体名称), 属性: (it.属性 || '') + (it.角色 ? '（' + it.角色 + '）' : ''), 客体: ref(it.客体名称), 置信度: it.置信度 === '高' ? '确定' : it.置信度 === '中' ? '推定' : '存疑' }; }
        else { table = 'values'; row = { 评估编码: 'TMP-VA-' + pad(++na), 要素: ref(it.对象名称), 价值一级: it.价值类别 || '', 价值二级: it.价值子项 || '', 世遗标准: '', 依据: im.code || '', 判定人: '[判定人]', 状态: '待审' }; }
        row.备注 = note(c); row._new = true;
        recs[table].push(row); added++; touched.push(table);
      });
      /* 关系里的 P14 / P31 / P108 顺手补进事件行 */
      acc.filter(c => c.sec === 'relations').forEach(c => {
        const it = c.raw, ev = evRows[it.主体名称]; if (!ev) return;
        const p = String(it.属性 || '');
        if (p.indexOf('P14') === 0 && !ev.执行者) { ev.执行者 = ref(it.客体名称); ev.角色 = it.角色 || ''; }
        if ((p.indexOf('P31') === 0 || p.indexOf('P108') === 0) && !ev.对象要素) ev.对象要素 = ref(it.客体名称);
      });
    }
    DYH.state.records = recs;
    r.writeSig = sig();
    DYH.save();
    return { added, touched };
  }

  function partWrite() {
    const s = part('review.write');
    const me = uid();
    let tab = 'entities';
    s.appendChild(head('写入正式表（流程第 6 步）', '只有“通过”和“修改后通过”的候选才进五张表，驳回和待定的留在审核表里。你判错的，表里也会错——后果马上看得见。', whoHu()));
    const H = mkHint(); s.appendChild(H.node);
    const info = el('div'), prev = el('div');
    s.append(info, prev);

    function renderInfo() {
      info.innerHTML = '';
      const acc = acceptedList(), { total, done } = counts();
      const { written, stale } = writtenState();
      const by = k => acc.filter(c => c.kind === k).length;
      const vals = acc.filter(c => c.kind === '价值');
      info.appendChild(el('div', { class: 'rv-plan' },
        el('span', null, '将写入'),
        ['实体', '事件', '关系', '价值'].map(k => el('span', { class: 'ch' }, el('i', { style: 'background:' + KIND_COLOR[k] }), k, el('b', null, String(by(k))))),
        el('span', { style: 'margin-left:6px' }, `不写入 ${total - acc.length} 条（驳回 / 待定 / 未审）`)));
      if (vals.length) info.appendChild(el('div', { class: 'callout warn', style: 'margin-bottom:16px' }, el('b', null, `你通过了 ${vals.length} 条价值候选。`), '写入后状态仍是“待审”，判定人确认前不能当结论用。审核员遇到价值候选，一般选“待定”。'));
      const btn = el('button', { class: 'btn primary', id: 'rv-write', disabled: done === 0, on: { click: doWrite } }, `写入正式表（${acc.length} 条）`);
      const rst = el('button', { class: 'btn light', disabled: !DYH.state.records, on: { click: () => { DYH.state.records = null; R().writeSig = null; DYH.save(); fire(REC, me); renderInfo(); renderPreview(); ui.toast('已恢复示例表格'); } } }, '恢复示例表格');
      const why = done === 0 ? '先在「审核工作台」审核至少一条，才能写入'
        : done < total ? `还有 ${total - done} 条未审——未审的不会写入`
          : stale ? '审核结论改过了，请重新写入一次'
            : written ? '再次写入会覆盖上次的结果'
              : isImp() ? '导入的候选追加到表末尾，先用临时编码 TMP-…' : '';
      info.appendChild(el('div', { class: 'rv-row' }, btn, rst, why ? reason(why) : null));
      // 提示与脉冲
      if (written && !stale) {
        const n = Object.values(DYH.state.records).reduce((a, rows) => a + (rows || []).filter(x => x && x._new && x._from !== 'archive').length, 0);
        H.set(true, `已写入 ${n} 条。浅蓝色行是你写入的，红字是判错后按 AI 原样写进来的内容。下一步：汇总导出。`);
      } else H.set(false, [done === 0 ? '先去「审核工作台」把候选判完（至少判一条）' : stale ? '审核结论改过了，需要重新写入' : '审核结论已就绪（' + done + ' / ' + total + '）', '点“写入正式表”', '看下方表格：浅蓝色行就是刚写入的——判错的也会照原样写进去']);
      pulseIn(s, done === total && total && (!written || stale) ? btn : null);
    }

    function doWrite() {
      const { added, touched } = doWriteData();
      DYH.progress.mark(MOD, 'write');
      tab = touched[0] || 'entities';
      renderInfo(); renderPreview();
      fire(REC, me);
      ui.toast(`已写入 ${added} 条到正式表`, 'ok');
      setTimeout(() => scrollTo(prev), 60);
    }

    function renderPreview() {
      prev.innerHTML = '';
      const recs = ui.records();
      const written = !!DYH.state.records;
      const seg = el('div', { class: 'seg' }, Object.keys(D.tableNames).map(k => {
        const rows = recs[k] || [], nn = rows.filter(x => x._new).length;
        return el('button', { class: tab === k ? 'on' : '', 'data-tab': k, on: { click: () => { tab = k; renderPreview(); } } },
          D.tableNames[k], el('span', { class: 'cnt' }, String(rows.length)), nn ? el('span', { class: 'plus' }, '+' + nn) : null);
      }));
      prev.appendChild(el('div', { class: 'rv-tblhead' }, seg,
        written ? el('span', { class: 'rv-legend' }, el('i'), '你写入后的表格 · 浅蓝色行是新写入的') : el('span', { class: 'rv-legend' }, '当前显示：示例表格（还没有写入）')));
      const rows = recs[tab] || [];
      const cs = cols(rows);
      if (!rows.length) { prev.appendChild(el('div', { class: 'rv-empty' }, '这张表是空的。', el('div', null, linkBtn('看实体表', () => { tab = 'entities'; renderPreview(); })))); return; }
      prev.appendChild(el('div', { class: 'tablewrap' }, el('table', { class: 'tbl' },
        el('thead', null, el('tr', null, cs.map(c => el('th', null, c)))),
        el('tbody', null, rows.map(r => el('tr', { class: r._new ? 'rv-new' : '' }, cs.map(c => {
          const v = r[c] == null ? '' : String(r[c]);
          const cls = /AI 原样|须判定人/.test(v) ? 'rv-bad' : /编码$/.test(c) ? 'code' : '';
          return el('td', { class: cls || null }, v);
        })))))));
    }

    renderInfo(); renderPreview();
    onEvt(s, EVT, renderInfo, me);
    onEvt(s, REC, () => { renderInfo(); renderPreview(); }, me);
    return s;
  }

  /* ================= 第 7 步 · 汇总导出 ================= */
  function partExport() {
    const s = part('review.export');
    const me = uid();
    s.appendChild(head('汇总导出（流程第 7 步）', '审核表记录“谁、凭什么这样判”，五张表是成果母本——两样都要交，出了问题才能顺着审核表追回去。', whoHu('人＋技术方')));
    const H = mkHint(); s.appendChild(H.node);
    const status = el('div', { class: 'rv-status', style: 'margin:0 0 20px' });
    s.appendChild(status);
    const mark = () => { DYH.progress.mark(MOD, 'export'); guide(); };
    const reviewRows = () => { const sI = srcInfo(); return queue().map(c => { const d = decOf(c), e = editOf(c); return { 候选编号: c.id, 记录类型: c.kind, AI抽取内容: c.content, 原文引文: c.quote, 来源编码: sI.code, 页码: sI.page, AI置信度: c.conf, 审核结论: d || '未审', 修改后内容: d === '修改后通过' ? (e.text || '') : '', 理由: d ? (e.reason || '') : '' }; }); };
    const reviewCSV = () => {
      ui.download('课题一_AI审核表_' + today() + '_V01.csv', ui.csv(reviewRows(), ['候选编号', '记录类型', 'AI抽取内容', '原文引文', '来源编码', '页码', 'AI置信度', '审核结论', '修改后内容', '理由']), 'text/csv');
      mark();
    };
    const tableCSV = k => { const rows = ui.records()[k] || []; ui.download('课题一_' + D.tableNames[k] + '_' + today() + '_V01.csv', ui.csv(cleanRows(rows), cols(rows)), 'text/csv'); mark(); };
    const allJSON = () => {
      const recs = ui.records();
      const out = { 说明: '大运河课题一 · 学习站导出（示意数据）', 导出日期: today(), 审核队列: isImp() ? '导入候选' : '示例候选', 审核表: reviewRows(), 五张表: {} };
      Object.keys(D.tableNames).forEach(k => { out.五张表[D.tableNames[k]] = cleanRows(recs[k] || []); });
      ui.download('课题一_数据集_' + today() + '_V01.json', JSON.stringify(out, null, 2), 'application/json');
      mark();
    };
    const main = el('button', { class: 'btn primary', id: 'rv-dl-review', on: { click: reviewCSV } }, '下载 AI 审核表.csv');
    s.appendChild(el('div', { class: 'rv-exports' },
      el('div', { class: 'rv-exp' }, el('h4', null, 'AI 审核表'), el('p', null, '每条候选的审核结论、修改后内容和理由。'), el('div', null, main)),
      el('div', { class: 'rv-exp' }, el('h4', null, '五张表（每张一个 CSV）'), el('p', null, `文件名按规则，例：课题一_实体表_${today()}_V01.csv`),
        el('div', { class: 'rv-row' }, Object.keys(D.tableNames).map(k => el('button', { class: 'btn light sm', 'data-tbl': k, on: { click: () => tableCSV(k) } }, D.tableNames[k])))),
      el('div', { class: 'rv-exp' }, el('h4', null, '全部 JSON'), el('p', null, '审核表＋五张表打包成一个文件，交给技术方。'), el('div', null, el('button', { class: 'btn light', on: { click: allJSON } }, '下载全部 JSON')))));
    s.appendChild(el('p', { class: 'rv-note' }, 'CSV 带 UTF-8 标记，Excel 直接打开不会乱码。「成果」一节会用你写入的表格生成要素档案、图谱和 RDF。'));

    function guide() {
      const { total, done } = counts(); const { written } = writtenState();
      status.innerHTML = '';
      status.append(el('div', null, el('b', null, '将导出：'), `${isImp() ? '导入候选' : '示例候选'} ${total} 条，已审 ${done} 条 · ${written ? '五张表为你写入后的版本' : '五张表还是示例数据（还没写入）'}`));
      if (DYH.progress.has(MOD, 'export')) H.set(true, '文件已下载到浏览器的“下载”文件夹。审核表和五张表一起交给负责人。');
      else H.set(false, ['点“下载 AI 审核表.csv”——每条候选的结论和理由都在里面', '需要的话再下载五张表的 CSV，或打包成一个 JSON', '文件会出现在浏览器的“下载”文件夹，Excel 可直接打开']);
      pulseIn(s, DYH.progress.has(MOD, 'export') ? null : main);
    }
    guide();
    onEvt(s, EVT, guide, me);
    onEvt(s, REC, guide, me);
    return s;
  }

  /* ---------- 注册部件 ---------- */
  DYH.parts = DYH.parts || {};
  DYH.parts['review.flow'] = () => partFlow();
  DYH.parts['review.prompt'] = () => partPrompt();
  DYH.parts['review.import'] = () => partImport();
  DYH.parts['review.rules'] = () => partRules();
  DYH.parts['review.bench'] = () => partBench();
  DYH.parts['review.write'] = () => partWrite();
  DYH.parts['review.export'] = () => partExport();

  DYH.modules = DYH.modules || {};
  DYH.modules.review = {
    title: 'AI 抽取 · 人工审核',
    steps: ['prompt', 'review', 'write', 'export'],
    next: 'results',
    parts: ['review.flow', 'review.prompt', 'review.import', 'review.rules', 'review.bench', 'review.write', 'review.export'],
    mount(box) {
      injectCSS(); R();
      box.appendChild(ui.pageHead('第 4 节 · 人机协同', 'AI 抽取 · 人工审核', 'AI 先把原文里的实体、事件、关系和价值抽成候选，人逐条把关。没过人工审核的数据，一律不进正式表。'));
      this.parts.forEach(n => box.appendChild(ui.part(n)));
    }
  };
})();
