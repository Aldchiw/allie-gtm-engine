---
name: draft
description: Stage 6 of the Allie GTM engine. Writes the first-touch message per contact (email if verified, LinkedIn note if not) and audits it against the messaging guardrails in reference/icp.md. Demo only: drafts are never sent.
---

# draft

## Purpose
Turn the signal into the first line of a message the plant leader would actually read, then audit it before anyone sees it.

## Read first
- reference/icp.md (Messaging guardrails, Buying committee)
- reference/schema.md (draft_e1, audit_result, audit_notes)

## Input
The most recent output/enrich_*.csv (or committee_*.csv if there is no enrich run). Only rows with contact_name filled.

## Steps
For each contact:
1. Channel: email if email_status = verified; otherwise LinkedIn connection note.
2. Language: Spanish for Mexico accounts, English for US accounts.
3. Email E1: subject line + 6 to 8 lines. Line 1 is the signal, specific and factual, from signal_detail. Then one line linking the signal to a plant problem (unplanned downtime, OEE, scrap or energy waste). Then one line on what Allie does, in plain words. Optional: one outcome claim only as Allie's public ranges, framed "in comparable plants". End with one low-friction question. Sign as [Name].
4. LinkedIn note: max 300 characters, signal first, one plain question, no pitch.
5. Adapt to the role: economic buyer = business impact and plant-level results; champion = day-to-day pain on the line.
6. Audit, one check per rule: signal in line 1; length (6-8 lines or 300 chars); plant language; claims only as public ranges with "comparable plants"; zero customer names; right language; no hype or AI-sounding words (revolutionary, cutting-edge, leverage, unlock, seamless, game-changer, delighted, I hope this finds you well); no CIO/CEO targeting; P1 accounts flagged for human review. 10. Timing: the message must match the current stage of the signal (announced, under construction, inaugurated, operating, start date in the future). Check the latest stage in the signal source and the gate and committee evidence before writing.
7. If any check fails, rewrite once and audit again. If it still fails, keep it with audit_result = fail.

## Output
- output/draft_<YYYYMMDD_HHMM>.csv: input columns plus channel, draft_e1, audit_result (pass / fail), audit_notes. Gitignored.
- output/draft_<YYYYMMDD_HHMM>_log.md: per contact, the audit checklist with pass/fail per rule and any rewrite.

## Hard rules
- DEMO ONLY: never send, schedule or upload any message. Aldahir does not work at Allie.
- Never invent facts about the company or the person beyond the signal and the gate evidence.
- Every draft starts with the label "BORRADOR / DRAFT".
- Do not write to output/leads_master.csv.
