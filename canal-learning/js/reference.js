/* 原文对照：CIDOC CRM 7.2.3 全部类与属性的“译本 × 解读”对照学习 */
(function () {
  const ui = DYH.ui, el = ui.el;
  const R = window.DYH_CRM || { classes: [], properties: [] };
  const C = R.classes, P = R.properties;
  const byC = Object.fromEntries(C.map(c => [c.code, c]));
  const byP = Object.fromEntries(P.map(p => [p.code, p]));
  const LV = { 1: ['核心', 'b-high'], 2: ['常用', 'b-mid'], 3: ['了解', ''] };
  const G = { root: ['根', 't-type'], thing: ['物', 't-thing'], event: ['事件', 't-event'], actor: ['人 / 机构', 't-actor'], place: ['地点 / 时空', 't-place'], time: ['时间', 't-time'], concept: ['概念 / 信息', 't-doc'], name: ['名称 / 编码', 't-type'], value: ['数值', 't-type'] };
  const FIX = [['本课程', '本类'], ['该课程', '该类'], ['此课程', '此类'], ['本课', '本类'], ['演员', '行动者'], ['周期', '时期'], ['网站', '场址'], ['守门员', '保管者'], ['精选持仓', '策展收藏'], ['创世', '创造'], ['时空卷', '时空体'], ['细绳', '字符串'], ['太空原始形态', '空间原语'], ['右侧', '权利'], ['地层', '组建']];
  const st = DYH.state.ref = DYH.state.ref || { fix: true, kind: 'E', lvl: 0, q: '', sel: 'E25' };

  DYH.modules.reference = {
    title: '原文对照', full: true,
    mount(box) {
      box.appendChild(hero());
      box.appendChild(chAnatomy());
      box.appendChild(chRoute());
      box.appendChild(chBrowser());
      box.appendChild(chTree());
      box.appendChild(chExt());
      box.appendChild(el('section', { class: 'chapter dark' }, el('div', { class: 'wrap center', style: 'text-align:center' },
        el('h2', { class: 'headline reveal' }, '读懂原文，再动手。'),
        el('p', { class: 'subhead reveal' }, '原文是依据，解读是捷径。遇到拿不准的类或属性，回到这里查。'),
        el('div', { class: 'row center reveal', style: 'justify-content:center;gap:14px;margin-top:28px' }, el('a', { class: 'btn primary lg', href: '#/trial' }, '去试用测试'), el('a', { class: 'btn lg', style: 'background:#2C2C2E', href: '#/method' }, '回到方法介绍')))));
    }
  };

  /* ---------- 工具 ---------- */
  const fixText = s => {
    let h = ui.esc(s);
    if (!st.fix) return h;
    FIX.forEach(([a, b]) => { h = h.split(a).join(`<mark class="fx" title="译本原文：${a}">${b}</mark>`); });
    return h;
  };
  const linkify = h => h.replace(/\b([EP]\d{1,3}i?)\b/g, (m, c) => (byC[c] || byP[c.replace(/i$/, '')]) ? `<a href="javascript:void(0)" class="xref" data-c="${c.replace(/i$/, '')}">${m}</a>` : m);
  const nameOf = c => byC[c] ? byC[c].zh : (byP[c] ? (byP[c].zh || byP[c].tzh) : '');
  const chip = code => el('a', { href: 'javascript:void(0)', class: 'tag ' + (byC[code] ? G[byC[code].g][1] : 't-prop'), style: 'text-decoration:none;cursor:pointer', on: { click: () => openEntry(code, true) } }, code + ' ' + nameOf(code));
  const chapter = (cls, id, ...kids) => el('section', { class: 'chapter ' + (cls || ''), id }, el('div', { class: 'wrap' }, kids));
  const head = (kicker, title, sub, center) => el('div', { class: 'reveal' + (center ? ' center' : '') }, el('span', { class: 'kicker' }, kicker), el('h2', { class: 'headline' }, title), sub ? el('p', { class: 'subhead' }, sub) : null);
  function injectCss() {
    if (document.getElementById('ref-css')) return;
    document.head.appendChild(el('style', { id: 'ref-css' }, `
      mark.fx{background:#E8F2FD;color:#00458C;border-radius:4px;padding:0 2px}
      a.xref{font-family:var(--mono);font-size:.92em;color:var(--accent);background:var(--accent-soft);border-radius:5px;padding:0 4px;text-decoration:none}
      .rb{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:24px;align-items:start}
      @media(max-width:980px){.rb{grid-template-columns:1fr}}
      .rlist{background:#fff;border-radius:20px;border:1px solid var(--bg3);max-height:760px;overflow:auto}
      .ritem{display:grid;grid-template-columns:64px 1fr auto;gap:10px;padding:12px 16px;border-bottom:1px solid var(--bg2);cursor:pointer;align-items:center}
      .ritem:hover{background:#FAFAFC}.ritem.on{background:var(--accent-soft)}
      .ritem .cd{font-family:var(--mono);font-weight:600;font-size:14px}
      .ritem .nm{font-weight:600;font-size:15px}.ritem .en{font-size:12px;color:var(--text3)}
      .ritem .one{font-size:13px;color:var(--text2);grid-column:2/4;line-height:1.5;margin-top:-4px}
      .rdetail{position:sticky;top:70px;background:#fff;border-radius:22px;border:1px solid var(--bg3);box-shadow:var(--shadow);padding:26px 28px;max-height:calc(100vh - 90px);overflow:auto}
      .rsec{margin-top:20px}.rsec h4{font-size:13px;color:var(--text2);font-weight:600;margin:0 0 8px;letter-spacing:.02em}
      .rsec p{font-size:15px;line-height:1.75;margin:0 0 8px}
      .ourread{background:linear-gradient(135deg,#F0F7FF,#F3FAF9);border-radius:16px;padding:16px 18px}
      .ourread b{color:var(--text)}
      .anat{display:grid;grid-template-columns:150px 1fr;gap:0;border-radius:16px;overflow:hidden;border:1px solid var(--bg3);background:#fff}
      .anat > div{padding:12px 16px;border-bottom:1px solid var(--bg2);font-size:15px}
      .anat .k{background:var(--bg2);font-weight:600;font-size:14px}
      .anat .trap{color:var(--c-time);font-size:12px;font-weight:600;display:block}
      .tree{font-size:14px;line-height:1.9;background:#fff;border-radius:20px;border:1px solid var(--bg3);padding:20px 24px;max-height:640px;overflow:auto}
      .tree ul{list-style:none;margin:0;padding-left:22px;border-left:1px dashed var(--sep)}
      .tree > ul{border-left:none;padding-left:0}
      .tree .tg{cursor:pointer;color:var(--text3);display:inline-block;width:16px}
      .tree a{color:var(--text);text-decoration:none;cursor:pointer}.tree a:hover{color:var(--accent)}
      .tree .lv1{font-weight:700}
      .ext .tile{display:flex;flex-direction:column;gap:6px}
      .ext .rec{font-size:13px;font-weight:700;padding:2px 10px;border-radius:980px;align-self:flex-start}
    `));
  }

  /* ---------- 首屏 ---------- */
  function hero() {
    injectCss();
    const n1 = C.filter(c => c.lvl === 1).length + P.filter(p => p.lvl === 1).length;
    return el('section', { class: 'hero', style: 'padding-bottom:64px' }, el('div', { class: 'wrap' },
      el('span', { class: 'kicker' }, '原文对照 · CIDOC CRM 7.2.3 中文译本'),
      el('h1', null, '81 个类，161 个属性。', el('br'), el('span', { class: 'grad' }, '每一条都能查到原文。')),
      el('p', { class: 'lead' }, '把 279 页的译本拆成一本可搜索的字典：左边是译本原文，右边是课题组的白话解读和大运河用法。先学会读一条定义，再按“精读路线”读最常用的几条。'),
      el('div', { class: 'grid3', style: 'max-width:720px;margin:10px auto 26px;text-align:center' },
        [['81', '类（E）'], ['161', '属性（P）'], [String(n1), '标为“核心”']].map(([a, b]) => el('div', null, el('div', { class: 'num', style: 'font-size:44px' }, a), el('div', { class: 'muted small' }, b)))),
      el('div', { class: 'row center', style: 'justify-content:center;gap:8px;flex-wrap:wrap' },
        [['#r-anat', '怎么读一条定义'], ['#r-route', '精读路线'], ['#r-browse', '全部类与属性'], ['#r-tree', '类层级树'], ['#r-ext', '扩展家族与建议']].map(([h, t], i) => el('a', { class: 'btn light sm', href: 'javascript:void(0)', on: { click: () => document.querySelector(h).scrollIntoView({ behavior: 'smooth' }) } }, String(i + 1).padStart(2, '0') + ' ' + t)))));
  }

  /* ---------- 01 怎么读一条定义 ---------- */
  function chAnatomy() {
    const e = byC.E25 || {};
    const cRows = [
      ['编号与名称', 'E25 人工特征（Human-Made Feature）', '编号是唯一不会被翻译坏的东西，拿不准时以编号和英文为准。'],
      ['上位类', (e.sup || []).join('、') + '（E24 实体人造物、E26 物理特征）', '译本标成“子类：”——原意是 Subclass of（是谁的子类），即它的上位类。', true],
      ['下位类', (e.sub || []).length ? e.sub.join('、') : '无', '译本标成“所属超类：”——原意是 Superclass of，即它下面还有哪些类。', true],
      ['范围说明', (e.scope || [''])[0], '英文 Scope note。最重要的一段：它决定一个东西算不算这个类。'],
      ['示例', (e.ex || []).slice(0, 2).join('　'), '官方给的例子。E25 第一个例子就是一条运河。'],
      ['一阶逻辑', (e.fol || []).join('　'), '形式化约束。E25(x) ⇒ E24(x) 读作“凡是 E25，必是 E24”。不用背。'],
      ['属性', '无本类专有属性（继承上位类的全部属性）', '类“能用哪些动词”。子类自动继承父类的所有属性。']
    ];
    const pRows = [
      ['编号与名称', 'P108 生产了（has produced）', '括号里是反向读法：was produced by（由…生产）。'],
      ['定义域', 'E12 生产', '译本写“领域:”——原意 Domain，即主语必须是什么类。', true],
      ['值域', 'E24 实体人造物', '译本写“范围：”——原意 Range，即宾语必须是什么类。注意别和“范围说明”混淆。', true],
      ['上位属性', 'P31 修改了、P92 使…开始存在', '译本写“子属性：”——原意 Subproperty of。', true],
      ['量化', '一对多、必需、依赖型 (1，n:1,1)', '括号前半是主语一侧的数量，后半是宾语一侧：每次生产至少产出 1 个物，每个物只能有 1 次生产。']
    ];
    const tbl = rows => el('div', { class: 'anat' }, rows.map(([k, v, n, trap]) => [el('div', { class: 'k' }, k), el('div', null, el('div', null, v), el('div', { class: 'small muted', style: 'margin-top:4px' }, trap ? el('span', { class: 'trap' }, '⚠ 译本标签易误读') : null, n))]));
    return chapter('gray', 'r-anat', head('01 · 怎么读一条定义', '每一条定义，都是同一个格式。', '以 E25（运河所属的类）和 P108 为例。译本有几个标签译反了——读原文前先记住它们。'),
      el('div', { class: 'grid2 reveal', style: 'margin-top:36px;align-items:start' },
        el('div', null, el('h3', null, '一个类（E）'), tbl(cRows)),
        el('div', null, el('h3', null, '一个属性（P）'), tbl(pRows),
          el('div', { style: 'margin-top:16px' }, ui.hint(['“子类 / 所属超类”“子属性 / 超属性”在译本里方向相反：读到“子类：E24”，意思是“我是 E24 的子类”', '“范围：”＝值域（Range），“范围说明：”＝定义（Scope note），两者不是一回事', '“领域:”＝定义域（Domain）；“量化：”＝数量约束'], { title: '三个最容易读错的地方', icon: '!' })))));
  }

  /* ---------- 02 精读路线 ---------- */
  function chRoute() {
    const route = [
      ['E1', '一切的根：名称、类型、备注从这里来'], ['E18', '有物质的东西：闸坝、河道、文物的共同上位'], ['E24', '人造物：闸、坝、桥、建筑'], ['E25', '人工地形：河道、堤——运河本身'], ['E22', '可移动的人造物：碑、构件'],
      ['E27', '遗址点'], ['E53', '纯空间：别和遗址混'], ['E7', '有意图的活动：P14 的前提'], ['E11', '修改：重修、疏浚'], ['E12', '生产：新建、开凿'],
      ['E13', '属性分配：价值评估的写法'], ['E55', '类型：整套词表的家'],
      ['P2', '贴类型标签'], ['P14', '谁执行'], ['P108', '新建出了什么'], ['P31', '修改了什么'], ['P53', '在哪里'], ['P46', '整体与部件'], ['P70', '文档记载'], ['P140', '评估给谁'], ['P141', '评估出什么']
    ];
    return chapter('', 'r-route', head('02 · 精读路线', '先读这 21 条，够用九成。', '按顺序点开，每条读“我们的解读”，再对照下面的译本原文。读过的会打勾。', true),
      el('div', { class: 'grid3 reveal', style: 'margin-top:36px' }, route.map(([c, d], i) => {
        const done = (st.read || {})[c];
        return el('div', { class: 'card flat click', style: 'padding:14px 18px;display:flex;gap:12px;align-items:center', on: { click: () => openEntry(c, true) } },
          el('span', { style: `flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;${done ? 'background:#34C759;color:#fff' : 'background:var(--bg2)'}` }, done ? '✓' : String(i + 1)),
          el('div', null, el('div', { style: 'font-weight:600' }, el('span', { class: 'mono' }, c), ' ', nameOf(c)), el('div', { class: 'small muted' }, d)));
      })));
  }

  /* ---------- 03 字典 ---------- */
  let listBox, detailBox;
  function chBrowser() {
    const q = el('input', { type: 'text', placeholder: '搜索编号、中文、英文或原文内容：如 E24、运河、location、价值', value: st.q || '' });
    const seg = el('div', { class: 'seg' });
    const lv = el('div', { class: 'seg' });
    const fixT = el('label', { class: 'small', style: 'display:flex;gap:6px;align-items:center;cursor:pointer' }, el('input', { type: 'checkbox', checked: st.fix ? true : null, on: { change: e => { st.fix = e.target.checked; DYH.save(); renderDetail(); } } }), '校正常见误译（蓝底为校正处，鼠标悬停看译本原文）');
    [['E', '类 E · 81'], ['P', '属性 P · 161']].forEach(([k, t]) => seg.appendChild(el('button', { class: st.kind === k ? 'on' : '', on: { click: () => { st.kind = k; DYH.save(); seg.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === (k === 'E' ? 0 : 1))); renderList(); } } }, t)));
    [[0, '全部'], [1, '核心'], [2, '常用'], [3, '了解']].forEach(([k, t]) => lv.appendChild(el('button', { class: st.lvl === k ? 'on' : '', on: { click: () => { st.lvl = k; DYH.save(); lv.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === k)); renderList(); } } }, t)));
    q.addEventListener('input', () => { st.q = q.value; DYH.save(); renderList(); });
    listBox = el('div', { class: 'rlist' });
    detailBox = el('div', { class: 'rdetail' });
    const s = chapter('gray', 'r-browse', head('03 · 全部类与属性', '一本可以搜索的字典。', '左边筛选、点选；右边看“我们的解读”和译本原文。正文里的 E / P 编号都可以点，直接跳过去。'),
      el('div', { class: 'reveal', style: 'margin-top:28px' }, ui.hint(['先在上方切换“类 / 属性”，选“核心”只看项目必用的', '点左侧任意一条，右侧显示完整定义', '右侧蓝色编号可以点，顺着上位类、属性一路读下去'], { title: '怎么用' })),
      el('div', { class: 'row wrap-row', style: 'gap:12px;margin:16px 0;align-items:center' }, seg, lv, el('div', { class: 'grow', style: 'min-width:280px' }, q), fixT),
      el('div', { class: 'rb' }, listBox, detailBox));
    renderList(); renderDetail();
    return s;
  }
  function items() {
    const k = (st.q || '').trim().toLowerCase();
    const src = st.kind === 'E' ? C : P;
    return src.filter(x => (!st.lvl || x.lvl === st.lvl) && (!k || [x.code, x.zh, x.tzh, x.en, x.plain, x.canal, (x.scope || []).join('')].join(' ').toLowerCase().includes(k)));
  }
  function renderList() {
    if (!listBox) return;
    const xs = items();
    listBox.innerHTML = '';
    listBox.appendChild(el('div', { class: 'small muted', style: 'padding:10px 16px;border-bottom:1px solid var(--bg2);position:sticky;top:0;background:#fff;z-index:1' }, `共 ${xs.length} 条`));
    xs.forEach(x => {
      const [lt, lc] = LV[x.lvl];
      const one = x.plain || (x.scope && x.scope[0] ? x.scope[0].slice(0, 46) + '…' : (x.missing ? '译本中未找到此条' : ''));
      const it = el('div', { class: 'ritem' + (st.sel === x.code ? ' on' : ''), on: { click: () => openEntry(x.code) } },
        el('span', { class: 'cd' }, x.code), el('div', null, el('div', { class: 'nm' }, x.zh || x.tzh, ' ', (st.read || {})[x.code] ? el('span', { style: 'color:#34C759' }, '✓') : null), el('div', { class: 'en' }, x.en)),
        el('span', { class: 'badge ' + lc }, lt), el('div', { class: 'one' }, one));
      listBox.appendChild(it);
    });
    if (!xs.length) listBox.appendChild(el('div', { style: 'padding:30px;text-align:center', class: 'muted' }, '没有匹配的条目，换个关键词试试。'));
  }
  function openEntry(code, scroll) {
    code = code.replace(/i$/, '');
    st.sel = code; st.kind = code[0]; st.read = st.read || {}; st.read[code] = true; DYH.save();
    const seg = document.querySelector('#r-browse .seg'); if (seg) seg.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === (st.kind === 'E' ? 0 : 1)));
    renderList(); renderDetail();
    if (scroll) document.querySelector('#r-browse').scrollIntoView({ behavior: 'smooth' });
    const on = listBox && listBox.querySelector('.ritem.on'); if (on) on.scrollIntoView({ block: 'nearest' });
  }
  function para(arr, cls) { return (arr || []).map(t => el('p', { class: cls || '', html: linkify(fixText(t)) })); }
  function renderDetail() {
    if (!detailBox) return;
    const x = byC[st.sel] || byP[st.sel];
    detailBox.innerHTML = '';
    if (!x) { detailBox.appendChild(el('p', { class: 'muted' }, '从左边选一条。')); return; }
    const isC = !!byC[x.code];
    const [lt, lc] = LV[x.lvl];
    detailBox.appendChild(el('div', { class: 'row center', style: 'gap:8px;flex-wrap:wrap' }, el('span', { class: 'badge ' + lc }, lt), isC ? el('span', { class: 'tag ' + G[x.g][1] }, G[x.g][0]) : el('span', { class: 'tag t-prop' }, '属性')));
    detailBox.appendChild(el('h2', { style: 'font-size:32px;margin:10px 0 2px' }, el('span', { class: 'mono', style: 'color:var(--text3);font-size:.7em;margin-right:10px' }, x.code), x.zh || x.tzh));
    detailBox.appendChild(el('div', { class: 'muted' }, x.en, x.tzh && x.tzh !== x.zh ? el('span', { class: 'small', style: 'margin-left:10px' }, '译本名：', x.tzh) : null));
    if (x.plain) detailBox.appendChild(el('div', { class: 'rsec ourread' }, el('h4', null, '课题组解读'), el('p', null, x.plain), el('p', { style: 'margin:0' }, el('b', null, '大运河怎么用：'), x.canal)));
    if (!isC) {
      detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '主语 → 宾语（定义域 → 值域）'),
        el('div', { class: 'row center', style: 'gap:10px;flex-wrap:wrap' }, x.domain ? chip(x.domain) : el('span', { class: 'muted' }, '—'), el('span', { class: 'tag t-prop' }, '—' + x.code + ' ' + (x.zh || x.tzh) + '→'), x.range ? chip(x.range) : el('span', { class: 'muted' }, '—')),
        x.quant ? el('p', { class: 'small muted', style: 'margin-top:8px' }, '数量约束：', x.quant) : null));
      if ((x.subOf || []).length) detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '上位属性（译本标“子属性”）'), el('div', { class: 'row wrap-row', style: 'gap:6px' }, x.subOf.filter(c => byP[c.replace(/i$/, '')]).map(c => chip(c.replace(/i$/, ''))))));
      const lower = P.filter(p => (p.subOf || []).includes(x.code)).map(p => p.code);
      if (lower.length) detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '下位属性（更具体的写法）'), el('div', { class: 'row wrap-row', style: 'gap:6px' }, lower.map(chip))));
    } else {
      if (x.sup.length) detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '上位类（译本标“子类”）'), el('div', { class: 'row wrap-row', style: 'gap:6px' }, x.sup.map(chip))));
      if (x.sub.length) detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '下位类（译本标“所属超类”）'), el('div', { class: 'row wrap-row', style: 'gap:6px' }, x.sub.map(chip))));
      const asDom = P.filter(p => p.domain === x.code).map(p => p.code), asRng = P.filter(p => p.range === x.code).map(p => p.code);
      if (asDom.length) detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '以它为主语的属性'), el('div', { class: 'row wrap-row', style: 'gap:6px' }, asDom.map(chip))));
      if (asRng.length) detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '以它为宾语的属性'), el('div', { class: 'row wrap-row', style: 'gap:6px' }, asRng.map(chip))));
    }
    detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '译本原文 · 范围说明（Scope note）'), x.scope && x.scope.length ? para(x.scope) : el('p', { class: 'muted' }, x.missing ? '本版中文译本中未找到这一条，请查阅英文原文。' : '译本此条未能解析，请查阅 PDF 原文。')));
    if (x.ex && x.ex.length) detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '译本原文 · 示例'), para(x.ex, 'small')));
    if (isC && x.fol && x.fol.length) detailBox.appendChild(el('div', { class: 'rsec' }, el('h4', null, '一阶逻辑'), el('div', { class: 'codebox', style: 'font-size:12px;padding:12px 14px' }, x.fol.join('\n'))));
    detailBox.appendChild(el('p', { class: 'small muted', style: 'margin-top:18px' }, '译本为机器翻译，仅供参考；正式文件以英文原文（cidoc-crm.org）为准。'));
    detailBox.querySelectorAll('a.xref').forEach(a => a.addEventListener('click', () => openEntry(a.dataset.c)));
    detailBox.scrollTop = 0;
  }

  /* ---------- 04 类层级树 ---------- */
  function chTree() {
    const seen = new Set();
    function node(code, depth) {
      const c = byC[code]; if (!c) return null;
      const li = el('li');
      const kids = c.sub;
      const dup = seen.has(code); seen.add(code);
      const sub = (!dup && kids.length) ? el('ul', { class: depth >= 2 ? 'hidden' : '' }, kids.map(k => node(k, depth + 1))) : null;
      const tg = el('span', { class: 'tg' }, sub ? (depth >= 2 ? '▸' : '▾') : '·');
      if (sub) tg.addEventListener('click', () => { sub.classList.toggle('hidden'); tg.textContent = sub.classList.contains('hidden') ? '▸' : '▾'; });
      li.append(tg, el('a', { class: c.lvl === 1 ? 'lv1' : '', on: { click: () => openEntry(code, true) } }, el('span', { class: 'mono', style: 'color:var(--text3)' }, code), ' ', c.zh, dup ? el('span', { class: 'small muted' }, '（多重继承，见上）') : null, c.lvl === 1 ? el('span', { class: 'badge b-high', style: 'margin-left:6px' }, '核心') : null)); if (sub) li.appendChild(sub);
      return li;
    }
    const tree = el('div', { class: 'tree reveal' }, el('ul', null, node('E1', 0)));
    return chapter('', 'r-tree', head('04 · 类层级树', '81 个类，一棵树。', '越往下越具体。点 ▸ 展开，点名字跳到字典。加粗的是项目核心类；有的类有两个“父亲”（多重继承），第二次出现时只标注不展开。', true),
      el('div', { style: 'margin-top:32px' }, tree));
  }

  /* ---------- 05 扩展家族 ---------- */
  function chExt() {
    const E = [
      ['CRMarchaeo', '考古发掘', 'v2.1.1 · 稳定版', '发掘过程单元、地层单元、地层关系', '记录考古成果：南旺枢纽、闸坝基址的发掘单元与地层。', '优先', '#248A3D'],
      ['CRMinf', '论证与推理', 'v1.2.1 · 稳定版', '论证（I1）、信念（I2）、推理（I5）', '把“价值判断”和“年代推定”的论证过程写清楚，是 E13 的进阶版。', '优先', '#248A3D'],
      ['CRMgeo', '空间与几何', 'v2.0.1 · 稳定版', '几何地点表达、坐标参照系', '对接 GIS：河道线、遗址范围的精确几何与坐标系（CGCS2000）。', '优先', '#248A3D'],
      ['CRMba', '建筑考古', '基于 v1.4（2016）· 草案', '建造工程、建筑形态分区、建筑地层单元', '描述闸坝、码头等构筑物的部位与分期改建；尚为草案，引用需注明版本。', '谨慎试用', '#B25000'],
      ['CRMdig', '数字化过程', 'v5.0 · 稳定版', '数字对象、数字化过程、软件执行', '记录测绘、扫描、三维建模、GIS 数据的生产来源。', '按需', '#0071E3'],
      ['CRMsci', '科学观测', 'v3.2 · 稳定版', '观测、遭遇事件、样品', '水文测量、勘探钻孔、材料检测等观测记录。', '按需', '#0071E3'],
      ['CRMtex', '文本实体', 'v2.0 · 候选发布', '书写文本、书写行为、书写系统', '碑刻、题刻的文字层面：谁写、何时刻、什么字体。', '按需', '#0071E3'],
      ['LRMoo', '书目与作品', 'v1.1.1 · 正式', '作品、表达、载体表现、单件', '《中国运河志》等文献的“作品—版本—单册”层次，与图书馆编目对接。', '按需', '#0071E3']
    ];
    return chapter('gray', 'r-ext', head('05 · 扩展家族与建议', '基础够用时不扩展；要扩展，先选这几个。', 'CIDOC CRM 是一个“家族”：基础模型之外，还有针对考古、空间、论证、数字化等领域的兼容扩展。版本与状态以官方“兼容模型”页为准（截至 2026 年）。'),
      el('div', { class: 'grid4 ext', style: 'margin-top:36px' }, E.map(([n, f, v, cls, use, rec, col], i) => el('div', { class: 'tile reveal', style: 'padding:24px;transition-delay:' + (i % 4) * 60 + 'ms' },
        el('span', { class: 'rec', style: `background:${col}1A;color:${col}` }, rec),
        el('div', { style: 'font-size:22px;font-weight:700;margin-top:6px' }, n), el('div', { class: 'small', style: 'font-weight:600;color:var(--text2)' }, f + ' · ' + v),
        el('p', { class: 'cap', style: 'margin:6px 0 0;font-size:14px' }, el('b', { style: 'color:var(--text)' }, '代表内容：'), cls),
        el('p', { class: 'cap', style: 'margin:0;font-size:14px;color:var(--text)' }, use)))),
      el('div', { class: 'grid2 reveal', style: 'margin-top:24px' },
        el('div', { class: 'tile' }, el('h3', null, '课题一的扩展原则'), el('ol', { style: 'margin:0;padding-left:20px;font-size:15px;line-height:1.9' },
          el('li', null, '先用基础 CRM 的 81 个类；用 E55 类型能解决的，不扩展。'),
          el('li', null, '确需扩展时，只引入上面标“优先”的三个，并在《Schema 与标注规范》里写明扩展名、版本号和用到的类。'),
          el('li', null, '草案状态的扩展（如 CRMba）只在试点中使用，正式数据保留基础 CRM 的等价写法。'),
          el('li', null, '扩展的增减由课题负责人统一决定，录入人员不自行引入。'))),
        el('div', { class: 'tile' }, el('h3', null, '配套标准（非 CRM 家族）'), el('ul', { style: 'margin:0;padding-left:20px;font-size:15px;line-height:1.9' },
          el('li', null, el('b', null, 'SKOS：'), '发布词表（E55）的通用格式，便于与其他知识库互通。'),
          el('li', null, el('b', null, 'GeoSPARQL / WKT：'), '几何坐标的通用写法，配合 CRMgeo 使用。'),
          el('li', null, el('b', null, 'RDF / Turtle：'), '知识图谱交付格式（见“方法介绍 · 五张表”）。')),
          el('p', { class: 'small muted', style: 'margin:10px 0 0' }, '以上为建议，最终以课题组审定的 Schema 为准。'))));
  }
})();
