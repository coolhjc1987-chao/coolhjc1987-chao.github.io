/* 第 2 节 · 打标签练习 */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el;
  const MOD = 'tag';
  function guide(step, items, doneMsg) {
    let h = DYH.progress.has(MOD, step) ? ui.hint(doneMsg, { done: true }) : ui.hint(items, { title: '怎么做' });
    return { node: h, done() { if (h.classList.contains('done')) return; const n = ui.hint(doneMsg, { done: true }); h.replaceWith(n); h = n; } };
  }
  DYH.parts = DYH.parts || {};
  DYH.parts['tag.spans'] = () => secSpans();
  DYH.parts['tag.relations'] = () => secRelations();
  const PICK = ['E25', 'E24', 'E22', 'E26', 'E27', 'E53', 'E21', 'E74', 'E12', 'E11', 'E6', 'E4', 'E52', 'E31', 'E55'];
  const NODES = [
    { n: '重开会通河', c: 'E11' }, { n: '筑戴村坝', c: 'E12' }, { n: '会通河', c: 'E25' }, { n: '戴村坝', c: 'E24' }, { n: '汶水', c: 'E26' },
    { n: '宋礼', c: 'E21' }, { n: '白英', c: 'E21' }, { n: '汶上', c: 'E53' }, { n: '南旺', c: 'E53' }, { n: '1411', c: 'E52' }
  ];
  const RELP = ['P31', 'P108', 'P14', 'P4', 'P7', 'P53', 'P9i', 'P46i', 'P2'];

  DYH.modules.tag = {
    title: '给原文打标签', steps: ['spans', 'relations'], next: 'archive',
    mount(box) {
      box.appendChild(ui.pageHead('第 2 节 · 打标签', '在一段志书文字上动手打标签', '五步法：圈名词认实体 → 查速查表定类 → 找动词连关系 → 挂类型词 → 记出处。这一节练前三步，后两步在第 3、4 节。'));
      box.appendChild(ui.html(`<div class="grid4">
        <div class="card soft"><span class="num">1</span><h4 style="margin-top:8px">圈名词 认实体</h4><p class="small muted" style="margin:0">要素、人物、地点、年代、文献，每个都是一个“实例”。</p></div>
        <div class="card soft"><span class="num">2</span><h4 style="margin-top:8px">查速查表 定类</h4><p class="small muted" style="margin:0">拿不准先标“待定”，不硬套。</p></div>
        <div class="card soft"><span class="num">3</span><h4 style="margin-top:8px">找动词 连关系</h4><p class="small muted" style="margin:0">“修建、主持、位于、记载”对应 P 属性；事件单独成一条。</p></div>
        <div class="card soft"><span class="num">4–5</span><h4 style="margin-top:8px">贴类型词 记出处</h4><p class="small muted" style="margin:0">标签只从词表选；每条写来源编码＋页码。</p></div></div>`));
      box.appendChild(secSpans());
      box.appendChild(secRelations());
    }
  };

  /* ---------- 标注片段 ---------- */
  function secSpans() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '练习一：点选片段，给它定类'));
    s.appendChild(el('p', { class: 'muted' }, '点击原文中带虚线的片段，在右侧选择它属于哪个类。全部标完后点“检查标注”。小心陷阱：有几个片段看起来像实体，其实不是你以为的那一类。'));
    const G = guide('spans', ['点击原文里带虚线的词（共 11 处），它会变黄', '在右侧面板选它属于哪个类，虚线变成彩色实线', '11 处都标完后点“检查标注”，答对 9 处即过关'], '已过关：注意那 4 个陷阱——官职、“重开”、籍贯、地点与遗址。');
    s.appendChild(G.node);
    const ans = DYH.state.tag.spans = DYH.state.tag.spans || {};
    let cur = null;
    const text = el('div', { class: 'srctext' });
    const segEls = {};
    D.sample.segments.forEach(sg => {
      if (!sg.id) { text.appendChild(document.createTextNode(sg.t)); return; }
      const sp = el('span', { class: 'span', style: 'border-bottom-style:dashed;border-bottom-color:#AEAEB2', on: { click: () => select(sg.id) } }, sg.t);
      segEls[sg.id] = sp; text.appendChild(sp);
    });
    const panel = el('div', { class: 'card', style: 'position:sticky;top:76px' });
    const fb = el('div', { style: 'margin-top:14px' });
    function colorOf(code) { const c = ui.cls(code); return c ? ({ thing: 'u-thing', actor: 'u-actor', place: 'u-place', time: 'u-time', period: 'u-time', event: 'u-event', doc: 'u-doc', type: 'u-doc' })[c.group] : ''; }
    function paint() {
      D.sample.segments.filter(x => x.id).forEach(sg => {
        const sp = segEls[sg.id]; const v = ans[sg.id];
        sp.className = 'span' + (v ? ' ' + colorOf(v) : '') + (cur === sg.id ? ' hl' : '');
        sp.style.borderBottomStyle = v ? 'solid' : 'dashed';
        sp.title = v ? v + ' ' + ui.cls(v).zh : '未标注';
      });
      const n = Object.keys(ans).length, total = D.sample.segments.filter(x => x.id).length;
      prog.textContent = `已标注 ${n} / ${total}`;
    }
    const prog = el('span', { class: 'muted small' });
    function select(id) {
      cur = id; const sg = D.sample.segments.find(x => x.id === id);
      panel.innerHTML = '';
      panel.appendChild(el('span', { class: 'eyebrow' }, '当前片段'));
      panel.appendChild(el('div', { style: 'font-family:var(--serif);font-size:26px;color:#1D1D1F;margin-bottom:10px' }, '“' + sg.t + '”'));
      const groups = [['物', ['E25', 'E24', 'E22', 'E26', 'E27']], ['地点 / 人', ['E53', 'E21', 'E74']], ['事件', ['E12', 'E11', 'E6']], ['时间', ['E4', 'E52']], ['其他', ['E31', 'E55']]];
      groups.forEach(([g, codes]) => {
        panel.appendChild(el('div', { class: 'small muted', style: 'margin-top:8px' }, g));
        panel.appendChild(el('div', null, codes.map(c => el('span', { class: 'choice' + (ans[id] === c ? ' on' : ''), title: ui.cls(c).hint, on: { click: () => { ans[id] = c; DYH.save(); paint(); select(id); } } }, c + ' ' + ui.cls(c).zh))));
      });
      if (ans[id]) panel.appendChild(el('p', { class: 'small', style: 'margin-top:12px' }, el('b', null, ans[id] + ' ' + ui.cls(ans[id]).zh + '：'), ui.cls(ans[id]).hint));
      paint();
    }
    panel.appendChild(el('div', { style: 'font-size:40px;line-height:1;margin-bottom:10px;color:var(--accent)' }, '←'));
    panel.appendChild(el('h3', null, '先点击左边原文中带虚线的词'));
    panel.appendChild(el('p', { class: 'muted' }, '颜色：青＝物，橙＝人，蓝＝地点，红＝时间，黑＝事件。'));
    function check() {
      fb.innerHTML = ''; let ok = 0; const items = D.sample.segments.filter(x => x.id);
      const list = el('div', { class: 'stack' });
      items.forEach(sg => {
        const v = ans[sg.id], right = v === sg.answer; if (right) ok++;
        list.appendChild(el('div', { class: 'callout ' + (right ? 'ok' : 'err'), style: 'padding:8px 12px' },
          el('b', null, '“' + sg.t + '” '), right ? '✓ ' : (v ? `✗ 你选了 ${v}，` : '✗ 未标注，'), sg.trap ? el('span', { class: 'badge b-mid', style: 'margin-right:6px' }, '陷阱') : null, sg.why));
      });
      fb.appendChild(el('h4', null, `答对 ${ok} / ${items.length}`));
      fb.appendChild(list);
      if (ok >= items.length - 2) { DYH.progress.mark(MOD, 'spans'); G.done(); ui.toast('练习一过关', 'ok'); } else ui.toast('看看下面的讲解，再改一改', 'warn');
    }
    const left = el('div', null, el('div', { class: 'row center', style: 'justify-content:space-between;margin-bottom:8px' }, el('span', { class: 'small muted' }, D.sample.sourceCode + ' · ' + D.sample.sourceTitle + ' · 第' + D.sample.page + '页（示意）'), prog), text,
      el('p', { class: 'small muted', style: 'margin-top:8px' }, D.sample.note),
      el('div', { style: 'margin-top:12px' }, el('button', { class: 'btn primary', on: { click: check } }, '检查标注'), el('button', { class: 'btn light', style: 'margin-left:8px', on: { click: () => { for (const k in ans) delete ans[k]; DYH.save(); fb.innerHTML = ''; paint(); } } }, '清空')), fb);
    s.appendChild(el('div', { class: 'split', style: 'grid-template-columns:3fr 2fr;margin-top:12px' }, left, panel));
    paint();
    if (!Object.keys(ans).length) setTimeout(() => ui.pulse(segEls.s3), 50);
    return s;
  }

  /* ---------- 连关系 ---------- */
  function secRelations() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '练习二：把实体连成关系（造句）'));
    s.appendChild(el('p', { class: 'muted' }, '为什么：关系表的每一行就是一句话。用原文里的事实造句，系统会检查语法，并和参考答案比对。参考答案共 6 句，找出至少 4 句过关。'));
    const G = guide('relations', ['选“主体—属性—客体”，造一句原文里说过的话', 'P14（由…执行）要在右边填角色，如“主持”“建议”', '点“添加这句”。和参考答案一致的会变绿；找到 4 句即过关，卡住了点“给个提示”'], '已过关：每一句都是关系表里的一行。');
    s.appendChild(G.node);
    const mine = DYH.state.tag.rels = DYH.state.tag.rels || [];
    const mk = () => el('select', null, NODES.map((t, i) => el('option', { value: i }, t.n + '（' + t.c + '）')));
    const sS = mk(), sO = mk(); sO.value = '2';
    const sP = el('select', null, RELP.map(c => el('option', { value: c }, c + ' ' + ui.prop(c).zh)));
    const role = el('input', { type: 'text', placeholder: '只有 P14 需要：主持 / 建议…' });
    const msg = el('div', { style: 'margin-top:10px' });
    const list = el('div', { class: 'stack', style: 'margin-top:12px' });
    const score = el('div', { class: 'small muted' });
    const key = r => r.s + '|' + r.p + '|' + r.o + '|' + (r.p === 'P14' ? (r.role || '') : '');
    const ref = D.sample.relations.map(r => ({ ...r, k: key(r) }));
    function render() {
      list.innerHTML = '';
      mine.forEach((r, i) => {
        const hit = ref.find(x => x.k === key(r));
        list.appendChild(el('div', { class: 'card flat', style: 'padding:10px 14px;display:flex;align-items:center;gap:10px;' + (hit ? 'border-color:var(--ok);background:var(--ok-soft)' : '') },
          el('b', null, r.s), ui.propTag(r.p, r.role), el('b', null, r.o), el('span', { class: 'grow' }),
          el('span', { class: 'small ' + (hit ? '' : 'muted') }, hit ? '✓ 与参考答案一致' : '语法正确，但不在参考答案中'),
          el('button', { class: 'btn ghost sm', on: { click: () => { mine.splice(i, 1); DYH.save(); render(); } } }, '删除')));
      });
      const found = ref.filter(x => mine.some(r => key(r) === x.k)).length;
      score.textContent = `已找到参考答案 ${found} / ${ref.length}`;
      if (found >= 4) { DYH.progress.mark(MOD, 'relations'); G.done(); }
    }
    function add() {
      const S = NODES[sS.value], O = NODES[sO.value], p = sP.value;
      const r = ui.checkTriple(S.c, p, O.c);
      msg.innerHTML = '';
      if (!r.ok) { msg.appendChild(el('div', { class: 'callout err' }, '✗ ' + r.msg)); return; }
      if (p === 'P14' && !role.value.trim()) { msg.appendChild(el('div', { class: 'callout warn' }, 'P14 必须写角色（P14.1）：这个人在事件里是主持、建议还是督办？')); return; }
      if (S.n === '戴村坝' && p === 'P53' && O.n === '汶上') { msg.appendChild(el('div', { class: 'callout err' }, '✗ 陷阱！语法没错，但事实错了：“汶上”是白英的籍贯，原文没说坝在汶上。')); return; }
      const rec = { s: S.n, p, o: O.n, role: p === 'P14' ? role.value.trim() : '' };
      if (mine.some(x => key(x) === key(rec))) { ui.toast('这句已经添加过了', 'warn'); return; }
      mine.push(rec); DYH.save(); render();
      const hit = ref.find(x => x.k === key(rec));
      msg.appendChild(el('div', { class: 'callout ' + (hit ? 'ok' : 'info') }, hit ? '✓ 好句子，和参考答案一致。' : '语法正确。不过参考答案里没有这一句——想想原文是否真的这么说。'));
    }
    function hint() {
      const miss = ref.find(x => !mine.some(r => key(r) === x.k));
      ui.modal('提示', miss ? `<p>试试用 <b>${ui.esc(miss.s)}</b> 作主体、属性 <b>${miss.p} ${ui.esc(ui.prop(miss.p).zh)}</b>${miss.role ? '，角色写“' + ui.esc(miss.role) + '”' : ''}。</p>` : '<p>参考答案都找到了！</p>');
    }
    const form = el('div', { class: 'card' },
      el('div', { class: 'grid4', style: 'gap:12px;grid-template-columns:2fr 2fr 2fr 1.5fr' },
        el('div', { class: 'field' }, el('label', null, '主体'), sS), el('div', { class: 'field' }, el('label', null, '属性'), sP), el('div', { class: 'field' }, el('label', null, '客体'), sO), el('div', { class: 'field' }, el('label', null, '角色（P14.1）'), role)),
      el('div', { style: 'margin-top:12px' }, el('button', { class: 'btn primary', id: 'rel-add', on: { click: add } }, '添加这句'), el('button', { class: 'btn light', style: 'margin-left:8px', on: { click: hint } }, '给个提示')), msg);
    s.appendChild(form);
    s.appendChild(el('div', { class: 'row center', style: 'justify-content:space-between;margin-top:18px' }, el('h4', { style: 'margin:0' }, '我的关系表'), score));
    s.appendChild(list);
    s.appendChild(ui.html(`<div class="callout info" style="margin-top:18px"><b>落到表格里：</b>练习一的每个实体 → 实体表一行；“重开”“筑”这类事件 → 事件表一行；练习二的每句话 → 关系表一行。正式工作中，这一步先由 AI 抽取候选，你来审核——见第 4 节。</div>`));
    render();
    return s;
  }
})();
