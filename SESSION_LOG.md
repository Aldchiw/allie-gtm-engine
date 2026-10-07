# Session Log

## 2026-09-27 — Session 1 (built from the Prima project chat)
- Created public repo and skeleton (f3f36f4): CLAUDE.md rules, hardened .gitignore, folder structure.
- Wrote Allie ICP (847619b): qualification, company_type labels, 2-axis segmentation, 5 signals with freshness, bilingual buying committee, messaging guardrails, exclusions. Added source-of-truth rule.
- Wrote data schema (cc39a13): 28 columns for output/leads_master.csv, gray-zone rule (unknown never gets paid enrichment).
- Next step: build skill 1, signal-radar. Start with a 3-5 account sample using free WebSearch, real URLs only, write to output/.

## 2026-10-05 / 10-07 — Session 2
- Built skill signal-radar (.claude/skills/signal-radar/SKILL.md). First real run signal_radar_20261005_0832: 5 accounts kept, 9 discarded. All 5 signals manually verified by chat Claude: VUTEQ (Guanajuato, new plant), Kikkoman Foods (Wisconsin, third US plant), Dohler (State of Mexico, new plant), Toyota Motor North America (San Antonio expansion), Opella (Ocoyoacac plant expansion).
- Fixes after review (e5c152b): job_posting removed from free defaults (job portals load with JavaScript and show no date; needs a paid jobs API behind the sample protocol); rule to search for and keep the freshest signal per account (Opella had a newer July signal than the May one picked).
- Renamed repo to demo-base (4cd5769). Claude Code now runs on Aldahir's personal Pro account (CLAUDE_CONFIG_DIR = .claude-personal).
- Next step: create skill icp-gate (stage 2) and run it on the 5 accounts from signal-radar.
- Built skill icp-gate (stages 2+3, Gate #0 + Segment). First run 20261006_2250: 5/5 pass, but the review found missing rules (greenfield vs enterprise, process_type definitions, automotive OEM vertical). Rules added to the skill and icp.md; re-run 20261006_2253 matched the predicted result exactly: VUTEQ P1 (discrete greenfield), Kikkoman P2, Dohler P2, Toyota P2 (enterprise), Opella P2 (hybrid enterprise). Both runs kept as audit trail.
- Pending: re-run signal-radar for Opella's fresher July signal.
- Next step: skill committee (stage 4) for the 5 passed accounts.
- Ran committee on the 5 passed accounts (output local only, gitignored): 2 of 10 contacts found, both economic buyers (Toyota Texas plant president; Opella Ocoyoacac plant director), 0 champions. Both manually verified by chat Claude against a second source.
- Finding: free web search reaches plant leaders through press, but not mid-level champions (LinkedIn blocks fetch, press names only executives, role searches return job postings). Champions require a paid people API, behind the sample protocol and spend approval.
- Decision: continue the pipeline with the 2 accounts that have a verified buyer to complete the end-to-end flow.
- Next step: stage 5 enrich (email waterfall).
- Built skill enrich (Deepline waterfall: dropleads -> hunter -> icypeas, verified or blank). Run enrich_20261006_2325 (output local only): 1 of 2 emails verified (Toyota Texas, via dropleads), 1 blank (Opella: no provider verified, no pattern guessing). Cost: 0.26 credits (0.026 USD), estimate approved before spending. Cost tracked in output/cost_log.csv.
- Deepline CLI 0.1.254 has no settings command: every call runs with DEEPLINE_NO_AUTO_UPDATE=1 and DEEPLINE_SKIP_SKILLS_SYNC=1.
- Next step: skill draft + guardrail audit (stage 6).
- Built skill draft (stage 6): email if verified, LinkedIn note if not; 10-rule audit. Run v1 (draft_20261006_2330) passed 9/9 but human review found timing errors: Toyota's new line starts in 2030, and Opella's line was already inaugurated on July 22. Added rule 10 (timing must match the signal stage). Run v2 (draft_20261006_2332) passed 10/10 and was approved: Toyota angle = current Tundra/Sequoia line before 2030; Opella angle = stabilization of a newly started line. Drafts are local only, demo only, never sent.
- Lesson: the auditor checks rules; a human checks truth.
- Next step: cockpit (docs/index.html) to show the pipeline, reading company-level outputs only.
- Built local cockpit: scripts/build-cockpit.js generates output/cockpit.html (gitignored, local only) from the latest run of each stage. Funnel: 5 signals -> 5 pass gate -> 2 with contact -> 1 email + 1 LinkedIn -> 2 approved drafts. Cost 0.26 credits. Each card shows a rule-based next action. Decision: cockpit stays local; no docs/index.html. Next step: demo script (scenario B) and from-scratch script (scenario A).
