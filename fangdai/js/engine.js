/* =========================================================
 * 贷款摊还计算引擎（纯函数，无依赖）
 * 支持：多笔贷款、等额本息/等额本金、固定/浮动利率(按当前利率测算)、
 *       提前还款(缩短期限月供不变 / 减少月供期限不变)、
 *       收入-存款视角的最快一次性结清时点
 * ========================================================= */
(function (global) {
  'use strict';

  function round2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }

  // 等额本息每期还款（r=期利率, n=期数, pv=本金），返回正值
  function pmt(r, n, pv) {
    if (!r) return pv / n;
    return pv * r / (1 - Math.pow(1 + r, -n));
  }

  function addMonths(y, m, k) { // m 为 0-based
    var t = y * 12 + m + k;
    return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
  }

  function fmtYM(y, m) { return y + '年' + (m + 1) + '月'; }

  /**
   * cfg = {
   *   startYear, startMonth(0-based),
   *   loans: [{ name, balance, annualRate, method:'equal_payment'|'equal_principal',
   *             remainingMonths, currentPayment(可选), paymentDay }],
   *   prepay: { enabled, amount, months:[4,10], target: 索引 或 'highest', mode:'shorten'|'reduce' },
   *   income: { enabled, startingSavings, annualIncome, annualLiving, fundCovers:Boolean }
   * }
   */
  function buildSchedule(cfg) {
    var prepay = cfg.prepay || { enabled: false };
    var income = cfg.income || { enabled: false };

    var states = cfg.loans.map(function (L) {
      var mr = L.annualRate / 12;
      var st = {
        name: L.name,
        method: L.method,
        mr: mr,
        bal: round2(L.balance),
        nRem: L.remainingMonths,           // 合同剩余期数（reduce 模式用，逐月递减）
        fixedPay: 0, fixedPrin: 0,
        payoff: null, totalInterest: 0, totalPrepay: 0
      };
      if (L.method === 'equal_payment') {
        st.fixedPay = (L.currentPayment > 0) ? L.currentPayment : pmt(mr, L.remainingMonths, L.balance);
      } else {
        st.fixedPrin = L.balance / L.remainingMonths;
      }
      return st;
    });

    // 提前还款的贷款冲抵顺序
    function targetOrder() {
      var idx = [];
      if (prepay.target === 'highest') {
        idx = states.map(function (s, i) { return i; })
          .sort(function (a, b) { return states[b].mr - states[a].mr; });
      } else {
        var t = Number(prepay.target) || 0;
        idx = [t].concat(states.map(function (s, i) { return i; }).filter(function (i) { return i !== t; }));
      }
      return idx;
    }
    var order = targetOrder();

    var rows = [];
    var y = cfg.startYear, m = cfg.startMonth;
    var savings = income.enabled ? (income.startingSavings || 0) : 0;
    var earliest = null;
    var maxMonths = 600, guard = 0;

    while (states.some(function (s) { return s.bal > 0; }) && guard < maxMonths) {
      guard++;
      var isPrepayMonth = prepay.enabled && prepay.months.indexOf(m + 1) !== -1;

      var perLoan = states.map(function (s) {
        var begin = s.bal, interest = 0, regPay = 0, regPrin = 0, extra = 0, end = begin;
        if (begin > 0) {
          interest = round2(begin * s.mr);
          if (s.method === 'equal_payment') {
            var pay;
            if (prepay.mode === 'reduce') {
              pay = pmt(s.mr, Math.max(s.nRem, 1), begin); // 期限不变：按合同剩余期数重算月供
            } else {
              pay = s.fixedPay;
            }
            regPay = Math.min(round2(pay), round2(begin + interest));
            regPrin = round2(regPay - interest);
          } else { // 等额本金
            var prin;
            if (prepay.mode === 'reduce') {
              prin = begin / Math.max(s.nRem, 1);
            } else {
              prin = s.fixedPrin;
            }
            regPrin = Math.min(round2(prin), begin);
            regPay = round2(regPrin + interest);
          }
          end = round2(begin - regPrin);
        }
        return { begin: begin, interest: interest, regPay: regPay, regPrin: regPrin, extra: extra, end: end };
      });

      // 提前还款（在正常月供之后冲抵本金）
      // 指定贷款：仅冲抵该笔，不跨贷款溢出，未用部分留存为现金；
      // “按利率自动分配”：按利率从高到低跨贷款溢出。
      var prepayTotal = 0;
      if (isPrepayMonth) {
        var pool = round2(prepay.amount);
        var cascade = prepay.target === 'highest';
        var lim = cascade ? order.length : 1;
        for (var oi = 0; oi < lim && pool > 0; oi++) {
          var li = order[oi];
          var avail = round2(perLoan[li].end); // 正常月供后剩余本金
          var take = round2(Math.min(pool, avail));
          if (take > 0) {
            perLoan[li].extra = take;
            perLoan[li].end = round2(perLoan[li].end - take);
            pool = round2(pool - take);
            prepayTotal = round2(prepayTotal + take);
          }
        }
      }

      // 汇总行
      var beginTotal = 0, interestTotal = 0, regPayTotal = 0, regPrinTotal = 0, endTotal = 0;
      perLoan.forEach(function (p) {
        beginTotal = round2(beginTotal + p.begin);
        interestTotal = round2(interestTotal + p.interest);
        regPayTotal = round2(regPayTotal + p.regPay);
        regPrinTotal = round2(regPrinTotal + p.regPrin);
        endTotal = round2(endTotal + p.end);
      });

      // 存款 / 最快结清（在支付提前还款之前判断：全额结清即替代提前还款）
      var settleInfo = null;
      if (income.enabled) {
        var monthIncome = income.annualIncome / 12;
        var monthLiving = income.annualLiving / 12;
        var forced = monthLiving + (income.fundCovers ? 0 : regPayTotal);
        var liquid = round2(savings + monthIncome - forced); // 当月可动用现金（未付提前还款）
        var needed = round2(beginTotal + interestTotal);    // 还款日一次性结清≈本金+当月利息
        if (liquid >= needed && !earliest && beginTotal > 0) {
          earliest = { y: y, m: m, liquid: liquid, needed: needed };
        }
        savings = round2(liquid - prepayTotal);
        settleInfo = { liquid: liquid, needed: needed, savingsAfter: savings };
      }

      rows.push({
        y: y, m: m, label: y + '-' + String(m + 1).padStart(2, '0'),
        perLoan: perLoan,
        beginTotal: beginTotal, interestTotal: interestTotal,
        regPayTotal: regPayTotal, regPrinTotal: regPrinTotal,
        prepayTotal: prepayTotal, endTotal: endTotal,
        cashOut: round2(regPayTotal + prepayTotal),
        settle: settleInfo
      });

      // 更新贷款状态
      states.forEach(function (s, i) {
        var p = perLoan[i];
        s.bal = p.end;
        s.totalInterest = round2(s.totalInterest + p.interest);
        s.totalPrepay = round2(s.totalPrepay + p.extra);
        if (s.nRem > 0) s.nRem -= 1;
        if (p.end <= 0 && s.payoff === null && (p.regPay > 0 || p.extra > 0)) {
          s.payoff = { y: y, m: m };
        }
      });

      var next = addMonths(y, m, 1); y = next.y; m = next.m;
    }

    // 累计利息列
    var cum = 0;
    rows.forEach(function (r) { cum = round2(cum + r.interestTotal); r.cumInterest = cum; });

    // 年度汇总
    var annualMap = {};
    rows.forEach(function (r) {
      var k = r.y;
      var a = annualMap[k] || (annualMap[k] = {
        year: k, interest: 0, prepay: 0, principal: 0, regPay: 0, endBalance: 0, cashOut: 0
      });
      a.interest = round2(a.interest + r.interestTotal);
      a.prepay = round2(a.prepay + r.prepayTotal);
      a.principal = round2(a.principal + r.regPrinTotal + r.prepayTotal);
      a.regPay = round2(a.regPay + r.regPayTotal);
      a.endBalance = r.endTotal;
      a.cashOut = round2(a.cashOut + r.cashOut);
    });
    var annual = Object.keys(annualMap).map(function (k) { return annualMap[k]; })
      .sort(function (a, b) { return a.year - b.year; });

    var loanSummary = states.map(function (s, i) {
      return {
        name: s.name,
        payoff: s.payoff ? fmtYM(s.payoff.y, s.payoff.m) : '—',
        totalInterest: s.totalInterest,
        totalPrepay: s.totalPrepay
      };
    });

    return {
      rows: rows,
      annual: annual,
      loanSummary: loanSummary,
      totalInterest: round2(states.reduce(function (a, s) { return a + s.totalInterest; }, 0)),
      totalPrepay: round2(states.reduce(function (a, s) { return a + s.totalPrepay; }, 0)),
      earliest: earliest ? { label: fmtYM(earliest.y, earliest.m), y: earliest.y, m: earliest.m,
        liquid: earliest.liquid, needed: earliest.needed } : null
    };
  }

  global.LoanEngine = { buildSchedule: buildSchedule, pmt: pmt, round2: round2 };
})(window);
