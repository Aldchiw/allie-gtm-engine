---
name: signal-radar
description: Stage 1 of the Allie GTM engine. Finds real buying-window signals for manufacturing plants and deduces the account from the signal. Free (WebSearch + WebFetch only). Writes to output/.
---

# signal-radar

## Purpose
Find manufacturers in a buying window for Allie, starting from the signal, never from a list. Every account found here has a real, dated, sourced signal.

## Read first
- reference/icp.md (signal sources, freshness windows, geography, exclusions)
- reference/schema.md (exact column names)

## Inputs (ask only if missing)
- signal_types: default expansion, leadership_change, systems_change, ownership_funding
  job_posting is not supported with free WebSearch/WebFetch: job portals load with JavaScript and rarely show a date. It requires a paid jobs API, gated by the sample protocol and explicit approval.
- geography: default Mexico, United States
- max_accounts: default 5 (sample)

## Steps
1. For each signal type, run WebSearch queries in Spanish and English. Examples:
   - expansion: "nueva planta" manufactura 2026, "nueva linea de produccion" inversion Mexico, "new plant" manufacturing announcement 2026, nearshoring planta Nuevo Leon / Bajio / Coahuila.
   - job_posting: "Ingeniero de Confiabilidad", "Gerente de Mejora Continua", "Reliability Engineer" manufacturing, "OEE" maintenance manager.
2. For each candidate result, open the source with WebFetch and confirm: company name, what happened, and the publication date.
3. Keep the signal only if ALL are true: source URL opened successfully; date is stated on the page; date is within the freshness window in reference/icp.md; geography matches; the company makes things in its own plant (not a distributor, integrator, software vendor or competitor per reference/icp.md).
4. domain: fill only if confirmed by visiting the company's official website. Otherwise leave blank.
5. One row per account. If an account has several valid signals, search for newer ones before choosing, and keep the freshest. Deduplicate by account_name.
6. Stop when max_accounts is reached.

## Output
- output/signal_radar_<YYYYMMDD_HHMM>.csv with columns, in order: run_id, detected_at, data_label, account_name, domain, country, signal_type, signal_detail, signal_url, signal_date
- data_label = real. run_id = signal_radar_<YYYYMMDD_HHMM>.
- signal_detail: one factual sentence in English, no adjectives, no claims beyond the source.
- output/signal_radar_<YYYYMMDD_HHMM>_log.md: queries run, candidates found, candidates discarded and why.

## Hard rules
- Never invent a URL, date, company or domain. Missing = blank; a row without signal_url or signal_date is discarded.
- No paid APIs. WebSearch and WebFetch only.
- Do not write to output/leads_master.csv. That happens in a later stage.
- Report at the end: accounts kept, candidates discarded, and the top discard reasons.
