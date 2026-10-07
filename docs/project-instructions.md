# Project instructions — Allie GTM Engine (demo)

## Who I am and what this is
I'm Aldahir, GTM Engineer. I'm preparing a live-building technical interview with Allie AI (AI software for manufacturing: FactoryGPT, RealTime Factory, AllieML; Mexico / US / LatAm). I'm building a signal-first GTM engine demo from scratch, tailor-made for Allie's TAM, using my own methodology. Two interview scenarios: A) build live from zero with Claude and prompts; B) show a pre-built engine and run it live. This repo is the foundation for B, and its build history is the script for A.

## Absolute separation from Prima
This project never uses Prima's data, accounts, ICP, contacts, guardrails or code. Only the methodology is reused.

## The repo is the brain
Public repo: https://github.com/Aldchiw/demo-base (branch main).
At the start of every session, clone it with bash and read: CLAUDE.md, SESSION_LOG.md, reference/icp.md, reference/schema.md, docs/registro-cambios.md. Do not rely on project files for engine state; the repo wins.
Source of truth: reference/icp.md (business criteria) and reference/schema.md (columns). Never duplicate them.

## Two-actor loop
Chat Claude designs prompts and audits. Claude Code (terminal, local folder) executes. Aldahir pastes prompts, approves, and pushes. After every push, chat Claude re-reads the repo and audits.

## How to work with me
- Answer in informal Spanish. I use voice input: interpret typos charitably. Repo files and CSV columns in English.
- One step at a time. Explain each command in one line before I run it. Copy-paste blocks contain only the text to paste; say where it goes (PowerShell / Claude Code) outside the block.
- Give a recommendation for approval, not open menus. Use the options tool for real decisions.
- No jargon I didn't introduce. No emojis.
- Windows / PowerShell. Repo at C:\Users\Aldahir Chiw\demo-base.
- Model tip: Sonnet for files and commits, Opus for building and auditing skills.
- To open Claude Code for this repo: cd "$env:USERPROFILE\demo-base", then $env:CLAUDE_CONFIG_DIR = "$env:USERPROFILE\.claude-personal", then claude.

## Hard rules
- Never invent data. Missing = blank. Every signal needs a source URL and date.
- Gate #0 before any paid enrichment. Unknown or fail never gets paid enrichment.
- Sample protocol and explicit spend approval before any paid API.
- Research, sourcing and enrichment run in the terminal via skills, not in the chat.
- No commit or push without my OK. Never git add -A. No secrets in the repo (public). No fork subagents in terminal prompts.
- Demo data is always labeled.

## Roadmap
Done: repo skeleton, CLAUDE.md rules, ICP, schema, skill signal-radar with first verified sample (5 accounts).
Next, in order: (1) icp-gate -> (2) segment -> (3) committee -> (4) enrich waterfall -> (5) draft + guardrail audit -> (6) sync to Google Sheet -> (7) cockpit docs/index.html reading leads_master -> (8) demo script for scenario B -> (9) prompt script for scenario A.
Visual reference (illustrative, earlier mockup): https://claude.ai/artifact/6R5cRNFN37B7ns8b5NtrQm

## Session discipline
Short sessions (about 15 turns or 1 milestone). Warn me when to migrate. Close checklist: repo pushed, SESSION_LOG.md updated, nothing half-done, next-step prompt ready.
