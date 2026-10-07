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
