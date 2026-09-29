/* =========================================================
 * 贷款摊还计算引擎（纯函数，无依赖）
 * 支持：多笔贷款、等额本息/等额本金、固定/浮动利率(按当前利率测算)、
 *       提前还款(缩短期限月供不变 / 减少月供期限不变)、
 *       收入-存款视角的最快一次性结清时点
 * 口径：所有金额一律精确到“元”（四舍五入取整，无小数）；
 *       月供统一由本金/利率/期数自动计算，无需手填；
 *       月公积金默认先用于偿还月供，不足从到手收入扣，富余计入存款。
 * ========================================================= */
;(function (global) {
  'use strict'

  // 金额精确到“元”：四舍五入取整
  function R(x) {
    return Math.round(x + Number.EPSILON)
  }

  // 等额本息每期还款（r=期利率, n=期数, pv=本金），返回正值
  function pmt(r, n, pv) {
    if (!r) return pv / n
    return (pv * r) / (1 - Math.pow(1 + r, -n))
  }

  function addMonths(y, m, k) {
    // m 为 0-based
    var t = y * 12 + m + k
    return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 }
  }

  function fmtYM(y, m) {
    return y + '年' + (m + 1) + '月'
  }

  /**
   * cfg = {
   *   startYear, startMonth(0-based),
   *   loans: [{ name, balance, annualRate, method:'equal_payment'|'equal_principal',
   *             remainingMonths, paymentDay }],
   *   prepay: { enabled, amount, months:[4,10], target: 索引 或 'highest', mode:'shorten'|'reduce' },
   *   income: { enabled, startingSavings, annualIncome, annualLiving, monthlyFund }
   * }
   */
  function buildSchedule(cfg) {
    var prepay = cfg.prepay || { enabled: false }
    var income = cfg.income || { enabled: false }

    var states = cfg.loans.map(function (L) {
      var mr = L.annualRate / 12
      var st = {
        name: L.name,
        method: L.method,
        mr: mr,
        bal: R(L.balance),
        nRem: L.remainingMonths, // 合同剩余期数（reduce 模式用，逐月递减）
        fixedPay: 0,
        fixedPrin: 0,
        payoff: null,
        totalInterest: 0,
        totalPrepay: 0,
      }
      if (L.method === 'equal_payment') {
        // 月供统一自动计算（精确到元），不再接受手填，避免与公式不一致
        st.fixedPay = R(pmt(mr, L.remainingMonths, L.balance))
      } else {
        st.fixedPrin = R(L.balance / L.remainingMonths)
      }
      return st
    })

    // 提前还款的贷款冲抵顺序
    function targetOrder() {
      var idx = []
      if (prepay.target === 'highest') {
        idx = states
          .map(function (s, i) {
            return i
          })
          .sort(function (a, b) {
            return states[b].mr - states[a].mr
          })
      } else {
        var t = Number(prepay.target) || 0
        idx = [t].concat(
          states
            .map(function (s, i) {
              return i
            })
            .filter(function (i) {
              return i !== t
            }),
        )
      }
      return idx
    }
    var order = targetOrder()

    var rows = []
    var y = cfg.startYear,
      m = cfg.startMonth
    var savings = income.enabled ? R(income.startingSavings || 0) : 0
    var earliest = null
    var maxMonths = 600,
      guard = 0

    while (
      states.some(function (s) {
        return s.bal > 0
      }) &&
      guard < maxMonths
    ) {
      guard++
      var isPrepayMonth = prepay.enabled && prepay.months.indexOf(m + 1) !== -1

      var perLoan = states.map(function (s) {
        var begin = s.bal,
          interest = 0,
          regPay = 0,
          regPrin = 0,
          extra = 0,
          end = begin
        if (begin > 0) {
          interest = R(begin * s.mr)
          if (s.method === 'equal_payment') {
            var pay
            if (prepay.mode === 'reduce') {
              pay = pmt(s.mr, Math.max(s.nRem, 1), begin) // 期限不变：按合同剩余期数重算月供
            } else {
              pay = s.fixedPay
            }
            regPay = Math.min(R(pay), R(begin + interest))
            regPrin = R(regPay - interest)
          } else {
            // 等额本金
            var prin
            if (prepay.mode === 'reduce') {
              prin = begin / Math.max(s.nRem, 1)
            } else {
              prin = s.fixedPrin
            }
            regPrin = Math.min(R(prin), begin)
            regPay = R(regPrin + interest)
          }
          end = R(begin - regPrin)
        }
        return {
          begin: begin,
          interest: interest,
          regPay: regPay,
          regPrin: regPrin,
          extra: extra,
          end: end,
        }
      })

      // 提前还款（在正常月供之后冲抵本金）
      // 指定贷款：仅冲抵该笔，不跨贷款溢出，未用部分留存为现金；
      // “按利率自动分配”：按利率从高到低跨贷款溢出。
      var prepayTotal = 0
      if (isPrepayMonth) {
        var pool = R(prepay.amount)
        var cascade = prepay.target === 'highest'
        var lim = cascade ? order.length : 1
        for (var oi = 0; oi < lim && pool > 0; oi++) {
          var li = order[oi]
          var avail = R(perLoan[li].end) // 正常月供后剩余本金
          var take = R(Math.min(pool, avail))
          if (take > 0) {
            perLoan[li].extra = take
            perLoan[li].end = R(perLoan[li].end - take)
            pool = R(pool - take)
            prepayTotal = R(prepayTotal + take)
          }
        }
      }

      // 汇总行
      var beginTotal = 0,
        interestTotal = 0,
        regPayTotal = 0,
        regPrinTotal = 0,
        endTotal = 0
      perLoan.forEach(function (p) {
        beginTotal = R(beginTotal + p.begin)
        interestTotal = R(interestTotal + p.interest)
        regPayTotal = R(regPayTotal + p.regPay)
        regPrinTotal = R(regPrinTotal + p.regPrin)
        endTotal = R(endTotal + p.end)
      })

      // 存款 / 最快结清（在支付提前还款之前判断：全额结清即替代提前还款）
      var settleInfo = null
      if (income.enabled) {
        var monthIncome = income.annualIncome / 12
        var monthLiving = income.annualLiving / 12
        var monthlyFund = income.monthlyFund || 0
        // 公积金默认先用于偿还月供：
        //   netFund>0 公积金有富余 → 计入存款；netFund<0 月供有缺口 → 从到手收入扣
        var netFund = monthlyFund - regPayTotal
        var fundToPay = R(Math.min(monthlyFund, regPayTotal)) // 公积金实际用于月供
        var fundSurplus = R(Math.max(0, netFund)) // 公积金富余（并入存款）
        var payGap = R(Math.max(0, -netFund)) // 月供现金缺口（从收入扣）
        var liquid = R(savings + monthIncome - monthLiving + netFund) // 当月可动用现金（未付提前还款）
        var needed = R(beginTotal + interestTotal) // 还款日一次性结清≈本金+当月利息
        if (liquid >= needed && !earliest && beginTotal > 0) {
          earliest = { y: y, m: m, liquid: liquid, needed: needed }
        }
        savings = R(liquid - prepayTotal)
        settleInfo = {
          liquid: liquid,
          needed: needed,
          savingsAfter: savings,
          fundToPay: fundToPay,
          fundSurplus: fundSurplus,
          payGap: payGap,
        }
      }

      rows.push({
        y: y,
        m: m,
        label: y + '-' + String(m + 1).padStart(2, '0'),
        perLoan: perLoan,
        beginTotal: beginTotal,
        interestTotal: interestTotal,
        regPayTotal: regPayTotal,
        regPrinTotal: regPrinTotal,
        prepayTotal: prepayTotal,
        endTotal: endTotal,
        cashOut: R(regPayTotal + prepayTotal),
        settle: settleInfo,
      })

      // 更新贷款状态
      states.forEach(function (s, i) {
        var p = perLoan[i]
        s.bal = p.end
        s.totalInterest = R(s.totalInterest + p.interest)
        s.totalPrepay = R(s.totalPrepay + p.extra)
        if (s.nRem > 0) s.nRem -= 1
        if (p.end <= 0 && s.payoff === null && (p.regPay > 0 || p.extra > 0)) {
          s.payoff = { y: y, m: m }
        }
      })

      var next = addMonths(y, m, 1)
      y = next.y
      m = next.m
    }

    // 累计利息列
    var cum = 0
    rows.forEach(function (r) {
      cum = R(cum + r.interestTotal)
      r.cumInterest = cum
    })

    // 年度汇总
    var annualMap = {}
    rows.forEach(function (r) {
      var k = r.y
      var a =
        annualMap[k] ||
        (annualMap[k] = {
          year: k,
          interest: 0,
          prepay: 0,
          principal: 0,
          regPay: 0,
          endBalance: 0,
          cashOut: 0,
        })
      a.interest = R(a.interest + r.interestTotal)
      a.prepay = R(a.prepay + r.prepayTotal)
      a.principal = R(a.principal + r.regPrinTotal + r.prepayTotal)
      a.regPay = R(a.regPay + r.regPayTotal)
      a.endBalance = r.endTotal
      a.cashOut = R(a.cashOut + r.cashOut)
    })
    var annual = Object.keys(annualMap)
      .map(function (k) {
        return annualMap[k]
      })
      .sort(function (a, b) {
        return a.year - b.year
      })

    var loanSummary = states.map(function (s) {
      return {
        name: s.name,
        payoff: s.payoff ? fmtYM(s.payoff.y, s.payoff.m) : '—',
        totalInterest: s.totalInterest,
        totalPrepay: s.totalPrepay,
      }
    })

    return {
      rows: rows,
      annual: annual,
      loanSummary: loanSummary,
      totalInterest: R(
        states.reduce(function (a, s) {
          return a + s.totalInterest
        }, 0),
      ),
      totalPrepay: R(
        states.reduce(function (a, s) {
          return a + s.totalPrepay
        }, 0),
      ),
      earliest: earliest
        ? {
            label: fmtYM(earliest.y, earliest.m),
            y: earliest.y,
            m: earliest.m,
            liquid: earliest.liquid,
            needed: earliest.needed,
          }
        : null,
    }
  }

  global.LoanEngine = { buildSchedule: buildSchedule, pmt: pmt, round0: R }
})(window)
