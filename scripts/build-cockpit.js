#!/usr/bin/env node
// 1. Merges the latest run of each stage into output/leads_master.csv (cumulative, local, gitignored).
// 2. Builds output/cockpit.html (local) and docs/index.html (public) from leads_master.csv.
// Neither view renders a full contact email; the public one shows it masked (a•••@domain).
// No external dependencies. Usage: node scripts/build-cockpit.js

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'output');
const OUT_FILE = path.join(OUT_DIR, 'cockpit.html');
const PUBLIC_FILE = path.join(__dirname, '..', 'docs', 'index.html');
const MASTER_FILE = path.join(OUT_DIR, 'leads_master.csv');

// Column contract from reference/schema.md, in order.
const MASTER_COLUMNS = [
  'run_id', 'detected_at', 'data_label', 'account_name', 'domain', 'country',
  'signal_type', 'signal_detail', 'signal_url', 'signal_date',
  'company_type', 'process_type', 'deployment_archetype', 'vertical', 'priority', 'gate_result', 'gate_reason',
  'contact_name', 'contact_title', 'contact_role', 'linkedin_url',
  'contact_email', 'email_status', 'draft_e1', 'audit_result', 'audit_notes', 'stage', 'outcome',
];
const USD_PER_CREDIT = 0.10; // Deepline: 1 credit = 0.10 USD (CLAUDE.md)

// ---------- CSV ----------

// RFC 4180 parser: quoted fields may contain commas, newlines and "" escapes.
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  const nonEmpty = rows.filter(r => r.some(v => v.trim() !== ''));
  if (!nonEmpty.length) return [];
  const header = nonEmpty[0].map(h => h.trim());
  return nonEmpty.slice(1).map(r => {
    const obj = {};
    header.forEach((h, idx) => { obj[h] = (r[idx] || '').trim(); });
    return obj;
  });
}

// Latest file for a stage, by the YYYYMMDD_HHMM timestamp in its name.
function latestFile(prefix) {
  const re = new RegExp('^' + prefix + '_(\\d{8}_\\d{4})\\.csv$');
  const matches = fs.readdirSync(OUT_DIR).filter(f => re.test(f)).sort();
  return matches.length ? matches[matches.length - 1] : null;
}

function readStage(prefix) {
  const file = latestFile(prefix);
  if (!file) return { file: null, rows: [] };
  return { file, rows: parseCsv(fs.readFileSync(path.join(OUT_DIR, file), 'utf8')) };
}

function toCsv(rows) {
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  return [MASTER_COLUMNS.map(q).join(',')]
    .concat(rows.map(r => MASTER_COLUMNS.map(c => q(r[c])).join(',')))
    .join('\n') + '\n';
}

// ---------- Stage files -> leads_master.csv (cumulative) ----------

const stages = {
  signal: readStage('signal_radar'),
  gate: readStage('icp_gate'),
  committee: readStage('committee'),
  enrich: readStage('enrich'),
  draft: readStage('draft'),
};

const costPath = path.join(OUT_DIR, 'cost_log.csv');
const costRows = fs.existsSync(costPath) ? parseCsv(fs.readFileSync(costPath, 'utf8')) : [];
const totalCredits = costRows.reduce((s, r) => s + (parseFloat(r.credits_spent) || 0), 0);
const totalUsd = totalCredits * USD_PER_CREDIT;

// Copies non-blank schema columns from src into dst. Blank never overwrites a value.
function fill(dst, src) {
  for (const c of MASTER_COLUMNS) if (src[c] != null && src[c] !== '') dst[c] = src[c];
  return dst;
}
const keyOf = r => r.account_name + '||' + (r.contact_name || '');

// Fresh rows from the latest stage files: account columns from signal + gate, contacts from later stages.
const fresh = new Map();
const accountBase = new Map();
for (const r of [...stages.signal.rows, ...stages.gate.rows]) {
  if (!r.account_name) continue;
  if (!accountBase.has(r.account_name)) accountBase.set(r.account_name, {});
  fill(accountBase.get(r.account_name), r);
}
for (const r of [...stages.committee.rows, ...stages.enrich.rows, ...stages.draft.rows]) {
  if (!r.account_name || !r.contact_name) continue;
  const k = keyOf(r);
  if (!fresh.has(k)) fresh.set(k, fill({}, accountBase.get(r.account_name) || {}));
  fill(fresh.get(k), r);
}
for (const [name, base] of accountBase) {
  if (![...fresh.values()].some(r => r.account_name === name)) fresh.set(name + '||', fill({}, base));
}

