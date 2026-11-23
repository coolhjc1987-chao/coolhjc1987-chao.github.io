/* 第 1 节 · 原理 */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el;
  const MOD = 'learn';
  /* 提示条：未完成时显示步骤，完成后变成绿色 ✓ */
  function guide(step, items, doneMsg) {
    let h = DYH.progress.has(MOD, step) ? ui.hint(doneMsg, { done: true }) : ui.hint(items, { title: '怎么做' });
    return { node: h, done() { if (h.classList.contains('done')) return; const n = ui.hint(doneMsg, { done: true }); h.replaceWith(n); h = n; } };
  }

  /* 造句器里可选的“实例” */
  const THINGS = [
    { n: '筑戴村坝', c: 'E12' }, { n: '重开会通河', c: 'E11' }, { n: '某年会通河淤废', c: 'E6' },
    { n: '戴村坝', c: 'E24' }, { n: '会通河', c: 'E25' }, { n: '御碑', c: 'E22' }, { n: '汶水', c: 'E26' }, { n: '南旺分水枢纽遗址', c: 'E27' },
    { n: '东平县', c: 'E53' }, { n: '山东省', c: 'E53' }, { n: '宋礼', c: 'E21' }, { n: '白英', c: 'E21' }, { n: '漕运总督衙门', c: 'E74' },
    { n: '1411', c: 'E52' }, { n: '明代', c: 'E4' }, { n: '《中国运河志》条目', c: 'E31' }, { n: '戴村坝测绘图', c: 'E36' },
    { n: '一次价值评估', c: 'E13' }, { n: '科学价值', c: 'E55' }, { n: '坝（词表）', c: 'E55' }
  ];
  const CHALLENGES = [
    { id: 'c1', ask: '说清楚：戴村坝是怎么来的（被哪次活动建造）', s: '筑戴村坝', p: 'P108', o: '戴村坝' },
    { id: 'c2', ask: '说清楚：谁主持了重开会通河', s: '重开会通河', p: 'P14', o: '宋礼' },
    { id: 'c3', ask: '说清楚：这张测绘图画的是什么', s: '戴村坝测绘图', p: 'P138', o: '戴村坝' },
    { id: 'c4', ask: '说清楚：戴村坝在哪里', s: '戴村坝', p: 'P53', o: '东平县' },
    { id: 'c5', ask: '说清楚：东平县属于哪个更大的地点', s: '东平县', p: 'P89', o: '山东省' },
    { id: 'c6', ask: '给戴村坝贴上“坝”这个结构标签', s: '戴村坝', p: 'P2', o: '坝（词表）' }
  ];

  DYH.modules.learn = {
    title: '读懂“语法”', steps: ['grammar', 'event', 'classify', 'builder', 'value'], next: 'tag',
    mount(box) {
      box.appendChild(ui.pageHead('第 1 节 · 原理', 'CIDOC CRM 是一套“记录事实的语法”', '不用背 279 页的标准。先认三个词、转一个弯（以事件为中心），再练两个小测试，就能看懂后面所有的表格。'));
      box.appendChild(secGrammar());
      box.appendChild(secEvent());
      box.appendChild(secClassify());
      box.appendChild(secBuilder());
      box.appendChild(secValue());
    }
  };

  DYH.parts = DYH.parts || {};
  DYH.parts['learn.grammar'] = () => secGrammar();
  DYH.parts['learn.event'] = () => secEvent();
  DYH.parts['learn.classify'] = () => secClassify();
  DYH.parts['learn.builder'] = () => secBuilder();
  DYH.parts['learn.value'] = () => secValue();

  /* ---------- 1 三个词 ---------- */
  function secGrammar() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '三个词：名词、动词、形容词'));
    s.appendChild(el('p', { class: 'muted' }, '为什么：所有标注都是在“造句”。分清这三个词，就分清了表格里每一列该填什么。'));
    s.appendChild(ui.html(`<div class="grid3" style="margin-top:14px">
      <div class="card"><span class="tag t-thing">E 开头</span><h3 style="margin-top:10px">类 ＝ 名词</h3><p>“这是哪一种东西”。人物 E21、地点 E53、人工特征 E25、文档 E31……</p><p class="muted small">例：戴村坝是一个 <b>E24 实体人造物</b></p></div>
      <div class="card"><span class="tag t-prop">P 开头</span><h3 style="margin-top:10px">属性 ＝ 动词</h3><p>“它和谁是什么关系”。有方向：从主体读到客体。</p><p class="muted small">例：戴村坝 <b>—P53 具有位置→</b> 东平县</p></div>
      <div class="card"><span class="tag t-type">E55</span><h3 style="margin-top:10px">类型 ＝ 形容词 / 标签</h3><p>从受控词表里选的词，把类再细分。只能选，不能自造。</p><p class="muted small">例：戴村坝 —P2 具有类型→ <b>坝</b></p></div></div>`));
    const t = ui.html(`<div class="tablewrap" style="margin-top:18px"><table class="tbl"><tr><th>词</th><th>文档里的意思</th><th>换成我们的话</th><th>运河例子</th></tr>
      <tr><td>类 Class</td><td>具有共同特征的一组事物</td><td>“这是哪一种”</td><td>E25 人工特征</td></tr>
      <tr><td>属性 Property</td><td>连接两个类的实例的关系，有方向：从“域”读到“值域”</td><td>“它和谁什么关系”</td><td>P53 具有位置</td></tr>
      <tr><td>实例 Instance</td><td>某个类里具体的一个</td><td>“具体是哪一个”</td><td>戴村坝、会通河</td></tr>
      <tr><td>类型 Type（E55）</td><td>叙词表、受控词表里的术语</td><td>“贴上去的标签”</td><td>闸坝、科学价值</td></tr></table></div>`);
    s.appendChild(t);
    s.appendChild(ui.html(`<div class="callout info" style="margin-top:14px"><b>正反两种读法：</b>“P53 具有位置（是……的位置）”——括号外是正向（戴村坝 具有位置 东平县），括号内是反向（东平县 是 戴村坝 的位置）。反向在编号后加 i，写作 P53i。</div>`));
    const gl = el('div', { class: 'card soft hidden', style: 'margin-top:14px' });
    gl.appendChild(el('h4', null, '中文译本误译对照：读到左边的词，请换成中间的标准说法'));
    const tb = el('table', { class: 'tbl' }, el('tr', null, el('th', null, '译本里写的'), el('th', null, '应理解为'), el('th', null, '英文原词')));
    D.glossary.forEach(r => tb.appendChild(el('tr', null, r.map(x => el('td', null, x)))));
    gl.appendChild(el('div', { class: 'tablewrap' }, tb));
    s.appendChild(el('div', { class: 'row wrap-row', style: 'margin-top:14px;gap:10px' },
      el('button', { class: 'btn light', on: { click: () => gl.classList.toggle('hidden') } }, '查看译本误译对照（演员、网站、右侧……）'),
      el('button', { class: 'btn teal', on: { click: e => { DYH.progress.mark(MOD, 'grammar'); e.target.textContent = '✓ 已掌握'; ui.toast('第 ① 部分完成', 'ok'); } } }, DYH.progress.has(MOD, 'grammar') ? '✓ 已掌握' : '我看懂了')));
    s.appendChild(gl);
    return s;
  }

  /* ---------- 2 以事件为中心 ---------- */
  function secEvent() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '转一个弯：以“事件”为中心'));
    s.appendChild(el('p', { class: 'muted' }, '为什么：不直接写“戴村坝建于 1411 年”，而是写“有一次修建活动，它生产了戴村坝，时间 1411，执行者白英（建议）”。这样开凿、多次重修、疏浚都能并列记录，互不覆盖。点击四个方向看看。'));
    const spokes = [
      { k: 'who', label: '谁', cls: 'E39 行动者', p: 'P14 由…执行', o: '白英（角色：建议）', x: 120, y: 70, color: '#C2410C', note: '人物、机构都是“行动者”。他在这次活动里担任什么角色，写在 P14.1。' },
      { k: 'what', label: '什么', cls: 'E24 实体人造物', p: 'P108 生产了', o: '戴村坝', x: 680, y: 70, color: '#0E7C86', note: '新建用 P108 生产了；如果是重修、疏浚，事件换成 E11 修改，属性换成 P31 修改了。' },
      { k: 'when', label: '何时', cls: 'E52 时间跨度', p: 'P4 具有时间跨度', o: '1411（推定）', x: 120, y: 330, color: '#B8460B', note: '时间挂在事件上，不挂在坝上。只知道朝代时，用 P10 落在“明代（E4）”之内。' },
      { k: 'where', label: '何地', cls: 'E53 地点', p: 'P7 发生于', o: '东平县', x: 680, y: 330, color: '#5856D6', note: '事件发生的地点用 P7；坝本身的位置用 P53。两者常常相同，但意思不同。' }
    ];
    const seen = new Set();
    const G = guide('event', ['点击图中“谁 / 什么 / 何时 / 何地”四个方框', '右侧会出现对应的那句话；四个都点过即完成'], '已完成：事件把“谁、什么、何时、何地”串在一起。');
    s.appendChild(G.node);
    const info = el('div', { class: 'card soft', style: 'min-height:170px' }, el('h3', null, '点击左图的任一方向'), el('p', { class: 'muted' }, '每个方向都是一句“事件 —属性→ 对象”。'));
    let svg = `<svg viewBox="0 0 800 400" style="width:100%;height:auto;max-height:420px;display:block" role="img" aria-label="以事件为中心的示意图">
      <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0E7C86"/></marker></defs>`;
    spokes.forEach(sp => { svg += `<line x1="400" y1="200" x2="${sp.x}" y2="${sp.y}" stroke="#0E7C86" stroke-width="3" marker-end="url(#ar)" data-l="${sp.k}"/>`; });
    svg += `<rect x="300" y="155" width="200" height="90" rx="14" fill="#1D1D1F"/><text x="400" y="192" text-anchor="middle" fill="#C7C7CC" font-size="15">E12 生产（事件）</text><text x="400" y="222" text-anchor="middle" fill="#FFFFFF" font-size="20" font-weight="700">筑戴村坝</text>`;
    spokes.forEach(sp => {
      svg += `<g data-k="${sp.k}" style="cursor:pointer"><rect x="${sp.x - 100}" y="${sp.y - 42}" width="200" height="84" rx="14" fill="#FFFFFF" stroke="${sp.color}" stroke-width="3"/>
        <text x="${sp.x}" y="${sp.y - 8}" text-anchor="middle" font-size="22" font-weight="700" fill="${sp.color}">${sp.label}</text>
        <text x="${sp.x}" y="${sp.y + 22}" text-anchor="middle" font-size="14" fill="#1D1D1F">${sp.cls}</text></g>`;
    });
    svg += '</svg>';
    const fig = ui.html('<div class="card">' + svg + '</div>');
    fig.querySelectorAll('g[data-k]').forEach(g => g.addEventListener('click', () => {
      const sp = spokes.find(x => x.k === g.dataset.k); seen.add(sp.k);
      fig.querySelectorAll('g[data-k] rect').forEach(r => r.setAttribute('stroke-width', '3'));
      g.querySelector('rect').setAttribute('stroke-width', '6');
      info.innerHTML = '';
      info.appendChild(el('span', { class: 'eyebrow' }, sp.label + '（' + seen.size + ' / 4）'));
      info.appendChild(el('div', { style: 'font-size:20px;margin:6px 0 12px;color:#1D1D1F' }, el('b', null, '筑戴村坝'), ' ', el('span', { class: 'tag t-prop' }, sp.p), ' ', el('b', null, sp.o)));
      info.appendChild(el('p', null, sp.note));
      if (seen.size === 4) { DYH.progress.mark(MOD, 'event'); G.done(); info.appendChild(el('div', { class: 'callout ok' }, '四个方向都看过了：事件把“谁、什么、何时、何地”串在一起。')); }
    }));
    s.appendChild(el('div', { class: 'split', style: 'grid-template-columns:3fr 2fr;margin-top:12px' }, fig, info));
    if (!DYH.progress.has(MOD, 'event')) setTimeout(() => ui.pulse(fig.querySelector('g[data-k=who] rect') && fig.querySelector('svg')), 50);
    return s;
  }

  /* ---------- 3 分类小测试 ---------- */
  function secClassify() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '小测试：这个东西归哪个类？'));
    s.appendChild(el('p', { class: 'muted' }, '为什么：定错类，后面的关系就全错。口诀——挖出来的用 E25，建起来的用 E24，搬得走的用 E22，只是位置用 E53。给每一项选一个类，然后点“检查”。'));
    const G = guide('classify', ['每张卡片的下拉框里选一个类（参考上面的口诀）', '16 项都选完后，点下方蓝色“检查”', '答对 14 项及以上即过关；答错的会显示原因'], '已过关：你已经能分清物、地、人、事、时、文。');
    s.appendChild(G.node);
    const opts = ['E25', 'E24', 'E22', 'E26', 'E27', 'E53', 'E21', 'E74', 'E12', 'E11', 'E4', 'E52', 'E31', 'E36', 'E55'];
    const grid = el('div', { class: 'grid4', style: 'margin-top:14px' });
    const sels = [];
    D.classify.forEach((it, i) => {
      const sel = el('select', null, el('option', { value: '' }, '— 选择类 —'), opts.map(o => el('option', { value: o }, o + ' ' + ui.cls(o).zh)));
      const fb = el('div', { class: 'small', style: 'min-height:22px;margin-top:6px' });
      const card = el('div', { class: 'card flat', style: 'padding:14px 16px' }, el('div', { style: 'font-weight:700;color:#1D1D1F;margin-bottom:8px' }, it.item), sel, fb);
      sels.push({ it, sel, fb, card }); grid.appendChild(card);
    });
    s.appendChild(grid);
    const score = el('span', { class: 'muted', style: 'margin-left:12px' });
    s.appendChild(el('div', { style: 'margin-top:16px' },
      el('button', { class: 'btn primary', id: 'cls-check', on: { click: check } }, '检查'),
      el('button', { class: 'btn ghost', style: 'margin-left:8px', on: { click: () => sels.forEach(x => { x.sel.value = ''; x.fb.textContent = ''; x.card.style.borderColor = ''; }) } }, '清空'), score));
    function check() {
      let ok = 0;
      sels.forEach(x => {
        const v = x.sel.value, right = v === x.it.answer; if (right) ok++;
        x.card.style.borderColor = v ? (right ? 'var(--ok)' : 'var(--err)') : '';
        x.fb.innerHTML = !v ? '<span class="muted">还没选</span>' : right ? '<span style="color:var(--ok)">✓ ' + ui.esc(x.it.why) + '</span>' : '<span style="color:var(--err)">✗ 应为 ' + x.it.answer + ' ' + ui.esc(ui.cls(x.it.answer).zh) + '：' + ui.esc(x.it.why) + '</span>';
      });
      score.textContent = `答对 ${ok} / ${sels.length}`;
      if (ok >= sels.length - 2) { DYH.progress.mark(MOD, 'classify'); G.done(); ui.toast('分类过关！', 'ok'); } else ui.toast('再看看标红的项', 'warn');
    }
    return s;
  }

  /* ---------- 4 造句器 ---------- */
  function secBuilder() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '造句器：一句话合不合“语法”？'));
    s.appendChild(el('p', { class: 'muted' }, '为什么：每个属性都规定了主体和客体必须是什么类（文档里叫“域”和“值域”）。造句器会像老师一样替你检查。完成右侧任意 3 个任务即可过关。'));
    const G = guide('builder', ['从三个下拉框分别选“主体、属性、客体”', '下方立刻告诉你这句话合不合规则，以及为什么', '照右侧任务造出 3 句即过关'], '已过关：你会用造句器检查一句话的“语法”了。');
    s.appendChild(G.node);
    const mk = (id) => el('select', { id }, THINGS.map((t, i) => el('option', { value: i }, t.n + '（' + t.c + '）')));
    const sS = mk('bs'), sO = mk('bo');
    const sP = el('select', null, D.properties.map(p => el('option', { value: p.code }, p.code + ' ' + p.zh)));
    sS.value = '0'; sP.value = 'P108'; sO.value = '3';
    const out = el('div', { style: 'margin-top:16px' });
    const done = new Set(Object.keys((DYH.state.learnDone || {})));
    const list = el('div', { class: 'stack' });
    function renderList() {
      list.innerHTML = '';
      CHALLENGES.forEach(c => list.appendChild(el('div', { class: 'card flat', style: 'padding:12px 14px;' + (done.has(c.id) ? 'border-color:var(--ok);background:var(--ok-soft)' : '') },
        el('div', null, (done.has(c.id) ? '✓ ' : '○ ') + c.ask))));
    }
    let userActed = false;
    function run() {
      const S = THINGS[sS.value], O = THINGS[sO.value], P = ui.prop(sP.value);
      const r = ui.checkTriple(S.c, P.code, O.c);
      out.innerHTML = '';
      out.appendChild(el('div', { class: 'card', style: 'font-size:22px;color:#1D1D1F' }, el('b', null, S.n), ' ', ui.classTag(S.c, true), '  ', el('span', { class: 'tag t-prop', style: 'font-size:15px' }, '—' + P.code + ' ' + P.zh + '→'), '  ', el('b', null, O.n), ' ', ui.classTag(O.c, true)));
      out.appendChild(el('div', { class: 'callout ' + (r.ok ? 'ok' : 'err'), style: 'margin-top:10px' }, r.ok ? '✓ ' + r.msg : '✗ ' + r.msg));
      out.appendChild(el('p', { class: 'muted small', style: 'margin-top:8px' }, '反向读法：', O.n, ' ', P.inv, ' ', S.n, '。用途：', P.use));
      if (r.ok && userActed) {
        const c = CHALLENGES.find(c => c.s === S.n && c.p === P.code && c.o === O.n);
        if (c && !done.has(c.id)) {
          done.add(c.id); DYH.state.learnDone = Object.fromEntries([...done].map(k => [k, true])); DYH.save(); renderList(); ui.toast('任务完成：' + c.ask, 'ok');
          if (done.size >= 3) { DYH.progress.mark(MOD, 'builder'); G.done(); }
        }
      }
    }
    [sS, sP, sO].forEach(x => x.addEventListener('change', () => { userActed = true; run(); }));
    const left = el('div', { class: 'card' },
      el('div', { class: 'grid3', style: 'gap:12px' }, el('div', { class: 'field' }, el('label', null, '主体（名词）'), sS), el('div', { class: 'field' }, el('label', null, '属性（动词）'), sP), el('div', { class: 'field' }, el('label', null, '客体（名词）'), sO)),
      out,
      el('p', { class: 'muted small', style: 'margin-top:10px' }, '试试错误的：让“宋礼 —P108 生产了→ 戴村坝”，看看造句器怎么说。'));
    renderList();
    s.appendChild(el('div', { class: 'split', style: 'grid-template-columns:3fr 2fr;margin-top:12px' }, left, el('div', null, el('h4', null, '任务（完成 3 个过关）'), list)));
    setTimeout(run, 0);
    return s;
  }

  /* ---------- 5 价值怎么记 ---------- */
  function secValue() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '价值标签：记成一次“评估”'));
    s.appendChild(el('p', { class: 'muted' }, '为什么：位置是事实，只有一个；价值是判断，可以有多位专家、多部文献的多条意见。所以价值不直接贴在要素上，而是记成一次 E13 属性分配：判给谁、判了什么、谁判的、依据什么、什么时候。'));
    const G = guide('value', ['左侧表单已按示例填好，可以改一改', '点“生成评估记录”，右侧出现一条价值评估', '试着清空“判定人”再生成，看看会怎样'], '已完成：价值＝一次可追溯的评估（E13）。');
    s.appendChild(G.node);
    const fEl = el('select', null, ['戴村坝', '会通河', '南旺分水枢纽遗址'].map(x => el('option', null, x)));
    const fV = el('select', null, D.values5.map(v => el('option', null, v.name)));
    const fSub = el('input', { type: 'text', value: '水利工程技术' });
    const fWho = el('input', { type: 'text', value: '[判定人]' });
    const fSrc = el('input', { type: 'text', value: 'SRC-ZS-0035' });
    const fO = el('select', null, el('option', { value: '' }, '（不对应）'), D.ouv.map(o => el('option', { value: o.code }, o.code + ' ' + o.zh)));
    fV.value = '科学价值'; fO.value = '(iv)';
    const out = el('div');
    function gen() {
      out.innerHTML = '';
      const rows = [['P140 分配给', fEl.value], ['P141 分配了', fV.value + ' / ' + (fSub.value || '—') + (fO.value ? '　世遗标准 ' + fO.value : '')], ['P14 由…执行', fWho.value || '（必须填写判定人）'], ['P4 时间', new Date().toISOString().slice(0, 10)], ['P16 依据', fSrc.value || '（必须填写依据）']];
      const c = el('div', { class: 'card dark' }, el('div', { class: 'row center', style: 'gap:10px;margin-bottom:10px' }, el('span', { class: 'tag t-value' }, 'E13 属性分配'), el('b', { style: 'color:#FFFFFF' }, 'VA-0001 一次价值评估')));
      rows.forEach(([p, v]) => c.appendChild(el('div', { style: 'padding:6px 0;border-top:1px solid #3A3A3C;display:flex;gap:14px' }, el('span', { style: 'color:#78C2B3;min-width:120px;font-family:var(--mono);font-size:13px' }, p), el('span', { style: 'color:#FFFFFF' }, v))));
      out.appendChild(c);
      const missing = !fWho.value.trim() || !fSrc.value.trim();
      out.appendChild(el('div', { class: 'callout ' + (missing ? 'err' : 'ok'), style: 'margin-top:10px' }, missing ? '缺判定人或依据的价值判断不能入库。' : '这一条就是价值表里的一行。没有依据和判定人的价值，不入库。'));
      if (!missing) { DYH.progress.mark(MOD, 'value'); G.done(); }
    }
    const form = el('div', { class: 'card' }, el('div', { class: 'grid2', style: 'gap:12px' },
      el('div', { class: 'field' }, el('label', null, '评估对象（P140）'), fEl), el('div', { class: 'field' }, el('label', null, '价值一级（P141）'), fV),
      el('div', { class: 'field' }, el('label', null, '价值二级（词表）'), fSub), el('div', { class: 'field' }, el('label', null, '世遗标准（并行）'), fO),
      el('div', { class: 'field' }, el('label', null, '判定人（P14）'), fWho), el('div', { class: 'field' }, el('label', null, '依据文献（P16）'), fSrc)),
      el('div', { style: 'margin-top:14px' }, el('button', { class: 'btn primary', on: { click: gen } }, '生成评估记录')));
    const ref = el('div', { class: 'card soft', style: 'margin-top:16px' }, el('h4', null, '五大价值（《中国文物古迹保护准则》2015）× 世界遗产标准'),
      el('div', { class: 'grid2', style: 'gap:16px' },
        el('div', null, D.values5.map(v => el('p', { class: 'small', style: 'margin:0 0 6px' }, el('b', null, v.name + '：'), v.sub))),
        el('div', null, D.ouv.map(o => el('p', { class: 'small', style: 'margin:0 0 6px' }, el('b', null, o.code + ' '), o.zh)))),
      el('p', { class: 'muted small', style: 'margin:8px 0 0' }, '二级标签为示意，正式词表由课题组审定。'));
    s.appendChild(el('div', { class: 'split', style: 'grid-template-columns:1fr 1fr;margin-top:12px' }, el('div', null, form, ref), out));
    return s;
  }
})();
