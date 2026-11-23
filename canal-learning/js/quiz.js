/* 第 6 节 · 测验与速查 */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el;
  const MOD = 'quiz';
  DYH.parts = DYH.parts || {};
  DYH.parts['quiz.quiz'] = () => secQuiz();
  DYH.parts['quiz.cheat'] = () => secCheat();
  DYH.parts['quiz.search'] = () => secSearch();
  const CHEAT = [
    ['“某闸建于某年”', '新建一条 E12 生产事件 → P108 生产了 该闸；P4 记年代'],
    ['“某年重修 / 疏浚”', 'E11 修改事件 → P31 修改了 该要素；每次单独一条'],
    ['“某段河道淤废”', '彻底消失用 E6 毁灭（P13）；变成别的东西用 E81 转化（P124 / P123）'],
    ['只知道朝代，不知年份', '事件 —P10 落在…之内→ 明代（E4 时期）'],
    ['一个要素有好几个名字', '都记 E41 名称：标准名用 P1，古称、别名用 P139 挂在名称上'],
    ['某闸属于某枢纽', '枢纽 —P46 由…组成→ 闸（反向 P46i）'],
    ['一张照片拍到了某要素', '照片（E36）—P138 表示→ 该要素；元数据卡“涉及要素”填编码'],
    ['专家认为它有某种价值', '价值表新增一条 E13 评估：写依据、判定人、日期'],
    ['两部志书说法不一', '各记一条，分别写来源，置信度标“存疑”'],
    ['速查表里找不到合适的类', '先标“待定”并写备注，交课题负责人裁决，不自行扩类'],
    ['原文“汶上老人白英”', '籍贯、官职里的地名不是工程位置，不建 P53']
  ];

  DYH.modules.quiz = {
    title: '测验与速查', steps: ['quiz'], next: 'guide',
    mount(box) {
      box.appendChild(ui.pageHead('第 6 节 · 测验与速查', '检验一下，然后把速查表放在手边', '12 道题，答对 9 道即过关。下面的速查表可以随时搜索。'));
      box.appendChild(secQuiz());
      box.appendChild(secCheat());
      box.appendChild(secSearch());
    }
  };

  function secQuiz() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '测验'));
    s.appendChild(DYH.progress.has(MOD, 'quiz') ? ui.hint('已过关！可以随时重新作答巩固一下。', { done: true }) : ui.hint(['点选一个答案，马上显示对错和讲解', '点“下一题”继续；12 题做完点“查看成绩”', '答对 9 题即过关'], { title: '怎么做' }));
    const st = DYH.state.quiz.ans = DYH.state.quiz.ans || {};
    let i = 0;
    const card = el('div', { class: 'card', style: 'max-width:820px' });
    const bar = el('div', { class: 'pbar', style: 'max-width:820px;margin-bottom:14px' }, el('i'));
    function render() {
      card.innerHTML = '';
      const q = D.quiz[i]; const picked = st[i];
      bar.firstChild.style.width = ((Object.keys(st).length) / D.quiz.length * 100) + '%';
      card.appendChild(el('span', { class: 'eyebrow' }, `第 ${i + 1} / ${D.quiz.length} 题`));
      card.appendChild(el('h3', null, q.q));
      const opts = el('div', { class: 'stack', style: 'margin-top:12px' });
      q.opts.forEach((o, k) => {
        let cls = 'choice'; if (picked != null) { if (k === q.a) cls += ' right'; else if (k === picked) cls += ' wrong'; }
        opts.appendChild(el('div', { class: cls, style: 'display:flex;margin:0;padding:10px 14px', on: { click: () => { if (st[i] != null) return; st[i] = k; DYH.save(); render(); } } }, String.fromCharCode(65 + k) + '. ' + o));
      });
      card.appendChild(opts);
      if (picked != null) card.appendChild(el('div', { class: 'callout ' + (picked === q.a ? 'ok' : 'err'), style: 'margin-top:12px' }, (picked === q.a ? '✓ 正确。' : '✗ 正确答案是 ' + String.fromCharCode(65 + q.a) + '。') + q.why));
      const nav = el('div', { class: 'row', style: 'margin-top:16px;justify-content:space-between' },
        el('button', { class: 'btn light', disabled: i === 0 ? true : null, on: { click: () => { i--; render(); } } }, '← 上一题'),
        i < D.quiz.length - 1 ? el('button', { class: 'btn primary', disabled: picked == null ? true : null, on: { click: () => { i++; render(); } } }, picked == null ? '先选一个答案' : '下一题 →') : el('button', { class: 'btn primary', on: { click: finish } }, '查看成绩'));
      card.appendChild(nav);
    }
    function finish() {
      const ok = D.quiz.filter((q, k) => st[k] === q.a).length, n = Object.keys(st).length;
      const pass = ok >= 9;
      if (pass) DYH.progress.mark(MOD, 'quiz');
      ui.modal('成绩', `<p style="font-size:22px">答对 <b>${ok}</b> / ${D.quiz.length}（已答 ${n} 题）</p><p>${pass ? '过关！可以开始正式工作了，记得先读“上手指南”。' : '还差一点。答错的题都附了讲解，建议回到对应小节再练一练。'}</p>`,
        [{ text: '重新作答', cls: 'light', onClick: () => { for (const k in st) delete st[k]; DYH.save(); i = 0; render(); } }, { text: '好的', cls: 'primary' }]);
    }
    s.appendChild(bar); s.appendChild(card);
    i = Math.min(Object.keys(st).length, D.quiz.length - 1);
    render();
    return s;
  }

  function secCheat() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '速查卡：遇到这种情况，这样记'));
    const t = el('table', { class: 'tbl' }, el('tr', null, el('th', { style: 'width:32%' }, '材料里写的'), el('th', null, '怎么记')));
    CHEAT.forEach(r => t.appendChild(el('tr', null, el('td', null, r[0]), el('td', null, r[1]))));
    s.appendChild(el('div', { class: 'tablewrap' }, t));
    s.appendChild(ui.html(`<div class="grid2" style="margin-top:18px">
      <div class="card soft"><h4>打标签 10 条规矩</h4><ol class="small" style="margin:0;padding-left:20px">
      <li>名称不是实体：“戴村坝”三个字是 E41，坝本身是 E24</li><li>地点不是遗址：E53 只是范围，E25 / E27 才有物质</li><li>事件要拆开：开凿、每次重修、每次疏浚各一条</li><li>年代用区间：只知“明代中期”就记范围</li><li>一处一码：所有表、所有文件只用一个编码</li><li>标签只从词表选</li><li>先用类型，不新建类</li><li>价值必有出处</li><li>矛盾说法并存，不自行取舍</li><li>拿不准就标“待定”</li></ol></div>
      <div class="card soft"><h4>提交前 8 项自检</h4><ol class="small" style="margin:0;padding-left:20px">
      <li>每个实体都有编码，且与编码表一致</li><li>每个实体都标了类和至少一个类型词</li><li>事件单独成行，至少有时间、地点、执行者之一</li><li>每条关系都写了来源编码和页码</li><li>类型词全部来自词表</li><li>每条价值都写了依据、判定人、日期</li><li>文件名符合规则，版本号已顺延</li><li>存疑项已标“待定”并写明疑问</li></ol></div></div>`));
    return s;
  }

  function secSearch() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '类与属性速查（可搜索）'));
    const q = el('input', { type: 'text', placeholder: '输入关键词：如 坝、位置、E53、执行、价值…', style: 'max-width:520px' });
    const out = el('div', { class: 'grid2', style: 'margin-top:14px' });
    function render() {
      const k = q.value.trim().toLowerCase();
      const hit = o => !k || JSON.stringify(o).toLowerCase().includes(k);
      out.innerHTML = '';
      const tc = el('table', { class: 'tbl' }, el('tr', null, el('th', null, '类'), el('th', null, '一句话'), el('th', null, '例子')));
      D.classes.filter(hit).forEach(c => tc.appendChild(el('tr', null, el('td', null, ui.classTag(c.code)), el('td', null, c.hint, c.doc ? el('div', { class: 'small muted' }, c.doc) : null), el('td', { class: 'small' }, c.ex))));
      const tp = el('table', { class: 'tbl' }, el('tr', null, el('th', null, '属性'), el('th', null, '主体 → 客体'), el('th', null, '什么时候用')));
      D.properties.filter(hit).forEach(p => tp.appendChild(el('tr', null, el('td', null, ui.propTag(p.code), el('div', { class: 'small muted' }, '反向：' + p.inv)), el('td', { class: 'small' }, p.domain.split('|').map(x => (ui.cls(x) ? ui.cls(x).zh : D.superNames[x] || x)).join('/') + ' → ' + p.range.split('|').map(x => (ui.cls(x) ? ui.cls(x).zh : D.superNames[x] || x)).join('/')), el('td', { class: 'small' }, p.use))));
      out.appendChild(el('div', { class: 'tablewrap' }, tc));
      out.appendChild(el('div', { class: 'tablewrap' }, tp));
    }
    q.addEventListener('input', render);
    s.appendChild(q); s.appendChild(out); render();
    return s;
  }
})();
