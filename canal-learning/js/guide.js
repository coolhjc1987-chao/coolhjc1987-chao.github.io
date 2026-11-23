/* 上手指南 */
(function () {
  const D = DYH.data, ui = DYH.ui, el = ui.el;
  const TABLE_COLS = {
    'AI审核表': ['候选编号', '记录类型', 'AI抽取内容', '原文引文', '来源编码', '页码', 'AI置信度', '审核结论', '修改后内容', '审核人', '审核日期', '写入表', '备注'],
    '实体表': ['实体编码', '名称', '类(E)', '类型词编码', '类型词名称', '别名/古称', '所在地点编码', '上级要素编码', '经度', '纬度', '保存状况', '来源编码', '页码', '审核状态', '录入人', '备注'],
    '事件表': ['事件编码', '事件名称', '事件类(E)', '时间原文', '起始年(最早)', '结束年(最晚)', '朝代/时期', '地点编码', '执行者编码', '角色(P14.1)', '对象要素编码', '来源编码', '页码', '置信度', '备注'],
    '关系表': ['主体编码', '主体名称', '属性(P)', '客体编码', '客体名称', '来源编码', '页码', '置信度', '审核状态', '备注'],
    '价值表': ['评估编码', '要素编码', '要素名称', '价值一级', '价值二级', '世遗标准', '价值说明', '依据来源编码', '页码', '判定人', '判定日期', '置信度', '审核状态'],
    '来源表': ['来源编码', '题名', '资料类型', '责任者', '形成时间', '涉及要素编码', '出处位置', '载体与格式', '权利/使用限制', '存放路径', '录入人', '录入日期']
  };
  const FAQ = [
    ['AI 抽出来的东西能直接用吗？', '不能。AI 结果一律先进“AI审核表”，审核结论为“通过”或“修改后通过”才写入正式表。没过审核的数据不交付。'],
    ['用 AI 到底能快多少？', '要在试点里实测：同一批 10 个条目，纯人工和“AI＋审核”各做一遍，比较每条目用时和通过率、驳回率、漏抽率，再决定推广方式和抽检比例。'],
    ['哪些资料能贴给云端 AI？', '已公开出版的志书条目，一次贴一个条目。未公开的考古资料、甲方资料，上传前按甲方规定书面确认，并使用单位认可的账号。'],
    ['价值标签可以让 AI 来判吗？', 'AI 只能提“候选”，一律标“待定”。价值由判定人确认依据后才入库，并记成一次 E13 评估。'],
    ['速查表里找不到合适的类怎么办？', '标“待定”，在备注写明疑问，交课题负责人裁决。不要自己新建类。'],
    ['要不要学写 RDF 代码？', '不用。人只维护五张表，RDF、知识图谱和要素档案都由技术方从表格自动导出。'],
    ['编码写错了能改吗？', '编码一经发出永久不改、不复用。录错了就作废旧码（在实体表标注状态），启用新码。']
  ];

  DYH.parts = DYH.parts || {};
  DYH.parts['guide.firstday'] = () => secFirstDay();
  DYH.parts['guide.downloads'] = () => secDownloads();
  DYH.parts['guide.faq'] = () => secFaq();
  DYH.parts['guide.roles'] = () => secRoles();
  DYH.parts['guide.about'] = () => secAbout();
  DYH.modules.guide = {
    title: '上手指南',
    mount(box) {
      box.appendChild(ui.pageHead('上手指南', '第一天怎么开始，日常怎么做', '把前面 6 节学到的东西变成每天的工作流程。下面的清单、模板和文件都可以直接下载使用。'));
      box.appendChild(secFirstDay());
      box.appendChild(secFlow());
      box.appendChild(secRoles());
      box.appendChild(secDownloads());
      box.appendChild(secFaq());
      box.appendChild(secAbout());
    }
  };

  function checklist(key, items) {
    const st = DYH.state.guide = DYH.state.guide || {}; const done = st[key] = st[key] || {};
    const wrap = el('div', { class: 'steps' });
    items.forEach((t, i) => {
      const step = el('div', { class: 'step' + (done[i] ? ' done' : ''), style: 'cursor:pointer' }, t);
      step.addEventListener('click', () => { done[i] = !done[i]; DYH.save(); step.classList.toggle('done', !!done[i]); });
      wrap.appendChild(step);
    });
    return wrap;
  }

  function secFirstDay() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '第一天：6 件事（点击打勾）'));
    s.appendChild(checklist('day1', [
      ui.html('<span>在本站学完 1–6 节，测验答对 9 题以上 <a href="#/learn">去学习</a></span>'),
      ui.html('<span>领取一个“要素包”：一处要素及其全部资料（建议从戴村坝、南旺分水枢纽等资料较全的点开始）</span>'),
      ui.html('<span>下载本页的表格模板和提示词模板，按命名规则重命名为自己的工作文件</span>'),
      ui.html('<span>把手上的每份资料登记到来源表，给 SRC 编码，原件按目录存放 <a href="#/archive">命名工具</a></span>'),
      ui.html('<span>拿 1 个条目走一遍：生成提示词 → AI 抽取 → 粘贴进审核表 → 逐条审核 → 写入五张表 <a href="#/review">审核工作台</a></span>'),
      ui.html('<span>记下卡住的地方和“待定”项，周例会统一讨论</span>')
    ]));
    return s;
  }

  function secFlow() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '日常：人机协同七步流程'));
    s.appendChild(el('p', { class: 'muted' }, '每个要素包都这样走。只有第 3 步是 AI 独立完成的，真正的质量关口是第 5 步。'));
    const flow = [
      ['登记归档', '人', '资料填来源表、给 SRC 编码，原件按目录存放'],
      ['切分校字', 'AI+人', '扫描件 OCR 识别，按条目切分，人工校对文字——错字会被 AI 当真'],
      ['AI 抽取', 'AI', '粘贴“提示词模板＋条目原文”，输出候选记录（JSON＋表格）'],
      ['进审核表', '人', 'AI 输出的表格粘贴到 AI审核表'],
      ['人工审核', '人（关键）', '逐条对照原文引文：通过、修改、驳回或待定'],
      ['写入五张表', '人', '通过的候选补编码后写入正式表，状态“已审”'],
      ['汇总导出', '人＋技术方', '每周合并、更新词表，导出 CSV 与 RDF']
    ];
    const w = el('div', { class: 'steps', style: 'margin-top:12px' });
    flow.forEach(([t, who, d]) => w.appendChild(el('div', { class: 'step' }, el('b', null, t), el('span', { class: 'who ' + (who === 'AI' ? 'ai' : 'human') }, who), el('div', { class: 'small muted' }, d))));
    s.appendChild(w);
    s.appendChild(ui.html(`<div class="grid2" style="margin-top:16px">
      <div class="callout"><b>审核四种结论：</b>通过（引文、类、方向都对）· 修改后通过（有据但标错）· 驳回（原文没说、推过头、编造）· 待定（需查资料或请专家；价值一律待定）。</div>
      <div class="callout warn"><b>抽检规则（建议，试点后定）：</b>试点期 100% 审核；正式期高置信度可抽检约 30%，中 / 低置信度与全部价值候选仍 100%；抽检发现同类错误，整批退回全审。</div></div>`));
    return s;
  }

  function secRoles() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '分工'));
    s.appendChild(ui.html(`<div class="tablewrap"><table class="tbl"><tr><th style="width:18%">角色</th><th>职责</th></tr>
      <tr><td>录入员 / AI 操作员</td><td>按要素包完成登记归档、切分校字、AI 抽取，把结果放进审核表（可以是同一人）</td></tr>
      <tr><td>审核员</td><td>逐条审核 AI 候选、交叉校核他人成果，按 8 项清单打勾；不审自己录入的包</td></tr>
      <tr><td>判定人（专家）</td><td>确认价值候选的依据，给出价值评估（E13）</td></tr>
      <tr><td>词表管理员</td><td>审定新词、维护编码表，定期发布词表与编码表新版本</td></tr>
      <tr><td>课题负责人</td><td>定分工与进度，裁决“待定”项和 Schema 扩展，确定抽检比例，把握对外口径</td></tr></table></div>`));
    return s;
  }

  function secDownloads() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '下载：模板与文件'));
    s.appendChild(el('p', { class: 'muted' }, '全部在本机生成，不联网。表格模板是带表头的 CSV（UTF-8，Excel 可直接打开）；带示例数据的完整版在线模板见课题共享链接。'));
    const K = window.DYH_KIT || {};
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const g = el('div', { class: 'grid3', style: 'margin-top:12px' });
    const item = (title, desc, btnText, fn) => el('div', { class: 'card' }, el('h4', null, title), el('p', { class: 'small muted' }, desc), el('button', { class: 'btn sm', on: { click: fn } }, btnText));
    g.appendChild(item('AI 抽取提示词模板', '复制即用，含示例与审核员检查清单（Markdown）。', '下载 .md', () => ui.download(`课题一_AI抽取提示词模板_${today}_V01.md`, K.promptDoc || '', 'text/markdown')));
    g.appendChild(item('人机协同作业规程', '角色、每日流程、抽检规则、试点测速方法、数据安全（Markdown）。', '下载 .md', () => ui.download(`课题一_人机协同作业规程_${today}_V01.md`, K.procedure || '', 'text/markdown')));
    g.appendChild(item('抽取结果 Schema', '给技术方做批量调用时约束 AI 输出格式（JSON Schema）。', '下载 .json', () => ui.download(`课题一_抽取结果schema_${today}_V01.json`, K.schema || '', 'application/json')));
    Object.keys(TABLE_COLS).forEach(name => g.appendChild(item(name + '（空模板）', '表头：' + TABLE_COLS[name].slice(0, 5).join('、') + '……', '下载 .csv', () => ui.download(`课题一_${name}_${today}_V01.csv`, ui.csv([], TABLE_COLS[name]), 'text/csv'))));
    g.appendChild(item('词表（示意版）', '当前示意词表，正式版以词表管理员发布为准。', '下载 .csv', () => ui.download(`课题一_词表_${today}_V01.csv`, ui.csv(D.vocab.map(v => ({ 类型编码: v.code, 中文名: v.zh, 上位词编码: v.parent, 适用类: v.cls }))), 'text/csv')));
    s.appendChild(g);
    return s;
  }

  function secFaq() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '常见问题'));
    const w = el('div', { class: 'stack' });
    FAQ.forEach(([q, a]) => {
      const body = el('p', { class: 'hidden', style: 'margin:10px 0 0' }, a);
      w.appendChild(el('div', { class: 'card flat', style: 'padding:14px 18px;cursor:pointer', on: { click: () => body.classList.toggle('hidden') } }, el('b', { style: 'color:#1D1D1F' }, '问：' + q), body));
    });
    s.appendChild(w);
    return s;
  }

  function secAbout() {
    const s = el('div', { class: 'section' });
    s.appendChild(el('h2', null, '关于本站'));
    s.appendChild(ui.html(`<div class="grid2"><div class="card soft small"><p><b>怎么打开：</b>网页可直接使用；离线版解压后双击 <span class="kbd">index.html</span>，用 Chrome 或 Edge 打开即可，无需联网、无需安装。</p><p><b>记录保存在哪：</b>只保存在你这台电脑的浏览器里，换浏览器或清除浏览器数据后会重置。首页底部可手动重置。</p><p style="margin:0"><b>分享给同事：</b>把网页链接或完整的离线压缩包发给对方即可。</p></div>
      <div class="card soft small"><p><b>依据：</b>《CIDOC 概念参考模型定义》版本 7.2.3（A 卷）中文译本。拿不准时以英文编号和原文为准。</p><p><b>示例数据：</b>戴村坝、会通河等均为示意，史实、年代、页码以《中国运河志》原文为准；编码规则、词表、抽检比例为建议值，以课题组审定版为准。</p><p style="margin:0"><b>版本：</b>V0.3 学习版。</p></div></div>`));
    return s;
  }
})();
