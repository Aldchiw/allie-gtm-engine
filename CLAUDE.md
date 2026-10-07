# CLAUDE.md

## Purpose
Demo GTM engine for Allie AI (AI software for manufacturing: FactoryGPT, RealTime Factory, AllieML). Built from scratch using Aldahir's methodology, for a live technical interview. This repo NEVER includes any data, accounts, ICP, contacts, or code from Prima.

## Security
- Public repo: NEVER commit secrets. API keys only go in `.env` (gitignored).
- All demo data must be labeled as illustrative.
- Files with personal data (names, LinkedIn, emails) never get committed. Commit skills and company-level outputs only.
- Never print, echo, encode or partially show a secret value. To check a secret, only use yes/no checks (exists, is empty, matches a placeholder).
- Deepline: 1 credit = 0.10 USD. Default cap per run: 2 USD (20 credits). Autoupdate is off: CLI 0.1.254 has no settings command, so every deepline call runs with DEEPLINE_NO_AUTO_UPDATE=1 and DEEPLINE_SKIP_SKILLS_SYNC=1. Update the CLI only on purpose.

## Pipeline (7 stages)
1. Signal Radar
2. ICP Gate #0
3. Segment
4. Committee
5. Enrich (waterfall)
6. Draft + Guardrail Audit
7. Measure

## Core rules
- Signal-first: an account enters only if it has a signal with a source URL and a date.
- Gate #0: the ICP check runs BEFORE any paid enrichment. Nothing marked fail or unknown gets paid enrichment.
- Never invent data. Missing = blank. No inferred domains or emails.
- Sample protocol: no paid API call over a full list without a 3-5 row sample, exact cost, and explicit approval from Aldahir.
- Every run writes its output to a file in `output/`.
- Data flow: `data/accounts_seed.csv` -> `output/leads_master.csv` -> Google Sheet -> `docs/index.html` (cockpit).
- output/leads_master.csv is local only (gitignored). Its columns are defined in reference/schema.md.

## Source of truth
- reference/icp.md is the single source of truth for ICP, segmentation, signals, buying committee, guardrails and exclusions.
- Every skill must read reference/icp.md instead of copying its content. If the ICP changes, it changes only there.
- reference/schema.md defines the columns of every output file. Skills must use these exact column names.

## Working conventions
- One step at a time.
- Explain each command in one line before running it.
- No commit or push without Aldahir's OK.
- Never `git add -A` — add files by path.
- No fork subagents.

## Change log rule
Every time changes from another person are pulled, add an entry to `docs/registro-cambios.md` (date, author, commits, files).

## Session close
Update `SESSION_LOG.md`.
