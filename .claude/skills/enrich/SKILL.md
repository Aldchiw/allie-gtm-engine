---
name: enrich
description: Stage 5 of the Allie GTM engine. Email waterfall through Deepline (dropleads first, then hunter, then icypeas). Verified or blank, never guessed. Paid: always estimate first and wait for Aldahir's OK.
---

# enrich

## Purpose
Find a verified work email for each contact from committee. If no provider returns a verified email, the field stays blank.

## Read first
- reference/schema.md (contact_email, email_status)
- CLAUDE.md (sample protocol, secrets rule)

## Input
The most recent output/committee_*.csv. Only rows with contact_name filled.

## Steps
1. Discover the exact Deepline commands for each provider with deepline --help and the provider help. Do not guess command names.
2. Check the Deepline balance (no credits spent).
3. ESTIMATE: list the contacts, the domain to use for each, the providers in order, and the maximum cost. Then STOP and wait for Aldahir's explicit OK. Never run paid calls in the same turn as the estimate.
4. After OK, for each contact run the waterfall in order: dropleads -> hunter -> icypeas. Stop at the first provider that returns a valid, verified email.
5. Accept only emails marked valid or verified by the provider. Catch-all, risky, unknown or not found = blank. A catch-all from dropleads usually repeats in hunter: skip to the next contact to save credits.
6. domain: use the account domain from the input. If blank, do not guess a domain: the contact stays blank.
7. Check the balance again and compute the exact cost.

## Output
- output/enrich_<YYYYMMDD_HHMM>.csv: the committee columns with contact_email and email_status (verified / blank). Gitignored, never committed.
- output/enrich_<YYYYMMDD_HHMM>_log.md: per contact, providers tried, result of each, and why it was accepted or left blank. No email values in the log.
- Append one row to output/cost_log.csv (create it with headers if missing): run_id, date, stage, provider_calls, emails_found, credits_before, credits_after, credits_spent. No personal data in this file, so it can be committed.

## Hard rules
- Verified or blank. Never infer an email from a name pattern.
- Never print secrets. Never use deepline auth register or deepline setup.
- Spend cap per run: 2 USD unless Aldahir approves more.
- Do not write to output/leads_master.csv.
