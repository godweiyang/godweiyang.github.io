/* 积分与账号池弹窗：多人页 /lolzjcx/ 与单人页 /lolzjcx2/ 共用。
   自带样式与请求，直接 <script src="/lolzjcx2/pool.js"></script> 后调用 LolPool.bind(按钮id)。
   仅访问本机 loopback 服务 127.0.0.1:17530。 */
(function () {
  const API = 'http://127.0.0.1:17530';
  async function get(p) {
    const r = await fetch(API + p, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (j && j.ok === false) throw new Error(j.error || 'error');
    return j.data;
  }
  async function post(p, b) {
    const r = await fetch(API + p, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b || {}),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (j && j.ok === false) throw new Error(j.error || 'error');
    return j.data;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  let root, sumEl, tbEl, progEl, logEl, checkBtn, stopBtn, pollTimer = null;

  function inject() {
    if (document.getElementById('lolpoolRoot')) return;
    const st = document.createElement('style');
    st.textContent = `
#lolpoolRoot{position:fixed;inset:0;z-index:9999;display:none}
#lolpoolRoot.show{display:block}
#lolpoolRoot .mask{position:absolute;inset:0;background:rgba(20,16,40,.45)}
#lolpoolRoot .card{position:relative;margin:4vh auto;max-width:900px;width:calc(100% - 28px);max-height:92vh;overflow:auto;background:#fff;border-radius:16px;box-shadow:0 18px 60px rgba(40,30,90,.3);padding:16px 16px 18px}
#lolpoolRoot .ph{display:flex;align-items:center;gap:10px;margin-bottom:10px}
#lolpoolRoot .ph h3{font-size:16px;margin:0;flex:1;color:#2b2350}
#lolpoolRoot .x{border:none;background:#f1f0f8;color:#555;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px}
#lolpoolRoot .sum{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
#lolpoolRoot .tag{display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:12.5px;font-weight:600}
#lolpoolRoot .t-ok{background:#e8f7ee;color:#16a34a}#lolpoolRoot .t-use{background:#f0ecfd;color:#6d4ce8}
#lolpoolRoot .t-no{background:#fdeeee;color:#dc2626}#lolpoolRoot .t-mut{background:#f1f0f5;color:#6b7280}
#lolpoolRoot .tools{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
#lolpoolRoot .tools button{border:1px solid #d8d2f5;background:#fff;color:#6d4ce8;border-radius:9px;padding:6px 12px;font-size:12.5px;cursor:pointer}
#lolpoolRoot .tools button:disabled{opacity:.5;cursor:default}
#lolpoolRoot .prog{display:none;background:#f7f6fc;border:1px solid #e7e3f7;border-radius:10px;padding:8px 10px;margin-bottom:10px;font-size:12.5px}
#lolpoolRoot .prog .bar{height:6px;background:#e7e3f7;border-radius:6px;overflow:hidden;margin:6px 0}
#lolpoolRoot .prog .bar i{display:block;height:100%;background:#6d4ce8;width:0}
#lolpoolRoot .prog pre{margin:6px 0 0;max-height:110px;overflow:auto;background:#fff;border-radius:8px;padding:6px 8px;font-size:11px;color:#555;white-space:pre-wrap}
#lolpoolRoot table{width:100%;border-collapse:collapse;font-size:12.5px}
#lolpoolRoot th,#lolpoolRoot td{padding:6px 8px;border-bottom:1px solid #f0eef7;text-align:left;vertical-align:middle}
#lolpoolRoot th{color:#8a86a6;font-weight:600;font-size:11.5px;white-space:nowrap}
#lolpoolRoot td .num{background:#f0ecfd;color:#6d4ce8;border-radius:6px;padding:1px 7px;font-weight:700}
#lolpoolRoot .del{border:1px solid #f3c2c2;background:#fff;color:#dc2626;border-radius:7px;padding:3px 9px;font-size:11.5px;cursor:pointer}
#lolpoolRoot .foot{margin-top:10px;color:#9a96b5;font-size:11.5px;line-height:1.6}
#lolpoolRoot .empty{padding:26px;text-align:center;color:#9a96b5;font-size:13px}
#lolpoolToast{position:fixed;left:50%;bottom:34px;transform:translateX(-50%);background:rgba(30,26,54,.94);color:#fff;padding:9px 18px;border-radius:10px;font-size:13px;z-index:10000;display:none;max-width:88vw}
@media(max-width:640px){#lolpoolRoot .card{margin:2vh auto;width:calc(100% - 16px);max-height:96vh}
#lolpoolRoot table{font-size:11.5px}#lolpoolRoot th,#lolpoolRoot td{padding:5px 5px}}
`;
    document.head.appendChild(st);
    root = document.createElement('div');
    root.id = 'lolpoolRoot';
    root.innerHTML = `
<div class="mask"></div>
<div class="card">
  <div class="ph"><h3>积分与账号池</h3><button class="x" type="button" id="lpClose">×</button></div>
  <div class="sum" id="lpSum"></div>
  <div class="tools">
    <button type="button" id="lpCheck">检测账号</button>
    <button type="button" id="lpStop" style="display:none">停止检测</button>
    <button type="button" id="lpClear">清理失效</button>
    <button type="button" id="lpRefresh">刷新</button>
  </div>
  <div class="prog" id="lpProg"><div id="lpProgTxt">检测中…</div><div class="bar"><i id="lpProgBar"></i></div><pre id="lpLog"></pre></div>
  <div id="lpBody"></div>
  <div class="foot">积分口径：每号每天 21 积分（北京 23:59 重置、跨天自动恢复）；完整查询 1 人消耗 3 积分，单人页切换模式 / 翻页、多人页翻页每人每次 1 积分。账号缺额时查询会自动注册补号。</div>
</div>`;
    document.body.appendChild(root);
    const toast = document.createElement('div');
    toast.id = 'lolpoolToast';
    document.body.appendChild(toast);
    root.querySelector('.mask').addEventListener('click', close);
    document.getElementById('lpClose').addEventListener('click', close);
    checkBtn = document.getElementById('lpCheck');
    stopBtn = document.getElementById('lpStop');
    sumEl = document.getElementById('lpSum');
    tbEl = document.getElementById('lpBody');
    progEl = document.getElementById('lpProg');
    logEl = document.getElementById('lpLog');
    checkBtn.addEventListener('click', startCheck);
    stopBtn.addEventListener('click', stopCheck);
    document.getElementById('lpClear').addEventListener('click', clearInvalid);
    document.getElementById('lpRefresh').addEventListener('click', () => load().catch(() => {}));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  let toastTimer = null;
  function toast(msg) {
    const t = document.getElementById('lolpoolToast');
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2200);
  }
  function open() { inject(); root.classList.add('show'); load().catch(e => { sumEl.innerHTML = ''; tbEl.innerHTML = `<div class="empty">读取失败：${esc(e.message)}<br>请确认右上角为「服务已运行」。</div>`; }); }
  function close() { if (root) root.classList.remove('show'); }

  function statusTag(r) {
    if (r.check_status === 'ok') return '<span class="tag t-ok">正常</span>';
    if (r.check_status === 'banned' || r.disabled) return '<span class="tag t-no">已封禁</span>';
    if (r.check_status === 'badpass') return '<span class="tag t-no">失效</span>';
    if (r.check_status === 'neterr') return '<span class="tag t-mut">网络异常</span>';
    if ((r.remaining || 0) <= 0) return '<span class="tag t-no">积分用完</span>';
    if (r.logged_in) return '<span class="tag t-ok">已登录</span>';
    return '<span class="tag t-mut">未检测</span>';
  }
  async function load() {
    const [list, ov] = await Promise.all([get('/api/accounts'), get('/api/pool_overview')]);
    sumEl.innerHTML =
      `<span class="tag t-ok">账号 ${ov.count}（可用 ${ov.available}）</span>` +
      `<span class="tag t-use">今日剩余积分 ${ov.total_remaining}</span>` +
      `<span class="tag t-mut">今日已用 ${ov.used_today} / 共 ${ov.total_quota} 积分</span>`;
    if (!list.length) { tbEl.innerHTML = '<div class="empty">暂无账号，首次查询时会自动注册补号。</div>'; return; }
    const rows = list.map(r => {
      const low = (r.remaining || 0) <= 0;
      return `<tr>
        <td><span class="num">${esc(r.num)}</span></td>
        <td>${esc(r.email || r.username || '')}</td>
        <td style="white-space:nowrap">${esc(r.password || '')}</td>
        <td>${statusTag(r)}</td>
        <td style="white-space:nowrap"><b style="color:${low ? '#dc2626' : '#16a34a'}">${r.remaining || 0}</b> / ${r.daily_quota || 0}（已用 ${r.used_today || 0}）</td>
        <td>${r.cookie_file ? '有' : '无'}</td>
        <td style="white-space:nowrap">${esc(r.last_used || r.updated_at || '')}</td>
        <td><button class="del" type="button" data-del="${esc(r.num)}">删除</button></td>
      </tr>`;
    }).join('');
    tbEl.innerHTML = `<table><thead><tr>
      <th>#</th><th>邮箱</th><th>密码</th><th>状态</th><th>剩余/总积分</th><th>Cookie</th><th>最近使用</th><th></th>
      </tr></thead><tbody>${rows}</tbody></table>`;
    tbEl.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => delAccount(b.getAttribute('data-del'))));
  }
  async function delAccount(num) {
    if (!confirm(`确定删除账号 #${num} 吗？\n仅删除本地记录和 Cookie，不影响网站账号。`)) return;
    try { const r = await post('/api/delete_account', { num: Number(num) || num });
      if (r && r.deleted) { toast('已删除 ' + num); load(); } else toast('删除失败：' + ((r && r.reason) || '未知'));
    } catch (e) { toast(e.message); }
  }
  async function clearInvalid() {
    try { const r = await post('/api/clear_accounts', { mode: 'invalid' }); toast(`已清理 ${r.removed} 个，剩余 ${r.left} 个`); load(); }
    catch (e) { toast(e.message); }
  }
  async function startCheck() {
    try { const r = await post('/api/start_check', {}); toast(`开始检测 ${r.total} 个账号`); progEl.style.display = 'block'; checkBtn.style.display = 'none'; stopBtn.style.display = ''; poll(); }
    catch (e) { toast(e.message); }
  }
  async function stopCheck() { try { await post('/api/stop_job', {}); } catch (e) {} }
  function poll() {
    clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      try {
        const j = await get('/api/job_status');
        const total = j.total || 0, done = j.done || 0;
        document.getElementById('lpProgTxt').textContent = `检测 ${done}/${total}｜正常 ${j.ok || 0} 异常 ${j.fail || 0}｜${j.running ? '进行中…' : '已结束'}`;
        document.getElementById('lpProgBar').style.width = total ? Math.round(100 * done / total) + '%' : '0';
        logEl.textContent = (j.logs || []).slice(-120).join('\n'); logEl.scrollTop = logEl.scrollHeight;
        if (!j.running) {
          clearInterval(pollTimer); progEl.style.display = 'none'; checkBtn.style.display = ''; stopBtn.style.display = 'none'; load();
        }
      } catch (e) {}
    }, 900);
  }
  window.LolPool = {
    open,
    bind(btnId) { const b = typeof btnId === 'string' ? document.getElementById(btnId) : btnId; if (b) b.addEventListener('click', open); },
  };
})();
