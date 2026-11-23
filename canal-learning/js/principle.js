/* 原理介绍：苹果式滚动叙事 */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el;

  DYH.modules.principle = {
    title: '原理介绍', full: true,
    mount(box) {
      box.appendChild(hero());
      box.appendChild(chWords());
      box.appendChild(chNouns());
      box.appendChild(chVerbs());
      box.appendChild(chEvent());
      box.appendChild(chValue());
      box.appendChild(chGlossary());
      box.appendChild(chNext());
    }
  };

  const chapter = (cls, id, ...kids) => el('section', { class: 'chapter ' + (cls || ''), id }, el('div', { class: 'wrap' }, kids));
  const head = (kicker, title, sub, center) => el('div', { class: 'reveal' + (center ? ' center' : '') }, el('span', { class: 'kicker' }, kicker), el('h2', { class: 'headline' }, title), sub ? el('p', { class: 'subhead' }, sub) : null);

  function hero() {
    const toc = [['#p-words', '三个词'], ['#p-nouns', '名词＝类'], ['#p-verbs', '动词＝属性'], ['#p-event', '以事件为中心'], ['#p-value', '价值＝评估'], ['#p-gloss', '译本避坑']];
    return el('section', { class: 'hero', style: 'padding-bottom:64px' }, el('div', { class: 'wrap' },
      el('span', { class: 'kicker' }, '原理介绍 · 约 10 分钟'),
      el('h1', null, 'CIDOC CRM，', el('br'), el('span', { class: 'grad' }, '是一套记录事实的语法。')),
      el('p', { class: 'lead' }, '不用读完 279 页的标准。认识三个词、转一个弯，就能看懂后面所有表格。往下滚动，一屏讲一件事。'),
      el('div', { class: 'row center', style: 'justify-content:center;gap:8px;flex-wrap:wrap;margin-top:8px' },
        toc.map(([h, t], i) => el('a', { class: 'btn light sm', href: 'javascript:void(0)', on: { click: () => document.querySelector(h).scrollIntoView({ behavior: 'smooth' }) } }, String(i + 1).padStart(2, '0') + ' ' + t)))));
  }

  /* 01 三个词 */
  function chWords() {
    const w = [
      ['名词', '类', 'E 开头', '“这是哪一种东西”', '戴村坝 是一个 E24 实体人造物', 'var(--c-thing)'],
      ['动词', '属性', 'P 开头', '“它和谁是什么关系”，有方向', '戴村坝 —P53 具有位置→ 东平县', 'var(--accent)'],
      ['形容词', '类型', 'E55', '从词表里选的标签，只能选不能造', '戴村坝 —P2 具有类型→ 坝', 'var(--c-value)']
    ];
    return chapter('', 'p-words', head('01 · 三个词', '三个词，就够了。', '所有标注都是在“造句”：用名词说是什么，用动词说什么关系，用形容词贴标签。', true),
      el('div', { class: 'grid3', style: 'margin-top:48px' }, w.map(([a, b, c, d, e, col], i) => el('div', { class: 'tile reveal', style: 'transition-delay:' + i * 90 + 'ms;min-height:280px' },
        el('div', { style: `font-size:15px;font-weight:600;color:${col}` }, c),
        el('div', { class: 'big' }, a, el('span', { style: 'color:var(--text3);font-weight:500' }, ' ＝ '), b),
        el('p', { class: 'cap' }, d),
        el('div', { style: 'margin-top:22px;padding-top:16px;border-top:1px solid var(--bg3);font-size:15px' }, el('span', { class: 'muted small' }, '例　'), e)))));
  }

  /* 02 名词＝类 */
  function chNouns() {
    const m = [
      ['挖出来的', 'E25', '人工特征', '河道、引河、月河、堤防', '文档以“曼彻斯特船运运河”为示例'],
      ['建起来的', 'E24', '实体人造物', '闸、坝、桥、码头、衙署建筑', '文档以福斯铁路桥、斗兽场为示例'],
      ['搬得走的', 'E22', '人造物', '碑、石构件、器物、铁牛', '有清晰的物理边界，可以移动'],
      ['只是位置', 'E53', '地点', '东平县、坐标范围、行政区', '纯空间，不含物质']
    ];
    const tiles = m.map(([k, c, zh, ex, doc], i) => {
      const back = el('div', { class: 'hidden' }, el('p', { style: 'font-size:17px;margin:10px 0 6px' }, el('b', null, '例：'), ex), el('p', { class: 'cap' }, doc));
      const hint = el('span', { class: 'link-arrow', style: 'font-size:15px' }, '点开看例子');
      const t = el('div', { class: 'tile click reveal', style: 'transition-delay:' + i * 70 + 'ms', on: { click: () => { back.classList.toggle('hidden'); hint.textContent = back.classList.contains('hidden') ? '点开看例子' : '收起'; } } },
        el('div', { class: 'big', style: 'font-size:34px' }, k),
        el('div', { style: 'margin:6px 0 4px' }, ui.classTag(c)), back, hint);
      return t;
    });
    const others = ['E26', 'E27', 'E21', 'E74', 'E12', 'E11', 'E4', 'E52', 'E31', 'E36', 'E55'];
    return chapter('gray', 'p-nouns', head('02 · 名词＝类', '先分清它是哪一种。', '定错类，后面的关系就全错。记住四句口诀，覆盖九成的运河要素。'),
      el('div', { class: 'grid4', style: 'margin-top:40px' }, tiles),
      el('div', { class: 'reveal', style: 'margin-top:36px' }, el('p', { class: 'muted', style: 'margin-bottom:10px' }, '其他常用的类（鼠标停在标签上看说明）：'),
        el('div', { class: 'row wrap-row', style: 'gap:8px' }, others.map(c => ui.classTag(c)))),
      el('div', { class: 'reveal', style: 'margin-top:28px' }, ui.hint('最容易混的一对：E53 地点是纯空间，E27 场址是地面上实实在在的遗址。一个遗址点通常两者都要，用 P53 连起来。', { icon: '!' })));
  }

  /* 03 动词＝属性 */
  function chVerbs() {
    const sent = el('div', { class: 'row center', style: 'justify-content:center;gap:18px;flex-wrap:wrap;font-size:34px;font-weight:700;margin:40px 0 18px' });
    const cap = el('p', { class: 'subhead center', style: 'text-align:center;margin:0 auto' });
    const seg = el('div', { class: 'seg' });
    const draw = rev => {
      sent.innerHTML = '';
      const a = el('span', null, rev ? '东平县' : '戴村坝'), b = el('span', null, rev ? '戴村坝' : '东平县');
      const p = el('span', { class: 'tag t-prop', style: 'font-size:20px;padding:6px 18px' }, rev ? 'P53i 是…的位置' : 'P53 具有位置');
      sent.append(a, el('span', { style: 'color:var(--text3)' }, '—'), p, el('span', { style: 'color:var(--text3)' }, '→'), b);
      cap.textContent = rev ? '反向读：在编号后加 i。意思完全一样，只是换了主语。' : '正向读：从主体读到客体。每个属性都有方向。';
      seg.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', i === (rev ? 1 : 0)));
    };
    seg.append(el('button', { on: { click: () => draw(false) } }, '正向读'), el('button', { on: { click: () => draw(true) } }, '反向读'));
    draw(false);
    const props = ['P14', 'P108', 'P31', 'P53', 'P70', 'P138'].map(c => ui.prop(c));
    return chapter('', 'p-verbs', head('03 · 动词＝属性', '一句话，有方向。', '属性规定了谁能当主语、谁能当宾语。比如“生产了”的主语只能是一次新建活动，不能是一个人。', true),
      el('div', { class: 'reveal center', style: 'text-align:center;margin-top:28px' }, seg, sent, cap),
      el('div', { class: 'grid3 reveal', style: 'margin-top:48px' }, props.map(p => el('div', { class: 'card flat', style: 'padding:18px 20px' }, ui.propTag(p.code), el('p', { style: 'margin:10px 0 0;font-size:15px' }, p.use)))),
      el('p', { class: 'center muted reveal', style: 'text-align:center;margin-top:24px' }, '在“试用测试”第 3 步，有一个造句器会替你检查每句话合不合规则。'));
  }

  /* 04 以事件为中心 */
  function chEvent() {
    const part = ui.part('learn.event');
    part.querySelectorAll(':scope > h2, :scope > p.muted').forEach(n => n.remove());
    part.classList.add('reveal');
    return chapter('gray', 'p-event', head('04 · 以事件为中心', '转一个弯：先有事件，再有东西。', '不直接写“戴村坝建于 1411 年”，而是写“有一次修建活动：它生产了戴村坝，时间 1411，执行者白英（建议）”。这样开凿、多次重修、疏浚都能并列记录，互不覆盖。'), part);
  }

  /* 05 价值＝评估 */
  function chValue() {
    const svg = `<svg viewBox="0 0 760 380" style="width:100%;height:auto;display:block" role="img" aria-label="价值评估 E13 示意">
      ${[[130, 70, 'P140 分配给', '戴村坝'], [630, 70, 'P141 分配了', '科学价值'], [130, 310, 'P14 由…执行', '判定人'], [630, 310, 'P16 依据', '志书条目'], [380, 340, 'P4 时间', '评估日期']].map(([x, y, p, t]) =>
        `<line x1="380" y1="190" x2="${x}" y2="${y}" stroke="#D2D2D7" stroke-width="2"/><rect x="${x - 95}" y="${y - 30}" width="190" height="60" rx="16" fill="#fff" stroke="#E8E8ED"/><text x="${x}" y="${y - 4}" text-anchor="middle" font-size="13" fill="#0071E3" font-family="Menlo,monospace">${p}</text><text x="${x}" y="${y + 18}" text-anchor="middle" font-size="17" font-weight="600" fill="#1D1D1F">${t}</text>`).join('')}
      <rect x="285" y="145" width="190" height="90" rx="22" fill="#B8460B"/><text x="380" y="183" text-anchor="middle" font-size="14" fill="#FDE3D2">E13 属性分配</text><text x="380" y="212" text-anchor="middle" font-size="21" font-weight="700" fill="#fff">一次价值评估</text></svg>`;
    return chapter('', 'p-value', head('05 · 价值＝评估', '价值，是一次可追溯的评估。', '位置是事实，只有一个；价值是判断，可以有多位专家、多部文献的不同意见。所以价值不直接贴在要素上，而是记成一次评估：判给谁、判了什么、谁判的、依据什么、什么时候。', true),
      el('div', { class: 'tile reveal', style: 'margin-top:40px;padding:28px 36px' }, ui.html(svg)),
      el('div', { class: 'grid3 reveal', style: 'margin-top:24px' },
        el('div', null, el('h3', null, '多条意见并存'), el('p', { class: 'muted' }, '不同专家、不同文献的判断各记一条，互不覆盖。')),
        el('div', null, el('h3', null, '随时能追问出处'), el('p', { class: 'muted' }, '汇报、评审时能回答“这个说法依据什么、谁说的”。')),
        el('div', null, el('h3', null, 'AI 只提候选'), el('p', { class: 'muted' }, '价值必须由判定人确认依据后入库。'))),
      el('div', { class: 'reveal', style: 'margin-top:20px' }, el('p', { class: 'small muted' }, '价值框架：《中国文物古迹保护准则》（2015）的历史、艺术、科学、社会、文化五大价值，并行对照大运河列入世界遗产的标准 (i)(iii)(iv)(vi)。')));
  }

  /* 06 译本避坑 */
  function chGlossary() {
    const t = el('table', { class: 'tbl' }, el('tr', null, el('th', null, '译本里写的'), el('th', null, '应理解为'), el('th', null, '英文原词')));
    D.glossary.forEach(r => t.appendChild(el('tr', null, el('td', null, r[0]), el('td', null, el('b', null, r[1])), el('td', { class: 'muted' }, r[2]))));
    return chapter('gray', 'p-gloss', head('06 · 译本避坑', '读到“演员”，请想成“行动者”。', '中文译本有不少机器翻译的痕迹。拿不准时，以英文编号为准——编号是唯一不会被翻译坏的东西。'),
      el('div', { class: 'tablewrap reveal', style: 'margin-top:32px;max-width:820px' }, t));
  }

  function chNext() {
    return el('section', { class: 'chapter dark' }, el('div', { class: 'wrap center', style: 'text-align:center' },
      el('h2', { class: 'headline reveal' }, '原理就这么多。'),
      el('p', { class: 'subhead reveal' }, '接下来看看团队每天怎么用：AI 先抽、人来把关，以及最终交付什么。'),
      el('div', { class: 'row center reveal', style: 'justify-content:center;gap:14px;margin-top:28px;flex-wrap:wrap' },
        el('a', { class: 'btn primary lg', href: '#/method' }, '下一部分：方法介绍'),
        el('a', { class: 'btn lg', style: 'background:#2C2C2E', href: '#/trial' }, '直接去试用'))));
  }
})();
