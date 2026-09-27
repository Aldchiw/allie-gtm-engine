# CLAUDE.md

## Purpose
Demo GTM engine for Allie AI (AI software for manufacturing: FactoryGPT, RealTime Factory, AllieML). Built from scratch using Aldahir's methodology, for a live technical interview. This repo NEVER includes any data, accounts, ICP, contacts, or code from Prima.

## Security
- Public repo: NEVER commit secrets. API keys only go in `.env` (gitignored).
- All demo data must be labeled as illustrative.

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
