(() => {
'use strict';
const KEY = 'vac.v3', $ = s => document.querySelector(s);
const DEF = { cfg: { bal: 3.75, date: '2026-10-15', sem: 15, hrs: 6, week: 'mon-fri', jan: null, janY: 0 }, entries: [] };
let S = (() => { try { const s = JSON.parse(localStorage.getItem(KEY)); return { cfg: { ...DEF.cfg, ...s.cfg }, entries: s.entries || [] }; } catch { return structuredClone(DEF); } })();
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fd = (s, o = { day: 'numeric', month: 'short', year: 'numeric' }) => parse(s).toLocaleDateString('es', o);
const n2 = n => n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const todayIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Managua' });
const isCut = d => d.getDate() === 15 || d.getDate() === new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const counts = d => ({ 'mon-fri': d.getDay() % 6 !== 0, 'mon-sat': d.getDay() !== 0, all: true })[S.cfg.week];
const workDays = (a, b) => { let n = 0; for (let d = parse(a); d <= parse(b); d.setDate(d.getDate() + 1)) if (counts(d)) n++; return n; };
const dh = d => { const hm = S.cfg.hrs * 60, t = Math.round(Math.abs(d) * hm), w = Math.floor(t / hm), r = t % hm, h = Math.floor(r / 60), m = r % 60; return (d < 0 ? '−' : '') + `${w} d` + (h ? ` ${h} h` : '') + (m ? ` ${m} min` : ''); };
const days = e => e.type === 'hours' ? e.hours / S.cfg.hrs : e.days;

function calc() {
  const t = todayIso(), base = parse(S.cfg.date), now = parse(t);
  let cuts = 0, last = S.cfg.date; for (let d = new Date(base.getTime() + 864e5 * 0), i = 0; ; i++) { d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1 + i); if (d > now) break; if (isCut(d)) { cuts++; last = iso(d); } }
  let nx = new Date(now); do nx.setDate(nx.getDate() + 1); while (!isCut(nx));
  const live = S.entries.filter(e => e.start > S.cfg.date);
  const taken = live.filter(e => e.start <= t).reduce((a, e) => a + days(e), 0);
  const planned = live.filter(e => e.start > t).reduce((a, e) => a + days(e), 0);
  const gain = cuts * (S.cfg.sem / 12), base0 = S.cfg.bal || 0;
  return { base: base0, gain, taken, planned, bal: base0 + gain - taken, nx: iso(nx), last, t };
}

const countCuts = (from, to) => { let n = 0; const o = parse(from); for (let i = 1; ; i++) { const d = new Date(o.getFullYear(), o.getMonth(), o.getDate() + i); if (iso(d) > to) return n; if (isCut(d)) n++; } };

function render() {
  const c = calc(), cfg = S.cfg, yr = +c.t.slice(0, 4);
  $('#today').textContent = fd(c.t, { day: 'numeric', month: 'long' });
  $('#balance').textContent = n2(c.bal); $('#balDH').textContent = `= ${dh(c.bal)}`;
  $('#sPlanned').textContent = `Próximo cierre: ${fd(c.nx, { day: 'numeric', month: 'short' })} (+${n2(cfg.sem / 12)})` + (c.planned ? ` · ${dh(c.planned)} programados` : '');
  const ys = `${yr - 1}-12-31`, a = cfg.sem / 12, open = cfg.jan != null && cfg.janY === yr ? cfg.jan : 0;
  const yT = Math.max(0, open + countCuts(ys, c.t) * a - c.bal);
  $('#yTaken').textContent = n2(yT); $('#yDH').textContent = `= ${dh(yT)}`;
  const left = countCuts(c.t, `${yr}-12-31`) * cfg.sem / 12, parts = [['C', yT], ['A', c.bal], ['F', left]];
  const tot = parts.reduce((s, p) => s + Math.max(p[1], 0), 0) || 1;
  $('#totalYr').textContent = n2(tot);
  parts.forEach(([k, v]) => { v = Math.max(v, 0); $('#seg' + k).style.flex = `${v} 1 0%`; $('#seg' + k + 'V').textContent = `${dh(v)} · ${Math.round(v / tot * 100)}%`; });
  atDate();
  const ul = $('#log'); ul.innerHTML = '';
  if (!S.entries.length) ul.innerHTML = '<li class="py-6 text-mute">Aún no registras descansos. Usa el formulario para agregar el primero.</li>';
  [...S.entries].sort((a, b) => b.start.localeCompare(a.start)).forEach(e => {
    const st = e.start <= cfg.date ? ['Incluido en saldo base', ''] : e.start > c.t ? ['Programado', 'plan'] : ['Descontado', ''];
    const li = document.createElement('li'); li.className = 'py-3 flex items-center gap-3 flex-wrap';
    const when = e.type === 'hours' ? fd(e.start) : e.start === e.end ? fd(e.start) : `${fd(e.start)} → ${fd(e.end)}`;
    li.innerHTML = `<div class="flex-1 min-w-[12rem]"><p class="font-medium"></p><p class="text-sm text-mute"></p></div><span class="chip ${st[1]}">${st[0]}</span><p class="font-display text-lg tabular-nums w-36 text-right">−${dh(days(e))}</p><button class="btn-ghost" type="button" aria-label="Eliminar">Eliminar</button>`;
    li.querySelector('.font-medium').textContent = when;
    li.querySelector('.text-mute').textContent = e.note || '';
    li.querySelector('button').onclick = () => { if (confirm('¿Eliminar este descanso? El saldo se recalcula.')) { S.entries = S.entries.filter(x => x.id !== e.id); save(); render(); preview(); } };
    ul.append(li);
  });
}

function atDate() {
  const c = calc(), v = $('#target').value;
  if (!v || v < c.t) { $('#atOut').textContent = '--'; $('#atFor').textContent = ''; $('#atWhy').textContent = 'Elige una fecha de hoy en adelante.'; return; }
  const gain = countCuts(c.t, v) * S.cfg.sem / 12, pl = S.entries.filter(e => e.start > c.t && e.start <= v && e.start > S.cfg.date).reduce((s, e) => s + days(e), 0);
  $('#atOut').textContent = n2(c.bal + gain - pl);
  $('#atFor').textContent = `= ${dh(c.bal + gain - pl)}`;
  $('#atWhy').textContent = `El ${fd(v, { day: 'numeric', month: 'long' })}: +${dh(gain)} por ganar` + (pl ? ` · −${dh(pl)} programados` : '');
}
$('#target').addEventListener('input', atDate);

let type = 'days', manual = false;
const val = () => {
  const start = $('#start').value, end = type === 'days' ? $('#end').value : start;
  if (!start || !end || end < start) return null;
  const amt = type === 'days' ? +$('#daysIn').value : +$('#hoursIn').value;
  return { start, end, amt };
};
function autoDays() { const v = val(); if (type === 'days' && !manual) $('#daysIn').value = v ? workDays(v.start, v.end) : ''; }
function preview() {
  autoDays(); const v = val(), p = $('#preview'), c = calc();
  if (!v || !(v.amt > 0)) { p.textContent = 'Elige las fechas y la cantidad para ver cómo queda tu saldo.'; p.style.color = ''; return null; }
  const d = type === 'hours' ? v.amt / S.cfg.hrs : v.amt, after = c.bal - (v.start > S.cfg.date ? d : 0);
  p.textContent = `Descuenta ${dh(d)}. Saldo después: ${dh(after)}.` + (after < 0 ? ' Superas tu saldo.' : '');
  p.style.color = after < 0 ? 'var(--danger)' : ''; return v;
}
function setType(t) {
  type = t; manual = false;
  document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.type === t));
  $('#wrapEnd').classList.toggle('hidden', t === 'hours'); $('#wrapDays').classList.toggle('hidden', t === 'hours');
  $('#wrapHours').classList.toggle('hidden', t === 'days'); $('#lblStart').textContent = t === 'days' ? 'Desde' : 'Fecha';
  preview();
}
document.querySelectorAll('.seg button').forEach(b => b.onclick = () => setType(b.dataset.type));
['start', 'end'].forEach(id => $('#' + id).addEventListener('input', () => { manual = false; if ($('#end').value < $('#start').value && id === 'start') $('#end').value = $('#start').value; preview(); }));
$('#daysIn').addEventListener('input', () => { manual = true; preview(); });
$('#hoursIn').addEventListener('input', preview);
$('#form').addEventListener('submit', ev => {
  ev.preventDefault(); const v = preview(); if (!v || !(v.amt > 0)) return $('#preview').focus();
  const e = { id: crypto.randomUUID(), type, start: v.start, end: v.end, note: $('#note').value.trim() };
  type === 'days' ? e.days = v.amt : e.hours = v.amt; S.entries.push(e); save();
  $('#note').value = ''; $('#hoursIn').value = ''; manual = false; render(); preview();
});

