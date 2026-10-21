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
/* ---------- Sincronización (exportar / importar estado) ---------- */
const dlgSync = $('#dlgSync'), dlgCsv = $('#dlgCsv');
[dlg, dlgSync, dlgCsv].forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };

let pending = null;
function resetImport() { pending = null; $('#fileIn').value = ''; $('#impBox').hidden = true; $('#impBox').classList.remove('err'); $('#impOk').hidden = true; $('#impMsg').innerHTML = ''; }
$('#btnSync').onclick = () => { resetImport(); dlgSync.showModal(); };
$('#syncX').onclick = $('#syncClose').onclick = () => dlgSync.close();

function exportState() {
  const payload = { app: 'breaks', schema: 3, exportado: new Date().toISOString(), cfg: S.cfg, entries: S.entries };
  dl(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `breaks-sincronizacion-${todayIso()}.json`);
}
$('#optExport').onclick = exportState;

function validateState(o) {
  if (!o || typeof o !== 'object' || o.app !== 'breaks') return { ok: false, why: 'El archivo no parece un respaldo de breaks.' };
  if (!o.cfg || typeof o.cfg !== 'object' || !Array.isArray(o.entries)) return { ok: false, why: 'El archivo tiene una estructura incompleta.' };
  const n = (v, d) => Number.isFinite(+v) ? +v : d;
  const dt = v => {
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    const [y, m, d] = v.split('-').map(Number), x = new Date(y, m - 1, d);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d ? v : null;
  };
  const cfg = {
    bal: n(o.cfg.bal, 0),
    date: dt(o.cfg.date) || DEF.cfg.date,
    sem: n(o.cfg.sem, DEF.cfg.sem),
    hrs: Math.max(1, n(o.cfg.hrs, DEF.cfg.hrs)),
    week: ['mon-fri', 'mon-sat', 'all'].includes(o.cfg.week) ? o.cfg.week : DEF.cfg.week,
    jan: o.cfg.jan == null || o.cfg.jan === '' ? null : n(o.cfg.jan, null),
    janY: n(o.cfg.janY, 0)
  };
  const entries = o.entries.filter(e => e && typeof e === 'object').map(e => {
    const type = e.type === 'hours' ? 'hours' : 'days';
    const start = dt(e.start); if (!start) return null;
    const end = dt(e.end) || start; if (end < start) return null;
    const amt = n(type === 'hours' ? e.hours : e.days, 0); if (!(amt > 0)) return null;
    const out = { id: typeof e.id === 'string' && e.id ? e.id : crypto.randomUUID(), type, start, end, note: typeof e.note === 'string' ? e.note.slice(0, 80) : '' };
    type === 'hours' ? out.hours = amt : out.days = amt;
    return out;
  }).filter(Boolean);
  return { ok: true, cfg, entries, at: typeof o.exportado === 'string' ? o.exportado : null, dropped: o.entries.length - entries.length };
}

function showImport(data) {
  const box = $('#impBox'), msg = $('#impMsg');
  box.hidden = false;
  if (!data.ok) { box.classList.add('err'); msg.textContent = data.why; $('#impOk').hidden = true; pending = null; return; }
  box.classList.remove('err'); pending = data;
  const c = data.cfg, w = c.week === 'all' ? 'todos los días' : c.week === 'mon-sat' ? 'lunes a sábado' : 'lunes a viernes';
  const items = [
    data.at ? `Exportado el ${fd(data.at.slice(0, 10))}` : 'Sin fecha de exportación',
    `${data.entries.length} descanso${data.entries.length === 1 ? '' : 's'} registrado${data.entries.length === 1 ? '' : 's'}`,
    `Saldo al corte: ${n2(c.bal)} días · ${fd(c.date)}`,
    `Acumulación: ${n2(c.sem)} días por semestre · ${n2(c.hrs)} h = 1 día · ${w}`
  ];
  if (data.dropped > 0) items.push(`${data.dropped} registro${data.dropped === 1 ? '' : 's'} inválido${data.dropped === 1 ? '' : 's'} ignorado${data.dropped === 1 ? '' : 's'}`);
  msg.innerHTML = `<strong class="font-medium">Archivo válido.</strong> Al confirmar se reemplazarán por completo los datos de este dispositivo.<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  $('#impOk').hidden = false;
}

$('#optImport').onclick = () => $('#fileIn').click();
$('#fileIn').addEventListener('change', () => {
  const f = $('#fileIn').files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { let o = null; try { o = JSON.parse(r.result); } catch { } showImport(o ? validateState(o) : { ok: false, why: 'No se pudo leer el archivo. ¿Es un JSON válido?' }); };
  r.onerror = () => showImport({ ok: false, why: 'No se pudo leer el archivo.' });
  r.readAsText(f);
});
$('#impCancel').onclick = resetImport;
$('#impOk').onclick = () => {
  if (!pending) return;
  S = { cfg: { ...DEF.cfg, ...pending.cfg }, entries: pending.entries };
  save(); render(); preview(); dlgSync.close(); resetImport();
};

/* ---------- Exportación a hoja de cálculo (CSV) ---------- */
$('#btnSheet').onclick = () => { const c = calc(); $('#csvFrom').value = c.last; $('#csvTo').value = c.nx; dlgCsv.showModal(); };
$('#csvX').onclick = $('#csvCancel').onclick = () => dlgCsv.close();
$('#csvForm').addEventListener('submit', ev => {
  ev.preventDefault();
  const from = $('#csvFrom').value, to = $('#csvTo').value;
  if (from && to && from > to) return;
  const rows = S.entries.filter(e => (!from || e.start >= from) && (!to || e.start <= to)).sort((a, b) => a.start.localeCompare(b.start));
  if (!rows.length && !confirm('No hay descansos en ese rango. ¿Descargar la hoja vacía?')) return;
  const t = todayIso(), cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['Estado', 'Tipo', 'Desde', 'Hasta', 'Cantidad', 'Unidad', 'Nota'].join(';')];
  rows.forEach(e => {
    const st = e.start <= S.cfg.date ? 'Incluido en saldo base' : e.start > t ? 'Programado' : 'Descontado';
    const h = e.type === 'hours';
    lines.push([st, h ? 'Horas' : 'Días', fd(e.start), h ? '' : fd(e.end), h ? e.hours : e.days, h ? 'horas' : 'días', e.note || ''].map(cell).join(';'));
  });
  dl(new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), `breaks-descansos_${from || 'inicio'}_${to || 'hoy'}.csv`);
  dlgCsv.close();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

$('#start').value = $('#end').value = todayIso(); $('#target').value = `${todayIso().slice(0, 4)}-12-31`;
render(); preview(); setType('days');
const countUp = (el, dur = 900) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const raw = el.textContent.replace(/\./g, '').replace(',', '.'), to = +raw;
  if (raw === '--' || !Number.isFinite(to)) return;
  const t0 = performance.now();
  (function f(t) { const k = Math.min(1, (t - t0) / dur); el.textContent = n2(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
};
if (S.cfg.bal === null) openCfg();
else ['#balance', '#yTaken', '#atOut'].forEach(s => countUp($(s)));
})();