// Merge into the existing master: keep every old row, update matching keys, append new ones.
const master = new Map();
if (fs.existsSync(MASTER_FILE)) {
  for (const r of parseCsv(fs.readFileSync(MASTER_FILE, 'utf8'))) if (r.account_name) master.set(keyOf(r), r);
}
const before = master.size;
let added = 0, updated = 0, discarded = 0;
for (const [k, r] of fresh) {
  if (!r.signal_url || !r.signal_date) { discarded++; continue; } // schema.md: required
  if (master.has(k)) { fill(master.get(k), r); updated++; }
  else { master.set(k, fill({}, r)); added++; }
}
// An account's blank-contact placeholder row goes away once the account has a real contact.
for (const k of [...master.keys()]) {
  const acc = k.slice(0, -2);
  if (k.endsWith('||') && [...master.values()].some(r => r.account_name === acc && r.contact_name)) master.delete(k);
}
const masterRows = [...master.values()];
fs.writeFileSync(MASTER_FILE, toCsv(masterRows), 'utf8');

// ---------- leads_master.csv -> accounts ----------

const accounts = new Map();
for (const r of masterRows) {
  if (!accounts.has(r.account_name)) {
    accounts.set(r.account_name, { name: r.account_name, base: r, contactList: [] });
  }
  const a = accounts.get(r.account_name);
  a.signal = a.signal || (r.signal_url ? r : null);
  a.gate = a.gate || (r.gate_result ? r : null);
  if (r.gate_result) a.base = r;
  if (!r.contact_name) continue;
  const verified = r.email_status === 'verified';
  a.contactList.push({
    name: r.contact_name, title: r.contact_title, role: r.contact_role, linkedin: r.linkedin_url,
    emailStatus: verified ? 'verified' : 'blank', email: verified ? r.contact_email : '',
    channel: r.draft_e1 ? (verified ? 'email' : 'linkedin') : '', // draft skill: email if verified, else LinkedIn
    draft: r.draft_e1 || '', audit: r.audit_result || '', auditNotes: r.audit_notes || '',
  });
}
const list = [...accounts.values()];

// ---------- Funnel ----------

// Channel: a verified email, or a LinkedIn note when the email stayed blank.
const allContacts = list.flatMap(a => a.contactList);
const emailChannels = allContacts.filter(c => c.emailStatus === 'verified').length;
const linkedinChannels = allContacts.filter(c => c.emailStatus !== 'verified' && c.channel.startsWith('linkedin')).length;

const funnel = [
  { label: 'Señales', sub: 'cuentas con señal fechada y fuente', n: list.filter(a => a.signal).length },
  { label: 'Pasan gate', sub: 'ICP Gate #0 = pass', n: list.filter(a => a.gate && a.gate.gate_result === 'pass').length },
  { label: 'Con contacto', sub: 'al menos un contacto del comité', n: list.filter(a => a.contactList.length).length },
  { label: 'Con canal', sub: `${emailChannels} email + ${linkedinChannels} LinkedIn`, n: emailChannels + linkedinChannels },
  { label: 'Borrador aprobado', sub: 'auditoría pass (email o nota LinkedIn)', n: list.filter(a => a.contactList.some(c => c.audit === 'pass')).length },
];

// ---------- Progress + next action ----------

// 4 = approved draft, 3 = verified email, 2 = contact, 1 = gate only, 0 = signal only.
function progress(a) {
  const cs = a.contactList;
  if (cs.some(c => c.audit === 'pass')) return 4;
  if (cs.some(c => c.emailStatus === 'verified')) return 3;
  if (cs.length) return 2;
  return a.gate ? 1 : 0;
}

