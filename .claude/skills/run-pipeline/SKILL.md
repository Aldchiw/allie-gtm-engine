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
6. Build output/leads_master.csv: merge the latest stage files into it, appending new rows without deleting old ones and without duplicating account_name + contact_name. Local only (gitignored).
7. node scripts/build-cockpit.js (does step 6, then regenerates output/cockpit.html from leads_master and docs/index.html, the public view with emails masked).
8. Summary: one line per stage with counts, total cost, and the next action per account.

## Rules
- Each stage follows its own SKILL.md and writes its own files.
- If a stage finds nothing, report it and continue with what exists.
- Never send messages. Never commit outputs with personal data.
