# Schema — output/leads_master.csv

Contract for the columns of `output/leads_master.csv`. One row per contact; if an account has no contact yet, it still gets one row with the contact columns left blank.

## Columns

| # | Column | Description | Filled by stage |
|---|---|---|---|
| 1 | `run_id` | Identifier of the pipeline run that produced this row. | Signal Radar |
| 2 | `detected_at` | Date/time the signal was detected by this run. | Signal Radar |
| 3 | `data_label` | `real` or `illustrative` — marks whether the row is live data or demo/illustrative data. | Signal Radar |
| 4 | `account_name` | Company name. | Signal Radar |
| 5 | `domain` | Company website domain. | Signal Radar |
| 6 | `country` | Country of the account. | Signal Radar |
| 7 | `signal_type` | `expansion`, `job_posting`, `leadership_change`, `systems_change` or `ownership_funding`. | Signal Radar |
| 8 | `signal_detail` | Short description of the signal. | Signal Radar |
| 9 | `signal_url` | Source URL for the signal. Required. | Signal Radar |
| 10 | `signal_date` | Date the signal was published/detected. Required. | Signal Radar |
| 11 | `company_type` | ICP company_type label (manufacturer-continuous, manufacturer-discrete, manufacturer-hybrid, distributor, system-integrator, machine-builder, software-vendor, competitor, wrong-industry, unknown). | ICP Gate #0 |
| 12 | `process_type` | `continuous`, `discrete` or `hybrid`. | Segment |
| 13 | `deployment_archetype` | `enterprise`, `mid_market` or `greenfield`. | Segment |
| 14 | `vertical` | Priority or secondary vertical. | Segment |
| 15 | `priority` | `P1`, `P2` or `P3`, per the segmentation matrix. | Segment |
| 16 | `gate_result` | `pass`, `fail` or `unknown` — result of ICP Gate #0. | ICP Gate #0 |
| 17 | `gate_reason` | Why the account got that gate_result. | ICP Gate #0 |
| 18 | `contact_name` | Contact's full name. | Committee |
| 19 | `contact_title` | Contact's job title. | Committee |
| 20 | `contact_role` | `champion` or `economic_buyer`. | Committee |
| 21 | `linkedin_url` | Contact's LinkedIn URL. | Committee |
| 22 | `contact_email` | Contact's email address. | Enrich (waterfall) |
| 23 | `email_status` | `verified` or `blank`. | Enrich (waterfall) |
| 24 | `draft_e1` | Draft of the first outreach email. | Draft + Guardrail Audit |
| 25 | `audit_result` | `pass` or `fail` — guardrail audit result for the draft. | Draft + Guardrail Audit |
| 26 | `audit_notes` | Notes from the guardrail audit (why it passed/failed). | Draft + Guardrail Audit |
| 27 | `stage` | Cadence step: `not_contacted`, `e1_sent`, `li_done`, `e2_sent`, `e3_sent` or `cooldown`. | Measure |
| 28 | `outcome` | Result: `none`, `replied`, `interested`, `meeting`, `not_interested` or `bounced`. | Measure |

## Rules
- `signal_url` and `signal_date` are required; a row without them is discarded.
- Blank means not found. Never fill with guesses.
- Only the stage that owns a column writes to it.
- `stage` (cadence step) and `outcome` (result) are separate fields.