function nextAction(a) {
  const cs = a.contactList;
  if (!cs.length) return 'Falta comité: los champions requieren una API de personas paga (muestra + costo aprobado).';
  if (cs.some(c => c.emailStatus === 'verified' && c.audit === 'pass')) return 'E1 listo para revisión humana. Nunca se envía en demo.';
  if (!cs.some(c => c.emailStatus === 'verified')) return 'Canal LinkedIn: nota lista para revisión humana.';
  return '';
}

// ---------- Render ----------

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }
function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } }

const ROLE_LABEL = { economic_buyer: 'Economic buyer', champion: 'Champion' };
const CHANNEL_LABEL = { email: 'Email', linkedin: 'Nota LinkedIn', linkedin_note: 'Nota LinkedIn' };

// Public view: first letter + ••• + @domain. Never the full address.
function maskEmail(e) {
  const at = (e || '').indexOf('@');
  return at > 0 ? e[0] + '•••' + e.slice(at) : '';
}

function renderContact(c, pub) {
  const li = pub ? '' : safeUrl(c.linkedin);
  const masked = pub ? maskEmail(c.email) : '';
  const email = c.emailStatus !== 'verified'
    ? '<span class="pill muted">email blank</span>'
    : masked ? `<span class="pill ok">${esc(masked)} verificado</span>` : '<span class="pill ok">email verified</span>';
  let draft = '<p class="muted small">Sin borrador.</p>';
  if (c.draft) {
    const auditCls = c.audit === 'pass' ? 'ok' : 'bad';
    draft = `
      <div class="draft">
        <div class="draft-head">
          <span class="small">Borrador · ${esc(CHANNEL_LABEL[c.channel] || c.channel || 'canal no indicado')}</span>
          <span class="pill ${auditCls}">auditoría ${esc(c.audit || 'sin resultado')}</span>
        </div>
        <pre>${esc(c.draft)}</pre>
        ${c.auditNotes ? `<p class="small muted">${esc(c.auditNotes)}</p>` : ''}
      </div>`;
  }
  return `
    <div class="contact">
      <div class="contact-head">
        <div>
          <strong>${esc(c.name)}</strong>
          ${li ? ` · <a href="${esc(li)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
          <div class="small muted">${esc(c.title)}</div>
        </div>
        <div class="pills">
          <span class="pill role">${esc(ROLE_LABEL[c.role] || c.role || 'rol no indicado')}</span>
          ${email}
        </div>
      </div>
      ${draft}
    </div>`;
}

function renderAccount(a, pub) {
  const b = a.base;
  const url = safeUrl(b.signal_url);
  const gate = a.gate;
  const gateCls = gate ? (gate.gate_result === 'pass' ? 'ok' : gate.gate_result === 'fail' ? 'bad' : 'warn') : 'muted';
  const contacts = a.contactList.length
    ? a.contactList.map(c => renderContact(c, pub)).join('')
    : '<div class="no-contact">Sin contacto verificado</div>';
  const next = nextAction(a);
  return `
  <article class="card">
    <header class="card-head">
      <div>
        <h2>${esc(a.name)}</h2>
        <div class="small muted">${esc(b.country)}${b.domain ? ' · ' + esc(b.domain) : ''}${b.vertical ? ' · ' + esc(b.vertical) : ''}</div>
      </div>
      <div class="pills">
        ${gate && gate.priority ? `<span class="pill prio prio-${esc(gate.priority)}">${esc(gate.priority)}</span>` : ''}
        <span class="pill ${gateCls}">gate ${esc(gate ? gate.gate_result : 'pendiente')}</span>
      </div>
    </header>

    <section>
      <h3>Señal <span class="small muted">· ${esc(b.signal_type)} · ${esc(b.signal_date)}</span></h3>
      <p>${esc(b.signal_detail)}</p>
      ${url ? `<a class="small" href="${esc(url)}" target="_blank" rel="noopener">Fuente: ${esc(hostOf(url))} ↗</a>` : '<span class="small bad-text">Sin URL de fuente</span>'}
    </section>

    ${gate ? `
    <section>
      <h3>Gate #0 + Segmento</h3>
      <dl class="facts">
        <div><dt>Proceso</dt><dd>${esc(gate.process_type || '—')}</dd></div>
        <div><dt>Arquetipo</dt><dd>${esc(gate.deployment_archetype || '—')}</dd></div>
        <div><dt>Tipo</dt><dd>${esc(gate.company_type || '—')}</dd></div>
      </dl>
      <p class="small muted">${esc(gate.gate_reason)}</p>
    </section>` : ''}

    <section>
      <h3>Comité</h3>
      ${contacts}
    </section>

    ${next ? `<div class="next"><strong>Siguiente acción:</strong> ${esc(next)}</div>` : ''}
  </article>`;
}

// Priority first (P1, P2, P3), then pipeline progress, then most recent signal.
list.sort((x, y) => {
  const px = (x.gate && x.gate.priority) || 'P9';
  const py = (y.gate && y.gate.priority) || 'P9';
  if (px !== py) return px < py ? -1 : 1;
  const dp = progress(y) - progress(x);
  if (dp) return dp;
  return (y.base.signal_date || '').localeCompare(x.base.signal_date || '');
});

const maxN = Math.max(1, funnel[0].n);
const funnelHtml = funnel.map(s => `
  <div class="step">
    <div class="step-top"><span>${esc(s.label)}</span><strong>${s.n}</strong></div>
    <div class="bar"><span style="width:${Math.round((s.n / maxN) * 100)}%"></span></div>
    <div class="small muted">${esc(s.sub)}</div>
  </div>`).join('');

const sources = `<li>leads_master.csv: ${masterRows.length} filas acumuladas</li>`
  + Object.entries(stages)
    .map(([k, v]) => `<li>${esc(k)} (última corrida): ${v.file ? esc(v.file) : '<em>sin archivo</em>'}</li>`).join('')
  + `<li>costos: ${costRows.length ? 'cost_log.csv (' + costRows.length + ' corridas)' : '<em>sin cost_log.csv</em>'}</li>`;

const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

const page = pub => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Allie GTM Cockpit</title>
<style>
  :root {
    --bg: #f6f7f9; --card: #ffffff; --text: #1d2330; --muted: #667085; --line: #e4e7ec;
    --accent: #2f5bea; --ok: #157f3b; --ok-bg: #e7f6ec; --bad: #b42318; --bad-bg: #fdecea;
    --warn: #a15c07; --warn-bg: #fef4e6; --chip: #eef1f6; --pre: #f9fafb;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #12151b; --card: #1a1e26; --text: #e6e9ef; --muted: #98a2b3; --line: #2a303b;
      --accent: #7c9bff; --ok: #6fd391; --ok-bg: #173323; --bad: #ff8a80; --bad-bg: #3a1c1a;
      --warn: #f5b759; --warn-bg: #3a2a12; --chip: #252b36; --pre: #151920;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 24px 16px 48px; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  h1 { font-size: 22px; margin: 0; }
  h2 { font-size: 18px; margin: 0; }
  h3 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin: 0 0 6px; }
  h3 .small { text-transform: none; letter-spacing: 0; }
  p { margin: 0 0 6px; }
  .small { font-size: 13px; }
  .muted { color: var(--muted); }
  .bad-text { color: var(--bad); }
  .demo { display: inline-block; margin: 10px 0 0; padding: 6px 12px; border-radius: 6px;
    background: var(--warn-bg); color: var(--warn); font-weight: 600; font-size: 13px; border: 1px solid currentColor; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
  .panel { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 16px; }
  .summary { display: grid; grid-template-columns: 1fr 220px; gap: 16px; margin-bottom: 24px; }
  .funnel { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
  .step-top { display: flex; justify-content: space-between; align-items: baseline; font-size: 14px; }
  .step-top strong { font-size: 24px; font-variant-numeric: tabular-nums; }
  .bar { height: 8px; background: var(--chip); border-radius: 4px; overflow: hidden; margin: 4px 0; }
  .bar span { display: block; height: 100%; background: var(--accent); border-radius: 4px; }
  .cost .big { font-size: 24px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .cards { display: grid; gap: 16px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 18px; display: grid; gap: 14px; }
  .card-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
  .pills { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
  .pill { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: var(--chip); white-space: nowrap; }
  .pill.ok { background: var(--ok-bg); color: var(--ok); }
  .pill.bad { background: var(--bad-bg); color: var(--bad); }
  .pill.warn { background: var(--warn-bg); color: var(--warn); }
  .pill.muted { color: var(--muted); }
  .pill.prio { font-weight: 700; }
  .pill.prio-P1 { background: var(--accent); color: #fff; }
  .facts { display: flex; gap: 24px; flex-wrap: wrap; margin: 0 0 6px; }
  .facts dt { font-size: 12px; color: var(--muted); }
  .facts dd { margin: 0; font-weight: 600; }
  .contact { border: 1px solid var(--line); border-radius: 8px; padding: 12px; margin-bottom: 10px; }
  .contact-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
  .no-contact { border: 1px dashed var(--line); border-radius: 8px; padding: 12px; color: var(--muted); font-style: italic; }
  .draft { margin-top: 10px; }
  .draft-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  pre { white-space: pre-wrap; word-wrap: break-word; background: var(--pre); border: 1px solid var(--line);
    border-radius: 6px; padding: 10px 12px; margin: 0 0 6px; font: 13px/1.5 ui-monospace, Consolas, monospace; }
  .next { border-left: 3px solid var(--accent); background: var(--chip); border-radius: 0 6px 6px 0; padding: 8px 12px; font-size: 14px; }
  footer { margin-top: 28px; }
  footer ul { margin: 4px 0 0; padding-left: 18px; }
  @media (max-width: 820px) {
    .summary { grid-template-columns: 1fr; }
    .funnel { grid-template-columns: repeat(2, 1fr); }
    .card-head, .contact-head { flex-direction: column; }
    .pills { justify-content: flex-start; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div>
      <h1>Allie GTM Cockpit</h1>
      <div class="small muted">Pipeline signal-first · generado ${esc(generatedAt)}</div>
      <div class="demo">DEMO — datos reales de fuentes públicas, mensajes nunca enviados</div>
    </div>
  </div>

  <div class="summary">
    <div class="panel"><div class="funnel">${funnelHtml}</div></div>
    <div class="panel cost">
      <h3>Costo total</h3>
      <div class="big">${totalCredits.toFixed(2)} créditos</div>
      <div class="muted">${totalUsd.toFixed(3)} USD · 1 crédito = ${USD_PER_CREDIT.toFixed(2)} USD</div>
    </div>
  </div>

  <div class="cards">${list.map(a => renderAccount(a, pub)).join('')}</div>

  <footer class="small muted">
    Fuentes (output/):
    <ul>${sources}</ul>
    ${pub
      ? 'Los emails de contacto se muestran enmascarados (primera letra + dominio), nunca completos.'
      : 'Los emails de contacto nunca se muestran; solo su estado (verified o blank).'}
  </footer>
</div>
</body>
</html>
`;

// Hard stop: no full contact email from the master may appear in either view.
const fullEmails = masterRows.map(r => r.contact_email).filter(e => e && e.includes('@'));
const views = [[OUT_FILE, page(false)], [PUBLIC_FILE, page(true)]];
for (const [file, html] of views) {
  const leaked = fullEmails.filter(e => html.toLowerCase().includes(e.toLowerCase()));
  if (leaked.length) throw new Error(`${leaked.length} full email(s) would leak into ${path.basename(file)}; no view written`);
}
for (const [file, html] of views) {
  fs.writeFileSync(file, html, 'utf8');
  console.log(`written: ${path.relative(process.cwd(), file)}`);
}
console.log(`leads_master: ${before} -> ${masterRows.length} rows (${added} new, ${updated} updated, ${discarded} discarded without signal_url/date)`);
console.log(`accounts: ${list.length} | funnel: ${funnel.map(s => s.n).join(' -> ')} | cost: ${totalCredits.toFixed(2)} credits (${totalUsd.toFixed(3)} USD)`);
console.log('sources: ' + Object.entries(stages).map(([k, v]) => `${k}=${v.file || 'none'}`).join(', '));
