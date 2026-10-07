# demo-base

Allie AI GTM engine demo.

A signal-first GTM engine demo for Allie AI, a manufacturing AI software company (FactoryGPT, RealTime Factory, AllieML). This is a from-scratch build for a live technical interview, showing how to go from public signals to a qualified, enriched, guardrail-audited outbound list. All data in this repo is illustrative — no Prima data, accounts, or ICP is used anywhere here. The engine is built as a repeatable pipeline rather than a one-off script, with an explicit gate before any paid enrichment spend.

## Pipeline (7 stages)
1. **Signal Radar** — scan for public signals (with source URL + date) that indicate buying intent.
2. **ICP Gate #0** — check each account against the ICP before spending on enrichment.
3. **Segment** — bucket qualified accounts using the segmentation matrix.
4. **Committee** — map the buying committee for each account/segment.
5. **Enrich (waterfall)** — enrich only accounts that passed Gate #0, provider by provider.
6. **Draft + Guardrail Audit** — draft outbound messaging and audit it against messaging guardrails.
7. **Measure** — track results and feed learnings back into the ICP and signal sources.

## Folder structure
```
.
├── CLAUDE.md                     # repo rules for Claude
├── README.md                     # this file
├── SESSION_LOG.md                # session close notes
├── .env.example                  # env var names, no values
├── reference/
│   └── icp.md                    # ICP, segmentation, signals, committee, guardrails, exclusions
├── data/                         # input seed data
├── output/                       # run outputs (leads_master.csv, etc.)
├── .claude/
│   └── skills/                   # Claude skills for this project
└── docs/
    ├── registro-cambios.md       # cumulative change log
    ├── project-instructions.md   # Claude project instructions
    └── index.html                # cockpit (generated)
```
