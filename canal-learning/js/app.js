/* 核心：状态、工具函数、提示系统、部件注册、路由、首页 */
(function () {
  const D = DYH.data;
  const KEY = 'grand-canal-crm-learning-v03';

  /* ---------- 状态（本机浏览器保存） ---------- */
  const fresh = () => ({ progress: {}, records: null, review: { decisions: {}, edits: {}, imported: null }, tag: {}, quiz: {}, seen: {} });
  let st = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) st = Object.assign(fresh(), JSON.parse(raw)); } catch (e) {}
  DYH.state = st;
  DYH.save = function () { try { localStorage.setItem(KEY, JSON.stringify(DYH.state)); } catch (e) {} };
  DYH.resetAll = function () { DYH.state = fresh(); DYH.save(); location.hash = '#/home'; route(); renderNav(); };

  /* ---------- 工具 ---------- */
  const ui = DYH.ui = {};
  ui.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  ui.el = function (tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'style') n.style.cssText = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'on') for (const ev in v) n.addEventListener(ev, v[ev]);
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; n.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c); });
    return n;
  };
  ui.html = function (str) { const t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.childElementCount === 1 ? t.content.firstElementChild : t.content; };
  ui.toast = function (msg, kind) {
    let box = document.querySelector('.toasts'); if (!box) { box = ui.el('div', { class: 'toasts' }); document.body.appendChild(box); }
    while (box.children.length > 2) box.firstChild.remove();
    const t = ui.el('div', { class: 'toast ' + (kind || '') }, msg); box.appendChild(t); setTimeout(() => t.remove(), 2800);
  };
  ui.modal = function (title, content, buttons) {
    const bg = ui.el('div', { class: 'modal-bg' });
    const close = () => bg.remove();
    const body = typeof content === 'string' ? ui.html('<div>' + content + '</div>') : content;
    const foot = ui.el('div', { class: 'row', style: 'justify-content:flex-end;margin-top:22px;gap:10px' });
    (buttons || [{ text: '好的', cls: 'primary' }]).forEach(b => foot.appendChild(ui.el('button', { class: 'btn ' + (b.cls || ''), on: { click: () => { if (!b.onClick || b.onClick() !== false) close(); } } }, b.text)));
    const m = ui.el('div', { class: 'modal' }, ui.el('h3', { style: 'font-size:24px' }, title), body, foot);
    bg.appendChild(m); bg.addEventListener('click', e => { if (e.target === bg) close(); });
    document.body.appendChild(bg); return close;
  };
  ui.download = function (name, text, mime) {
    const blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    const a = ui.el('a', { href: URL.createObjectURL(blob), download: name }); document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    ui.toast('已下载：' + name, 'ok');
  };
  ui.copy = function (text) {
    const done = () => ui.toast('已复制到剪贴板', 'ok');
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else fallback();
    function fallback() { const ta = ui.el('textarea', { style: 'position:fixed;left:-9999px' }); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { ui.toast('复制失败，请手动选择复制', 'err'); } ta.remove(); }
  };
  ui.csv = function (rows, cols) {
    cols = cols || (rows[0] ? Object.keys(rows[0]).filter(k => k[0] !== '_') : []);
    const q = v => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return '﻿' + [cols.map(q).join(',')].concat(rows.map(r => cols.map(c => q(r[c])).join(','))).join('\r\n');
  };
  ui.cls = code => D.classes.find(c => c.code === code);
  ui.prop = code => D.properties.find(p => p.code === code);
  ui.classTag = function (code, short) {
    const c = ui.cls(code); if (!c) return ui.el('span', { class: 'tag t-type' }, code);
    return ui.el('span', { class: 'tag ' + D.groupTag[c.group], title: c.en + ' · ' + c.hint }, short ? c.code : c.code + ' ' + c.zh);
  };
  ui.propTag = function (code, role) { const p = ui.prop(code); return ui.el('span', { class: 'tag t-prop', title: p ? p.use : '' }, code + ' ' + (p ? p.zh : '') + (role ? '（' + role + '）' : '')); };
  ui.ancestors = function (code) { const out = [code]; const q = [code]; while (q.length) { const c = q.shift(); (D.parents[c] || []).forEach(p => { if (!out.includes(p)) { out.push(p); q.push(p); } }); } return out; };
  ui.isA = function (code, target) { return String(target).split('|').some(t => t === 'E1' || ui.ancestors(code).includes(t)); };
  ui.checkTriple = function (sCode, pCode, oCode) {
    const p = ui.prop(pCode); if (!p) return { ok: false, msg: '未知属性' };
    const dn = t => t.split('|').map(x => (ui.cls(x) ? x + ' ' + ui.cls(x).zh : x + ' ' + (D.superNames[x] || ''))).join(' 或 ');
    if (!ui.isA(sCode, p.domain)) return { ok: false, msg: `${pCode} 的主体必须是 ${dn(p.domain)}，而 ${sCode} 不是。` };
    if (!ui.isA(oCode, p.range)) return { ok: false, msg: `${pCode} 的客体必须是 ${dn(p.range)}，而 ${oCode} 不是。` };
    return { ok: true, msg: `合法：${dn(p.domain)} —${pCode} ${p.zh}→ ${dn(p.range)}` };
  };
  ui.records = function () { return DYH.state.records || D.records; };
  ui.pageHead = function (eyebrow, title, lead) { return ui.el('div', { class: 'pagehead' }, ui.el('span', { class: 'eyebrow' }, eyebrow), ui.el('h1', null, title), lead ? ui.el('p', { class: 'lead' }, lead) : null); };

  /* 提示条：告诉用户“现在该做什么”。items 可为字符串或字符串数组 */
  ui.hint = function (items, opts) {
    opts = opts || {};
    const list = Array.isArray(items) ? ui.el('ol', null, items.map(t => ui.el('li', null, t))) : ui.el('div', null, items);
    return ui.el('div', { class: 'hintbar' + (opts.done ? ' done' : '') }, ui.el('span', { class: 'hi' }, opts.done ? '✓' : (opts.icon || 'i')), ui.el('div', null, opts.title ? ui.el('b', { style: 'display:block;margin-bottom:2px' }, opts.title) : null, list));
  };
  /* 给某个元素加脉冲光圈，提示“点这里”；点击后自动消失 */
  ui.pulse = function (node) { if (!node) return; node.classList.add('pulse'); const off = () => { node.classList.remove('pulse'); node.removeEventListener('click', off, true); }; node.addEventListener('click', off, true); };
  /* 滚动出现动画 */
  ui.reveal = function (root) {
    const els = (root || document).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  };

  /* ---------- 部件注册：每个练习块都能单独嵌入“试用测试”向导 ---------- */
  DYH.parts = DYH.parts || {};
  ui.part = function (name, opts) {
    const f = DYH.parts[name];
    if (!f) return ui.el('div', { class: 'callout err' }, '缺少部件：' + name);
    try { return f(opts || {}); } catch (e) { console.error(e); return ui.el('div', { class: 'callout err' }, '部件出错：' + name + '：' + e.message); }
  };

  /* ---------- 进度 ---------- */
  const listeners = [];
  DYH.onProgress = fn => listeners.push(fn);
  DYH.progress = {
    mark(mod, step) { const p = DYH.state.progress[mod] = DYH.state.progress[mod] || {}; if (!p[step]) { p[step] = true; DYH.save(); renderNav(); listeners.forEach(f => { try { f(mod, step); } catch (e) {} }); } },
    has(mod, step) { return !!(DYH.state.progress[mod] || {})[step]; },
    count(mod) { const m = DYH.modules[mod]; if (!m || !m.steps) return [0, 0]; return [m.steps.filter(s => DYH.progress.has(mod, s)).length, m.steps.length]; },
    done(mod) { const [a, b] = DYH.progress.count(mod); return b > 0 && a === b; },
    total() { const T = DYH.trialSteps || []; return [T.filter(s => s.done()).length, T.length]; }
  };

  /* ---------- 路由 ---------- */
  DYH.modules = DYH.modules || {};
  const NAV = [['home', '首页'], ['principle', '原理介绍'], ['method', '方法介绍'], ['reference', '原文对照'], ['trial', '试用测试']];
  const ALIAS = { learn: 'principle', guide: 'method', tag: 'trial', archive: 'trial', review: 'trial', results: 'trial', quiz: 'trial' };

  function renderNav() {
    const nav = document.getElementById('nav'); if (!nav) return;
    let cur = (location.hash.replace('#/', '') || 'home').split('/')[0];
    cur = ALIAS[cur] || cur;
    nav.innerHTML = '';
    NAV.forEach(([id, label]) => nav.appendChild(ui.el('a', { href: '#/' + id, class: id === cur ? 'active' : '' }, label)));
    const [a, b] = DYH.progress.total();
    const pr = document.getElementById('progtext'); if (pr) pr.textContent = b ? `试用进度 ${a}/${b}` : '';
    const bar = document.getElementById('progbar'); if (bar) bar.style.width = (b ? a / b * 100 : 0) + '%';
  }
  DYH.renderNav = renderNav;

  function route() {
    let id = (location.hash.replace('#/', '') || 'home').split('/')[0];
    if (id === 'part') { /* 开发预览：#/part/部件名 */
      const name = decodeURIComponent(location.hash.split('/').slice(2).join('/'));
      const view = document.getElementById('view'); view.innerHTML = '';
      const box = ui.el('div', { class: 'wrap' }); view.appendChild(box); box.appendChild(ui.part(name)); renderNav(); return;
    }
    if (ALIAS[id] && !DYH.modules[id]) id = ALIAS[id];
    if (['tag', 'archive', 'review', 'results', 'quiz'].includes(id) && DYH.trialGoto) { DYH.trialGoto(id); id = 'trial'; history.replaceState(null, '', '#/trial'); }
    const view = document.getElementById('view');
    const mod = DYH.modules[id] || DYH.modules.home;
    view.innerHTML = '';
    const box = ui.el('div', { class: mod.full ? '' : 'wrap' });
    view.appendChild(box);
    try { mod.mount(box); } catch (e) { console.error(e); box.appendChild(ui.el('div', { class: 'callout err', style: 'margin:30px' }, '页面加载出错：' + e.message)); }
    renderNav();
    window.scrollTo(0, 0);
    setTimeout(() => ui.reveal(view), 30);
  }
  DYH.route = route;
  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', () => { if (location.protocol === 'file:') { document.getElementById('offline-download').hidden = true; document.getElementById('offline-note').hidden = false; } renderNav(); route(); document.querySelector('.brand').addEventListener('click', () => location.hash = '#/home'); });

  /* ---------- 首页 ---------- */
  DYH.modules.home = {
    title: '首页', full: true,
    mount(box) {
      const [a, b] = DYH.progress.total();
      box.appendChild(ui.html(`<section class="hero"><div class="wrap">
        <span class="kicker">大运河 · 课题一 · “志·图·数”融合知识库</span>
        <h1>标注，<span class="grad">从读懂一句话开始</span>。</h1>
        <p class="lead">用 CIDOC CRM 给运河要素打标签、归档文件、归纳数据。三步学会：先懂原理，再看方法，最后亲手试一遍。</p>
        <div class="row center" style="justify-content:center;gap:14px;flex-wrap:wrap">
          <a class="btn primary lg" href="#/principle">开始学习</a>
          <a class="btn ghost lg" href="#/trial">${a ? '继续试用（' + a + '/' + b + '）' : '直接试用'}</a></div>
        <p class="small muted" style="margin-top:18px">本机测试版 · 不联网、不上传 · 记录只保存在这台电脑的浏览器里</p></div></section>`));
      const ch = ui.el('section', { class: 'chapter gray' }, ui.el('div', { class: 'wrap' }));
      const w = ch.firstChild;
      w.appendChild(ui.html(`<div class="center reveal"><h2 class="headline md">三个板块，按顺序来。</h2><p class="subhead">建议用时约 1 小时。每一板块都会告诉你“现在该做什么”。</p></div>`));
      const cards = [
        ['principle', '01', '原理介绍', '约 10 分钟', '类、属性、类型三个词；为什么以“事件”为中心；价值为什么要记成一次评估。', '#0E7C86'],
        ['method', '02', '方法介绍', '约 15 分钟', 'AI 先抽、人来把关的七步流程；打标签五步法；归档命名规则；最终交付什么。', '#0071E3'],
        ['trial', '03', '试用测试', '约 30 分钟', '7 个引导步骤：定类、标原文、连关系、命名归档、审核 AI、看成果、小测验。', '#5856D6']
      ];
      const g = ui.el('div', { class: 'grid3', style: 'margin-top:40px' });
      cards.forEach(([id, n, t, time, d, c], i) => g.appendChild(ui.el('a', { class: 'tile click reveal', href: '#/' + id, style: 'text-decoration:none;color:inherit;display:flex;flex-direction:column;min-height:300px;transition-delay:' + i * 80 + 'ms' },
        ui.el('div', { style: `font-size:15px;font-weight:600;color:${c}` }, n + ' · ' + time),
        ui.el('div', { class: 'big' }, t),
        ui.el('p', { class: 'cap', style: 'flex:1' }, d),
        ui.el('span', { class: 'link-arrow' }, id === 'trial' && a ? '继续' : '进入'))));
      w.appendChild(g);
      box.appendChild(ch);
      const ch2 = ui.el('section', { class: 'chapter' }, ui.el('div', { class: 'wrap' }));
      ch2.firstChild.appendChild(ui.html(`<div class="grid3">
        <div class="reveal"><div class="num">一套语法</div><p class="muted" style="margin-top:12px">名词＝类（E），动词＝属性（P），形容词＝类型（E55）。打标签就是造句。</p></div>
        <div class="reveal" style="transition-delay:80ms"><div class="num" style="color:#0E7C86">一个流程</div><p class="muted" style="margin-top:12px">AI 先抽取候选，人逐条审核把关。没过审核的数据不进正式表。</p></div>
        <div class="reveal" style="transition-delay:160ms"><div class="num" style="color:#5856D6">一个母本</div><p class="muted" style="margin-top:12px">五张表是一切成果的母本：要素档案、知识图谱、RDF 数据都自动导出。</p></div></div>`));
      ch2.firstChild.appendChild(ui.el('p', { class: 'small muted', style: 'margin-top:48px;text-align:center' }, '想从头再来？', ui.el('a', { href: 'javascript:void(0)', on: { click: () => ui.modal('清空学习记录？', '<p class="muted">会清空本机保存的进度、审核结论和写入的表格，恢复为初始示例数据。</p>', [{ text: '取消', cls: 'light' }, { text: '清空', cls: 'primary', onClick: () => { DYH.resetAll(); ui.toast('已重置', 'ok'); } }]) } }, '重置全部记录')));
      box.appendChild(ch2);
    }
  };
})();