const dlg = $('#dlg');
function openCfg() { const c = S.cfg; $('#cBal').value = c.bal ?? ''; $('#cDate').value = c.date; $('#cSem').value = c.sem; $('#cHrs').value = c.hrs; $('#cWeek').value = c.week; $('#cJan').value = c.jan != null && c.janY === +todayIso().slice(0, 4) ? c.jan : ''; dlg.showModal(); }
$('#btnSettings').onclick = openCfg; $('#cCancel').onclick = () => dlg.close();
$('#cfg').addEventListener('submit', () => { S.cfg = { bal: +$('#cBal').value, date: $('#cDate').value, sem: +$('#cSem').value, hrs: +$('#cHrs').value, week: $('#cWeek').value, jan: $('#cJan').value === '' ? null : +$('#cJan').value, janY: +todayIso().slice(0, 4) }; save(); render(); preview(); });
$('#btnExport').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = `vacaciones-${todayIso()}.json`; a.click(); };
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

$('#start').value = $('#end').value = todayIso(); $('#target').value = `${todayIso().slice(0, 4)}-12-31`;
render(); preview(); setType('days');
if (S.cfg.bal === null) openCfg();
else if (!matchMedia('(prefers-reduced-motion: reduce)').matches) { const to = calc().bal, t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 900); $('#balance').textContent = n2(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0); }
})();
