/* 开黑重开模拟器 · 交互层 */
(function () {
  'use strict';
  var E = window.RestartEngine, Game = E.Game, ATTRS = E.ATTRS;
  var ATTR_NAME = { ap: '手速', aw: '意识', me: '心态', fam: '家境', soc: '人缘' };
  var RAR = { gold: { n: '金色天赋', c: 'gold' }, purple: { n: '紫色天赋', c: 'purple' }, blue: { n: '蓝色天赋', c: 'blue' }, gray: { n: '灰色天赋', c: 'gray' } };
  var SAVE_KEY = 'restart_save_v1';
  var ESSENCE = { death: 20, normal: 40, good: 120, hidden: 300 };
  var HORSE_ORDER = { '牛马': 0, '下等马': 1, '中等马': 2, '上等马': 3, '天选马': 4 };

  // ---------- 存档 ----------
  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; }
  }
  var save = Object.assign({
    runs: 0, bestHorse: null, bestHorseName: null, essence: 0,
    ach: {}, endings: {}, unlockedTalents: {}, oxHorse: 0, seeds: {}, posted: false
  }, loadSave());
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

  // ---------- 数据加载 ----------
  var DATA = null, game = null;
  var FILES = ['talents.json', 'meta.json', 'events-teen.json', 'events-prime.json', 'events-veteran.json', 'events-extra.json', 'events-choices.json', 'events-pro.json', 'events-echo.json'];
  function loadData() {
    return Promise.all(FILES.map(function (f) {
      return fetch('data/' + f).then(function (r) { if (!r.ok) throw new Error(f); return r.json(); });
    })).then(function (arr) {
      DATA = {
        talents: arr[0], meta: arr[1],
        events: arr.slice(2).reduce(function (a, b) { return a.concat(b.events); }, [])
      };
      game = new Game(DATA);
    }).catch(function () {
      document.querySelector('.hero').innerHTML += '<p style="color:#ff8090;margin-top:14px">数据加载失败，请通过博客正常访问本页（/restart/），不要直接双击打开文件。</p>';
      throw new Error('data load failed');
    });
  }

  // ---------- DOM ----------
  var $ = function (id) { return document.getElementById(id); };
  function show(id) {
    ['s-home', 's-draw', 's-alloc', 's-life', 's-end'].forEach(function (s) { $(s).classList.toggle('hidden', s !== id); });
    window.scrollTo(0, 0);
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    $('toast-host').appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(function () { t.remove(); }, 450); }, 1800);
  }
  function deltaText(eff, rp) {
    var out = [];
    ATTRS.forEach(function (a) { if (eff && eff[a]) out.push('<span class="' + (eff[a] > 0 ? 'up' : 'dn') + '">' + ATTR_NAME[a] + (eff[a] > 0 ? '+' : '') + eff[a] + '</span>'); });
    if (typeof rp === 'number' && rp) out.push('<span class="rp">战力' + (rp > 0 ? '+' : '') + rp + '</span>');
    return out.join('');
  }

  // ---------- 局状态 ----------
  var run = null, hand = [], picked = [], bonusPts = 0, allocLeft = 20, allocBase = null;
  var goldCount = 0, seedInput = '', startAttrs = null, timer = null, speed = 1, busy = false;

  // ---------- 首页 ----------
  var TIPS = [
    '暴毙率约六成，红温删游戏是最常见的结局',
    '20 点属性不可能全能，偏科才有特殊人生',
    '金色天赋占两个槽，灰天赋反而送属性点',
    '19~24 岁是巅峰窗口，错过职业线就永远关闭',
    '代练赚得越多，封号越近，别问怎么知道的',
    '相同种子 + 相同选择 = 相同人生，可以发种子和朋友 PK',
    '失败海报比成功海报更好笑，放心晒'
  ];
  function renderHome() {
    $('st-runs').textContent = save.runs;
    $('st-horse').textContent = save.bestHorseName || '—';
    $('st-ach').textContent = Object.keys(save.ach).length + '/30';
    $('home-tip').textContent = '💡 ' + TIPS[Math.floor(Math.random() * TIPS.length)];
    var canG = Object.keys(save.unlockedTalents).length < 7 && save.essence >= 100;
    $('gacha-dot').classList.toggle('hidden', !canG);
  }
  document.querySelectorAll('#seg-mode button').forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll('#seg-mode button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
    };
  });
  $('btn-start').onclick = function () {
    seedInput = $('in-seed').value.trim();
    var mode = document.querySelector('#seg-mode button.on').getAttribute('data-m');
    run = game.newRun({ seed: seedInput || undefined, mode: mode });
    hand = game.drawTen(run, save.unlockedTalents);
    picked = []; bonusPts = 0; goldCount = hand.filter(function (t) { return t.rarity === 'gold'; }).length;
    renderDraw();
    show('s-draw');
  };

  // ---------- 抽天赋 ----------
  function slotUsed() { return picked.reduce(function (s, id) { return s + (game.talentById(id).cost || 1); }, 0); }
  function renderDraw() {
    var g = $('draw-grid'); g.innerHTML = '';
    hand.forEach(function (t, i) {
      var d = document.createElement('div');
      d.className = 'tcard ' + RAR[t.rarity].c;
      d.style.animationDelay = (i * 45) + 'ms';
      d.innerHTML =
        '<div class="rar">' + RAR[t.rarity].n + '</div>' +
        '<div class="nm">' + t.name + '</div>' +
        '<div class="ds">' + t.desc + '</div>' +
        (t.cost === 2 ? '<div class="cost">占2槽</div>' : '') +
        (t.bonus ? '<div class="cost">+' + t.bonus + '点</div>' : '') +
        '<div class="check">✓</div>';
      d.onclick = function () { toggleTalent(t.id, d); };
      g.appendChild(d);
    });
    updateSlots();
  }
  function toggleTalent(id, el) {
    var t = game.talentById(id), cost = t.cost || 1, used = slotUsed();
    var idx = picked.indexOf(id);
    if (idx >= 0) { picked.splice(idx, 1); el.classList.remove('sel'); }
    else {
      if (used + cost > 3) { toast('天赋槽不够啦（金色占 2 槽）'); return; }
      picked.push(id); el.classList.add('sel');
    }
    // 灰掉装不下的卡
    var left = 3 - slotUsed();
    document.querySelectorAll('.tcard').forEach(function (c, i) {
      var tt = hand[i];
      if (picked.indexOf(tt.id) < 0 && (tt.cost || 1) > left) c.classList.add('disabled');
      else c.classList.remove('disabled');
    });
    updateSlots();
  }
  function updateSlots() {
    var used = slotUsed();
    document.querySelectorAll('#slot-dots i').forEach(function (d, i) { d.classList.toggle('used', i < used); });
    $('slot-text').textContent = used + ' / 3';
    $('btn-draw-ok').disabled = used === 0;
  }
  $('btn-redraw').onclick = function () {
    if (save.essence < 50) { toast('蓝色精萃不足 50'); return; }
    save.essence -= 50; persist();
    hand = game.drawTen(run, save.unlockedTalents);
    picked = []; renderDraw();
    toast('命运已重新洗牌（-50 精萃）');
  };
  $('btn-draw-ok').onclick = function () {
    bonusPts = game.applyTalents(run, picked);
    allocBase = JSON.parse(JSON.stringify(run.attrs));
    allocLeft = 20 + bonusPts;
    renderAlloc();
    show('s-alloc');
  };

  // ---------- 属性分配 ----------
  function renderAlloc() {
    var list = $('attr-list'); list.innerHTML = '';
    ATTRS.forEach(function (a) {
      var v = run.attrs[a];
      var row = document.createElement('div');
      row.className = 'attr-row';
      row.innerHTML =
        '<div class="an">' + ATTR_NAME[a] + '</div>' +
        '<div class="track"><div class="fill" style="width:' + (v * 10) + '%"></div></div>' +
        '<div class="val" id="v-' + a + '">' + v + '</div>' +
        '<div class="stepper"><button id="minus-' + a + '">−</button><button id="plus-' + a + '">+</button></div>';
      list.appendChild(row);
      $('plus-' + a).onclick = function () {
        if (allocLeft <= 0) { toast('点数用完了'); return; }
        if (run.attrs[a] >= 10) { toast('这项已经拉满了'); return; }
        run.attrs[a] += 1; allocLeft -= 1; renderAlloc();
      };
      $('minus-' + a).onclick = function () {
        if (run.attrs[a] <= allocBase[a]) { toast('不能低于天赋初始值'); return; }
        run.attrs[a] -= 1; allocLeft += 1; renderAlloc();
      };
    });
    $('pts-left').textContent = allocLeft;
    $('btn-alloc-ok').disabled = allocLeft > 0;
    $('btn-alloc-ok').textContent = allocLeft > 0 ? '还有 ' + allocLeft + ' 点未分配' : '就这样，开启人生 →';
  }
  $('btn-alloc-ok').onclick = function () {
    startAttrs = JSON.parse(JSON.stringify(run.attrs));
    $('life-mode').textContent = run.mode === 'easy' ? ' · 轻松模式' : '';
    $('log').innerHTML = '';
    speed = 1; $('btn-speed').textContent = '加速 ▶▶'; $('btn-speed').classList.remove('on');
    renderHead();
    show('s-life');
    schedule(500);
  };

  // ---------- 人生回放 ----------
  function schedule(ms) { clearTimeout(timer); timer = setTimeout(tick, ms == null ? (speed === 2 ? 260 : 950) : ms); }
  function tick() {
    if (busy || !run || run.ended) { if (run && run.ended) finish(); return; }
    var evs = game.step(run);
    renderHead();
    appendEvents(evs, 0, function () {
      if (run.ended) { finish(); return; }
      if (run.pending) { openChoice(); return; }
      schedule();
    });
  }
  function appendEvents(evs, i, cb) {
    if (i >= evs.length) { cb && cb(); return; }
    var e = evs[i];
    var box = document.createElement('div');
    box.className = 'ev' + (e.special === 'highlight' ? ' special-h' : e.special === 'disaster' ? ' special-d' : '') + (e.death ? ' death' : '');
    box.innerHTML = '<div class="eage">' + e.age + ' 岁</div><div class="etext">' + e.text + '</div>' +
      (deltaText(e.eff, e.rp) ? '<div class="delta">' + deltaText(e.eff, e.rp) + '</div>' : '');
    var log = $('log');
    log.appendChild(box);
    window.scrollTo({ top: document.body.scrollHeight, behavior: speed === 2 ? 'auto' : 'smooth' });
    setTimeout(function () { appendEvents(evs, i + 1, cb); }, speed === 2 ? 160 : 560);
  }
  function renderHead() {
    $('life-age').textContent = Math.max(run.age, 6);
    var rk = game.rankAt(run.rp), pk = game.rankAt(run.peakRp);
    $('rank-name').textContent = rk.name;
    $('rank-peak').textContent = pk.name + ' ' + Math.round(run.peakRp);
    $('rank-fill').style.width = Math.min(100, run.peakRp / 75) + '%';
    var ma = $('mini-attrs'); ma.innerHTML = '';
    ATTRS.forEach(function (a) {
      var d = document.createElement('div');
      d.className = 'ma' + (run.attrs[a] <= 2 ? ' danger' : '');
      d.innerHTML = ATTR_NAME[a] + '<b>' + run.attrs[a] + '</b>';
      ma.appendChild(d);
    });
  }
  $('btn-speed').onclick = function () {
    speed = speed === 1 ? 2 : 1;
    $('btn-speed').textContent = speed === 2 ? '极速 ⏩' : '加速 ▶▶';
    $('btn-speed').classList.toggle('on', speed === 2);
    if (!run.pending && !run.ended) schedule();
  };
  $('btn-skip').onclick = function () { speed = 2; $('btn-speed').textContent = '极速 ⏩'; $('btn-speed').classList.add('on'); if (!run.pending && !run.ended) schedule(); };
  document.getElementById('s-life').addEventListener('click', function (e) {
    if (e.target.closest('.life-tools') || run.pending) return;
    if (speed !== 2) { speed = 2; $('btn-speed').textContent = '极速 ⏩'; $('btn-speed').classList.add('on'); schedule(); }
  });

  // ---------- 选择支 ----------
  function openChoice() {
    busy = true;
    var ev = run.pending.event, vis = game['_visibleChoices'](run, ev);
    $('q-age').textContent = run.age + ' 岁 · 人生岔路口';
    $('q-text').textContent = ev.text;
    var box = $('q-options'); box.innerHTML = '';
    vis.forEach(function (ch, i) {
      var b = document.createElement('button');
      b.className = 'choice';
      var rate = ch.check ? game.choiceRate(run, ch) : null;
      var rateTag = '';
      if (rate != null) {
        var cls = rate >= 65 ? 'hi' : rate >= 40 ? 'mid' : 'lo';
        rateTag = '<span class="rate ' + cls + '">成功率 ' + rate + '%</span>';
      }
      b.innerHTML = ch.text + rateTag;
      b.onclick = function () { answerChoice(i); };
      box.appendChild(b);
    });
    $('mask-choice').classList.remove('hidden');
  }
  function answerChoice(i) {
    var ch = game['_visibleChoices'](run, run.pending.event)[i];
    var isCheck = !!ch.check;
    var rec = game.answer(run, i);
    $('mask-choice').classList.add('hidden');
    if (isCheck) showCheck(rec);
    else showPlainBranch(rec);
  }
  function showPlainBranch(rec) {
    busy = true;
    var ev = run.pending ? null : rec;
    $('q-age').textContent = rec.age + ' 岁';
    $('q-text').textContent = rec.choice.replace(/^「|」$/g, '');
    $('q-options').innerHTML = '<div class="branch win"><span class="res">✅ 你的选择</span>' + rec.resultText + '</div>' +
      '<button class="btn block" id="q-continue" style="margin-top:12px">继续</button>';
    $('mask-choice').classList.remove('hidden');
    $('q-continue').onclick = function () {
      $('mask-choice').classList.add('hidden'); busy = false;
      if (run.ended) finish(); else schedule(300);
    };
  }
  function showCheck(rec) {
    var mask = $('mask-check'), dice = $('check-dice'), br = $('check-branch');
    dice.textContent = '🎲';
    br.className = 'branch'; br.innerHTML = '命运的骰子正在转动…';
    mask.classList.remove('hidden');
    $('btn-check-ok').classList.add('hidden');
    setTimeout(function () {
      dice.textContent = rec.success ? '🎉' : '💥';
      br.className = 'branch ' + (rec.success ? 'win' : 'fail');
      br.innerHTML = '<span class="res">' + (rec.success ? '检定成功！' : '检定失败…') + '</span>' + rec.resultText;
      $('btn-check-ok').classList.remove('hidden');
    }, 1050);
    $('btn-check-ok').onclick = function () {
      mask.classList.add('hidden'); busy = false;
      if (run.ended) finish(); else schedule(300);
    };
  }

  // ---------- 结局 ----------
  function pickMoment(list) {
    if (!list || !list.length) return null;
    return list[list.length - 1];
  }
  function finish() {
    clearTimeout(timer);
    var end = run.ending, peak = game.rankAt(run.peakRp);
    save.runs += 1;
    var isNewEnding = !save.endings[end.id];
    save.endings[end.id] = (save.endings[end.id] || 0) + 1;
    if (peak.horse === '牛马') save.oxHorse += 1;
    if (!save.bestHorse || HORSE_ORDER[peak.horse] > HORSE_ORDER[save.bestHorse]) {
      save.bestHorse = peak.horse; save.bestHorseName = peak.horse + ' · ' + peak.name;
    }
    var isSameSeed = seedInput && save.seeds[seedInput];
    if (seedInput) save.seeds[seedInput] = true;

    // 海报
    var poster = $('poster');
    poster.className = end.tier === 'death' ? 'death' : (end.tier === 'good' || end.tier === 'hidden' ? 'good' : '');
    $('p-horse').textContent = peak.horse;
    $('p-icon').textContent = end.icon;
    $('p-title').textContent = end.title;
    $('p-line').textContent = end.line;
    $('p-epitaph').textContent = end.epitaph;
    $('p-age').textContent = run.diedAge;
    $('p-peakrank').textContent = peak.name + (end.tier === 'death' ? '（' + Math.round(run.peakRp) + '）' : '');
    $('p-name').textContent = $('in-name').value.trim() || '神秘召唤师';
    var pa = $('p-attrs'); pa.innerHTML = '';
    ATTRS.forEach(function (a) {
      pa.innerHTML += '<div class="pa"><div class="lab">' + ATTR_NAME[a] + '</div><div class="bar"><i style="width:' + run.attrs[a] * 10 + '%"></i></div><b>' + run.attrs[a] + '</b></div>';
    });
    var hi = pickMoment(run.special.highlight), lo = pickMoment(run.special.disaster);
    $('p-hi').classList.toggle('hidden', !hi); $('p-hi-t').textContent = hi ? (hi.age + ' 岁：' + hi.text) : '';
    $('p-lo').classList.toggle('hidden', !lo); $('p-lo-t').textContent = lo ? (lo.age + ' 岁：' + lo.text) : '';
    // 二维码：扫码回到游戏
    try {
      var qr = qrcode(0, 'M');
      qr.addData('https://godweiyang.com/restart/');
      qr.make();
      $('p-qr-img').src = qr.createDataURL(5, 2);
    } catch (e) {}

    // 精萃
    var gain = ESSENCE[end.tier] || 30;
    if (isNewEnding) gain += 30;
    save.essence += gain;
    $('p-essence').textContent = gain + (isNewEnding ? '（含新结局 +30）' : '');

    // 成就
    var got = checkAchievements(isSameSeed);
    persist();
    if (got.length) setTimeout(function () { toast('解锁成就 ×' + got.length + ' 📖'); }, 600);

    $('btn-sameseed').style.display = seedInput ? 'block' : 'none';
    show('s-end');
  }

  function checkAchievements(isSameSeed) {
    var A = DATA.meta.achievements, end = run.ending, peak = game.rankAt(run.peakRp);
    var unlock = function (id) { if (!save.ach[id]) { save.ach[id] = true; return true; } return false; };
    var got = [];
    var allEndings = DATA.meta.endings;
    var checks = {
      a_first_run: true,
      a_restart_10: save.runs + 1 >= 10,
      a_restart_50: save.runs + 1 >= 50,
      a_die_first: end.tier === 'death' && run.diedAge < 18,
      a_die_all: allEndings.filter(function (e) { return e.tier === 'death'; }).every(function (e) { return save.endings[e.id]; }),
      a_king: end.id === 'g_champion',
      a_pro: !!(run.flags.pro_path || run.flags.tryout),
      a_good_end: end.tier === 'good' || end.tier === 'hidden',
      a_hidden: end.tier === 'hidden',
      a_hidden_all: allEndings.filter(function (e) { return e.tier === 'hidden'; }).every(function (e) { return save.endings[e.id]; }),
      a_three_gold: goldCount >= 3,
      a_max_attr: Math.max.apply(null, ATTRS.map(function (a) { return startAttrs[a]; })) >= 10,
      a_balanced: ATTRS.every(function (a) { return run.attrs[a] >= 6; }),
      a_low_all: ATTRS.every(function (a) { return run.attrs[a] <= 3; }) && run.diedAge >= 30,
      a_05: picked.indexOf('t02') >= 0 && run.diedAge >= 35,
      a_poison: end.id === 'h_poison',
      a_sixth: picked.indexOf('t17') >= 0 && run.peakRp >= 7500,
      a_streak15: run.streak >= 8,
      a_loss15: run.loss >= 8,
      a_never_win: picked.indexOf('t59') >= 0 && run.peakRp < 900,
      a_f2p: !run.flags.skin_gambler && run.attrs.fam <= 3 && run.peakRp >= 4200,
      a_gacha: (run.vars.gacha || 0) >= 5,
      a_team: !!(run.flags.fixed_team && run.flags.ritual_reunion),
      a_old_bros: end.id === 'h_final_together',
      a_best_horse: peak.horse === '天选马',
      a_ox_horse: save.oxHorse >= 3,
      a_same_seed: !!isSameSeed,
      a_full_talent: DATA.talents.talents.every(function (t) { return !t.locked || save.unlockedTalents[t.id]; }),
      a_full_ending: allEndings.every(function (e) { return save.endings[e.id]; })
    };
    A.forEach(function (a) { if (checks[a.id] && unlock(a.id)) got.push(a.name); });
    return got;
  }

  // ---------- 海报 / 文案 ----------
  function copyText() {
    var end = run.ending, peak = game.rankAt(run.peakRp);
    var name = $('in-name').value.trim() || '神秘召唤师';
    var hi = pickMoment(run.special.highlight), lo = pickMoment(run.special.disaster);
    var t = '【开黑生涯鉴定】\n召唤师：' + name + '\n' +
      '这一世我是「' + peak.horse + ' · ' + end.title + '」，终年 ' + run.diedAge + ' 岁，巅峰 ' + peak.name + '\n';
    if (end.tier === 'death') t += '死因：' + end.line + '\n墓志铭：' + end.epitaph + '\n';
    if (hi) t += '🏅 高光：' + hi.text + '\n';
    if (lo) t += '💀 至暗：' + lo.text + '\n';
    t += '——来自 godweiyang.com 开黑重开模拟器';
    return t;
  }
  $('btn-copy').onclick = function () {
    var t = copyText();
    var done = function () { toast('鉴定文案已复制，去群里晒吧'); if (!save.ach.a_posted) { save.ach.a_posted = true; persist(); renderHome(); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请长按选择文本'); }
      ta.remove();
    }
  };
  $('btn-poster').onclick = function () {
    if (!window.htmlToImage) { posterFallback(); return; }
    window.htmlToImage.toPng($('poster'), { pixelRatio: 2, backgroundColor: '#15102e' }).then(function (url) {
      var a = document.createElement('a');
      a.href = url; a.download = '开黑重开-' + run.ending.title + '.png'; a.click();
      toast('海报已保存');
      if (!save.ach.a_posted) { save.ach.a_posted = true; persist(); renderHome(); }
    }, posterFallback);
  };
  function posterFallback() {
    toast('当前浏览器不支持自动导出，可截图保存海报');
  };
  $('btn-again').onclick = function () { renderHome(); show('s-home'); };
  $('btn-sameseed').onclick = function () {
    var mode = document.querySelector('#seg-mode button.on').getAttribute('data-m');
    run = game.newRun({ seed: seedInput || undefined, mode: mode });
    hand = game.drawTen(run, save.unlockedTalents);
    picked = []; bonusPts = 0; goldCount = hand.filter(function (t) { return t.rarity === 'gold'; }).length;
    renderDraw(); show('s-draw');
  };

  // ---------- 图鉴 / 抽卡 ----------
  var mTab = 'talent';
  document.querySelectorAll('#m-tabs button').forEach(function (b) {
    b.onclick = function () {
      mTab = b.getAttribute('data-t');
      document.querySelectorAll('#m-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      renderCollection();
    };
  });
  $('btn-book').onclick = function () { $('m-tabs').classList.remove('hidden'); mTab = 'talent'; renderCollection(); $('mask-modal').classList.remove('hidden'); };

  function renderCollection() {
    var body = $('m-body');
    body.className = 'coll-list';
    if (mTab === 'talent') {
      body.innerHTML = '<div style="text-align:center;margin-bottom:12px">蓝色精萃：<b style="color:var(--gold)">' + save.essence +
        '</b>　已解锁天赋：<b style="color:var(--gold)">' + DATA.talents.talents.filter(function (t) { return !t.locked || save.unlockedTalents[t.id]; }).length + '/60</b></div>' +
        '<button class="btn block" id="m-gacha" style="margin-bottom:14px">🎁 100 精萃抽一个锁定天赋</button>';
      $('m-gacha').onclick = doGacha;
      DATA.talents.talents.forEach(function (t) {
        var owned = !t.locked || !!save.unlockedTalents[t.id];
        body.innerHTML += '<div class="coll-item' + (owned ? '' : ' locked') + '"><div class="ci">' + (owned ? (t.rarity === 'gold' ? '🌟' : t.rarity === 'purple' ? '💜' : t.rarity === 'gray' ? '⚪' : '💙') : '🔒') + '</div>' +
          '<div><div class="cn">' + (owned ? t.name : '？？？') + '</div><div class="cd">' + (owned ? t.desc : '用精萃抽取解锁，解锁后进入十连卡池') + '</div></div>' +
          '<div class="cstat">' + RAR[t.rarity].n + '</div></div>';
      });
    } else if (mTab === 'ending') {
      var n = 0;
      DATA.meta.endings.forEach(function (e) {
        var seen = save.endings[e.id];
        if (seen) n++;
        body.innerHTML += '<div class="coll-item' + (seen ? '' : ' locked') + '"><div class="ci">' + (seen ? e.icon : '❔') + '</div>' +
          '<div><div class="cn">' + (seen ? e.title : '未解锁结局') + '</div><div class="cd">' + (seen ? e.line + '（已达成 ' + seen + ' 次）' : '继续重开，探索未知人生') + '</div></div></div>';
      });
      body.innerHTML = '<div style="text-align:center;margin-bottom:12px">已发现 <b style="color:var(--gold)">' + n + '/' + DATA.meta.endings.length + '</b> 种结局</div>' + body.innerHTML;
    } else {
      var got = 0;
      DATA.meta.achievements.forEach(function (a) {
        var has = !!save.ach[a.id];
        if (has) got++;
        body.innerHTML += '<div class="coll-item' + (has ? '' : ' locked') + '"><div class="ci">' + (has ? '🏅' : '🔒') + '</div>' +
          '<div><div class="cn">' + a.name + '</div><div class="cd">' + a.desc + '</div></div></div>';
      });
      body.innerHTML = '<div style="text-align:center;margin-bottom:12px"><b style="color:var(--gold)">' + got + '/' + DATA.meta.achievements.length + '</b></div>' + body.innerHTML;
    }
  }
  function doGacha() {
    var locked = DATA.talents.talents.filter(function (t) { return t.locked && !save.unlockedTalents[t.id]; });
    if (!locked.length) { toast('所有天赋都已解锁'); return; }
    if (save.essence < 100) { toast('精萃不足，多暴毙几把就有了'); return; }
    save.essence -= 100;
    var t = locked[Math.floor(Math.random() * locked.length)];
    save.unlockedTalents[t.id] = true;
    persist(); renderHome();
    $('m-tabs').classList.add('hidden');
    $('m-body').className = 'gacha-box';
    $('m-body').innerHTML = '<div style="font-size:13px;color:var(--sub)">新天赋已永久加入卡池</div>' +
      '<div class="big">' + (t.rarity === 'gold' ? '🌟' : t.rarity === 'purple' ? '💜' : '💙') + '</div>' +
      '<div style="font-size:20px;font-weight:900;margin-bottom:8px">' + t.name + '</div>' +
      '<div style="color:var(--sub);font-size:13px;line-height:1.7;max-width:340px;margin:0 auto 16px">' + t.desc + '</div>' +
      '<button class="btn" id="m-gacha-ok">收下</button>';
    $('m-gacha-ok').onclick = function () { $('mask-modal').classList.add('hidden'); };
  }
  $('btn-gacha').onclick = function () { $('btn-book').click(); mTab = 'talent'; renderCollection(); };

  // ---------- 启动 ----------
  loadData().then(function () {
    renderHome();
  }).catch(function () {});
})();
