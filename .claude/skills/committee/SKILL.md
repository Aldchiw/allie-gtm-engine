---
name: committee
description: Stage 4 of the Allie GTM engine. Finds the buying committee (champion + economic buyer, max 2 per account) for accounts that passed icp-gate. Free (WebSearch + WebFetch only). Output contains personal data and is never committed.
---

# committee

## Purpose
Find the right people, not the most senior ones. One champion who feels the pain and one economic buyer who signs.

## Read first
- reference/icp.md (Buying committee section: titles in English and Spanish, greenfield exception, never lead with CIO or CEO)
- reference/schema.md (exact column names)

## Input
The most recent output/icp_gate_*.csv. Only rows with gate_result = pass.

## Steps
For each account:
1. Target the plant in the signal (its city and country), not global headquarters.
2. Champion: search titles from reference/icp.md (maintenance, reliability, continuous improvement, production) at that plant or country. Greenfield accounts: Launch / Startup Manager first.
3. Economic buyer: Plant Director / Director de Planta, VP Operations / Director de Operaciones, COO for that plant or country. Greenfield: the Plant Director named for the launch.
4. Sources: public LinkedIn profiles via WebSearch, company press releases, news that names plant leaders. Search in Spanish for Mexico, English for the US.
5. Keep a person only if a source shows the name, the title and the company, and the role looks current (no sign they left). If unsure, leave them out.
6. Max 2 contacts per account: 1 champion + 1 economic_buyer. If only one is found, keep one.

## Output
- output/committee_<YYYYMMDD_HHMM>.csv: the icp-gate columns plus contact_name, contact_title, contact_role (champion / economic_buyer), linkedin_url. One row per contact. If an account has no verified contact, one row with contact columns blank.
- contact_email stays blank (stage 5 owns it).
- output/committee_<YYYYMMDD_HHMM>_log.md: per person, the source URL and why they were kept; per account, who was searched for and not found.

## Hard rules
- Never invent names, titles or LinkedIn URLs. Missing = blank.
- Never lead with CIO or CEO.
- No paid APIs. Do not write to output/leads_master.csv.
- This output contains personal data: it is gitignored and must never be committed.
- Report at the end: per account, champion and economic buyer found or not found.
