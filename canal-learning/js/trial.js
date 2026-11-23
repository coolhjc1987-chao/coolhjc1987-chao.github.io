/* 试用测试：7 步引导式向导 */
(function () {
  const ui = DYH.ui, el = ui.el, P = DYH.progress;
  const STEPS = [
    { id: 'classify', mod: 'learn', title: '分清“是哪一种”', short: '定类',
      desc: '标注的第一步是给东西归类。用口诀判断 16 样东西各属于哪个类。',
      goal: ['看一眼口诀：挖出来的 E25 · 建起来的 E24 · 搬得走的 E22 · 只是位置 E53', '给 16 张卡片各选一个类', '点“检查”，答对 14 项即完成'],
      parts: ['learn.classify'], done: () => P.has('learn', 'classify') },
    { id: 'spans', mod: 'tag', title: '在原文上打标签', short: '标原文',
      desc: '拿一段志书原文，圈出里面的实体，给每个实体定类。小心 4 个陷阱。',
      goal: ['点原文中带虚线的词', '在右侧选它的类', '11 处标完点“检查标注”，答对 9 处即完成'],
      parts: ['tag.spans'], done: () => P.has('tag', 'spans') },
    { id: 'relations', mod: 'tag', title: '把实体连成关系', short: '连关系',
      desc: '关系表的每一行就是一句话：主体 —属性→ 客体。系统会检查语法，并和参考答案比对。',
      goal: ['用下拉框造一句原文里说过的话', '点“添加这句”，绿色＝与参考答案一致', '找到 4 句与参考答案一致的关系'],
      parts: ['tag.relations'], extra: ['learn.builder'], extraTitle: '想多练？用造句器看看“错的句子”错在哪', done: () => P.has('tag', 'relations') },
    { id: 'archive', mod: 'archive', title: '给文件命名、归档', short: '命名归档',
      desc: '文件名里带编码，文件就算被拷来拷去也知道属于谁、是哪一版。',
      goal: ['在“检查任意文件名”里试一个合规的文件名', '把 8 个文件放进正确的文件夹，点“检查”', '文件名检查器里通过一个合规文件名，并把 8 个文件全部归档正确'],
      parts: ['archive.name', 'archive.sort'], extra: ['archive.code', 'archive.card'], extraTitle: '进阶：编码生成器、填一张元数据卡', done: () => P.has('archive', 'name') && P.has('archive', 'sort') },
    { id: 'review', mod: 'review', title: '审核 AI 的抽取结果', short: 'AI 审核',
      desc: 'AI 已经从原文抽出 7 条候选。你来逐条把关，再把通过的写进正式表。这是整套方法里最关键的一步。',
      goal: ['逐条判断：通过 / 修改 / 驳回 / 待定', '7 条判完后，点“对照专家参考答案”', '7 条都给出结论，再点“写入正式表”'],
      parts: ['review.bench', 'review.write'], extra: ['review.prompt', 'review.import', 'review.export'], extraTitle: '进阶：生成提示词、粘贴真实 AI 的回复、导出表格', done: () => P.has('review', 'review') && P.has('review', 'write') },
    { id: 'results', mod: 'results', title: '看看成果长什么样', short: '看成果',
      desc: '你刚写入的表格，会自动变成要素档案、知识图谱和 RDF 数据。',
      goal: ['在“要素档案”里换一个要素看看', '切到“知识图谱”，点一个节点', '“要素档案”“知识图谱”两个标签各看一次（RDF 和五张表可顺便看看）'],
      parts: ['results.view'], done: () => P.has('results', 'dossier') && P.has('results', 'graph') },
    { id: 'quiz', mod: 'quiz', title: '小测验', short: '测验',
      desc: '12 道题，检验你是否掌握了关键规则。每题都有讲解。',
      goal: ['点选答案，马上看讲解', '做完 12 题点“查看成绩”', '答对 9 题即完成'],
      parts: ['quiz.quiz'], extra: ['quiz.cheat'], extraTitle: '速查卡：遇到这种情况，这样记', done: () => P.has('quiz', 'quiz') }
  ];
  DYH.trialSteps = STEPS;
  DYH.trialGoto = function (mod) { const i = STEPS.findIndex(s => s.mod === mod); if (i >= 0) { DYH.state.trialStep = i; DYH.save(); } };

  let root = null, cur = 0;

  DYH.modules.trial = {
    title: '试用测试', full: true,
    mount(box) {
      root = box;
      cur = Math.min(DYH.state.trialStep || 0, STEPS.length);
      render();
      if (!(DYH.state.seen || {}).trialTour) setTimeout(tour, 300);
    }
  };

  DYH.onProgress(() => {
    if (!root || !document.body.contains(root)) return;
    const s = STEPS[cur]; if (!s) return;
    updateStatus();
    if (s.done() && !s._toasted) { s._toasted = true; ui.toast('本步完成！点右下角“下一步”继续', 'ok'); const nb = root.querySelector('#wz-next'); if (nb) ui.pulse(nb); }
  });

  function go(i) { cur = i; DYH.state.trialStep = i; DYH.save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function render() {
    root.innerHTML = '';
    const wrap = el('div', { class: 'wrap wide' });
    const wz = el('div', { class: 'wz' });
    wz.appendChild(side());
    wz.appendChild(cur >= STEPS.length ? finish() : main());
    wrap.appendChild(wz);
    root.appendChild(wrap);
    if (cur < STEPS.length) root.appendChild(foot());
    DYH.renderNav();
    setTimeout(() => ui.reveal(root), 20);
  }

  function side() {
    const s = el('aside', { class: 'wz-side' }, el('h4', null, '试用测试 · 7 步'));
    STEPS.forEach((st, i) => {
      const ok = st.done();
      s.appendChild(el('div', { class: 'wz-item' + (i === cur ? ' cur' : '') + (ok ? ' ok' : ''), on: { click: () => go(i) } },
        el('span', { class: 'c' }, ok ? '✓' : String(i + 1)), el('span', null, st.short)));
    });
    const all = STEPS.every(x => x.done());
    s.appendChild(el('div', { class: 'wz-item' + (cur === STEPS.length ? ' cur' : '') + (all ? ' ok' : ''), on: { click: () => go(STEPS.length) } }, el('span', { class: 'c' }, all ? '★' : '✦'), el('span', null, '完成')));
    s.appendChild(el('div', { style: 'margin:18px 12px 0' }, el('a', { href: 'javascript:void(0)', class: 'small', on: { click: tour } }, '怎么使用这个页面？')));
    return s;
  }

  function main() {
    const st = STEPS[cur];
    const m = el('div', { class: 'wz-main' });
    m.appendChild(el('div', { class: 'wz-head' }, el('div', { class: 'stepno' }, `第 ${cur + 1} 步，共 ${STEPS.length} 步`), el('h2', null, st.title), el('p', null, st.desc)));
    const status = el('span', { class: 'status', id: 'wz-status' });
    m.appendChild(el('div', { class: 'coach' }, el('div', { class: 'ic' }, '✎'), el('div', null, el('h4', null, '完成条件'), el('div', { style: 'font-size:15px' }, st.goal[st.goal.length - 1]), el('div', { class: 'small muted', style: 'margin-top:4px' }, '具体怎么做，看下方蓝色“怎么做”提示条；完成后它会变绿。')), status));
    const body = el('div', { class: 'wz-body' });
    st.parts.forEach(n => body.appendChild(ui.part(n)));
    if (st.extra) {
      const ex = el('div', { class: 'hidden' }); st.extra.forEach(n => ex.appendChild(ui.part(n)));
      const btn = el('button', { class: 'btn light', on: { click: () => { ex.classList.toggle('hidden'); btn.textContent = ex.classList.contains('hidden') ? '展开 · ' + st.extraTitle : '收起'; } } }, '展开 · ' + st.extraTitle);
      body.appendChild(el('div', { class: 'section', style: 'text-align:center' }, el('p', { class: 'small muted', style: 'margin-bottom:10px' }, '以下为可选内容，不影响本步完成'), btn));
      body.appendChild(ex);
    }
    m.appendChild(body);
    setTimeout(updateStatus, 0);
    return m;
  }

  function updateStatus() {
    const st = STEPS[cur]; if (!st) return;
    const ok = st.done();
    const s = root.querySelector('#wz-status'); if (s) { s.className = 'status' + (ok ? ' ok' : ''); s.textContent = ok ? '✓ 已完成' : '未完成'; }
    const nb = root.querySelector('#wz-next'); const tip = root.querySelector('#wz-tip');
    if (nb) { nb.disabled = !ok; nb.textContent = cur === STEPS.length - 1 ? '完成试用 →' : '下一步：' + STEPS[cur + 1].short + ' →'; }
    if (tip) tip.textContent = ok ? '做得好，可以继续了。' : '完成上方“本步任务”后，“下一步”会亮起。';
    root.querySelectorAll('.wz-item').forEach((it, i) => { if (STEPS[i]) { it.classList.toggle('ok', STEPS[i].done()); it.querySelector('.c').textContent = STEPS[i].done() ? '✓' : String(i + 1); } });
  }

  function foot() {
    const f = el('div', { class: 'wz-foot' });
    const dots = el('div', { class: 'row center', style: 'gap:6px' }, STEPS.map((s, i) => el('i', { style: `width:${i === cur ? 22 : 7}px;height:7px;border-radius:4px;background:${s.done() ? '#34C759' : i === cur ? 'var(--accent)' : 'var(--bg3)'};display:block;transition:all .3s` })));
    f.appendChild(el('div', { class: 'wrap' },
      el('button', { class: 'btn light', disabled: cur === 0 ? true : null, on: { click: () => go(cur - 1) } }, '← 上一步'),
      dots,
      el('span', { class: 'grow small muted', id: 'wz-tip', style: 'text-align:right' }),
      el('a', { href: 'javascript:void(0)', class: 'small', style: 'color:var(--text2)', on: { click: () => go(cur + 1) } }, '跳过'),
      el('button', { class: 'btn primary', id: 'wz-next', on: { click: () => go(cur + 1) } }, '下一步')));
    return f;
  }

  function finish() {
    const n = STEPS.filter(s => s.done()).length;
    const all = n === STEPS.length;
    const m = el('div', { class: 'wz-main' });
    m.appendChild(el('div', { class: 'tile ' + (all ? 'dark' : ''), style: 'text-align:center;padding:56px 32px' },
      el('div', { style: 'font-size:56px;line-height:1' }, all ? '★' : '✦'),
      el('div', { class: 'big' }, all ? '试用全部完成' : `已完成 ${n} / ${STEPS.length} 步`),
      el('p', { class: 'cap', style: 'max-width:560px;margin:0 auto 22px' }, all ? '你已经走完了从定类、打标签、命名归档到审核 AI、看成果的全流程。可以领取一个要素包开始正式工作了。' : '还有几步没完成，左侧灰色圆圈就是。也可以先去“方法介绍”下载模板。'),
      el('div', { class: 'row center', style: 'justify-content:center;gap:12px;flex-wrap:wrap' },
        all ? null : el('button', { class: 'btn primary', on: { click: () => go(STEPS.findIndex(s => !s.done())) } }, '去完成下一个未完成的步骤'),
        el('a', { class: 'btn ' + (all ? 'primary' : 'light'), href: '#/method' }, '下载模板与提示词'),
        el('button', { class: 'btn light', on: { click: () => go(0) } }, '从头再看一遍'))));
    m.appendChild(el('div', { class: 'grid3', style: 'margin-top:24px' }, STEPS.map((s, i) => el('div', { class: 'card flat', style: 'padding:16px 18px;cursor:pointer', on: { click: () => go(i) } },
      el('div', { class: 'small', style: 'color:' + (s.done() ? 'var(--ok)' : 'var(--text3)') + ';font-weight:600' }, (s.done() ? '✓ 已完成' : '未完成') + ' · 第 ' + (i + 1) + ' 步'), el('div', { style: 'font-weight:600;margin-top:4px' }, s.title)))));
    return m;
  }

  function tour() {
    const slides = [
      ['①', '7 步，每步一个小任务', '左侧是步骤列表。每一步都很短，按顺序做最快。'],
      ['②', '先看“本步任务”和蓝色提示条', '它们会告诉你点哪里、做到什么程度算完成。完成后提示条会变成绿色。'],
      ['③', '完成后，“下一步”才会亮起', '右下角的“下一步”在本步完成后解锁。实在卡住，可以点旁边的“跳过”。']
    ];
    let i = 0;
    const bg = el('div', { class: 'tour' });
    const close = () => { bg.remove(); DYH.state.seen = DYH.state.seen || {}; DYH.state.seen.trialTour = true; DYH.save(); };
    function draw() {
      const [n, t, d] = slides[i];
      bg.innerHTML = '';
      bg.appendChild(el('div', { class: 'box' },
        el('div', { class: 'art', style: 'color:var(--accent);font-weight:700' }, n), el('h3', null, t), el('p', null, d),
        el('div', { class: 'dots' }, slides.map((_, k) => el('i', { class: k === i ? 'on' : '' }))),
        el('div', { class: 'row center', style: 'justify-content:center;gap:10px' },
          el('button', { class: 'btn light', on: { click: close } }, '跳过介绍'),
          el('button', { class: 'btn primary', on: { click: () => { if (i < slides.length - 1) { i++; draw(); } else close(); } } }, i < slides.length - 1 ? '下一条' : '开始第 1 步'))));
    }
    bg.addEventListener('click', e => { if (e.target === bg) close(); });
    draw(); document.body.appendChild(bg);
  }
})();
