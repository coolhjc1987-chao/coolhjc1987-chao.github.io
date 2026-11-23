/* 方法介绍：苹果式滚动叙事 */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el;
  const chapter = (cls, id, ...kids) => el('section', { class: 'chapter ' + (cls || ''), id }, el('div', { class: 'wrap' }, kids));
  const head = (kicker, title, sub, center) => el('div', { class: 'reveal' + (center ? ' center' : '') }, el('span', { class: 'kicker' }, kicker), el('h2', { class: 'headline' }, title), sub ? el('p', { class: 'subhead' }, sub) : null);
  const trialLink = (step, text) => el('a', { class: 'link-arrow', href: 'javascript:void(0)', on: { click: () => { DYH.state.trialStep = step; DYH.save(); location.hash = '#/trial'; } } }, text || '在试用测试中体验');

  DYH.modules.method = {
    title: '方法介绍', full: true,
    mount(box) {
      box.appendChild(hero());
      box.appendChild(chWhy());
      box.appendChild(chFlow());
      box.appendChild(chTag());
      box.appendChild(chReview());
      box.appendChild(chArchive());
      box.appendChild(chTables());
      box.appendChild(chDeliver());
      box.appendChild(chTeam());
      box.appendChild(chNext());
    }
  };

  function hero() {
    const toc = [['#m-why', 'AI＋人工'], ['#m-flow', '七步流程'], ['#m-tag', '打标签'], ['#m-review', '审核规则'], ['#m-archive', '归档命名'], ['#m-tables', '五张表'], ['#m-deliver', '交付成果'], ['#m-team', '分工与下载']];
    return el('section', { class: 'hero', style: 'padding-bottom:64px' }, el('div', { class: 'wrap' },
      el('span', { class: 'kicker' }, '方法介绍 · 约 15 分钟'),
      el('h1', null, 'AI 先抽，', el('span', { class: 'grad' }, '人来把关。')),
      el('p', { class: 'lead' }, '团队每天怎么干活：一个要素包走七步，五张表是唯一的母本，最后交付 8 项成果。'),
      el('div', { class: 'row center', style: 'justify-content:center;gap:8px;flex-wrap:wrap;margin-top:8px' },
        toc.map(([h, t], i) => el('a', { class: 'btn light sm', href: 'javascript:void(0)', on: { click: () => document.querySelector(h).scrollIntoView({ behavior: 'smooth' }) } }, String(i + 1).padStart(2, '0') + ' ' + t)))));
  }

  /* 01 为什么 AI＋人工 */
  function chWhy() {
    const c = [
      ['纯人工录入', '慢', '逐字读、逐格填；准确但标准难统一。', '只适合少量复杂条目', ''],
      ['AI ＋ 人工审核', '快且可靠', '人从“填”变成“判”；每条带原文引文，审核留痕。', '推荐做法', 'dark'],
      ['纯 AI 自动入库', '最快', '会错类、错方向、甚至编造；出了错没人负责。', '不采用', '']
    ];
    return chapter('gray', 'm-why', head('01 · 方法选择', '为什么是 AI ＋ 人工审核。', '把 AI 当成一个读得很快、但需要人把关的实习生：它负责“抽”，人负责“判”。', true),
      el('div', { class: 'grid3', style: 'margin-top:44px;align-items:stretch' }, c.map(([t, k, d, v, cls], i) => el('div', { class: 'tile reveal ' + cls, style: 'transition-delay:' + i * 80 + 'ms;' + (cls ? 'transform:scale(1.03)' : '') },
        el('div', { class: 'small', style: 'font-weight:600;color:' + (cls ? '#64D2FF' : 'var(--text2)') }, k),
        el('div', { class: 'big', style: 'font-size:30px' }, t), el('p', { class: 'cap' }, d),
        el('div', { style: 'margin-top:16px;font-weight:600;color:' + (cls ? '#30D158' : 'var(--text3)') }, (cls ? '✓ ' : '') + v)))),
      el('p', { class: 'muted center reveal', style: 'text-align:center;margin-top:32px' }, '提速多少，要在试点里实测：同一批 10 个条目，纯人工和“AI＋审核”各做一遍再比较。'));
  }

  /* 02 七步流程 */
  function chFlow() {
    const F = [
      ['登记归档', '人', '资料到手先登记：填来源表、给 SRC 编码，原件按目录存放。', '一份原始资料', '来源表一行 + 归档文件', 3],
      ['切分校字', 'AI＋人', '扫描件用 OCR 识别，按条目切开，人工校对文字。错字会被 AI 当真。', '扫描件 / PDF', '校对过的条目文字', null],
      ['AI 抽取', 'AI', '复制提示词模板，填好来源编码、页码、原文，贴给 AI。一次只贴一个条目。', '条目文字 + 提示词', '候选记录（JSON + 表格）', 4],
      ['进审核表', '人', '把 AI 回复里的表格粘进“AI审核表”。', 'AI 的回复', 'AI审核表里的待审候选', 4],
      ['人工审核', '人 · 关键', '逐条对照原文引文：通过、修改、驳回或待定。价值一律待定，交判定人。', '待审候选', '每条都有结论', 4],
      ['写入五张表', '人', '通过的候选补上编码，写入正式表，状态标“已审”。', '通过的候选', '五张表新增行', 4],
      ['汇总导出', '人＋技术方', '每周合并、更新词表，由技术方导出 CSV 与 RDF。', '五张表', '图谱数据、要素档案', 5]
    ];
    const pills = el('div', { class: 'row', style: 'gap:8px;flex-wrap:wrap;justify-content:center;margin-top:40px' });
    const detail = el('div', { class: 'tile', style: 'margin-top:20px;min-height:200px' });
    const show = i => {
      pills.querySelectorAll('button').forEach((b, k) => { b.className = 'btn ' + (k === i ? 'primary' : 'light'); });
      const [t, who, d, inp, out, step] = F[i];
      detail.innerHTML = '';
      detail.append(
        el('div', { class: 'row center', style: 'gap:10px' }, el('span', { class: 'num', style: 'font-size:28px' }, String(i + 1)), el('h3', { style: 'margin:0;font-size:26px' }, t), el('span', { class: 'who ' + (who === 'AI' ? 'ai' : 'human') }, who)),
        el('p', { style: 'font-size:19px;margin:14px 0 18px;max-width:820px' }, d),
        el('div', { class: 'grid2', style: 'max-width:820px' }, el('div', null, el('div', { class: 'small muted' }, '输入'), el('div', { style: 'font-weight:600' }, inp)), el('div', null, el('div', { class: 'small muted' }, '产出'), el('div', { style: 'font-weight:600' }, out))),
        step != null ? el('div', { style: 'margin-top:18px' }, trialLink(step)) : null);
    };
    F.forEach(([t, who], i) => pills.appendChild(el('button', { class: 'btn light', on: { click: () => show(i) } }, (i + 1) + ' ' + t)));
    show(4);
    return chapter('', 'm-flow', head('02 · 七步流程', '一个要素包，走七步。', '只有第 3 步是 AI 独立完成的；真正的质量关口是第 5 步。', true),
      el('div', { class: 'reveal' }, el('div', { style: 'max-width:640px;margin:24px auto 0' }, ui.hint('点下面任意一步，看谁来做、输入什么、产出什么。'))), el('div', { class: 'reveal' }, pills, detail));
  }

  /* 03 打标签五步法 */
  function chTag() {
    const S = [['圈名词', '认实体', '要素、人物、地点、年代、文献，每个都是一个“实例”。'], ['查速查表', '定类', '拿不准先标“待定”，不硬套。'], ['找动词', '连关系', '“修建、主持、位于、记载”对应 P 属性；事件单独成一条。'], ['挂类型词', '贴标签', '只从词表里选；没有的词报给词表管理员。'], ['记出处', '留痕迹', '每条写来源编码＋页码；价值再写判定人和日期。']];
    return chapter('gray', 'm-tag', head('03 · 打标签', '五步法：名词定类，动词定属性。', '正式工作中，前三步先由 AI 抽取候选，你负责审核；第 4、5 步靠词表和规范保证一致。'),
      el('div', { class: 'grid4', style: 'margin-top:40px;grid-template-columns:repeat(5,minmax(0,1fr))' }, S.map(([a, b, d], i) => el('div', { class: 'tile reveal', style: 'padding:24px;transition-delay:' + i * 60 + 'ms' }, el('div', { class: 'num', style: 'font-size:28px' }, String(i + 1)), el('h3', { style: 'margin:12px 0 2px' }, a), el('div', { class: 'muted', style: 'font-weight:600;margin-bottom:8px' }, b), el('p', { class: 'cap', style: 'margin:0' }, d)))),
      el('div', { class: 'tile reveal', style: 'margin-top:24px' },
        el('div', { class: 'small muted', style: 'margin-bottom:10px' }, '例（示意原文）'),
        el('div', { class: 'srctext', style: 'background:transparent;padding:0;font-size:21px' }, D.sample.text),
        el('div', { class: 'row wrap-row', style: 'gap:8px;margin-top:12px' }, [['会通河', 'E25'], ['戴村坝', 'E24'], ['汶水', 'E26'], ['宋礼', 'E21'], ['白英', 'E21'], ['南旺', 'E53'], ['重开（事件）', 'E11'], ['筑（事件）', 'E12'], ['永乐九年', 'E52']].map(([n, c]) => el('span', { class: 'row center', style: 'gap:4px' }, el('b', { style: 'font-size:15px' }, n), ui.classTag(c, true)))),
        el('div', { style: 'margin-top:14px' }, trialLink(1, '亲手标一遍'))));
  }

  /* 04 审核规则 */
  function chReview() {
    const R = [['通过', '#248A3D', '引文在原文里一字不差，类、属性、方向都对。'], ['修改后通过', '#B25000', '有据但标错了，例如把建议者标成主持者。写出改正后的内容。'], ['驳回', '#D70015', '原文没说、AI 推过头或编造。例如把籍贯“汶上”当坝址。'], ['待定', '#1D1D1F', '需要查其他资料或请专家判断。所有价值候选默认待定。']];
    return chapter('', 'm-review', head('04 · 审核规则', '每条候选，只有四种结论。', '审核顺序：① 引文在不在原文 ② 类和方向对不对 ③ 年代是写明的还是推定的 ④ 价值一律待定。', true),
      el('div', { class: 'grid4', style: 'margin-top:40px' }, R.map(([t, c, d], i) => el('div', { class: 'tile reveal', style: 'transition-delay:' + i * 60 + 'ms' }, el('span', { class: 'tag', style: `background:${c};color:#fff;font-size:15px;padding:3px 14px` }, t), el('p', { class: 'cap', style: 'margin:14px 0 0;font-size:16px;color:var(--text)' }, d)))),
      el('div', { class: 'grid2 reveal', style: 'margin-top:24px' },
        el('div', { class: 'tile dark' }, el('h3', null, '抽检规则（建议，试点后定）'), el('p', { class: 'cap', style: 'font-size:16px' }, '试点期全部逐条审核。正式期：高置信度候选可抽检约 30%；中、低置信度与全部价值候选仍 100% 审核。抽检发现同类错误，整批退回全审。')),
        el('div', { class: 'tile' }, el('h3', null, '两条底线'), el('p', { class: 'cap', style: 'font-size:16px;color:var(--text)' }, 'AI 的结果不直接进正式表；没过审核的数据不交付。未公开的考古资料、甲方资料，上传云端 AI 前按甲方规定书面确认。'), trialLink(4, '去审核 7 条 AI 候选'))));
  }

  /* 05 归档命名 */
  function chArchive() {
    const seg = (t, s, c) => el('span', { class: 'seg-a' }, el('b', { style: `background:${c}1A;color:${c}` }, t), el('small', null, s));
    const sep = () => el('span', { class: 'sepc' }, '-');
    const us = () => el('span', { class: 'sepc' }, '_');
    return chapter('gray', 'm-archive', head('05 · 归档命名', '一物一码，以码相连。', '文件夹只解决“放在哪”，编码才解决“它和谁有关”。一张照片可能同时拍到闸和坝，所以靠编码互相引用，而不是靠文件夹嵌套。'),
      el('div', { class: 'grid4', style: 'margin-top:36px' }, [['一物一码', '每个要素一个永久编码，不改、不复用。'], ['一源一档', '每份资料一个来源编码＋一张元数据卡。'], ['三库分立', '志（文献）、图（图像）、数（数据）分库存放。'], ['以码相连', '文件之间靠编码互相引用。']].map(([t, d], i) => el('div', { class: 'tile reveal', style: 'transition-delay:' + i * 60 + 'ms' }, el('div', { class: 'big', style: 'font-size:28px' }, t), el('p', { class: 'cap', style: 'margin:0' }, d)))),
      el('div', { class: 'tile reveal', style: 'margin-top:24px' }, el('div', { class: 'small muted', style: 'margin-bottom:16px' }, '要素编码长这样（代码为示意，以《编码表》为准）'),
        el('div', { class: 'anatomy' }, seg('DYH', '项目', '#1D1D1F'), sep(), seg('HTH', '河段：会通河', '#0E7C86'), sep(), seg('ZB', '类型：闸坝', '#5856D6'), sep(), seg('0012', '流水号', '#B8460B'))),
      el('div', { class: 'tile reveal', style: 'margin-top:16px' }, el('div', { class: 'small muted', style: 'margin-bottom:16px' }, '文件名长这样'),
        el('div', { class: 'anatomy', style: 'font-size:22px' }, seg('DYH-HTH-ZB-0012', '编码', '#0E7C86'), us(), seg('戴村坝平面测绘图', '内容简述', '#1D1D1F'), us(), seg('20261120', '日期', '#5856D6'), us(), seg('V01', '版本', '#B8460B'), seg('.dwg', '扩展名', '#6E6E73')),
        el('p', { class: 'cap', style: 'margin:16px 0 0' }, '版本号只顺延 V01 → V02，不加“最终版”“改”“(1)”这类后缀。'), el('div', { style: 'margin-top:10px' }, trialLink(3, '用文件名检查器试一试'))),
      el('div', { class: 'reveal', style: 'margin-top:24px' }, el('div', { class: 'tablewrap' }, el('table', { class: 'tbl' }, el('tr', null, el('th', null, '一级文件夹'), el('th', null, '放什么')), D.folders.map(f => el('tr', null, el('td', { class: 'code' }, f.name), el('td', null, f.what)))))));
  }

  /* 06 五张表 */
  function chTables() {
    const T = [['实体表', '点', '一个要素、人物、地点', 'var(--c-thing)'], ['事件表', '点', '一次修建、重修、疏浚、淤废', 'var(--c-event)'], ['关系表', '线', '一句话：主体 —属性→ 客体', 'var(--accent)'], ['价值表', '证据', '一次价值评估（E13）', 'var(--c-value)'], ['来源表', '证据', '一份资料的元数据卡', 'var(--c-doc)']];
    const view = ui.part('results.view', { tab: 'dossier' });
    view.classList.add('reveal');
    return chapter('', 'm-tables', head('06 · 五张表', '五张表，是一切成果的母本。', '人只维护表格。要素档案、知识图谱、RDF 数据都从表格自动生成；表里改一处，所有成果跟着变。', true),
      el('div', { class: 'grid4', style: 'margin-top:40px;grid-template-columns:repeat(5,minmax(0,1fr))' }, T.map(([t, k, d, c], i) => el('div', { class: 'tile reveal', style: 'padding:22px;transition-delay:' + i * 60 + 'ms' }, el('div', { class: 'small', style: `font-weight:700;color:${c}` }, k), el('div', { style: 'font-size:22px;font-weight:700;margin:6px 0' }, t), el('p', { class: 'cap', style: 'margin:0' }, d)))),
      el('div', { style: 'margin-top:24px' }, view));
  }

  /* 07 交付成果 */
  function chDeliver() {
    return chapter('gray', 'm-deliver', head('07 · 交付成果', '最后交出去的，是这 8 样东西。', '日常工作只围绕第 ③ 项五张表展开；④ 和 ⑦ 由技术方从表格批量导出。'),
      el('div', { class: 'grid4', style: 'margin-top:36px' }, D.deliverables.map((d, i) => el('div', { class: 'tile reveal', style: 'padding:24px;transition-delay:' + (i % 4) * 60 + 'ms;' + (i === 2 ? 'box-shadow:0 0 0 2px var(--accent)' : '') },
        el('div', { class: 'num', style: 'font-size:26px' }, d.n), el('h3', { style: 'margin:10px 0 4px;font-size:19px' }, d.name), el('div', { class: 'small', style: 'font-weight:600;color:var(--text2)' }, d.fmt),
        el('div', { class: 'mono', style: 'font-size:11.5px;color:var(--text3);margin-top:10px;word-break:break-all' }, d.file), el('div', { class: 'small', style: 'margin-top:8px' }, '给：' + d.who)))));
  }

  /* 08 分工与下载 */
  function chTeam() {
    const roles = [['录入员 / AI 操作员', '登记归档、切分校字、AI 抽取，把结果放进审核表'], ['审核员', '逐条审核 AI 候选，交叉校核；不审自己录入的包'], ['判定人（专家）', '确认价值候选的依据，给出价值评估'], ['词表管理员', '审定新词、维护编码表，定期发布新版本'], ['课题负责人', '分工进度、裁决待定项与扩类、确定抽检比例']];
    const dl = ui.part('guide.downloads'); dl.querySelectorAll(':scope > h2').forEach(n => n.remove()); dl.style.paddingTop = '0';
    const faq = ui.part('guide.faq'); faq.querySelectorAll(':scope > h2').forEach(n => n.remove()); faq.style.paddingTop = '0';
    return chapter('', 'm-team', head('08 · 分工与下载', '谁做什么，用什么。', null, true),
      el('div', { class: 'grid4 reveal', style: 'margin-top:36px;grid-template-columns:repeat(5,minmax(0,1fr))' }, roles.map(([r, d]) => el('div', { class: 'tile', style: 'padding:22px' }, el('h3', { style: 'font-size:18px' }, r), el('p', { class: 'cap', style: 'margin:0' }, d)))),
      el('h3', { class: 'reveal', style: 'font-size:28px;margin-top:64px' }, '模板与文件'), el('div', { class: 'reveal' }, dl),
      el('h3', { class: 'reveal', style: 'font-size:28px;margin-top:40px' }, '常见问题'), el('p', { class: 'muted small reveal' }, '点问题展开答案。'), el('div', { class: 'reveal' }, faq));
  }

  function chNext() {
    return el('section', { class: 'chapter dark' }, el('div', { class: 'wrap center', style: 'text-align:center' },
      el('h2', { class: 'headline reveal' }, '方法看完了。亲手试一遍。'),
      el('p', { class: 'subhead reveal' }, '7 个引导步骤，约 30 分钟。每一步都会告诉你点哪里。'),
      el('div', { class: 'row center reveal', style: 'justify-content:center;gap:14px;margin-top:28px' }, el('a', { class: 'btn primary lg', href: '#/trial' }, '开始试用测试'))));
  }
})();
