/* =========================================================
 * 房贷计算器 · 交互逻辑（表单 → 引擎 → 结果 / Excel / 海报）
 * ========================================================= */
(function () {
  'use strict';

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return '-';
    return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmt0(n) { return Number(n).toLocaleString('zh-CN'); }

  var toastTimer = null;
  function toast(msg, isErr) {
    var t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'toast'; }, 2600);
  }

  /* ---------- 贷款卡片 ---------- */
  var DEFAULTS = [
    { name: '商业贷款', balance: 2026233.84, rate: 3.2, method: 'equal_payment', months: 243, payment: 11340.54, day: 20 },
    { name: '公积金贷款', balance: 232827.88, rate: 2.6, method: 'equal_payment', months: 109, payment: 2400.49, day: 20 }
  ];

  function loanCardHtml(d, i) {
    return '' +
    '<div class="loan-card" data-idx="' + i + '">' +
      '<div class="lc-top">' +
        '<div class="lc-badge">' + (i + 1) + '</div>' +
        '<input class="lc-name" value="' + d.name + '" maxlength="20">' +
        '<button type="button" class="lc-del">删除</button>' +
      '</div>' +
      '<div class="grid">' +
        '<div class="field"><label>当前剩余本金</label><div class="control"><input type="number" class="lc-balance" value="' + d.balance + '" min="0" step="0.01"></div></div>' +
        '<div class="field"><label>年利率</label><div class="control"><input type="number" class="lc-rate has-suffix" value="' + d.rate + '" min="0" step="0.01"><span class="suffix">%</span></div></div>' +
        '<div class="field"><label>还款方式</label><div class="control"><select class="lc-method">' +
          '<option value="equal_payment"' + (d.method === 'equal_payment' ? ' selected' : '') + '>等额本息</option>' +
          '<option value="equal_principal"' + (d.method === 'equal_payment' ? '' : ' selected') + '>等额本金</option>' +
        '</select></div></div>' +
        '<div class="field"><label>剩余期数</label><div class="control"><input type="number" class="lc-months has-suffix" value="' + d.months + '" min="1" step="1"><span class="suffix">个月</span></div></div>' +
        '<div class="field"><label>当前月供 <span class="note">(选填)</span></label><div class="control"><input type="number" class="lc-payment" value="' + d.payment + '" min="0" step="0.01" placeholder="留空自动计算"></div></div>' +
        '<div class="field"><label>每月还款日</label><div class="control"><input type="number" class="lc-day has-suffix" value="' + d.day + '" min="1" max="31" step="1"><span class="suffix">日</span></div></div>' +
      '</div>' +
    '</div>';
  }

  function renderLoans() {
    var list = $('#loanList');
    list.innerHTML = DEFAULTS.map(loanCardHtml).join('');
    rebuildTargetOptions();
  }

  function rebuildTargetOptions() {
    var sel = $('#ppTarget');
    var n = $all('.loan-card').length;
    var html = '';
    for (var i = 0; i < n; i++) {
      var name = $('.loan-card[data-idx="' + i + '"] .lc-name').value;
      html += '<option value="' + i + '">全部冲抵：' + name + '</option>';
    }
    html += '<option value="highest">按利率从高到低自动分配</option>';
    sel.innerHTML = html;
  }

  $('#addLoan').addEventListener('click', function () {
    var n = DEFAULTS.push({ name: '贷款' + (DEFAULTS.length + 1), balance: 500000, rate: 3.5, method: 'equal_payment', months: 240, payment: '', day: 20 });
    $('#loanList').insertAdjacentHTML('beforeend', loanCardHtml(DEFAULTS[n - 1], n - 1));
    rebuildTargetOptions();
  });

  $('#loanList').addEventListener('click', function (e) {
    var btn = e.target.closest('.lc-del');
    if (!btn) return;
    var card = btn.closest('.loan-card');
    var idx = Number(card.getAttribute('data-idx'));
    if ($all('.loan-card').length <= 1) { toast('至少保留一笔贷款', true); return; }
    DEFAULTS.splice(idx, 1);
    renderLoans();
  });
  $('#loanList').addEventListener('input', function (e) {
    if (e.target.classList.contains('lc-name')) rebuildTargetOptions();
  });

  /* ---------- 月份多选 ---------- */
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

  /* ---------- 开关 / 方式 ---------- */
  function bindSwitch(swId, bodyId) {
    var sw = $('#' + swId), body = $('#' + bodyId);
    sw.addEventListener('click', function () {
      sw.classList.toggle('on');
      body.classList.toggle('hidden', !sw.classList.contains('on'));
    });
  }
  bindSwitch('prepaySwitch', 'prepayBody');
  bindSwitch('incomeSwitch', 'incomeBody');
  $('#prepaySwitch').classList.add('on'); $('#prepayBody').classList.remove('hidden'); // 默认展示提前还款区

  $('#ppModeSeg').addEventListener('click', function (e) {
    var opt = e.target.closest('.opt');
    if (!opt) return;
    $all('.opt', this).forEach(function (o) { o.classList.remove('active'); });
    opt.classList.add('active');
    opt.querySelector('input').checked = true;
  });

  /* ---------- 读取表单 ---------- */
  function readConfig() {
    var sm = $('#startMonth').value.split('-');
    var loans = $all('.loan-card').map(function (card) {
      function v(cls) { var el = $('.' + cls, card); return el ? el.value : ''; }
      return {
        name: v('lc-name'),
        balance: parseFloat(v('lc-balance')) || 0,
        annualRate: (parseFloat(v('lc-rate')) || 0) / 100,
        method: v('lc-method'),
        remainingMonths: Math.max(1, parseInt(v('lc-months'), 10) || 1),
        currentPayment: parseFloat(v('lc-payment')) || 0,
        paymentDay: parseInt(v('lc-day'), 10) || 20
      };
    });

    var months = $all('#monthToggles button.active').map(function (b) { return Number(b.getAttribute('data-m')); });
    var cfg = {
      startYear: Number(sm[0]),
      startMonth: Number(sm[1]) - 1,
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
        fundCovers: $('#inFundCovers').checked
      }
    };
    return cfg;
  }

  function validate(cfg) {
    if (!cfg.loans.some(function (l) { return l.balance > 0; })) return '请至少填写一笔贷款的剩余本金';
    for (var i = 0; i < cfg.loans.length; i++) {
      var l = cfg.loans[i];
      if (!l.remainingMonths) return '请填写「' + l.name + '」的剩余期数';
      if (l.annualRate < 0) return '年利率不能为负';
    }
    if (cfg.prepay.enabled) {
      if (cfg.prepay.amount <= 0) return '请填写每次提前还款金额';
      if (!cfg.prepay.months.length) return '请至少选择一个提前还款月份';
    }
    if (cfg.income.enabled && cfg.income.annualIncome <= 0) return '请填写税后年收入';
    return null;
  }

  /* ---------- 测算 + 渲染 ---------- */
  var lastResult = null, lastCfg = null;

  function latestPayoff(res) {
    var labels = res.loanSummary.map(function (l) { return l.payoff; }).filter(function (p) { return p !== '—'; });
    return labels.sort().slice(-1)[0] || '—';
  }

  function renderResult(cfg, res) {
    $('#resultArea').classList.remove('hidden');

    // 顶部卡片
    var cards = [
      { cls: 'accent', lab: '全部贷款结清时间', val: latestPayoff(res), small: true },
      { cls: '', lab: '未来应付利息合计', val: fmt(res.totalInterest) },
      { cls: '', lab: '提前还款本金合计', val: fmt(res.totalPrepay) }
    ];
    if (cfg.income.enabled) {
      cards.push({ cls: 'green', lab: '最快可一次性结清', val: res.earliest ? res.earliest.label : '收入不足', small: true,
        sub2: res.earliest ? '当月需约 ' + fmt0(res.earliest.needed) + ' 元' : '' });
    } else {
      cards.push({ cls: '', lab: '当前剩余本金合计', val: fmt(cfg.loans.reduce(function (a, l) { return a + l.balance; }, 0)) });
    }
    $('#resultCards').innerHTML = cards.map(function (c) {
      return '<div class="rcard ' + c.cls + '"><div class="lab">' + c.lab + '</div>' +
        '<div class="val' + (c.small ? ' small' : '') + '">' + c.val + '</div>' +
        (c.sub2 ? '<div class="sub2">' + c.sub2 + '</div>' : '') + '</div>';
    }).join('');

    // 每笔贷款结果
    $('#loanResults').innerHTML = res.loanSummary.map(function (l, i) {
      var loan = cfg.loans[i];
      return '<div class="lres"><h3><span class="dot"></span>' + loan.name + '</h3>' +
        '<div class="kv"><span>结清时间</span><b>' + l.payoff + '</b></div>' +
        '<div class="kv"><span>未来利息</span><b>' + fmt(l.totalInterest) + '</b></div>' +
        '<div class="kv"><span>提前偿还本金</span><b>' + fmt(l.totalPrepay) + '</b></div></div>';
    }).join('');

    // 表头按贷款名
    var ths = $all('#schedTable thead th');
    var n1 = cfg.loans[0] ? cfg.loans[0].name : '贷款1';
    var n2 = cfg.loans[1] ? cfg.loans[1].name : '';
    function setTh(i, t) { ths[i].textContent = t; }
    setTh(1, n1 + '月供'); setTh(2, n1 + '利息'); setTh(3, n1 + '还本'); setTh(5, n1 + '剩余本金');
    if (cfg.loans[1]) {
      setTh(6, n2 + '月供'); setTh(7, n2 + '利息'); setTh(8, n2 + '还本'); setTh(9, n2 + '剩余本金');
    } else { [6, 7, 8, 9].forEach(function (i) { setTh(i, ''); }); }

    drawTable(res, 'all');

    // 说明
    var notes = [];
    notes.push('<b>怎么看一次性结清要准备多少钱：</b>「剩余本金合计」列是当月还款后还欠的本金；提前结清只按实际占用天数计息，后续未产生的利息无需支付，结清额 ≈ 当月期初本金 + 当月利息。');
    if (cfg.prepay.enabled) {
      notes.push('<b>提前还款：</b>每年 ' + cfg.prepay.months.join('、') + ' 月各提前偿还 ' + fmt0(cfg.prepay.amount) +
        ' 元，方式为「' + (cfg.prepay.mode === 'shorten' ? '缩短期限、月供不变' : '减少月供、期限不变') + '」。');
    }
    notes.push('<b>利率假设：</b>按当前利率（' + cfg.loans.map(function (l) { return l.name + ' ' + (l.annualRate * 100).toFixed(2) + '%'; }).join('；') +
      '）保持不变测算；浮动利率未来重定价后结果会变化。金额按分四舍五入，末期可能有几分钱尾差。');
    $('#resultNote').innerHTML = notes.join('<br>');
  }

  function cell(v, zeroPlain) {
    if (!v) return zeroPlain ? '0' : '<span class="z">-</span>';
    return fmt(v);
  }

  function drawTable(res, mode) {
    var body = $('#schedBody');
    body.innerHTML = res.rows.map(function (r) {
      var p1 = r.perLoan[0] || { regPay: 0, interest: 0, regPrin: 0, end: 0 };
      var p2 = r.perLoan[1] || { regPay: 0, interest: 0, regPrin: 0, end: 0 };
      var cls = '';
      if (r.endTotal === 0) cls = 'payoff-row';
      else if (r.prepayTotal > 0) cls = 'prepay-row';
      return { html: '' +
        '<tr class="' + cls + '" data-prepay="' + (r.prepayTotal > 0 ? 1 : 0) + '" data-month="' + r.m + '">' +
        '<td class="lft">' + r.label + '</td>' +
        '<td>' + cell(p1.regPay) + '</td><td>' + cell(p1.interest) + '</td><td>' + cell(p1.regPrin) + '</td>' +
        '<td>' + (r.prepayTotal ? '<span class="pos">' + fmt(r.prepayTotal) + '</span>' : '<span class="z">-</span>') + '</td>' +
        '<td>' + cell(p1.end, true) + '</td>' +
        '<td>' + cell(p2.regPay) + '</td><td>' + cell(p2.interest) + '</td><td>' + cell(p2.regPrin) + '</td><td>' + cell(p2.end, true) + '</td>' +
        '<td>' + fmt(r.cashOut) + '</td><td>' + fmt(r.endTotal) + '</td><td>' + fmt(r.cumInterest) + '</td>' +
        '</tr>', prepay: r.prepayTotal > 0, month: r.m };
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

  /* ---------- 导出 Excel ---------- */
  $('#btnExcel').addEventListener('click', function () {
    if (!lastResult) return;
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
      overview.push(['  当前剩余本金', l.balance]);
      overview.push(['  年利率', (l.annualRate * 100).toFixed(2) + '%']);
      overview.push(['  还款方式', l.method === 'equal_payment' ? '等额本息' : '等额本金']);
      overview.push(['  结清时间', s.payoff]);
      overview.push(['  未来利息', s.totalInterest]);
      overview.push(['  提前偿还本金', s.totalPrepay]);
    });
    overview.push([]);
    overview.push(['未来利息合计', res.totalInterest]);
    overview.push(['提前还款本金合计', res.totalPrepay]);
    if (res.earliest) overview.push(['最快可一次性结清', res.earliest.label, '当月需约 ' + Math.round(res.earliest.needed) + ' 元']);

    var detailHead = ['月份', '贷款1月供', '贷款1利息', '贷款1还本', '提前还本', '贷款1剩余本金',
      '贷款2月供', '贷款2利息', '贷款2还本', '贷款2剩余本金', '当月还款合计', '剩余本金合计', '累计利息'];
    var detail = [detailHead];
    res.rows.forEach(function (r) {
      var p1 = r.perLoan[0] || {}, p2 = r.perLoan[1] || {};
      detail.push([r.label, p1.regPay || 0, p1.interest || 0, p1.regPrin || 0, r.prepayTotal || 0, p1.end || 0,
        p2.regPay || 0, p2.interest || 0, p2.regPrin || 0, p2.end || 0, r.cashOut, r.endTotal, r.cumInterest]);
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
    s2['!cols'] = detailHead.map(function () { return { wch: 14 }; });
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
    var loansHtml = res.loanSummary.map(function (s, i) {
      var l = cfg.loans[i];
      return '<div class="p-loan"><div class="lt"><span>' + l.name + '</span><span class="off">' + s.payoff + ' 结清</span></div>' +
        '<div class="lk"><span>年利率 ' + (l.annualRate * 100).toFixed(2) + '% · ' + (l.method === 'equal_payment' ? '等额本息' : '等额本金') + '</span></div>' +
        '<div class="lk"><span>未来利息</span><b>' + fmt(s.totalInterest) + '</b></div>' +
        '<div class="lk"><span>提前偿还本金</span><b>' + fmt(s.totalPrepay) + '</b></div></div>';
    }).join('');

    $('#posterNode').innerHTML =
      '<div class="p-hero">' +
        '<div class="kicker">Loan Repayment Overview</div>' +
        '<h3>房贷还款核心概览</h3>' +
        '<div class="date">测算起始 ' + cfg.startYear + '-' + String(cfg.startMonth + 1).padStart(2, '0') + ' · 生成于 ' + now.toLocaleDateString('zh-CN') + '</div>' +
      '</div>' +
      '<div class="p-big">' +
        '<div class="pb"><div class="l">全部贷款结清</div><div class="v">' + latestPayoff(res) + '</div></div>' +
        '<div class="pb"><div class="l">未来利息合计</div><div class="v">' + fmt(res.totalInterest) + '</div></div>' +
        '<div class="pb"><div class="l">提前还款合计</div><div class="v">' + fmt(res.totalPrepay) + '</div></div>' +
      '</div>' +
      '<div class="p-rows">' +
        '<div class="pr"><span class="k">当前剩余本金合计</span><span class="v">' + fmt(totalPrincipal) + '</span></div>' +
        (res.earliest ? '<div class="pr"><span class="k">最快可一次性结清</span><span class="v" style="color:var(--green)">' + res.earliest.label + '</span></div>' : '') +
      '</div>' +
      '<div class="p-loans">' + loansHtml + '</div>' +
      '<div class="p-foot"><div class="brand">房贷还款计算器</div>' +
        '<div class="tip">提前结清仅按实际占用天数计息，未产生利息无需支付<br>本概览仅供参考，实际金额以银行 / 公积金中心账单为准</div></div>';
  }

  function openPoster() {
    if (!lastResult) return;
    buildPoster(lastCfg, lastResult);
    $('#posterModal').classList.remove('hidden');
  }
  $('#btnPoster').addEventListener('click', openPoster);
  $('#posterClose').addEventListener('click', function () { $('#posterModal').classList.add('hidden'); });
  $('#posterModal').addEventListener('click', function (e) {
    if (e.target === this) $('#posterModal').classList.add('hidden');
  });

  $('#posterDownload').addEventListener('click', function () {
    var node = $('#posterNode');
    var btn = this;
    btn.disabled = true; btn.textContent = '生成中…';
    htmlToImage.toPng(node, { pixelRatio: 2, cacheBust: false, backgroundColor: '#ffffff' })
      .then(function (dataUrl) {
        var a = document.createElement('a');
        a.download = '房贷还款概览_' + new Date().toISOString().slice(0, 10) + '.png';
        a.href = dataUrl;
        a.click();
        toast('海报已保存');
      })
      .catch(function () { toast('海报生成失败，请重试', true); })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = '<svg class="svg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>保存海报';
      });
  });

  /* ---------- 初始化 ---------- */
  renderLoans();
})();
