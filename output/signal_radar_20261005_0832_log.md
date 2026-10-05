# signal_radar_20261005_0832 — run log

- Run at: 2026-10-05T08:32:06-06:00
- Inputs: signal_types = expansion, job_posting; geography = Mexico, United States; max_accounts = 5
- Freshness windows (reference/icp.md): expansion 180 days (>= 2026-04-08); job_posting 45 days (>= 2026-08-21)
- Tools: WebSearch + WebFetch only. No paid APIs.

## Queries run
### expansion
1. `"nueva planta" manufactura 2026 inversión México`
2. `"nueva línea de producción" inversión México 2026 planta`
3. `"new plant" manufacturing announcement 2026`
4. `nearshoring planta Nuevo León Bajío Coahuila inversión 2026`
5. `Toyota San Antonio $3.6 billion expansion second assembly line Tacoma announcement` (follow-up to locate the primary source)
6. `Kikkoman Foods $560 million third production facility Jefferson Wisconsin` (follow-up to locate the primary source)

### job_posting
1. `"Ingeniero de Confiabilidad" planta manufactura vacante`
2. `"Reliability Engineer" manufacturing plant job posting 2026`
3. `"Continuous Improvement Manager" OR "Gerente de Mejora Continua" planta alimentos bebidas vacante septiembre 2026`
4. `"maintenance manager" OEE food plant job posted September 2026 greenhouse OR lever`
5. `jobs.lever.co "reliability engineer" plant manufacturing`

## Kept (5)
| account_name | country | signal_type | signal_date | source |
|---|---|---|---|---|
| VUTEQ | Mexico | expansion | 2026-09-03 | Guanajuato state bulletin (page opened, date stated) |
| Kikkoman Foods | United States | expansion | 2026-09-18 | PR Newswire release (page opened, date stated) |
| Döhler | Mexico | expansion | 2026-07-22 | Real Estate Market & Lifestyle (page opened, date stated) |
| Toyota Motor North America | United States | expansion | 2026-07-06 | Toyota pressroom (page opened, date stated) |
| Opella | Mexico | expansion | 2026-05-28 | Expansión Política (page opened, date stated) |

Domain: only `toyota.com` filled (source page is on Toyota's official site, pressroom.toyota.com). All other domains left blank — the official websites were not visited.

## Discarded (9)
| Candidate | signal_type | Reason |
|---|---|---|
| Tramontina (Lerma, Edomex) | expansion | Outside freshness window: 2026-03-18 (> 180 days). |
| AdvanSix — Electrical Reliability Engineer (Hopewell, VA) | job_posting | Source not readable: Dayforce page returned only shell/navigation, no job details or date. |
| GE Vernova — Manufacturing Equipment Reliability Engineer | job_posting | Source not readable: Workday page returned no content. |
| Pepsi Bottling Ventures — Manufacturing Reliability Engineer | job_posting | Source not readable: Workday page returned no content. |
| Clarios — Manufacturing Reliability Engineer | job_posting | Source URL returned HTTP 404. |
| Shearer's Snacks — Greenhouse posting | job_posting | Source URL returned HTTP 404. |
| Home Market Foods — Greenhouse board | job_posting | No date stated; board index, not a specific relevant posting (no OEE/reliability/CI role). |
| Confidential food plant via Food Talent Solutions (St. Louis, MO) | job_posting | Company not disclosed; posting dated 2026-07-16 is outside 45-day window. |
| Crest Industries / DIS-TRAN Steel — Maintenance and Reliability Manager (Pineville, LA) | job_posting | No date stated on page. |

## Seen but not evaluated (max_accounts reached)
- Other companies in the 2026-05-28 Expansión pharma article: Abbott, Bristol Myers Squibb, Grupo Neolpharma, Kener (Grupo Vazol), Laboratorios Liomont, Sanofi, Bayer.
- IndustrySelect "New U.S. Factories Unveiled in September 2026" (2026-09-30): GE Appliances, Ford, Pirelli, Hansae Mobility, Eaton, Hitachi Energy, Okonite, Suniva, ABEC, Reckitt, SK Pharmteco, Schreiber Foods, King Technology, Enstrom Mold. (Kikkoman taken from this list, verified via its primary source.)
- Pacífico Mexinol (Topolobampo, Sinaloa), Bosch, Huatai Mould (Aguascalientes) — not opened.
- Job-board aggregators (OCC, Indeed, LinkedIn, Glassdoor, Computrabajo) — listing pages, not individual dated postings.

## Notes
- 0 job_posting signals kept: ATS pages (Workday, Dayforce) render via JavaScript and WebFetch gets no content; static boards (Greenhouse, Lever) often omit the posting date. A free route to dated job postings is a gap for the next iteration.
- No gate checks run here (company_type, size, etc. belong to ICP Gate #0).
- output/leads_master.csv not touched.
