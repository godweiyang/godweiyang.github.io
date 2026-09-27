/* 开黑重开模拟器 · 纯逻辑引擎（UMD：浏览器 & Node 通用） */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RestartEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ATTRS = ['ap', 'aw', 'me', 'fam', 'soc'];

  // ---------- 随机 ----------
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashSeed(str) {
    var h = 2166136261 >>> 0;
    str = String(str || '');
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function Game(data) {
    this.talentsData = data.talents;   // { talents:[] }
    this.events = data.events;        // 已合并的事件数组
    this.meta = data.meta;
    this._byId = {};
    var self = this;
    this.events.forEach(function (e) { self._byId[e.id] = e; });
  }

  Game.prototype.newRun = function (opts) {
    opts = opts || {};
    var seed = (opts.seed != null) ? (typeof opts.seed === 'string' ? hashSeed(opts.seed) : opts.seed >>> 0)
      : (Math.random() * 4294967296 >>> 0);
    var run = {
      seed: seed,
      rng: mulberry32(seed),
      mode: opts.mode || 'normal',            // normal | easy
      age: 5,
      attrs: { ap: 1, aw: 1, me: 1, fam: 1, soc: 1 },
      flags: {},
      vars: {},
      rp: 0,
      log: [],
      chosenTalents: [],
      dealt: {},                             // once 事件记录
      special: { highlight: [], disaster: [] },
      streak: 0,
      loss: 0,
      alive: true,
      ended: false,
      ending: null,
      pending: null,
      peakRp: 0,
      diedAge: null
    };
    if (run.mode === 'easy') run.flags._easy = true;
    return run;
  };

  Game.prototype.roll = function (run, n) { return Math.floor(run.rng() * (n || 100)); };
  Game.prototype.chance = function (run, p) { return run.rng() < p; };

  // ---------- 抽天赋 ----------
  Game.prototype.drawTen = function (run, unlocked) {
    var pool = this.talentsData.talents.filter(function (t) {
      return !t.locked || (unlocked && unlocked[t.id]);
    });
    var weights = { gold: 5, purple: 20, blue: 45, gray: 30 };
    var out = [];
    for (var k = 0; k < 10; k++) {
      var r = this.roll(run, 100), rar;
      if (r < weights.gold) rar = 'gold';
      else if (r < weights.gold + weights.purple) rar = 'purple';
      else if (r < weights.gold + weights.purple + weights.blue) rar = 'blue';
      else rar = 'gray';
      var cand = pool.filter(function (t) { return t.rarity === rar; });
      if (!cand.length) cand = pool;
      var t = cand[this.roll(run, cand.length)];
      // 尽量不重复
      var guard = 0;
      while (out.indexOf(t) >= 0 && guard++ < 6) t = cand[this.roll(run, cand.length)];
      out.push(t);
    }
    run.hand = out;
    return out;
  };

  Game.prototype.talentById = function (id) {
    var list = this.talentsData.talents;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };

  // 应用天赋（选中后）
  Game.prototype.applyTalents = function (run, ids) {
    var self = this;
    run.chosenTalents = ids.slice();
    var bonus = 0;
    ids.forEach(function (id) {
      var t = self.talentById(id);
      if (!t) return;
      ATTRS.forEach(function (a) { if (t.score && t.score[a]) run.attrs[a] += t.score[a]; });
      (t.addFlags || []).forEach(function (f) { run.flags[f] = true; });
      (t.delFlags || []).forEach(function (f) { run.flags[f] = false; });
      if (t.bonus) bonus += t.bonus;
    });
    return bonus; // 返回额外可分配点数
  };

  Game.prototype.allocate = function (run, add) {
    var self = this;
    ATTRS.forEach(function (a) { run.attrs[a] = clamp(run.attrs[a] + (add[a] || 0), 1, 10); });
  };

  // ---------- 条件系统 ----------
  Game.prototype.condOk = function (run, c) {
    if (!c) return true;
    if (c.minAttr) for (var k in c.minAttr) if (run.attrs[k] < c.minAttr[k]) return false;
    if (c.maxAttr) for (var k2 in c.maxAttr) if (run.attrs[k2] > c.maxAttr[k2]) return false;
    if (c.hasFlag) for (var i = 0; i < c.hasFlag.length; i++) if (!run.flags[c.hasFlag[i]]) return false;
    if (c.anyFlags) {
      var any = false;
      for (var j = 0; j < c.anyFlags.length; j++) if (run.flags[c.anyFlags[j]]) { any = true; break; }
      if (!any) return false;
    }
    if (c.noFlag) for (var n = 0; n < c.noFlag.length; n++) if (run.flags[c.noFlag[n]]) return false;
    if (c.anyVars) for (var v in c.anyVars) if ((run.vars[v] || 0) < c.anyVars[v]) return false;
    return true;
  };

  Game.prototype._effect = function (run, doObj, silent) {
    if (!doObj) return;
    var self = this;
    if (doObj.eff) ATTRS.forEach(function (a) {
      if (doObj.eff[a]) run.attrs[a] = clamp(run.attrs[a] + doObj.eff[a], 0, 10);
    });
    if (doObj.vars) for (var v in doObj.vars) run.vars[v] = (run.vars[v] || 0) + doObj.vars[v];
    if (doObj.flags) (doObj.flags || []).forEach(function (f) { run.flags[f] = true; });
    if (doObj.delFlags) (doObj.delFlags || []).forEach(function (f) { run.flags[f] = false; });
    if (typeof doObj.rp === 'number') this._addRp(run, doObj.rp);
    if (doObj.special) run.special[doObj.special].push({ age: run.age, text: doObj.text || '' });
  };

  Game.prototype._addRp = function (run, delta) {
    if (run.mode === 'easy') delta = Math.round(delta * 1.1);
    run.rp = Math.max(0, run.rp + delta);
    if (delta > 0) { run.streak += 1; }
    if (delta < 0) { run.loss += 1; run.streak = 0; if (run.flags.big_heart) { /* 不额外扣 */ } }
    run.peakRp = Math.max(run.peakRp, run.rp);
    if (delta <= -40 && !run.flags.big_heart && !run.flags._easy) {
      run.attrs.me = clamp(run.attrs.me - 1, 0, 10);
    }
    if (run.attrs.me <= 0 && !run.flags._easy) run.flags._death_pending_tilt = true;
  };

  // 年份事件候选
  Game.prototype.eventsForAge = function (run, age) {
    var self = this;
    return this.events.filter(function (e) {
      var min = e.age, max = e.ageMax || e.age;
      if (age < min || age > max) return false;
      if (e.once && run.dealt[e.id]) return false;
      return self.condOk(run, e.cond);
    });
  };

  Game.prototype._pickWeighted = function (run, list) {
    var total = 0;
    list.forEach(function (e) { total += (e.w || 1); });
    var r = run.rng() * total, acc = 0;
    for (var i = 0; i < list.length; i++) { acc += (list[i].w || 1); if (r <= acc) return list[i]; }
    return list[list.length - 1];
  };

  // 推进一岁；返回当年的事件结果数组（自动事件）。若遇到 choice，则挂起 pending 并返回。
  Game.prototype.step = function (run) {
    if (!run.alive || run.ended) return [];
    run.age += 1;

    // 年龄自然衰减（25 岁起）
    if (run.age >= 25 && run.age % 2 === 1) {
      var decay = run.flags.healthy || run.flags.late_bloom ? 0 : 1;
      if (run.flags.neglect_health) decay += 1;
      if (run.flags.fit) decay = Math.max(0, decay - 1);
      if (decay) run.attrs.ap = clamp(run.attrs.ap - decay, 1, 10);
    }

    this._drift(run);

    var yearEvents = [];
    var self = this;
    var cands = this.eventsForAge(run, run.age);

    // 固定事件优先
    var fixed = cands.filter(function (e) { return e.fixed; });
    var others = cands.filter(function (e) { return !e.fixed; });

    var picks = [];
    fixed.forEach(function (e) { if (picks.indexOf(e) < 0) picks.push(e); });

    // 每岁 0~2 条随机【自动】事件（choice 不再占用名额），30 岁后减少
    var autoOthers = others.filter(function (e) { return e.type !== 'choice'; });
    var nRand = run.age < 13 ? 1 : (run.age < 25 ? (this.chance(run, 0.85) ? 1 : 0) + (this.chance(run, 0.35) ? 1 : 0) : (this.chance(run, 0.6) ? 1 : 0));
    for (var k = 0; k < nRand; k++) {
      var pool = autoOthers.filter(function (e) { return picks.indexOf(e) < 0; });
      if (!pool.length) break;
      picks.push(this._pickWeighted(run, pool));
    }

    // 死亡检定事件优先于普通事件结算
    var death = picks.filter(function (e) { return e.death; })[0];
    if (death) {
      this._resolveDeath(run, death);
      return [];
    }

    // 选择事件独立处理：固定 choice 必出；否则当年以高概率从候选里补一个
    var choice = picks.filter(function (e) {
      return e.type === 'choice' && self._visibleChoices(run, e).length;
    })[0];
    if (!choice) {
      var cc = others.filter(function (e) {
        return e.type === 'choice' && self._visibleChoices(run, e).length;
      });
      var cp = run.mode === 'easy' ? 0.95 : 0.85;
      if (cc.length && this.chance(run, cp)) choice = this._pickWeighted(run, cc);
    }

    picks.forEach(function (e) {
      if (e === choice) return;
      yearEvents.push(self._runAuto(run, e));
    });

    if (choice) {
      run.dealt[choice.id] = true;
      run.pending = { event: choice };
    } else {
      run.pending = null;
      this._postYear(run);
    }
    return yearEvents;
  };

  // 每年的竞技状态漂移：战力决定段位趋势，巅峰窗口只在 19~24
  Game.prototype._drift = function (run) {
    var a = run.attrs;
    var power = a.ap * 0.3 + a.aw * 0.3 + a.me * 0.2 + a.soc * 0.1 + a.fam * 0.1;
    var age = run.age, d = 0;
    if (age >= 13 && age <= 18) d = (power - 5.0) * 14 + (this.roll(run, 31) - 15);
    else if (age >= 19 && age <= 24) d = (power - 5.6) * 30 + (this.roll(run, 61) - 30);
    else if (age >= 25 && age <= 30) d = (power - 6.0) * 18 + (this.roll(run, 41) - 20);
    else if (age >= 31) d = (power - 6.6) * 16 + (this.roll(run, 31) - 15);
    d = Math.round(d);
    if (d !== 0 && age >= 13) {
      run.rp = clamp(run.rp + d, 0, 99999);
      run.peakRp = Math.max(run.peakRp, run.rp);
      if (d > 0) run.streak += 1; else run.loss += 1;
    }

    // 心态：积压的红温值在成年后缓慢反噬
    if (age >= 26 && (run.vars.tilt || 0) >= 2 && this.chance(run, 0.4)) {
      run.attrs.me = clamp(run.attrs.me - 1, 0, 10);
      run.vars.tilt -= 1;
    }
    // 手伤累积
    if (age >= 19 && run.flags.hand_risk) {
      var p = 0.28 + (run.flags.neglect_health ? 0.14 : 0) - (run.flags.fit || run.flags.healthy ? 0.12 : 0);
      if (this.chance(run, p)) run.vars.hand = (run.vars.hand || 0) + 1;
    }
    // 健康透支
    if (age >= 19) {
      var hp = 0;
      if (run.flags.couch_potato || run.flags.neglect_health) hp += 0.2;
      if ((run.flags.night_owl || run.flags.netcafe) && age <= 24) hp += 0.12;
      if (hp && this.chance(run, hp)) run.vars.health = (run.vars.health || 0) + 1;
    }
    // 社恐/孤狼随年龄流失人缘
    if (age >= 23 && (run.flags.loner || run.flags.solo_only) && this.chance(run, 0.3)) {
      run.attrs.soc = clamp(run.attrs.soc - 1, 0, 10);
    }
  };
  Game.prototype._runAuto = function (run, e) {
    run.dealt[e.id] = true;
    var rec = {
      age: run.age, id: e.id, text: e.text,
      eff: e.eff, vars: e.vars, flags: e.flags, rp: e.rp,
      special: e.special, death: e.death
    };
    this._effect(run, { eff: e.eff, vars: e.vars, flags: e.flags, rp: e.rp, special: e.special, text: e.text });
    run.log.push(rec);
    if (e.death) this._resolveDeath(run, e);
    return rec;
  };

  Game.prototype._visibleChoices = function (run, e) {
    var self = this;
    return e.choices.filter(function (ch) { return !ch.cond || self.condOk(run, ch.cond); });
  };

  // 选项成功率（给 UI 显示）：以 DC 为基准，属性每高 1 点 +7%
  Game.prototype.choiceRate = function (run, ch) {
    if (!ch.check) return null;
    var sc = run.attrs[ch.check.attr] || 1;
    var rate = 100 - ch.check.dc + (sc - 5) * 7;
    if (ch.check.mod) ch.check.mod.forEach(function (m) { if (run.flags[m.flag]) rate += m.add; });
    if (run.flags._easy) rate += 15;
    return clamp(Math.round(rate), 3, 97);
  };

  // 玩家做选择 idx（visibleChoices 的索引）
  Game.prototype.answer = function (run, idx) {
    var e = run.pending && run.pending.event;
    if (!e) return null;
    var vis = this._visibleChoices(run, e);
    var ch = vis[idx];
    if (!ch) return null;
    run.dealt[e.id] = true;
    var rec = { age: run.age, id: e.id, text: e.text, choice: ch.text, resultText: '', success: null };

    if (ch.check) {
      var rate = this.choiceRate(run, ch);
      var ok = this.roll(run, 100) < rate;
      rec.success = ok;
      var branch = ok ? ch.on : ch.off;
      this._effect(run, branch);
      rec.resultText = branch.text;
    } else {
      this._effect(run, ch.do);
      rec.resultText = ch.do.text;
    }
    run.log.push(rec);
    run.pending = null;
    this._postYear(run);
    return rec;
  };

  Game.prototype._postYear = function (run) {
    // 属性归零死亡
    if (run.attrs.me <= 0 || run.flags._death_pending_tilt) { this._deathById(run, 'd_tilt'); return; }
    if (run.attrs.soc <= 0) { this._deathById(run, 'd_loner'); return; }
    if (run.attrs.fam <= 0 && run.vars.gacha >= 3) { this._deathById(run, 'd_broke'); return; }
    if (run.vars.hand >= 6) { this._deathById(run, 'd_hand'); return; }
    if (run.vars.burnout >= 4) { this._deathById(run, 'd_burnout'); return; }

    if (run.age >= 35) this._finish(run);
  };

  Game.prototype._deathById = function (run, id) {
    var e = this._byId[id] || this.events.filter(function (x) { return x.death === id; })[0];
    if (e) this._resolveDeath(run, e);
    else this._kill(run, id, '意外离场');
  };

  Game.prototype._resolveDeath = function (run, e) {
    run.dealt[e.id] = true;
    run.log.push({ age: run.age, id: e.id, text: e.text, death: true });
    this._kill(run, e.death, e.text);
  };

  Game.prototype._kill = function (run, deathId, text) {
    run.alive = false;
    run.ended = true;
    run.diedAge = run.age;
    run.ending = this._endingObj(deathId) || { id: deathId, tier: 'death', title: '意外离场', icon: '⚰️', line: text || '', epitaph: '' };
  };

  Game.prototype._endingObj = function (id) {
    return this.meta.endings.filter(function (x) { return x.id === id; })[0] || null;
  };

  // ---------- 终局 ----------
  Game.prototype.rankAt = function (rp) {
    var cur = this.meta.ranks[0];
    this.meta.ranks.forEach(function (r) { if (rp >= r.min) cur = r; });
    return cur;
  };

  Game.prototype._finish = function (run) {
    run.alive = false;
    run.ended = true;
    run.diedAge = 35;

    // 1. 隐藏结局
    var hidden = this.meta.endings.filter(function (e) {
      return e.tier === 'hidden' && e.requires.every(function (f) { return run.flags[f]; });
    })[0];
    // 2. 好结局
    var good = null;
    var fl = run.flags;
    if (run.peakRp >= 2500 && fl.made_peak) good = this._endingObj('g_champion');
    else if (fl.pro_played && (fl.pro_bench || fl.became_coach)) good = this._endingObj('g_pro');
    else if (fl.champion_coach) good = this._endingObj('g_coach');
    else if (fl.stream_growing && fl.stream_crossroads && run.attrs.soc >= 8) good = this._endingObj('g_streamer');
    else if (fl.happy_casual && fl.married) good = this._endingObj('g_couple');
    else if (fl.play_support && run.peakRp >= 2500) good = this._endingObj('g_support');
    else if (run.peakRp >= 2500 && fl.peak_rp) good = this._endingObj('g_diamond');

    var ending = hidden || good;

    // 3. 普通结局
    if (!ending) {
      if (fl.tft_king || fl.tft_path) ending = this._endingObj('n_tft');
      else if (fl.afk_dad || fl.sneak_dad) ending = this._endingObj('n_dad');
      else if (fl.gaming_family || fl.passed_torch) ending = this._endingObj('n_company');
      else if (fl.became_coach || fl.game_company) ending = this._endingObj('n_company');
      else if (fl.ritual_reunion || fl.kept_team) ending = this._endingObj('n_friends');
      else if (fl.casual_forever) ending = this._endingObj('n_casual');
      else {
        var rk = this.rankAt(run.peakRp);
        if (rk.min >= 1500) ending = this._endingObj('n_emerald');
        else if (fl.cameback || fl.veteran_grind) ending = this._endingObj('n_worker');
        else ending = this._endingObj('n_spectator');
      }
    }
    run.ending = ending;
    run.finalRank = this.rankAt(run.rp);
    run.peakRank = this.rankAt(run.peakRp);
  };

  // ---------- 自动对局（模拟用） ----------
  Game.prototype.autoChoose = function (run) {
    var e = run.pending && run.pending.event;
    if (!e) return;
    var vis = this._visibleChoices(run, e);
    // 策略：偏好成功率最高且带 check 的选项；若无 check 随机；带高 on 收益时偶尔赌
    var best = 0, bestScore = -1;
    for (var i = 0; i < vis.length; i++) {
      var ch = vis[i], s = 0;
      if (ch.check) {
        var rate = this.choiceRate(run, ch);
        s = rate + (ch.on && ch.on.flags ? ch.on.flags.length * 4 : 0);
      } else {
        var pos = 0;
        if (ch.do && ch.do.eff) for (var k in ch.do.eff) pos += Math.max(0, ch.do.eff[k]);
        s = 60 + pos * 4;
      }
      if (s > bestScore) { bestScore = s; best = i; }
    }
    this.answer(run, best);
  };

  Game.prototype.simulate = function (opts) {
    opts = opts || {};
    var run = this.newRun({ seed: opts.seed, mode: opts.mode });
    var hand = this.drawTen(run, opts.unlocked);
    // 自动选天赋：按总属性正收益 + 槽位效率
    var sorted = hand.slice().sort(function (a, b) {
      var sa = 0, sb = 0;
      ATTRS.forEach(function (at) {
        if (a.score) sa += (a.score[at] || 0);
        if (b.score) sb += (b.score[at] || 0);
      });
      return (sb / (b.cost || 1)) - (sa / (a.cost || 1));
    });
    var slots = 3, picked = [];
    for (var i = 0; i < sorted.length && slots > 0; i++) {
      var c = sorted[i].cost || 1;
      if (c <= slots) { picked.push(sorted[i].id); slots -= c; }
    }
    var bonus = this.applyTalents(run, picked);
    // 自动分配：补最短的板（含 bonus 点）
    var pts = 20 + bonus;
    for (var p = 0; p < pts; p++) {
      var lo = ATTRS[0];
      ATTRS.forEach(function (a) { if (run.attrs[a] < run.attrs[lo] && run.attrs[lo] < 9) lo = a; });
      if (run.attrs[lo] >= 10) lo = ATTRS[ATTRS.indexOf(lo) + 1] || lo;
      run.attrs[lo] = clamp(run.attrs[lo] + 1, 1, 10);
    }
    while (!run.ended) {
      this.step(run);
      var guard = 0;
      while (run.pending && guard++ < 5) this.autoChoose(run);
      if (run.age > 40) break;
    }
    return run;
  };

  return {
    Game: Game,
    ATTRS: ATTRS,
    hashSeed: hashSeed,
    mulberry32: mulberry32
  };
});
