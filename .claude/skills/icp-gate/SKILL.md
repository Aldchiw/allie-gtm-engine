---
name: icp-gate
description: Stages 2 and 3 (Gate #0 + Segment) of the Allie GTM engine. Classifies each account from signal-radar against reference/icp.md and decides pass / fail / unknown before any paid enrichment. Free (WebSearch + WebFetch only).
---

# icp-gate

## Purpose
Decide which accounts deserve enrichment. Nothing that fails or is unknown moves to paid stages.

## Read first
- reference/icp.md (qualification, company_type labels, segmentation matrix, exclusions, gray zone)
- reference/schema.md (exact column names)

## Input
The most recent output/signal_radar_*.csv, unless a file is specified.

## Steps
For each account:
1. Find what the company actually does at the plant in the signal: official website first, then the signal source. Assign company_type using only the labels in reference/icp.md.
2. Size: find an employee count or number of plants/lines from a verifiable source. If not verifiable, size is unknown.
3. process_type: continuous = flow processes (beverages, brewing and fermentation, food ingredients, cement, steel, glass, chemicals, paper). hybrid = batch formulation (pharma, medical devices, personal care, CPG). discrete = individual units (auto parts, vehicles, electronics, appliances, metal parts). Also assign vertical.
4. deployment_archetype: greenfield only if the signal is a new site (a new plant or building). A new line or expansion inside an existing plant is NOT greenfield: use enterprise if the group has multiple plants, otherwise mid_market.
5. priority: read it from the segmentation matrix in reference/icp.md using process_type x deployment_archetype.
6. gate_result, applying reference/icp.md in this order: exclusions -> company_type -> geography -> size (including gray zone). Pain: met by default when company_type is manufacturer-continuous, manufacturer-discrete or manufacturer-hybrid, because downtime, OEE, scrap and energy waste apply to every production line. Note it in the log. First failing rule decides.
   - pass: all rules met with evidence.
   - fail: a rule is clearly broken.
   - unknown: a rule cannot be verified. Unknown never gets paid enrichment.
7. gate_reason: one short sentence with the deciding rule and the evidence URL.
8. domain: fill only if confirmed on the official website; keep the value from signal-radar if already filled.

## Output
- output/icp_gate_<YYYYMMDD_HHMM>.csv with the signal-radar columns plus, in order: company_type, process_type, deployment_archetype, vertical, priority, gate_result, gate_reason
- output/icp_gate_<YYYYMMDD_HHMM>_log.md: per account, the evidence found and why each label was chosen.
- Keep run_id and detected_at from signal-radar (lineage to the signal run). The gate run is identified by the output file name.

## Hard rules
- Never invent size, type or domain. If not verifiable, the result is unknown, not pass.
- Use only labels and values defined in reference/icp.md and reference/schema.md.
- No paid APIs. Do not write to output/leads_master.csv.
- Report at the end: counts of pass / fail / unknown, and one line per account with result and reason.
