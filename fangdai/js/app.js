/* =========================================================
 * 房贷计算器 · 交互逻辑（表单 → 引擎 → 结果 / Excel / 海报）
 * ========================================================= */
(function () {
  'use strict';

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  // 金额一律精确到“元”（无小数）
  function fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return '-';
    return Math.round(Number(n)).toLocaleString('zh-CN');
  }

  var toastTimer = null;
  function toast(msg, isErr) {
    var t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 2600);
  }

  /* ---------- 第三方库按需懒加载：首屏不下载，保证页面打开即可点 ---------- */
  var LIBS = {
    xlsx: 'vendor/xlsx.full.min.js',
    h2i: 'vendor/html-to-image.min.js',
    qr: 'vendor/qrcode.min.js'
  };
  var libPromise = {};
  function loadLib(src) {
    if (libPromise[src]) return libPromise[src];
    libPromise[src] = new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = src; el.async = true;
      el.onload = function () { resolve(); };
      el.onerror = function () { delete libPromise[src]; reject(new Error('load fail')); };
      document.head.appendChild(el);
    });
    return libPromise[src];
  }

  /* ---------- 贷款数据（金额一律留空，仅保留利率/期数/还款日等非金额默认） ---------- */
  var LOAN_DATA = {
    commercial: { name: '商业贷款', rate: 3.2, balance: '', method: 'equal_payment', months: 360, day: 20 },
    fund:       { name: '公积金贷款', rate: 2.6, balance: '', method: 'equal_payment', months: 360, day: 20 }
  };
  var loanType = 'commercial'; // commercial | fund | combo

  function activeLoans() {
    if (loanType === 'combo') return [LOAN_DATA.commercial, LOAN_DATA.fund];
    if (loanType === 'fund') return [LOAN_DATA.fund];
    return [LOAN_DATA.commercial];
  }

  function loanCardHtml(d) {
    return '' +
    '<div class="loan-card" data-name="' + d.name + '">' +
      '<div class="lc-top"><div class="lc-badge">' + d.name.charAt(0) + '</div><div class="lc-title">' + d.name + '</div></div>' +
      '<div class="grid">' +
        '<div class="field"><label>当前剩余本金</label><div class="control"><input type="number" class="lc-balance" value="' + d.balance + '" min="0" step="10000" placeholder="如 1000000"></div></div>' +
        '<div class="field"><label>年利率</label><div class="control"><input type="number" class="lc-rate has-suffix" value="' + d.rate + '" min="0" step="0.1"><span class="suffix">%</span></div></div>' +
        '<div class="field"><label>还款方式</label><div class="control"><select class="lc-method">' +
          '<option value="equal_payment"' + (d.method === 'equal_payment' ? ' selected' : '') + '>等额本息</option>' +
          '<option value="equal_principal"' + (d.method === 'equal_payment' ? '' : ' selected') + '>等额本金</option>' +
        '</select></div></div>' +
        '<div class="field"><label>剩余期数</label><div class="control"><input type="number" class="lc-months has-suffix" value="' + d.months + '" min="1" step="1"><span class="suffix">个月</span></div></div>' +
        '<div class="field"><label>月供（自动计算）</label><div class="control"><input type="text" class="lc-autopay" readonly placeholder="填写后自动显示" style="background:#f1f5f8;color:var(--navy);font-weight:700;cursor:default"></div></div>' +
        '<div class="field"><label>每月还款日</label><div class="control"><input type="number" class="lc-day has-suffix" value="' + d.day + '" min="1" max="31" step="1"><span class="suffix">日</span></div></div>' +
      '</div>' +
    '</div>';
  }

  // 根据本金/利率/期数实时显示自动月供（只读，杜绝手填与公式不一致）
  function updateAutoPay(card) {
    var ap = $('.lc-autopay', card);
    if (!ap) return;
    var bal = parseFloat($('.lc-balance', card).value) || 0;
    var rate = (parseFloat($('.lc-rate', card).value) || 0) / 100;
    var method = $('.lc-method', card).value;
    var n = parseInt($('.lc-months', card).value, 10) || 1;
    if (bal <= 0) { ap.value = ''; return; }
    if (method === 'equal_payment') {
      ap.value = Math.round(LoanEngine.pmt(rate / 12, n, bal)).toLocaleString('zh-CN') + ' 元/月';
    } else {
      ap.value = Math.round(bal / n).toLocaleString('zh-CN') + ' 元本金/月起';
    }
  }

  function syncCard(card) {
    var key = card.getAttribute('data-name') === '公积金贷款' ? 'fund' : 'commercial';
    var d = LOAN_DATA[key];
    d.balance = $('.lc-balance', card).value;
    d.rate = parseFloat($('.lc-rate', card).value) || 0;
    d.method = $('.lc-method', card).value;
    d.months = parseInt($('.lc-months', card).value, 10) || 360;
    d.day = parseInt($('.lc-day', card).value, 10) || 20;
    updateAutoPay(card);
  }

  function renderLoans() {
    $('#loanList').innerHTML = activeLoans().map(loanCardHtml).join('');
    $all('.loan-card').forEach(updateAutoPay);
    rebuildTargetOptions();
  }

  function rebuildTargetOptions() {
    var sel = $('#ppTarget');
    var loans = activeLoans();
    var html = loans.map(function (l, i) { return '<option value="' + i + '">全部冲抵：' + l.name + '</option>'; }).join('');
    if (loans.length > 1) html += '<option value="highest">按利率从高到低自动分配</option>';
    sel.innerHTML = html;
  }

  // 卡片输入实时回写（切换贷款类型时不丢已填内容）
  $('#loanList').addEventListener('input', function (e) {
    var card = e.target.closest('.loan-card');
    if (card) syncCard(card);
  });
  $('#loanList').addEventListener('change', function (e) {
    var card = e.target.closest('.loan-card');
    if (card) syncCard(card);
  });

  // 贷款类型切换
  $('#loanTypeSeg').addEventListener('click', function (e) {
    var opt = e.target.closest('.opt');
    if (!opt) return;
    $all('.opt', this).forEach(function (o) { o.classList.remove('active'); });
    opt.classList.add('active');
    loanType = opt.getAttribute('data-type');
    renderLoans();
  });

  /* ---------- 自定义年月选择器 ---------- */
  var picker = { selY: 2026, selM: 9, viewY: 2026, mode: 'month' };
  function ymText() { return picker.selY + '年' + (picker.selM + 1) + '月'; }

  function renderYmGrid() {
    var grid = $('#ymGrid'), h = '', i;
    if (picker.mode === 'month') {
      grid.className = 'ym-grid month-view';
      for (i = 0; i < 12; i++) {
        h += '<button type="button" data-m="' + i + '" class="' +
          (picker.viewY === picker.selY && i === picker.selM ? 'sel' : '') + '">' + (i + 1) + '月</button>';
      }
      $('#ymYLab').textContent = picker.viewY + ' 年';
    } else {
      grid.className = 'ym-grid year-view';
      var base = Math.floor(picker.viewY / 12) * 12;
      for (i = 0; i < 12; i++) {
        var yy = base + i;
        h += '<button type="button" data-y="' + yy + '" class="' + (yy === picker.selY ? 'cur' : '') + '">' + yy + '</button>';
      }
      $('#ymYLab').innerHTML = base + ' - ' + (base + 11) + ' 年';
    }
    grid.innerHTML = h;
  }
  function openYm() {
    $('#startPicker').classList.add('open');
    $('#ymPop').classList.remove('hidden');
    picker.viewY = picker.selY; picker.mode = 'month'; renderYmGrid();
  }
  function closeYm() {
    $('#startPicker').classList.remove('open');
    $('#ymPop').classList.add('hidden');
  }
  $('#ymDisplay').addEventListener('click', function (e) {
    e.stopPropagation();
    if ($('#startPicker').classList.contains('open')) closeYm(); else openYm();
  });
  $('#ymPrev').addEventListener('click', function () {
    picker.viewY += picker.mode === 'month' ? -1 : -12; renderYmGrid();
  });
  $('#ymNext').addEventListener('click', function () {
    picker.viewY += picker.mode === 'month' ? 1 : 12; renderYmGrid();
  });
  $('#ymYLab').addEventListener('click', function () {
    picker.mode = picker.mode === 'month' ? 'year' : 'month'; renderYmGrid();
  });
  $('#ymGrid').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (picker.mode === 'month') {
      picker.selM = Number(b.getAttribute('data-m'));
      picker.selY = picker.viewY;
      $('#ymText').textContent = ymText();
      closeYm();
    } else {
      picker.viewY = Number(b.getAttribute('data-y'));
      picker.mode = 'month'; renderYmGrid();
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#startPicker')) closeYm();
  });

  /* ---------- 月份多选（提前还款月份） ---------- */
  (function () {
    var box = $('#monthToggles');
    var html = '';
    for (var i = 1; i <= 12; i++) {
      html += '<button type="button" data-m="' + i + '" class="' + (i === 4 || i === 10 ? 'active' : '') + '">' + i + '月</button>';
    }
    box.innerHTML = html;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) b.classList.toggle('active');
    });
  })();

  /* ---------- 开关 ---------- */
  function bindSwitch(swId, bodyId, onByDefault) {
    var sw = $('#' + swId), body = $('#' + bodyId);
    if (onByDefault) { sw.classList.add('on'); body.classList.remove('hidden'); }
    sw.addEventListener('click', function () {
      sw.classList.toggle('on');
      body.classList.toggle('hidden', !sw.classList.contains('on'));
    });
  }
  bindSwitch('prepaySwitch', 'prepayBody', true);
  bindSwitch('incomeSwitch', 'incomeBody', false);

  $('#ppModeSeg').addEventListener('click', function (e) {
    var opt = e.target.closest('.opt');
    if (!opt) return;
    $all('.opt', this).forEach(function (o) { o.classList.remove('active'); });
    opt.classList.add('active');
    opt.querySelector('input').checked = true;
  });

  /* ---------- 读取表单 ---------- */
  function readConfig() {
    var loans = $all('.loan-card').map(function (card) {
      function v(cls) { var el = $('.' + cls, card); return el ? el.value : ''; }
      return {
        name: card.getAttribute('data-name'),
        balance: parseFloat(v('lc-balance')) || 0,
        annualRate: (parseFloat(v('lc-rate')) || 0) / 100,
        method: v('lc-method'),
        remainingMonths: Math.max(1, parseInt(v('lc-months'), 10) || 1),
        paymentDay: parseInt(v('lc-day'), 10) || 20
      };
    });

    var months = $all('#monthToggles button.active').map(function (b) { return Number(b.getAttribute('data-m')); });
    var cfg = {
      startYear: picker.selY,
      startMonth: picker.selM,
      loans: loans,
      prepay: {
        enabled: $('#prepaySwitch').classList.contains('on'),
        amount: parseFloat($('#ppAmount').value) || 0,
        months: months,
        target: $('#ppTarget').value,
        mode: $all('input[name="ppmode"]').filter(function (i) { return i.checked; })[0].value
      },
      income: {
        enabled: $('#incomeSwitch').classList.contains('on'),
        startingSavings: parseFloat($('#inSavings').value) || 0,
        annualIncome: parseFloat($('#inIncome').value) || 0,
        annualLiving: parseFloat($('#inLiving').value) || 0,
        monthlyFund: parseFloat($('#inFund').value) || 0
      }
    };
    return cfg;
  }

  function validate(cfg) {
    if (!cfg.loans.some(function (l) { return l.balance > 0; })) return '请填写剩余本金';
    for (var i = 0; i < cfg.loans.length; i++) {
      var l = cfg.loans[i];
      if (!l.remainingMonths) return '请填写「' + l.name + '」的剩余期数';
      if (l.annualRate < 0) return '年利率不能为负';
    }
    if (cfg.prepay.enabled) {
      if (cfg.prepay.amount <= 0) return '请填写每次提前还款金额';
      if (!cfg.prepay.months.length) return '请至少选择一个提前还款月份';
    }
    if (cfg.income.enabled) {
      if (cfg.income.annualIncome <= 0) return '请填写税后年收入';
      if (cfg.income.annualLiving < 0) return '年生活支出不能为负';
    }
    return null;
  }

  /* ---------- 测算 + 渲染 ---------- */
  var lastResult = null, lastCfg = null;

  function latestPayoff(res) {
    var labels = res.loanSummary.map(function (l) { return l.payoff; }).filter(function (p) { return p !== '—'; });
    labels.sort();
    return labels[labels.length - 1] || '—';
  }

  /* ---------- “还剩几年几个月”倒计时 ---------- */
  function parseYM(s) {
    var mt = /(\d+)年(\d+)月/.exec(s || '');
    return mt ? { y: Number(mt[1]), m: Number(mt[2]) - 1 } : null;
  }
  function remainParts(cfg, ym) {
    var diff = (ym.y - cfg.startYear) * 12 + (ym.m - cfg.startMonth);
    if (diff < 0) diff = 0;
    return { y: Math.floor(diff / 12), m: diff % 12, total: diff };
  }
  // 大号炫酷倒计时：超大数字 + 小单位
  function countdownHtml(p) {
    if (p.total <= 0) return '<span class="cd-now">当月结清</span>';
    var h = '';
    if (p.y > 0) h += '<span class="cd-n">' + p.y + '</span><span class="cd-u">年</span>';
    if (p.m > 0) h += '<span class="cd-n">' + p.m + '</span><span class="cd-u">个月</span>';
    return h;
  }
  // 紧凑文本（用于每笔贷款小字处）
  function shortRemain(p) {
    if (p.total <= 0) return '当月';
    var s = '';
    if (p.y > 0) s += p.y + '年';
    if (p.m > 0) s += p.m + '个月';
    return s;
  }

  function renderResult(cfg, res) {
    $('#resultArea').classList.remove('hidden');

    var overallYM = parseYM(latestPayoff(res));
    var overallParts = overallYM ? remainParts(cfg, overallYM) : null;
    var totalPrincipal = cfg.loans.reduce(function (a, l) { return a + l.balance; }, 0);

    // 卡1：时间合并卡（左=按计划逐期结清[非一次性]，右=最快一次性结清[绿色突出]）
    var cardsHtml = '<div class="rcard time-card c6"><div class="tc-col plan">' +
      '<div class="tc-lab">按计划全部结清</div>' +
      '<div class="tc-cd">' + (overallParts ? countdownHtml(overallParts) : '—') + '</div>' +
      '<div class="tc-sub">' + latestPayoff(res) + ' 按月供逐期结清（非一次性）</div></div>';
    if (cfg.income.enabled) {
      var e0 = res.earliest;
      var fparts = e0 ? remainParts(cfg, { y: e0.y, m: e0.m }) : null;
      cardsHtml += '<div class="tc-col fast">' +
        '<div class="tc-lab">最快一次性结清</div>' +
        '<div class="tc-cd">' + (fparts ? countdownHtml(fparts) : '收入不足以提前结清') + '</div>' +
        (e0 ? '<div class="tc-sub">' + e0.label + ' 可一次性结清</div>' : '') + '</div>';
    }
    cardsHtml += '</div>';
    // 卡2-4：当前剩余本金 / 未来利息 / 提前还款
    cardsHtml += '<div class="rcard c2"><div class="lab">当前剩余本金</div><div class="val">' + fmt(totalPrincipal) + '</div></div>';
    cardsHtml += '<div class="rcard c2"><div class="lab">未来应付利息合计</div><div class="val">' + fmt(res.totalInterest) + '</div></div>';
    cardsHtml += '<div class="rcard c2"><div class="lab">提前还款本金合计</div><div class="val">' + fmt(res.totalPrepay) + '</div></div>';
    $('#resultCards').innerHTML = cardsHtml;

    $('#loanResults').innerHTML = res.loanSummary.map(function (l, i) {
      var loan = cfg.loans[i];
      var pym = parseYM(l.payoff), pp = pym ? remainParts(cfg, pym) : null;
      return '<div class="lres"><h3><span class="dot"></span>' + loan.name + '</h3>' +
        '<div class="kv"><span>还需多久</span><b class="kv-cd">' + (pp ? shortRemain(pp) : '—') + '</b></div>' +
        '<div class="kv"><span>结清于</span><b>' + l.payoff + '</b></div>' +
        '<div class="kv"><span>未来利息</span><b>' + fmt(l.totalInterest) + '</b></div>' +
        '<div class="kv"><span>提前偿还本金</span><b>' + fmt(l.totalPrepay) + '</b></div></div>';
    }).join('');

    // 动态表头
    var cols = ['月份'];
    cfg.loans.forEach(function (l) { cols.push(l.name + '月供', l.name + '利息', l.name + '还本', l.name + '剩余本金'); });
    cols.push('提前还本', '当月还款合计', '剩余本金合计', '累计利息');
    $('#schedHead').innerHTML = '<tr>' + cols.map(function (c, i) {
      return '<th class="' + (i === 0 ? 'lft' : '') + '">' + c + '</th>';
    }).join('') + '</tr>';

    drawTable(res, 'all');

    var notes = [];
    notes.push('<b>怎么看一次性结清要准备多少钱：</b>「剩余本金合计」列是当月还款后还欠的本金；提前结清只按实际占用天数计息，后续未产生的利息无需支付，结清额 ≈ 当月期初本金 + 当月利息。');
    if (cfg.prepay.enabled) {
      notes.push('<b>提前还款：</b>每年 ' + cfg.prepay.months.join('、') + ' 月各提前偿还 ' + fmt(cfg.prepay.amount) +
        ' 元，方式为「' + (cfg.prepay.mode === 'shorten' ? '缩短期限、月供不变' : '减少月供、期限不变') + '」。');
    }
    if (cfg.income.enabled && cfg.income.monthlyFund > 0) {
      notes.push('<b>公积金抵扣：</b>每月公积金 ' + fmt(cfg.income.monthlyFund) +
        ' 元默认先用于偿还月供，有富余计入存款，不足部分从到手收入扣除。');
    }
    notes.push('<b>利率与金额假设：</b>按当前利率（' + cfg.loans.map(function (l) { return l.name + ' ' + (l.annualRate * 100).toFixed(2) + '%'; }).join('；') +
      '）保持不变测算，浮动利率未来重定价后结果会变化；所有金额精确到元（四舍五入），末期可能有 1 元内尾差。');
    $('#resultNote').innerHTML = notes.join('<br>');
  }

  function cell(v, zeroPlain) {
    if (!v) return zeroPlain ? '0' : '<span class="z">-</span>';
    return fmt(v);
  }

  function rowHtml(r) {
    var cls = '';
    if (r.endTotal === 0) cls = 'payoff-row';
    else if (r.prepayTotal > 0) cls = 'prepay-row';
    var tds = '<td class="lft">' + r.label + '</td>';
    r.perLoan.forEach(function (p) {
      tds += '<td>' + cell(p.regPay) + '</td><td>' + cell(p.interest) + '</td><td>' + cell(p.regPrin) + '</td><td>' + cell(p.end, true) + '</td>';
    });
    tds += '<td>' + (r.prepayTotal ? '<span class="pos">' + fmt(r.prepayTotal) + '</span>' : '<span class="z">-</span>') + '</td>';
    tds += '<td>' + fmt(r.cashOut) + '</td><td>' + fmt(r.endTotal) + '</td><td>' + fmt(r.cumInterest) + '</td>';
    return '<tr class="' + cls + '" data-prepay="' + (r.prepayTotal > 0 ? 1 : 0) + '" data-month="' + r.m + '">' + tds + '</tr>';
  }

  function drawTable(res, mode) {
    $('#schedBody').innerHTML = res.rows.map(function (r) {
      return { html: rowHtml(r), prepay: r.prepayTotal > 0, month: r.m };
    }).filter(function (d) {
      if (mode === 'prepay') return d.prepay;
      if (mode === 'annual') return d.month === 11;
      return true;
    }).map(function (d) { return d.html; }).join('');
  }

  $('#tableFilter').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    $all('button', this).forEach(function (x) { x.classList.remove('active'); });
    b.classList.add('active');
    drawTable(lastResult, b.getAttribute('data-f'));
  });

  $('#btnCalc').addEventListener('click', function () {
    var cfg = readConfig();
    var err = validate(cfg);
    if (err) { toast(err, true); return; }
    try {
      lastCfg = cfg;
      lastResult = LoanEngine.buildSchedule(cfg);
    } catch (ex) { toast('测算失败：' + ex.message, true); return; }
    renderResult(cfg, lastResult);
    $('#btnExcel').disabled = false;
    $('#btnPoster').disabled = false;
    toast('测算完成，共生成 ' + lastResult.rows.length + ' 期还款计划');
    $('#resultArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- 导出 Excel（列随贷款笔数动态生成） ---------- */
  $('#btnExcel').addEventListener('click', async function () {
    if (!lastResult) return;
    var xb = this, xot = xb.innerHTML;
    xb.disabled = true; xb.textContent = '组件加载中…';
    try { await loadLib(LIBS.xlsx); } catch (e) {
      toast('Excel 组件加载失败，请检查网络后重试', true);
      xb.disabled = false; xb.innerHTML = xot; return;
    }
    xb.disabled = false; xb.innerHTML = xot;
    var cfg = lastCfg, res = lastResult;

    var overview = [
      ['房贷还款计划 · 总览'],
      ['生成时间', new Date().toLocaleString('zh-CN')],
      ['测算起始月份', cfg.startYear + '-' + String(cfg.startMonth + 1).padStart(2, '0')],
      []
    ];
    cfg.loans.forEach(function (l, i) {
      var s = res.loanSummary[i];
      overview.push([l.name]);
      overview.push(['  当前剩余本金', Math.round(l.balance)]);
      overview.push(['  年利率', (l.annualRate * 100).toFixed(2) + '%']);
      overview.push(['  还款方式', l.method === 'equal_payment' ? '等额本息' : '等额本金']);
      overview.push(['  剩余期数', l.remainingMonths]);
      overview.push(['  结清时间', s.payoff]);
      overview.push(['  未来利息', s.totalInterest]);
      overview.push(['  提前偿还本金', s.totalPrepay]);
    });
    overview.push([]);
    overview.push(['未来利息合计', res.totalInterest]);
    overview.push(['提前还款本金合计', res.totalPrepay]);
    if (cfg.income.enabled) {
      overview.push(['每月公积金缴存额', cfg.income.monthlyFund || 0]);
    }
    if (res.earliest) overview.push(['最快可一次性结清', res.earliest.label, '当月需约 ' + fmt(res.earliest.needed) + ' 元']);

    var head = ['月份'];
    cfg.loans.forEach(function (l) { head.push(l.name + '月供', l.name + '利息', l.name + '还本', l.name + '剩余本金'); });
    head.push('提前还本', '当月还款合计', '剩余本金合计', '累计利息');
    var detail = [head];
    res.rows.forEach(function (r) {
      var row = [r.label];
      r.perLoan.forEach(function (p) { row.push(p.regPay || 0, p.interest || 0, p.regPrin || 0, p.end || 0); });
      row.push(r.prepayTotal || 0, r.cashOut, r.endTotal, r.cumInterest);
      detail.push(row);
    });

    var annual = [['年份', '当年利息', '提前还款', '偿还本金合计', '正常月供合计', '年末剩余本金', '当年现金流出']];
    res.annual.forEach(function (a) {
      annual.push([a.year, a.interest, a.prepay, a.principal, a.regPay, a.endBalance, a.cashOut]);
    });

    var wb = XLSX.utils.book_new();
    var s1 = XLSX.utils.aoa_to_sheet(overview);
    var s2 = XLSX.utils.aoa_to_sheet(detail);
    var s3 = XLSX.utils.aoa_to_sheet(annual);
    s1['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 26 }];
    s2['!cols'] = head.map(function () { return { wch: 14 }; });
    s3['!cols'] = annual[0].map(function () { return { wch: 15 }; });
    XLSX.utils.book_append_sheet(wb, s1, '总览');
    XLSX.utils.book_append_sheet(wb, s2, '逐月明细');
    XLSX.utils.book_append_sheet(wb, s3, '年度汇总');
    var d = new Date();
    var fname = '房贷还款计划_' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + '.xlsx';
    XLSX.writeFile(wb, fname);
    toast('Excel 已生成并开始下载');
  });

  /* ---------- 概览海报 ---------- */
  function buildPoster(cfg, res) {
    var now = new Date();
    var totalPrincipal = cfg.loans.reduce(function (a, l) { return a + l.balance; }, 0);
    var pYM = parseYM(latestPayoff(res));
    var pParts = pYM ? remainParts(cfg, pYM) : null;
    var loansHtml = res.loanSummary.map(function (s, i) {
      var l = cfg.loans[i];
      var lpym = parseYM(s.payoff), lpp = lpym ? remainParts(cfg, lpym) : null;
      return '<div class="p-loan"><div class="lt"><span>' + l.name + '</span><span class="off">还剩 ' + (lpp ? shortRemain(lpp) : '—') + '</span></div>' +
        '<div class="lk"><span>年利率 ' + (l.annualRate * 100).toFixed(1) + '% · ' + (l.method === 'equal_payment' ? '等额本息' : '等额本金') + '</span></div>' +
        '<div class="lk"><span>结清于</span><b>' + s.payoff + '</b></div>' +
        '<div class="lk"><span>未来利息</span><b>' + fmt(s.totalInterest) + '</b></div>' +
        '<div class="lk"><span>提前偿还本金</span><b>' + fmt(s.totalPrepay) + '</b></div></div>';
    }).join('');

    // 卡1：时间合并卡（左=按计划逐期结清[非一次性]，右=最快一次性结清[绿色突出]）
    var p4 = '<div class="rcard time-card c6"><div class="tc-col plan">' +
      '<div class="tc-lab">按计划全部结清</div>' +
      '<div class="tc-cd">' + (pParts ? countdownHtml(pParts) : '—') + '</div>' +
      '<div class="tc-sub">' + latestPayoff(res) + ' 按月供逐期结清（非一次性）</div></div>';
    if (cfg.income.enabled) {
      var e = res.earliest, ep = e ? remainParts(cfg, { y: e.y, m: e.m }) : null;
      p4 += '<div class="tc-col fast">' +
        '<div class="tc-lab">最快一次性结清</div>' +
        '<div class="tc-cd">' + (ep ? countdownHtml(ep) : '收入不足以提前结清') + '</div>' +
        (e ? '<div class="tc-sub">' + e.label + ' 可一次性结清</div>' : '') + '</div>';
    }
    p4 += '</div>';
    p4 += '<div class="rcard c2"><div class="lab">当前剩余本金</div><div class="val">' + fmt(totalPrincipal) + '</div></div>';
    p4 += '<div class="rcard c2"><div class="lab">未来利息合计</div><div class="val">' + fmt(res.totalInterest) + '</div></div>';
    p4 += '<div class="rcard c2"><div class="lab">提前还款合计</div><div class="val">' + fmt(res.totalPrepay) + '</div></div>';

    $('#posterNode').innerHTML =
      '<div class="p-hero">' +
        '<div class="kicker">Loan Repayment Overview</div>' +
        '<h3>房贷还款核心概览</h3>' +
        '<div class="date">测算起始 ' + cfg.startYear + '-' + String(cfg.startMonth + 1).padStart(2, '0') + ' · 生成于 ' + now.toLocaleDateString('zh-CN') + '</div>' +
      '</div>' +
      '<div class="result-cards poster4">' + p4 + '</div>' +
      '<div class="p-loans">' + loansHtml + '</div>' +
      '<div class="p-foot">' +
        '<div class="pf-left"><div class="brand">房贷还款计算器</div>' +
          '<div class="tip">提前结清仅按实际占用天数计息，未产生利息无需支付<br>本概览仅供参考，实际金额以银行 / 公积金中心账单为准</div></div>' +
        '<div class="pf-qr"><img id="pQrImg" width="78" height="78" alt="二维码"><div class="pf-qr-t">扫码测算你的房贷</div></div>' +
      '</div>';

    // 右下角二维码：扫码直接打开房贷计算器
    try {
      var qr = qrcode(0, 'M');
      qr.addData('https://godweiyang.com/fangdai/');
      qr.make();
      $('#pQrImg').src = qr.createDataURL(5, 2);
    } catch (e) {}
  }

  // 海报固定 560px 渲染；窄屏仅等比缩放“预览”，截图始终用原始尺寸，保证各端比例一致
  var POSTER_W = 560;
  function fitPoster() {
    var stage = $('#posterStage'), node = $('#posterNode');
    if (!stage || !node) return;
    var modal = $('#posterModal .modal');
    var avail = modal.clientWidth;
    var scale = Math.min(1, avail / POSTER_W);
    var h = node.offsetHeight;
    node.style.transformOrigin = 'top left';
    node.style.transform = scale < 1 ? ('scale(' + scale + ')') : '';
    stage.style.width = Math.round(POSTER_W * scale) + 'px';
    stage.style.height = Math.round(h * scale) + 'px';
  }

  async function openPoster() {
    if (!lastResult) return;
    var pb = $('#btnPoster'), pot = pb.innerHTML;
    pb.disabled = true; pb.textContent = '组件加载中…';
    try { await loadLib(LIBS.qr); } catch (e) {
      toast('海报组件加载失败，请检查网络后重试', true);
      pb.disabled = false; pb.innerHTML = pot; return;
    }
    pb.disabled = false; pb.innerHTML = pot;
    buildPoster(lastCfg, lastResult);
    $('#posterModal').classList.remove('hidden');
    requestAnimationFrame(function () { requestAnimationFrame(fitPoster); });
    loadLib(LIBS.h2i).catch(function () {}); // 顺手预加载，便于马上保存/复制
  }
  $('#btnPoster').addEventListener('click', openPoster);
  window.addEventListener('resize', function () { if (!$('#posterModal').classList.contains('hidden')) fitPoster(); });
  window.addEventListener('orientationchange', function () { setTimeout(fitPoster, 220); });
  $('#posterClose').addEventListener('click', function () { $('#posterModal').classList.add('hidden'); });
  $('#posterModal').addEventListener('click', function (e) {
    if (e.target === this) $('#posterModal').classList.add('hidden');
  });

  $('#posterDownload').addEventListener('click', async function () {
    var node = $('#posterNode');
    var btn = this;
    btn.disabled = true; btn.textContent = '组件加载中…';
    try { await loadLib(LIBS.h2i); } catch (e) {
      toast('海报组件加载失败，请检查网络后重试', true);
      btn.disabled = false;
      btn.innerHTML = '<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>保存海报';
      return;
    }
    btn.textContent = '生成中…';
    var prevT = node.style.transform; node.style.transform = '';
    htmlToImage.toPng(node, { pixelRatio: 2, cacheBust: false })
      .then(function (dataUrl) {
        var a = document.createElement('a');
        a.download = '房贷还款概览_' + new Date().toISOString().slice(0,10) + '.png';
        a.href = dataUrl;
        a.click();
        toast('海报已保存');
      })
      .catch(function () { toast('海报生成失败，请重试', true); })
      .finally(function () {
        node.style.transform = prevT;
        btn.disabled = false;
        btn.innerHTML = '<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>保存海报';
      });
  });

  // 一键复制海报到剪贴板（仿照 LOL 长图：ClipboardItem 写入，不支持时回退下载）
  $('#posterCopy').addEventListener('click', async function () {
    var node = $('#posterNode');
    var btn = this, ot = btn.innerHTML;
    btn.disabled = true; btn.textContent = '组件加载中…';
    try { await loadLib(LIBS.h2i); } catch (e) {
      toast('海报组件加载失败，请检查网络后重试', true);
      btn.disabled = false; btn.innerHTML = ot; return;
    }
    btn.textContent = '生成中…';
    var prevTc = node.style.transform; node.style.transform = '';
    try {
      var dataUrl = await htmlToImage.toPng(node, { pixelRatio: 2, cacheBust: false });
      var blob = await (await fetch(dataUrl)).blob();
      var ok = false;
      try {
        if (navigator.clipboard && window.ClipboardItem && navigator.clipboard.write) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          ok = true;
          toast('海报已复制，去聊天框或文档直接 Ctrl+V 粘贴即可');
        }
      } catch (err) { ok = false; }
      if (!ok) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '房贷还款概览_' + new Date().toISOString().slice(0, 10) + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
        toast('当前浏览器不支持直接复制，已改为下载海报');
      }
    } catch (e) {
      toast('海报生成失败，请重试', true);
    } finally {
      node.style.transform = prevTc;
      btn.disabled = false; btn.innerHTML = ot;
    }
  });

  /* ---------- 本地缓存：刷新 / 重开后保留已填信息 ---------- */
  var STORE_KEY = 'fangdai_calc_state_v1';

  function applySwitch(swId, bodyId, on) {
    $('#' + swId).classList.toggle('on', on);
    $('#' + bodyId).classList.toggle('hidden', !on);
  }
  function loanPart(k) {
    var d = LOAN_DATA[k];
    return { balance: d.balance, rate: d.rate, method: d.method, months: d.months, day: d.day };
  }
  function collectState() {
    return {
      loanType: loanType,
      sy: picker.selY, sm: picker.selM,
      pp: {
        on: $('#prepaySwitch').classList.contains('on'),
        amount: $('#ppAmount').value,
        months: $all('#monthToggles button.active').map(function (b) { return Number(b.getAttribute('data-m')); }),
        target: $('#ppTarget').value,
        mode: ($all('input[name="ppmode"]').filter(function (i) { return i.checked; })[0] || {}).value
      },
      inc: {
        on: $('#incomeSwitch').classList.contains('on'),
        savings: $('#inSavings').value,
        income: $('#inIncome').value,
        living: $('#inLiving').value,
        fund: $('#inFund').value
      },
      cards: { commercial: loanPart('commercial'), fund: loanPart('fund') },
      hasResult: !$('#resultArea').classList.contains('hidden')
    };
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(collectState())); } catch (e) {}
  }
  function restoreState(st) {
    if (!st) return;
    if (st.cards) {
      ['commercial', 'fund'].forEach(function (k) {
        var c = st.cards[k]; if (!c) return;
        var d = LOAN_DATA[k];
        if (c.balance !== undefined) d.balance = c.balance;
        if (c.rate !== undefined && c.rate !== '') d.rate = Number(c.rate);
        if (c.method) d.method = c.method;
        if (c.months !== undefined && c.months !== '') d.months = Number(c.months);
        if (c.day !== undefined && c.day !== '') d.day = Number(c.day);
      });
    }
    if (st.loanType) loanType = st.loanType;
    $all('#loanTypeSeg .opt').forEach(function (o) {
      o.classList.toggle('active', o.getAttribute('data-type') === loanType);
    });
    renderLoans();

    if (st.sy !== undefined) {
      picker.selY = Number(st.sy); picker.selM = Number(st.sm);
      $('#ymText').textContent = ymText();
    }

    if (st.pp) {
      var pp = st.pp;
      applySwitch('prepaySwitch', 'prepayBody', !!pp.on);
      $('#ppAmount').value = pp.amount || '';
      $all('#monthToggles button').forEach(function (b) {
        b.classList.toggle('active', (pp.months || []).indexOf(Number(b.getAttribute('data-m'))) >= 0);
      });
      if (pp.target) $('#ppTarget').value = pp.target;
      if (pp.mode) {
        $all('input[name="ppmode"]').forEach(function (i) { i.checked = (i.value === pp.mode); });
        $all('#ppModeSeg .opt').forEach(function (o) {
          o.classList.toggle('active', o.querySelector('input').checked);
        });
      }
    }

    if (st.inc) {
      var inc = st.inc;
      applySwitch('incomeSwitch', 'incomeBody', !!inc.on);
      $('#inSavings').value = inc.savings !== undefined ? inc.savings : '0';
      $('#inIncome').value = inc.income || '';
      $('#inLiving').value = inc.living || '';
      $('#inFund').value = inc.fund || '';
    }

    $all('.loan-card').forEach(updateAutoPay);
    if (st.hasResult) setTimeout(function () { $('#btnCalc').click(); }, 60);
  }

  /* ---------- 初始化 ---------- */
  $('#ymText').textContent = ymText();
  renderLoans();
  var savedState = null;
  try { savedState = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
  restoreState(savedState);

  // 任意输入 / 选择 / 点击后，防抖写入本地缓存
  var saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 250);
  }
  document.addEventListener('input', scheduleSave);
  document.addEventListener('change', scheduleSave);
  document.addEventListener('click', scheduleSave);
})();
