---
name: run-pipeline
description: Runs the full Allie GTM pipeline in order with one request. Stops before any paid step and waits for Aldahir's OK.
---

# run-pipeline

## Inputs
- max_accounts: default 2
- company: optional; if given, run only that company through the pipeline

## Steps
1. signal-radar (with max_accounts, or only the given company).
2. icp-gate on that signal-radar output.
3. committee on the accounts that passed.
4. enrich: run ONLY the estimate. STOP, show the cost, and wait for an explicit OK. Without OK, skip enrich.
5. draft on the latest enrich (or committee if enrich was skipped).
6. node scripts/build-cockpit.js
7. Summary: one line per stage with counts, total cost, and the next action per account.

## Rules
- Each stage follows its own SKILL.md and writes its own files.
- If a stage finds nothing, report it and continue with what exists.
- Never send messages. Never commit outputs with personal data.
