/* 第 3 节 · 归档与命名：一物一码，以码相连（部件化）
   部件：archive.principle / archive.folders / archive.code / archive.name / archive.sort / archive.card */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el;
  const MOD = 'archive';
  const CODE_EVT = 'dyh:archive-code';    // 编码生成器 → 文件名构造器
  const REC = 'dyh:records-changed';       // 来源表新增一行

  const STYLE = `
.ar-part{padding:40px 0}
.ar-head h2{margin:0 0 6px}
.ar-why{color:var(--text2);font-size:17px;margin:0;max-width:820px;text-wrap:pretty}
.ar-hint{margin:16px 0 24px}
.ar-hint .hintbar{margin:0}
.ar-part .btn.pulse{border-radius:980px}
.ar-part select.pulse,.ar-part input.pulse{border-radius:10px;border-color:var(--accent)}
.ar-part .ar-fd.pulse{border-radius:10px}
.ar-link{border:0;background:none;color:var(--accent);font:inherit;font-size:15px;font-weight:500;cursor:pointer;padding:0}
.ar-link::after{content:" ›"}
.ar-link:hover{text-decoration:underline}
.ar-reason{font-size:14px;color:var(--text2)}
.ar-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.ar-card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:22px;padding:24px 26px;box-shadow:0 1px 2px rgba(0,0,0,.03),0 8px 28px rgba(0,0,0,.05)}
.ar-card h3{margin:0 0 4px;font-size:19px}
.ar-card .sub{font-size:14px;color:var(--text2);margin:0 0 16px}
/* 16 字 */
.ar-prgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
@media (max-width:1100px){.ar-prgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.ar-pr{background:var(--bg2);border-radius:22px;padding:24px 22px 22px;position:relative;display:flex;flex-direction:column}
.ar-pr .ix{font-size:13px;font-weight:600;color:var(--text3)}
.ar-pr .big{font-size:26px;font-weight:700;color:var(--text);letter-spacing:.06em;margin:6px 0 8px}
.ar-pr p{font-size:14px;color:var(--text2);margin:0 0 14px;flex:1}
.ar-pr .ex{font-size:13px;background:#fff;border-radius:12px;padding:10px 12px;color:var(--text);line-height:1.5}
.ar-pr .ex span{color:var(--text3);display:block;font-size:12px}
.ar-pr .ex code{font-size:12px;word-break:break-all}
.ar-got{display:flex;align-items:center;gap:20px;margin-top:20px;padding:20px 24px;border-radius:20px;background:var(--accent-soft);color:#00458C;font-size:15px}
.ar-got > div{flex:1;min-width:240px}
.ar-got b{display:block;font-size:17px;color:var(--text);margin-bottom:2px}
/* 目录树 */
.ar-tree{background:var(--bg2);border-radius:20px;padding:12px;font-size:14px}
.ar-tree .root{display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text);padding:6px 10px 8px;font-family:var(--mono);font-size:13px}
.ar-fd{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:transparent;border:0;border-radius:10px;padding:8px 12px 8px 24px;cursor:pointer;font-family:var(--mono);font-size:13.5px;color:var(--text);transition:background .15s}
.ar-fd:hover{background:rgba(0,0,0,.04)}
.ar-fd.on{background:var(--accent);color:#fff}
.ar-fd .rule{margin-left:auto;font-family:var(--sans);font-size:12px;color:var(--text3)}
.ar-fd.on .rule{color:rgba(255,255,255,.8)}
.ar-fd.seen:not(.on) .nm::after{content:" ✓";color:var(--ok);font-family:var(--sans);font-size:12px}
.ar-subs{margin:4px 0 8px 58px;font-family:var(--mono);font-size:12.5px;color:var(--text2)}
.ar-subs div{padding:3px 0;display:flex;align-items:center;gap:8px}
.ar-fdetail .eyebrow{color:var(--text3);font-size:12px;margin:18px 0 6px}
.ar-fdetail .eyebrow:first-child{margin-top:0}
.ar-fdetail h3{font-family:var(--mono);font-size:21px;margin:0 0 6px}
.ar-fdetail p{margin:0}
.ar-rule{display:inline-flex;align-items:center;background:var(--accent-soft);color:var(--accent);border-radius:980px;padding:4px 14px;font-weight:600;font-size:14px;margin:0 0 8px}
.ar-path{font-family:var(--mono);font-size:13px;background:var(--bg2);border-radius:12px;padding:10px 14px;color:var(--text);word-break:break-all}
/* 编码 */
.ar-gen{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.ar-code{display:flex;flex-wrap:wrap;align-items:flex-start;gap:6px;margin:28px 0 8px;font-family:var(--mono)}
.ar-seg{display:flex;flex-direction:column;align-items:center;min-width:96px}
.ar-seg .v{font-size:30px;font-weight:600;padding:8px 18px;border-radius:14px;line-height:1.2}
.ar-seg .k{font-family:var(--sans);font-size:13px;color:var(--text);font-weight:600;margin-top:10px}
.ar-seg .d{font-family:var(--sans);font-size:12px;color:var(--text2);text-align:center;max-width:150px;line-height:1.45}
.ar-dash{font-size:30px;font-weight:600;color:var(--text3);padding:8px 2px;line-height:1.2}
.ar-out{font-family:var(--mono);font-size:17px;background:#1D1D1F;color:#F5F5F7;border-radius:14px;padding:12px 18px;word-break:break-all;flex:1;min-width:0}
.ar-out.mini{font-size:15px;padding:10px 16px}
.ar-tbl td.code{white-space:nowrap}
/* 文件名 */
.ar-fmt{background:var(--bg2);border-radius:16px;padding:14px 18px;margin-bottom:20px;font-size:15px;color:var(--text2)}
.ar-fmt code{font-weight:600;color:var(--text);font-size:15px;margin:0 6px}
.ar-checks{list-style:none;margin:16px 0 0;padding:0}
.ar-checks li{display:flex;gap:12px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--bg3);font-size:14px}
.ar-checks li:first-child{border-top:0}
.ar-checks .ic{width:20px;height:20px;flex:none;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:11px;color:#fff;margin-top:2px}
.ar-checks .ic.y{background:#34C759} .ar-checks .ic.n{background:var(--err)}
.ar-checks .h{display:block;color:var(--err);font-size:13px}
.ar-verdict{margin-top:12px}
.ar-samples{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;align-items:center}
.ar-samples .btn{font-family:var(--mono);font-size:12px}
.ar-msg{font-size:13px;margin-top:4px}
.ar-msg:empty{display:none}
.ar-msg.err{color:var(--err)} .ar-msg.warn{color:var(--warn)} .ar-msg.ok{color:var(--ok)}
/* 归档练习 */
.ar-sorts{display:grid;gap:8px}
.ar-sort{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:6px 16px;align-items:center;padding:12px 16px;border-radius:16px;background:var(--bg2);transition:background .2s}
.ar-sort .fn{font-family:var(--mono);font-size:13.5px;color:var(--text);word-break:break-all;display:flex;gap:10px;align-items:center}
.ar-sort .fn svg{flex:none}
.ar-sort select{background:#fff}
.ar-sort .ex{grid-column:1 / -1;font-size:13px}
.ar-sort .ex:empty{display:none}
.ar-sort.right{background:var(--ok-soft)}
.ar-sort.wrong{background:var(--err-soft)}
.ar-sort.right .ex{color:var(--ok)} .ar-sort.wrong .ex{color:var(--err)}
.ar-score{font-weight:600;color:var(--text)}
/* 元数据卡 */
.ar-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 20px}
.ar-form .full{grid-column:1 / -1}
.ar-form .field label{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ar-form .req{color:var(--err)}
.mtag{font-family:var(--mono);font-size:11px;font-weight:400;color:var(--text3);background:var(--bg2);border-radius:6px;padding:0 6px;line-height:1.7}
.ar-auto{font-size:12px;color:var(--accent);cursor:pointer;margin-left:auto;font-weight:500}
.ar-prev td{white-space:nowrap}
.tbl tr.ar-new td{background:var(--accent-soft)}
@media (max-width:900px){.ar-form,.ar-gen{grid-template-columns:1fr}.ar-sort{grid-template-columns:1fr}}
`;
  function injectCss() { if (!document.getElementById('mod-archive-css')) document.head.appendChild(el('style', { id: 'mod-archive-css' }, STYLE)); }

  const today = () => { const d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const pad4 = n => String(Math.max(1, Math.min(9999, parseInt(n, 10) || 1))).padStart(4, '0');
  const ENTITY_CODE = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
  const folderIcon = (c) => ui.html(`<svg width="18" height="15" viewBox="0 0 18 15" aria-hidden="true"><path d="M1 2.5 C1 1.7 1.6 1 2.4 1 H6.6 L8.2 2.8 H15.6 C16.4 2.8 17 3.5 17 4.3 V12.6 C17 13.4 16.4 14 15.6 14 H2.4 C1.6 14 1 13.4 1 12.6Z" fill="${c || '#5AB0F5'}"/></svg>`);
  const fileIcon = () => ui.html(`<svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1 H7.5 L11 4.5 V13 H1Z" fill="#fff" stroke="#86868B"/></svg>`);

  /* ---------- 部件公共件 ---------- */
  function part(name, title, why, id) {
    injectCss();
    return el('div', { class: 'section ar-part', 'data-part': name, id: id || null },
      el('div', { class: 'ar-head' }, el('h2', null, title), el('p', { class: 'ar-why' }, '为什么：' + why)));
  }
  function mkHint() {
    const wrap = el('div', { class: 'ar-hint' }); let key = '';
    return { node: wrap, set(done, content) {
      const k = (done ? 1 : 0) + JSON.stringify(content); if (k === key) return; key = k;
      wrap.innerHTML = '';
      wrap.appendChild(done ? ui.hint('已完成：' + content, { done: true }) : ui.hint(content, { title: '怎么做' }));
    } };
  }
  function pulseIn(root, node) { root.querySelectorAll('.pulse').forEach(n => n.classList.remove('pulse')); if (node && !node.disabled) ui.pulse(node); }
  function onEvt(node, name, fn) {
    const h = e => { if (!node.isConnected) { document.removeEventListener(name, h); return; } fn(e); };
    document.addEventListener(name, h);
  }
  const linkBtn = (text, fn) => el('button', { class: 'ar-link', on: { click: fn } }, text);
  const reason = t => el('span', { class: 'ar-reason' }, t);
  const opt = (list, v) => list.map(([c, n]) => { const o = el('option', { value: c }, c + ' · ' + n); if (c === v) o.selected = true; return o; });

  /* =========== 1. 16 字原则 =========== */
  function partPrinciple() {
    const s = part('archive.principle', '16 字原则', '所有命名和归档规则都从这 16 个字推出来；记住它们，遇到没见过的情况也能自己判断。', 'ar-principle');
    const H = mkHint(); s.appendChild(H.node);
    const P = [
      ['一物一码', '每个要素、事件、人物、来源都有唯一编码，一辈子不变、不复用。', ['戴村坝', 'DYH-HTH-ZB-0012']],
      ['一源一档', '每份来源资料一个文件夹、来源表里一行，原件和元数据放在一起。', ['《中国运河志》条目', '01_志_文献库/SRC-ZS-0035/']],
      ['三库分立', '志（文献）、图（图像）、数（数据）分库存放，各管各的格式。', ['测绘图', '02_图_图像库/测绘图/']],
      ['以码相连', '文件名、表格、图谱都写编码；三个库靠编码连起来，而不是靠文件夹。', ['测绘图文件名', 'DYH-HTH-ZB-0012_戴村坝平面测绘图_…']]
    ];
    s.appendChild(el('div', { class: 'ar-prgrid' }, P.map(([t, d, ex], i) => el('div', { class: 'ar-pr' },
      el('span', { class: 'ix' }, '0' + (i + 1)), el('div', { class: 'big' }, t), el('p', null, d),
      el('div', { class: 'ex' }, el('span', null, '例：' + ex[0]), el('code', null, ex[1]))))));
    const btn = el('button', { class: 'btn primary', id: 'ar-got', on: { click: () => { DYH.progress.mark(MOD, 'principle'); ui.toast('好！接下来看文件夹怎么摆。', 'ok'); sync(); } } });
    s.appendChild(el('div', { class: 'ar-got' },
      el('div', null, el('b', null, '文件夹只解决“放在哪”，编码才解决“和谁有关”。'),
        '同一座戴村坝，志书在 01 库、测绘图在 02 库、数据在 03 库——是编码 DYH-HTH-ZB-0012 把它们连在一起。'), btn));
    function sync() {
      const done = DYH.progress.has(MOD, 'principle');
      btn.textContent = done ? '✓ 已理解' : '我理解了';
      btn.className = 'btn ' + (done ? 'light' : 'primary');
      if (done) H.set(true, '记住了 16 字原则。下一步：看看 8 个一级文件夹怎么摆。');
      else H.set(false, ['读一读下面四张卡：每张一条原则，配一个运河例子', '读完点最下面的“我理解了”']);
      pulseIn(s, done ? null : btn);
    }
    sync();
    return s;
  }

  /* =========== 2. 目录结构 =========== */
  const RULES = {
    '00_规范与词表': ['按版本号', '规范、词表、编码表会反复修订：同一个文件只顺延版本号，不另起新名。', ['课题一_Schema与标注规范_V02.docx', '课题一_词表_V02.xlsx', '课题一_编码表_V01.xlsx', '表格模板/']],
    '01_志_文献库': ['按来源编码', '一源一档：每份文献一个文件夹，文件夹名就是来源编码。', ['SRC-ZS-0035/', 'SRC-ZS-0036/', 'SRC-DA-0002/']],
    '02_图_图像库': ['按资料类型 → 来源编码', '图像数量多、格式杂：先按类型分（测绘图 / 舆图 / 照片），再一源一档。', ['测绘图/SRC-CH-0004/', '舆图/SRC-YT-0008/', '照片/SRC-ZP-0021/']],
    '03_数_数据库': ['按表名', '五张表各一个文件夹；GIS 图层和导出数据另放。', ['实体表/', '事件表/', '关系表/', '价值表/', '来源表/', 'GIS图层/', '导出/']],
    '04_考古成果': ['按来源编码', '发掘报告、简报也是“来源”，同样一源一档。', ['SRC-KG-0003/', 'SRC-KG-0004/']],
    '05_文物数据': ['按来源编码', '文物登记表、构件照片按登记来源分档。', ['SRC-WW-0011/', 'SRC-WW-0012/']],
    '06_过程文件': ['按月份', '纪要、校核记录、周报按时间找最方便。', ['202610/', '202611/', '202612/']],
    '99_归档备份': ['按日期', '每到阶段节点整体打包一份，按打包日期命名；只读，不在里面改。', ['20261130_阶段成果/', '20261231_年度成果/']]
  };
  function partFolders() {
    const s = part('archive.folders', '目录结构：8 个一级文件夹', '全组用同一套文件夹，任何人都能在同一个位置找到同一类东西；二级文件夹各有一条固定规则。', 'ar-folders');
    const H = mkHint(); s.appendChild(H.node);
    let cur = D.folders[1].name;
    const seen = new Set([cur]);
    const tree = el('div', { class: 'ar-tree', role: 'tree' });
    const detail = el('div', { class: 'ar-card ar-fdetail' });
    const draw = () => {
      tree.innerHTML = '';
      tree.appendChild(el('div', { class: 'root' }, folderIcon('#1D1D1F'), '大运河课题一/'));
      D.folders.forEach(f => {
        const on = f.name === cur; const r = RULES[f.name] || ['—', '', []];
        tree.appendChild(el('button', { class: 'ar-fd' + (on ? ' on' : '') + (seen.has(f.name) ? ' seen' : ''), 'data-f': f.name, role: 'treeitem', 'aria-expanded': on ? 'true' : 'false', on: { click: () => { cur = f.name; seen.add(cur); draw(); } } },
          folderIcon(on ? '#fff' : null), el('span', { class: 'nm' }, f.name + '/'), el('span', { class: 'rule' }, r[0])));
        if (on) tree.appendChild(el('div', { class: 'ar-subs' }, r[2].map(x => el('div', null, /\/$/.test(x) ? folderIcon('#A7D3F8') : fileIcon(), x))));
      });
      const f = D.folders.find(x => x.name === cur); const r = RULES[cur] || ['—', '', []];
      detail.innerHTML = '';
      detail.append(...[el('span', { class: 'eyebrow' }, '这里放什么'), el('h3', null, f.name + '/'), el('p', null, f.what),
        el('span', { class: 'eyebrow' }, '二级文件夹规则'), el('div', { class: 'ar-rule' }, r[0]), el('p', { class: 'small muted' }, r[1]),
        el('span', { class: 'eyebrow' }, '完整路径示例'), el('div', { class: 'ar-path' }, f.name + '/' + r[2][0]),
        cur === '99_归档备份' ? el('div', { class: 'callout warn small', style: 'margin-top:14px' }, '99 文件夹只读：打包后谁都不要再改里面的文件。') : null].filter(Boolean));
      const done = seen.size >= 3;
      if (done) H.set(true, `看过 ${seen.size} 个文件夹了。每个一级文件夹下，二级文件夹都按一条固定规则来分。`);
      else H.set(false, ['点左边任意一个文件夹（打 ✓ 的是看过的）', '右边会说明这里放什么、二级文件夹按什么规则分', `至少看 3 个，建议看看 02 和 99（已看 ${seen.size} 个）`]);
      pulseIn(s, seen.size === 1 ? tree.querySelector('.ar-fd[data-f="02_图_图像库"]') : null);
    };
    draw();
    s.appendChild(el('div', { class: 'split' }, tree, detail));
    return s;
  }

  /* =========== 3. 编码生成器 =========== */
  function partCode() {
    const s = part('archive.code', '编码生成器', '编码是每个东西的“身份证号”：看到编码就知道它在哪条河段、是什么类型，而且全课题不会重复。', 'ar-code');
    const H = mkHint(); s.appendChild(H.node);
    const river = el('select', { id: 'gen-river' }, opt(D.codes.river, 'HTH'));
    const type = el('select', { id: 'gen-type' }, opt(D.codes.type, 'ZB'));
    const num = el('input', { type: 'number', id: 'gen-num', min: 1, max: 9999, value: 12 });
    const out = el('div', { class: 'ar-out', id: 'gen-out' });
    const segs = el('div', { class: 'ar-code' });
    const seg = (v, k, d, c, bg) => el('div', { class: 'ar-seg' }, el('span', { class: 'v', style: `background:${bg};color:${c}` }, v), el('span', { class: 'k' }, k), el('span', { class: 'd' }, d));
    const useBtn = el('button', { class: 'btn light', id: 'gen-use', on: { click: () => {
      DYH.state.archiveCode = out.textContent; DYH.save();
      document.dispatchEvent(new CustomEvent(CODE_EVT, { detail: { code: out.textContent, force: true } }));
      DYH.progress.mark(MOD, 'code'); sync();
      const nm = document.querySelector('[data-part="archive.name"]');
      if (nm) nm.scrollIntoView({ behavior: 'smooth' }); else ui.toast('已记下 ' + out.textContent + '：下一步「文件名」会自动带上它', 'ok');
    } } }, '用它来命名文件 ↓');
    const upd = (user) => {
      const n = pad4(num.value); const rv = D.codes.river.find(x => x[0] === river.value), tp = D.codes.type.find(x => x[0] === type.value);
      const code = `DYH-${river.value}-${type.value}-${n}`;
      out.textContent = code;
      segs.innerHTML = '';
      segs.append(seg('DYH', '项目码', '大运河，全课题固定', '#fff', '#1D1D1F'), el('span', { class: 'ar-dash' }, '-'),
        seg(river.value, '河段码', rv ? rv[1] : '', 'var(--c-place)', 'var(--c-place-soft)'), el('span', { class: 'ar-dash' }, '-'),
        seg(type.value, '类型码', tp ? tp[1] : '', 'var(--c-thing)', 'var(--c-thing-soft)'), el('span', { class: 'ar-dash' }, '-'),
        seg(n, '流水号', `第 ${parseInt(n, 10)} 个，固定 4 位，不足补 0`, 'var(--c-value)', 'var(--c-value-soft)'));
      if (user) {
        DYH.state.archiveCode = code; DYH.save();
        document.dispatchEvent(new CustomEvent(CODE_EVT, { detail: { code } }));
        DYH.progress.mark(MOD, 'code'); sync();
      }
    };
    [river, type, num].forEach(x => { x.addEventListener('change', () => upd(true)); x.addEventListener('input', () => upd(true)); });
    // 来源编码
    const sType = el('select', { id: 'gen-src-type' }, opt(D.codes.source, 'CH'));
    const sNum = el('input', { type: 'number', id: 'gen-src-num', min: 1, max: 9999, value: 4 });
    const sOut = el('div', { class: 'ar-out mini', id: 'gen-src-out' });
    const sPath = el('div', { class: 'ar-path', id: 'gen-src-path', style: 'margin-top:12px' });
    const sUpd = (user) => {
      const c = `SRC-${sType.value}-${pad4(sNum.value)}`; sOut.textContent = c;
      const t = (D.codes.source.find(x => x[0] === sType.value) || ['', ''])[1];
      sPath.textContent = '它的文件夹：' + pathFor(t, c);
      if (user) { DYH.progress.mark(MOD, 'code'); sync(); }
    };
    [sType, sNum].forEach(x => { x.addEventListener('change', () => sUpd(true)); x.addEventListener('input', () => sUpd(true)); });

    s.appendChild(el('div', { class: 'ar-card' },
      el('h3', null, '要素编码'), el('p', { class: 'sub' }, '格式：DYH-{河段}-{类型}-{4 位流水号}'),
      el('div', { class: 'ar-gen' },
        el('div', { class: 'field' }, el('label', { for: 'gen-river' }, '河段码'), river),
        el('div', { class: 'field' }, el('label', { for: 'gen-type' }, '类型码'), type),
        el('div', { class: 'field' }, el('label', { for: 'gen-num' }, '流水号（1–9999）'), num)),
      segs,
      el('div', { class: 'ar-row', style: 'gap:10px;margin-top:20px' }, out,
        el('button', { class: 'btn light', on: { click: () => ui.copy(out.textContent) } }, '复制'), useBtn)));
    const EX = { 'EV-': 'EV-0101', 'PER-': 'PER-0007', 'ORG-': 'ORG-0003', 'PL-': 'PL-0032', 'SRC-': 'SRC-ZS-0035', 'T-': 'T-SG-020', 'VA-': 'VA-0001', 'NAT-': 'NAT-0001' };
    s.appendChild(el('div', { class: 'grid2', style: 'margin-top:20px;align-items:start' },
      el('div', { class: 'ar-card' }, el('h3', null, '来源编码'), el('p', { class: 'sub' }, 'SRC-{资料类型}-{4 位}；它同时是这份资料的文件夹名。'),
        el('div', { class: 'grid2', style: 'gap:12px' }, el('div', { class: 'field' }, el('label', { for: 'gen-src-type' }, '资料类型码'), sType),
          el('div', { class: 'field' }, el('label', { for: 'gen-src-num' }, '流水号'), sNum)),
        el('div', { class: 'ar-row', style: 'gap:10px;margin-top:14px' }, sOut, el('button', { class: 'btn light sm', on: { click: () => ui.copy(sOut.textContent) } }, '复制')),
        sPath),
      el('div', { class: 'ar-card' }, el('h3', null, '其他编码前缀'), el('p', { class: 'sub' }, '事件、人物、地点等也各有前缀。'),
        el('div', { class: 'tablewrap' }, el('table', { class: 'tbl ar-tbl' }, el('thead', null, el('tr', null, el('th', null, '前缀'), el('th', null, '用于'), el('th', null, '示例'))),
          el('tbody', null, D.codes.prefixes.map(([p, n]) => el('tr', null, el('td', { class: 'code' }, p), el('td', null, n), el('td', { class: 'code' }, EX[p] || p + '0001')))))))));
    s.appendChild(el('div', { class: 'callout warn', style: 'margin-top:20px' }, el('b', null, '两条铁律　'),
      '代码为示意，以《编码表》为准；编码一旦发出就永久不改、不复用——要素拆分或合并时发新码，旧码作废留档。'));
    function sync() {
      const done = DYH.progress.has(MOD, 'code');
      if (done) H.set(true, '会发编码了。点“用它来命名文件”，把编码带到下一步「文件名」。');
      else H.set(false, ['在下面选“河段码”和“类型码”，改一下流水号', '看编码被拆成四段：每段是什么意思', '满意后点“用它来命名文件”，带到下一步']);
      pulseIn(s, done ? null : river);
    }
    upd(false); sUpd(false); sync();
    return s;
  }

  /* =========== 4. 文件名生成与检查 =========== */
  const NAME_RE = /^(DYH-[A-Z]+-[A-Z]{2}-\d{4}|SRC-[A-Z]{2}-\d{4}|[A-Z]+-\d{4}|课题一|DYH)_[^_\s]+(_[^_\s]+)*_\d{8}_V\d{2}\.[A-Za-z0-9]+$/;
  const CODE_HEAD = /^(DYH-[A-Z]+-[A-Z]{2}-\d{4}|SRC-[A-Z]{2}-\d{4}|[A-Z]+-\d{4}|课题一|DYH)$/;
  const BANNED = [['最终版 / 最终', /最终/], ['终稿', /终稿/], ['修改版', /修改版/], ['单独的“改”字', /改(?=[_\s.)）\-]|$)/], ['final', /final/i], ['副本', /副本/], ['copy', /copy/i], ['(1) 这类编号', /[（(]\s*\d+\s*[)）]/], ['新版 / 新', /新版|_新[._]/]];
  function realDate(s) {
    if (!/^\d{8}$/.test(s)) return false;
    const y = +s.slice(0, 4), m = +s.slice(4, 6), d = +s.slice(6, 8);
    if (y < 1900 || y > 2100) return false;
    const dt = new Date(y, m - 1, d); return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }
  function checkName(name) {
    name = String(name || '');
    const extM = name.match(/\.([A-Za-z0-9]+)$/);
    const base = extM ? name.slice(0, -extM[0].length) : name;
    const segs = base.split('_');
    const head = segs[0], ver = segs.length >= 3 ? segs[segs.length - 1] : '', date = segs.length >= 4 ? segs[segs.length - 2] : '';
    const desc = segs.length >= 4 ? segs.slice(1, -2) : [];
    const hitBanned = BANNED.filter(b => b[1].test(name)).map(b => b[0]);
    const R = [
      { ok: segs.length >= 4 && desc.length > 0, t: '用下划线分成：编码 _ 内容简述 _ 日期 _ 版本', h: segs.length < 4 ? `现在只有 ${segs.length} 段，应至少 4 段` : '' },
      { ok: CODE_HEAD.test(head), t: '开头是编码（如 DYH-HTH-ZB-0012、SRC-CH-0004、EV-0101、课题一）', h: CODE_HEAD.test(head) ? '' : `开头是“${head || '（空）'}”，不是合规编码` },
      { ok: desc.length > 0 && desc.every(x => x.length > 0), t: '有内容简述（中文即可，不要空段）', h: desc.some(x => !x) ? '出现了连续的下划线' : '' },
      { ok: realDate(date), t: '日期为 8 位 YYYYMMDD，且是真实存在的日期', h: !date ? '没找到日期段' : !/^\d{8}$/.test(date) ? `“${date}”不是 8 位数字` : realDate(date) ? '' : `“${date}”这一天不存在` },
      { ok: /^V\d{2}$/.test(ver), t: '版本号是 V＋两位数字（V01、V02 …）', h: ver && !/^V\d{2}$/.test(ver) ? `“${ver}”不合规，应写成 V01 这样的两位` : '' },
      { ok: !!extM, t: '有扩展名（.pdf .docx .xlsx .dwg .tif …）', h: '' },
      { ok: !/\s/.test(name), t: '不含空格', h: /\s/.test(name) ? '空格请换成下划线，或直接去掉' : '' },
      { ok: !hitBanned.length, t: '不含“最终版 / 终稿 / 改 / 修改版 / final / 副本 / copy / (1)”', h: hitBanned.length ? '发现：' + hitBanned.join('、') + '。要改版本就把 V01 顺延成 V02' : '' }
    ];
    return { rules: R, ok: NAME_RE.test(name) && R.every(r => r.ok) };
  }
  DYH._archiveCheck = checkName;

  function partName() {
    const s = part('archive.name', '文件名：生成与检查', '文件名里带编码，文件被拷来拷去也知道它属于哪个要素、是哪一版，不用打开就能判断。', 'ar-name');
    const H = mkHint(); s.appendChild(H.node);
    s.appendChild(el('div', { class: 'ar-fmt' }, '格式', el('code', null, '{编码}_{内容简述}_{YYYYMMDD}_V{两位版本}.{扩展名}'),
      '版本只顺延 V01 → V02，不加“最终版”“改”“(1)”。'));
    /* 构造器 */
    const code = el('input', { type: 'text', id: 'nb-code', value: DYH.state.archiveCode || 'DYH-HTH-ZB-0012' });
    code.addEventListener('input', e => { if (e.isTrusted) code.dataset.touched = '1'; });
    const desc = el('input', { type: 'text', id: 'nb-desc', value: '戴村坝平面测绘图' });
    const date = el('input', { type: 'text', id: 'nb-date', value: today(), maxlength: 8 });
    const ver = el('select', { id: 'nb-ver' }, Array.from({ length: 12 }, (_, i) => el('option', { value: 'V' + String(i + 1).padStart(2, '0') }, 'V' + String(i + 1).padStart(2, '0'))));
    const ext = el('select', { id: 'nb-ext' }, ['dwg', 'pdf', 'docx', 'xlsx', 'csv', 'tif', 'jpg', 'ttl', 'gpkg'].map(x => el('option', { value: x }, '.' + x)));
    const out = el('div', { class: 'ar-out', id: 'nb-out' });
    const note = el('div', { class: 'ar-msg' });
    const build = () => {
      const d = desc.value.trim().replace(/[\s_]+/g, '');
      out.textContent = `${code.value.trim()}_${d}_${date.value.trim()}_${ver.value}.${ext.value}`;
      const r = checkName(out.textContent);
      note.className = 'ar-msg ' + (r.ok ? 'ok' : 'warn');
      note.textContent = r.ok ? '✓ 这个文件名合规' : '还有问题：' + r.rules.filter(x => !x.ok).map(x => x.t.split('（')[0]).join('；');
      if (/[\s_]/.test(desc.value.trim())) note.textContent += '（简述里的空格和下划线已自动去掉）';
    };
    [code, desc, date, ver, ext].forEach(x => { x.addEventListener('input', build); x.addEventListener('change', build); });
    onEvt(s, CODE_EVT, e => { if (e.detail && (e.detail.force || !code.dataset.touched)) { code.value = e.detail.code; if (e.detail.force) delete code.dataset.touched; build(); } });
    const send = el('button', { class: 'btn primary sm', id: 'nb-send', on: { click: () => { input.value = out.textContent; run(); } } }, '送去检查 →');
    const builder = el('div', { class: 'ar-card' }, el('h3', null, '① 生成文件名'), el('p', { class: 'sub' }, '编码来自上一步的生成器，也可以手改。'),
      el('div', { class: 'grid2', style: 'gap:14px' },
        el('div', { class: 'field' }, el('label', { for: 'nb-code' }, '编码'), code),
        el('div', { class: 'field' }, el('label', { for: 'nb-desc' }, '内容简述'), desc),
        el('div', { class: 'field' }, el('label', { for: 'nb-date' }, '日期 YYYYMMDD（默认今天）'), date),
        el('div', { class: 'grid2', style: 'gap:12px' }, el('div', { class: 'field' }, el('label', { for: 'nb-ver' }, '版本'), ver), el('div', { class: 'field' }, el('label', { for: 'nb-ext' }, '扩展名'), ext))),
      el('div', { class: 'ar-row', style: 'gap:10px;margin-top:18px' }, out, el('button', { class: 'btn light', id: 'nb-copy', on: { click: () => ui.copy(out.textContent) } }, '复制')),
      note,
      el('div', { style: 'margin-top:14px' }, send));
    /* 检查器 */
    const input = el('input', { type: 'text', id: 'nc-input', placeholder: '粘贴或输入任意文件名，例如：戴村坝测绘图最终版.dwg' });
    const res = el('div', { id: 'nc-result' });
    const run = () => {
      const v = input.value.trim(); res.innerHTML = '';
      input.classList.remove('good', 'bad');
      if (!v) { res.appendChild(el('p', { class: 'ar-reason', style: 'margin:14px 0 0' }, '输入后会逐条告诉你哪里对、哪里不对。')); sync(); return; }
      const r = checkName(v);
      input.classList.add(r.ok ? 'good' : 'bad');
      res.appendChild(el('ul', { class: 'ar-checks' }, r.rules.map(x => el('li', null, el('span', { class: 'ic ' + (x.ok ? 'y' : 'n') }, x.ok ? '✓' : '✗'),
        el('div', null, x.t, x.h && !x.ok ? el('span', { class: 'h' }, x.h) : null)))));
      res.appendChild(el('div', { class: 'ar-verdict callout ' + (r.ok ? 'ok' : 'err') }, r.ok ? '✓ 合规，可以归档。' : '✗ 不合规，请按上面打 ✗ 的条目修改。'));
      if (r.ok) DYH.progress.mark(MOD, 'name');
      sync();
    };
    input.addEventListener('input', run);
    const samples = [['DYH-HTH-ZB-0012_戴村坝平面测绘图_20261120_V01.dwg', true], ['课题一_数据集_20261231_V01.xlsx', true], ['戴村坝测绘图最终版.dwg', false], ['DYH-HTH-ZB-0012 戴村坝 改.dwg', false], ['SRC-YT-0008_明代山东运河图_20261131_V1.tif', false], ['测绘图(1).dwg', false]];
    const checker = el('div', { class: 'ar-card' }, el('h3', null, '② 检查任意文件名'), el('p', { class: 'sub' }, '粘贴一个文件名，或点下面的样例。'),
      el('div', { class: 'field' }, el('label', { for: 'nc-input' }, '文件名'), input),
      el('div', { class: 'ar-samples' }, el('span', { class: 'ar-reason' }, '试试：'),
        samples.map(([n, good]) => el('button', { class: 'btn light sm nc-sample', title: n, 'data-good': good ? '1' : '0', on: { click: () => { input.value = n; run(); } } },
          (good ? '✓ ' : '✗ ') + (n.length > 20 ? n.slice(0, 19) + '…' : n)))),
      res);
    s.appendChild(el('div', { class: 'grid2', style: 'align-items:start' }, builder, checker));
    function sync() {
      const done = DYH.progress.has(MOD, 'name');
      if (done) H.set(true, '检查出了合规的文件名。再点几个 ✗ 样例，看看常见错误错在哪。');
      else H.set(false, ['在左边改“内容简述 / 日期 / 版本”，文件名会实时生成', '点“送去检查 →”，或在右边点一个样例、粘贴任意文件名', '右边出现“✓ 合规，可以归档”就完成']);
      pulseIn(s, done ? null : send);
    }
    build(); run();
    return s;
  }

  /* =========== 5. 归档练习 =========== */
  const SRC_TYPE = Object.fromEntries(D.codes.source);
  function sortWhy(f) {
    const m = f.file.match(/^SRC-([A-Z]{2})-\d{4}/);
    if (m) {
      const t = SRC_TYPE[m[1]] || m[1];
      if (f.answer === '02_图_图像库') return `SRC-${m[1]} 是${t}，属于图像 → 02_图_图像库/${t}/${m[0]}/`;
      return `SRC-${m[1]} 是${t} → ${f.answer}/${m[0]}/（一源一档）`;
    }
    if (/数据集|实体表|事件表|关系表|价值表|来源表/.test(f.file)) return '五张表的数据集 → 03_数_数据库（按表名分）';
    if (/纪要|周报|校核/.test(f.file)) return '会议纪要是过程文件 → 06_过程文件/（按月份，如 ' + (f.file.match(/^(\d{6})/) || ['', '202611'])[1] + '/）';
    if (/词表|规范|编码表|模板/.test(f.file)) return '词表、规范属于“规矩” → 00_规范与词表（按版本号）';
    const fd = D.folders.find(x => x.name === f.answer); return '应放在 ' + f.answer + '：' + (fd ? fd.what : '');
  }
  function partSort() {
    const s = part('archive.sort', '归档练习：把文件放进正确的文件夹', '看文件名开头的编码就能判断去处——这正是“以码相连”的好处。', 'ar-sort');
    const H = mkHint(); s.appendChild(H.node);
    const rows = D.sortFiles.map((f, i) => {
      const sel = el('select', { 'data-i': i, class: 'sort-sel' }, el('option', { value: '' }, '选择文件夹…'), D.folders.map(fd => el('option', { value: fd.name }, fd.name)));
      const ex = el('div', { class: 'ex' });
      const row = el('div', { class: 'ar-sort' }, el('div', { class: 'fn' }, fileIcon(), f.file), sel, ex);
      sel.addEventListener('change', () => { row.classList.remove('right', 'wrong'); ex.textContent = ''; sync(); });
      return { f, sel, ex, row };
    });
    const score = el('span', { class: 'ar-score', id: 'sort-score' });
    const checkBtn = el('button', { class: 'btn primary', id: 'sort-check', on: { click: () => check() } }, '检查');
    const why = reason('');
    let checked = false;
    const check = () => {
      let ok = 0;
      rows.forEach(({ f, sel, ex, row }) => {
        row.classList.remove('right', 'wrong');
        if (!sel.value) return;
        const good = sel.value === f.answer; if (good) ok++;
        row.classList.add(good ? 'right' : 'wrong');
        ex.textContent = (good ? '✓ ' : '✗ 应为 ' + f.answer + '。') + sortWhy(f);
      });
      checked = true;
      score.textContent = `${ok} / ${rows.length} 正确`;
      if (ok === rows.length) { DYH.progress.mark(MOD, 'sort'); ui.toast('全部放对了！8 个文件都找到了家。', 'ok'); }
      else ui.toast(`对了 ${ok} 个，红色的再想想`, 'warn');
      sync();
    };
    const redo = linkBtn('重做', () => { rows.forEach(r => { r.sel.value = ''; r.row.classList.remove('right', 'wrong'); r.ex.textContent = ''; }); score.textContent = ''; checked = false; sync(); });
    s.appendChild(el('div', { class: 'ar-sorts' }, rows.map(r => r.row)));
    s.appendChild(el('div', { class: 'ar-row', style: 'margin-top:16px' }, checkBtn, why, score, redo));
    function sync() {
      const empty = rows.filter(r => !r.sel.value).length;
      const allRight = rows.every(r => r.row.classList.contains('right'));
      checkBtn.disabled = empty > 0;
      why.textContent = empty ? `还有 ${empty} 个文件没选文件夹` : '';
      if (DYH.progress.has(MOD, 'sort') && (allRight || !checked)) H.set(true, allRight ? '8 个文件全部放对了。看文件名里的编码，就知道它该去哪个库。' : '这个练习你已经做对过；想巩固可以再做一遍。');
      else H.set(false, ['看每个文件名开头的编码：SRC-ZS 是志书、SRC-CH 是测绘图、SRC-KG 是考古报告……', '给 8 个文件各选一个文件夹', '点“检查”：全部变绿即完成；红色的看提示再改']);
      const target = empty === rows.length ? (DYH.progress.has(MOD, 'sort') ? null : rows[0].sel) : !empty && !allRight ? checkBtn : null;
      pulseIn(s, target);
    }
    sync();
    return s;
  }

  /* =========== 6. 元数据卡 =========== */
  const SRC_FOLDER = { ZS: '01_志_文献库', DA: '01_志_文献库', YT: '02_图_图像库', CH: '02_图_图像库', ZP: '02_图_图像库', KG: '04_考古成果', WW: '05_文物数据' };
  const typeCodeOf = name => (D.codes.source.find(x => x[1] === name) || [''])[0];
  function pathFor(typeName, code) {
    const t = typeCodeOf(typeName), f = SRC_FOLDER[t]; if (!f || !code) return '';
    return f === '02_图_图像库' ? `${f}/${typeName}/${code}/` : `${f}/${code}/`;
  }
  function partCard() {
    const s = part('archive.card', '元数据卡：给来源表添一行', '资料放进文件夹还不够，要在来源表登记一行“身份证”——这一行就是它进入档案和图谱的入口。', 'ar-card');
    const H = mkHint(); s.appendChild(H.node);
    const F = [
      ['资料类型', '资料类型', 'E55·P2', 'select', true],
      ['来源编码', '来源编码', 'E42·P48', 'text', true, '选好资料类型后自动编号，如 SRC-ZP-0001'],
      ['题名', '题名', 'E35·P102', 'text', true, '如 戴村坝主坝现状照片'],
      ['责任者', '责任者', 'E39·P14', 'text', false, '编纂、测绘、拍摄单位或个人'],
      ['形成时间', '形成时间', 'E52·P4', 'text', false, '如 2026-11 或 清乾隆年间'],
      ['涉及要素', '涉及要素编码（逗号分隔）', 'P70/P138', 'text', true, '如 DYH-HTH-ZB-0012, EV-0102'],
      ['出处位置', '出处位置', 'P3', 'text', false, '卷 / 页 / 图幅号 / 档号'],
      ['载体与格式', '载体与格式', 'E55·P2', 'text', false, '如 纸本扫描 / PDF'],
      ['权利与使用限制', '权利 / 使用限制', 'E30·P104', 'text', false, '如 课题组内部使用'],
      ['存放路径', '存放路径', '路径', 'text', true, '按规则自动生成']
    ];
    const inp = {}, msg = {};
    let codeAuto = true, pathAuto = true, lastAdded = null;
    const fields = F.map(([k, label, crm, type, req, ph]) => {
      const id = 'mc-' + k;
      const c = type === 'select' ? el('select', { id }, el('option', { value: '' }, '请选择…'), D.codes.source.map(([cc, n]) => el('option', { value: n }, n + '（' + cc + '）')))
        : el('input', { type: 'text', id, placeholder: ph || '' });
      inp[k] = c; msg[k] = el('div', { class: 'ar-msg' });
      const lab = el('label', { for: id }, label, req ? el('span', { class: 'req' }, '*') : null, el('span', { class: 'mtag', title: 'CIDOC CRM 对应' }, crm));
      if (k === '存放路径') lab.appendChild(el('span', { class: 'ar-auto', on: { click: () => { pathAuto = true; autoFill(); validate(); } } }, '↺ 按规则重新生成'));
      if (k === '来源编码') lab.appendChild(el('span', { class: 'ar-auto', on: { click: () => { codeAuto = true; autoFill(); validate(); } } }, '↺ 自动编号'));
      return el('div', { class: 'field' + (k === '题名' || k === '涉及要素' ? ' full' : '') }, lab, c, msg[k]);
    });
    const recs = () => DYH.state.records || D.records;
    const nextCode = t => {
      if (!t) return '';
      const used = (recs().sources || []).map(r => String(r.来源编码 || '')).concat(D.sortFiles.map(f => f.file.split('_')[0]))
        .map(c => c.match(new RegExp('^SRC-' + t + '-(\\d{4})$'))).filter(Boolean).map(m => +m[1]);
      return `SRC-${t}-${pad4((used.length ? Math.max(...used) : 0) + 1)}`;
    };
    const autoFill = () => {
      const t = typeCodeOf(inp.资料类型.value);
      if (codeAuto && t) inp.来源编码.value = nextCode(t);
      if (pathAuto) inp.存放路径.value = pathFor(inp.资料类型.value, inp.来源编码.value.trim());
    };
    inp.来源编码.addEventListener('input', () => { codeAuto = false; autoFill(); validate(); });
    inp.存放路径.addEventListener('input', () => { pathAuto = false; validate(); });
    inp.资料类型.addEventListener('change', () => { autoFill(); validate(); });
    Object.keys(inp).forEach(k => { if (!['来源编码', '存放路径', '资料类型'].includes(k)) inp[k].addEventListener('input', () => validate()); });

    const row = () => {
      const o = {};
      F.forEach(([k]) => { let v = inp[k].value.trim(); if (k === '涉及要素') v = v.split(/[,，;；、\s]+/).filter(Boolean).join('; '); o[k] = v; });
      return { 来源编码: o.来源编码, 题名: o.题名, 资料类型: o.资料类型, 责任者: o.责任者, 形成时间: o.形成时间, 涉及要素: o.涉及要素, 出处位置: o.出处位置, 载体与格式: o.载体与格式, 权利与使用限制: o.权利与使用限制, 存放路径: o.存放路径 };
    };
    const prevBox = el('div');
    const addBtn = el('button', { class: 'btn primary', id: 'mc-add', on: { click: () => add() } }, '加入来源表');
    const addWhy = reason('');
    const sampleBtn = el('button', { class: 'btn light sm', id: 'mc-sample', on: { click: () => sample() } }, '填入示例');
    const validate = () => {
      const r = row(), errs = {}, warns = {};
      const R = recs();
      if (!r.来源编码) errs.来源编码 = '必填';
      else if (!/^SRC-[A-Z]{2}-\d{4}$/.test(r.来源编码)) errs.来源编码 = '格式应为 SRC-两位大写字母-4位数字，如 SRC-ZP-0001';
      else if ((R.sources || []).some(x => String(x.来源编码) === r.来源编码)) errs.来源编码 = '这个编码已经被用过了——编码不复用，请换一个（可点“自动编号”）';
      else if (typeCodeOf(r.资料类型) && r.来源编码.slice(4, 6) !== typeCodeOf(r.资料类型)) errs.来源编码 = `编码里的类型码 ${r.来源编码.slice(4, 6)} 与资料类型「${r.资料类型}」（${typeCodeOf(r.资料类型)}）不一致`;
      if (!r.题名) errs.题名 = '必填';
      if (!r.资料类型) errs.资料类型 = '必选';
      const codes = r.涉及要素 ? r.涉及要素.split('; ') : [];
      if (!codes.length) errs.涉及要素 = '至少填一个要素编码——没有编码，这份资料就和谁都连不上';
      else {
        const bad = codes.filter(c => !ENTITY_CODE.test(c));
        if (bad.length) errs.涉及要素 = '这些不像编码：' + bad.join('、') + '（只填编码，不填名称）';
        else {
          const known = new Set([].concat((R.entities || []).map(x => String(x.实体编码)), (R.events || []).map(x => String(x.事件编码))));
          const unk = codes.filter(c => !known.has(c));
          if (unk.length) warns.涉及要素 = '实体表 / 事件表里还没有：' + unk.join('、') + '（可以先登记来源，之后补实体）';
        }
      }
      if (!r.存放路径) errs.存放路径 = '必填';
      else { const exp = pathFor(r.资料类型, r.来源编码); if (exp && r.存放路径 !== exp) warns.存放路径 = '按目录规则应为 ' + exp; }
      F.forEach(([k]) => {
        const e = errs[k], w = warns[k];
        const showErr = e && inp[k].value.trim();
        msg[k].className = 'ar-msg ' + (showErr ? 'err' : w ? 'warn' : '');
        msg[k].textContent = showErr ? e : (w || '');
        inp[k].classList.toggle('bad', !!showErr);
      });
      // 预览
      prevBox.innerHTML = '';
      const cols = Object.keys(r);
      prevBox.appendChild(el('div', { class: 'tablewrap' }, el('table', { class: 'tbl ar-prev', id: 'mc-preview' },
        el('thead', null, el('tr', null, cols.map(c => el('th', null, c)))),
        el('tbody', null, el('tr', null, cols.map(c => el('td', { class: c === '来源编码' ? 'code' : '' }, r[c] || el('span', { class: 'muted' }, '—'))))))));
      // 按钮状态、提示与脉冲
      const ok = !Object.keys(errs).length;
      addBtn.disabled = !ok;
      const missing = F.filter(([k, , , , req]) => req && errs[k] && !inp[k].value.trim()).map(([k]) => k);
      addWhy.textContent = ok ? '' : missing.length ? '还差：' + missing.join('、') : '先改正红字';
      if (lastAdded) H.set(true, `${lastAdded} 已加入来源表。它会出现在「成果」的五张表、要素档案和图谱里。`);
      else H.set(false, ['先选“资料类型”——来源编码和存放路径会自动生成', '填“题名”和“涉及要素编码”（不会填就点右上角“填入示例”）', '没有红字后，点“加入来源表”']);
      pulseIn(s, lastAdded ? null : !inp.资料类型.value ? inp.资料类型 : ok ? addBtn : null);
      return { ok, r, errs };
    };
    const done = el('div', { id: 'mc-done' });
    const add = () => {
      const v = validate();
      if (!v.ok) { ui.toast('还有 ' + Object.keys(v.errs).length + ' 处要改（见红字）', 'err'); return; }
      if (!DYH.state.records) DYH.state.records = JSON.parse(JSON.stringify(D.records));
      const R = DYH.state.records; R.sources = R.sources || [];
      R.sources.push(Object.assign({}, v.r, { _new: true, _from: 'archive' }));
      DYH.save();
      DYH.progress.mark(MOD, 'card');
      lastAdded = v.r.来源编码;
      document.dispatchEvent(new CustomEvent(REC, { detail: { src: 'archive' } }));
      ui.toast('已加入来源表：' + v.r.来源编码, 'ok');
      done.innerHTML = '';
      done.appendChild(el('div', { class: 'callout ok', style: 'margin-top:16px' }, el('b', null, `✓ ${v.r.来源编码} 已加入来源表。`),
        '「成果」的五张表里会以浅蓝色标出；涉及的要素档案里也会多出这条' + (['测绘图', '舆图', '照片'].includes(v.r.资料类型) ? '图像' : '文献') + '记录，图谱和 RDF 也会多出相应的边。 ',
        el('a', { href: '#/results', id: 'mc-goto', on: { click: () => { DYH.resultsOpen = { tab: 'tables', table: 'sources' }; } } }, '去「成果」看看 ›')));
      codeAuto = true; autoFill(); validate();
    };
    const sample = () => {
      inp.资料类型.value = '照片'; codeAuto = true; pathAuto = true;
      inp.题名.value = '戴村坝主坝现状照片'; inp.责任者.value = '[拍摄人]'; inp.形成时间.value = today().slice(0, 4) + '-' + today().slice(4, 6);
      inp.涉及要素.value = 'DYH-HTH-ZB-0012'; inp.出处位置.value = '现场拍摄 · 东侧'; inp.载体与格式.value = '数码照片 / JPG'; inp.权利与使用限制.value = '课题组内部使用';
      autoFill(); validate();
    };
    s.appendChild(el('div', { class: 'ar-card' },
      el('div', { class: 'ar-row', style: 'justify-content:space-between;margin-bottom:18px' },
        el('div', null, el('h3', null, '来源表 · 新增一行'), el('span', { class: 'ar-reason', style: 'font-size:13px' }, '灰色小标签＝这一格在 CIDOC CRM 里对应的类 · 属性')),
        sampleBtn),
      el('div', { class: 'ar-form' }, fields),
      el('h4', { style: 'margin:28px 0 10px' }, '预览：将写入来源表的一行'), prevBox,
      el('div', { class: 'ar-row', style: 'margin-top:18px' }, addBtn, addWhy,
        el('span', { class: 'ar-reason', style: 'margin-left:auto;font-size:13px' }, '只保存在本机浏览器')),
      done));
    autoFill(); validate();
    return s;
  }

  /* ---------- 注册部件 ---------- */
  DYH.parts = DYH.parts || {};
  DYH.parts['archive.principle'] = () => partPrinciple();
  DYH.parts['archive.folders'] = () => partFolders();
  DYH.parts['archive.code'] = () => partCode();
  DYH.parts['archive.name'] = () => partName();
  DYH.parts['archive.sort'] = () => partSort();
  DYH.parts['archive.card'] = () => partCard();

  DYH.modules = DYH.modules || {};
  DYH.modules.archive = {
    title: '归档与命名',
    steps: ['principle', 'code', 'name', 'sort', 'card'],
    next: 'review',
    parts: ['archive.principle', 'archive.folders', 'archive.code', 'archive.name', 'archive.sort', 'archive.card'],
    mount(box) {
      injectCss();
      box.appendChild(ui.pageHead('第 3 节 · 文件归档', '归档与命名：一物一码，以码相连',
        '一个课题几千份资料、几万行数据，靠记忆和文件夹是找不回来的。这一节练四件事：发编码、起文件名、放文件夹、填来源卡。'));
      this.parts.forEach(n => box.appendChild(ui.part(n)));
    }
  };
})();
