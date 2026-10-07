# Playbook — Escenario A: reconstruir el motor desde cero en 40 minutos

Guía para reconstruir en vivo el motor GTM de Allie en una carpeta vacía, con un Claude Code nuevo.
Los prompts son versiones condensadas de los archivos de este repo, no copias: la terminal corta los pegados largos.
Todos los datos de la demo son ilustrativos o vienen de fuentes públicas. Nunca se envía ningún mensaje.

## Índice

| # | Paso | Tiempo | Acumulado |
|---|---|---|---|
| 0 | Preparación (antes de empezar el reloj) | — | 0 |
| 1 | Carpeta y CLAUDE.md | 3 min | 3 |
| 2a | reference/icp.md: ICP, matriz, señales | 2 min | 5 |
| 2b | reference/icp.md: comité, guardrails, exclusiones | 2 min | 7 |
| 3 | reference/schema.md | 3 min | 10 |
| 4 | Skill signal-radar | 4 min | 14 |
| 5 | Correr signal-radar con 2 cuentas | 8 min | 22 |
| 6 | Skill icp-gate (segunda ventana, en paralelo al paso 5) | 4 min, en paralelo | 22 |
| 7 | Correr icp-gate | 5 min | 27 |
| 8 | Script del cockpit simple | 5 min | 32 |
| — | Margen | 8 min | 40 |
| 9 | Opcional: skill committee + correr | 8 min | — |
| 10 | Opcional: skill enrich (solo estimado) | 5 min | — |
| 11 | Opcional: skill draft + correr | 6 min | — |

---

## 0. Preparación (fuera del reloj)

- Ten instalado Node.js y Claude Code. Para el paso 10 también necesitas Deepline con sesión iniciada (opcional).
- Ten abierta la carpeta vacía: `mkdir allie-gtm && cd allie-gtm && git init && claude`
- Ten este archivo abierto al lado para copiar los prompts.

**Qué decir:** "Voy a construir el motor desde una carpeta vacía; lo único que traigo es la metodología, no el código."

---

## 1. Carpeta y CLAUDE.md — 3 min

**Objetivo:** fijar las reglas del motor antes de escribir cualquier cosa.

**Prompt:**
```
Crea CLAUDE.md para un motor GTM demo de Allie AI (software de IA para manufactura). Reglas:
- Pipeline: Signal Radar, ICP Gate #0, Segment, Committee, Enrich, Draft+Audit, Measure.
- Signal-first: una cuenta entra solo con señal que tenga URL de fuente y fecha.
- Gate #0 corre ANTES de cualquier enrichment pagado; fail o unknown nunca se enriquece.
- Nunca inventar datos: faltante = vacío.
- Ninguna llamada pagada sin muestra de 3-5 filas, costo exacto y mi OK.
- Cada corrida escribe a output/. reference/icp.md y reference/schema.md son la fuente de verdad.
- Nunca imprimir secretos. Archivos con datos personales nunca se commitean.
Crea también .gitignore con .env y output/committee_*, output/enrich_*, output/draft_*.
```

**Debe salir:** `CLAUDE.md` (unas 20 líneas) y `.gitignore`.

**Qué decir:** "Primero van las reglas: el motor no gasta un peso ni inventa un dato sin que yo lo apruebe."

**Si sale mal:**
- Si escribe un CLAUDE.md largo y genérico, pide: "Recórtalo a solo esas reglas, sin secciones extra."
- Si tarda más de 1 minuto, sigue sin `.gitignore` y créalo en el paso 3.

---

## 2a. reference/icp.md: ICP, matriz y señales — 2 min

**Objetivo:** primera mitad de la fuente de verdad: a quién le vendemos y cuándo.

**Prompt:**
```
Crea reference/icp.md (en inglés, marcado illustrative):
ICP: manufacturero con plantas propias; México, US o LatAm; 200+ empleados o 1 planta con varias líneas. 50-199 o tamaño no verificable = unknown.
company_type: manufacturer-continuous/discrete/hybrid, distributor, system-integrator, machine-builder, software-vendor, competitor, wrong-industry, unknown.
Verticales prioridad: alimentos y bebidas, cemento/acero/vidrio, CPG.
Matriz proceso x arquetipo (enterprise/mid_market/greenfield): Continuo P1/P2/P2, Discreto P2/P2/P1, Híbrido P2/P3/P3.
Señales y frescura: expansion 180d, job_posting 45d, leadership_change 180d, systems_change 180d, ownership_funding 365d.
```

**Debe salir:** `reference/icp.md` con las secciones ICP, Segmentation matrix y Signal sources.

**Qué decir:** "El ICP vive en un solo archivo; si mañana cambia, cambia aquí y todas las skills lo leen."

**Si sale mal:**
- Si cambia los valores de la matriz, señala la celda y pide: "Corrige la matriz exactamente como te la di."

---

## 2b. reference/icp.md: comité, guardrails y exclusiones — 2 min

**Objetivo:** segunda mitad: a quién le hablamos, cómo, y a quién nunca.

**Prompt:**
```
Agrega a reference/icp.md, sin tocar lo existente:
Comité (máx 2): champion = mantenimiento, confiabilidad, mejora continua, producción; buyer = director de planta, VP Ops, COO. Nunca CIO/CEO.
Guardrails: 6-8 líneas, señal en línea 1, lenguaje de planta (OEE, downtime, scrap), claims solo 15-20% downtime / 10-15 pts OEE / 5-10% desperdicio "in comparable plants", cero nombres de clientes, español MX / inglés US, sin palabras hype.
Exclusiones: distribuidores, integradores, fabricantes de máquinas, software puro, competidores (MachineMetrics), <50 empleados.
```

**Debe salir:** `reference/icp.md` completo, con Buying committee, Messaging guardrails y Exclusions al final.

**Qué decir:** "Los únicos números que el motor puede usar son los rangos públicos de Allie; todo lo demás está prohibido."

**Si sale mal:**
- Si reescribe la primera mitad, pide: "Restaura lo del paso anterior y solo agrega las tres secciones."
- Si agrega números de resultados inventados, pide: "Quita todo número que no esté en mi prompt."

---

## 3. reference/schema.md — 3 min

**Objetivo:** contrato de columnas para que todas las skills hablen igual.

**Prompt:**
```
Crea reference/schema.md: columnas de output/leads_master.csv, una fila por contacto, con la etapa que llena cada una:
run_id, detected_at, data_label (real/illustrative), account_name, domain, country, signal_type, signal_detail, signal_url, signal_date [signal-radar];
company_type, process_type, deployment_archetype, vertical, priority, gate_result (pass/fail/unknown), gate_reason [icp-gate];
contact_name, contact_title, contact_role (champion/economic_buyer), linkedin_url [committee];
contact_email, email_status (verified/blank) [enrich]; draft_e1, audit_result, audit_notes [draft]; stage, outcome [measure].
Reglas: sin signal_url o signal_date la fila se descarta; vacío = no encontrado; solo la etapa dueña escribe su columna.
```

**Debe salir:** `reference/schema.md` con una tabla de 28 columnas y 3 reglas.

**Qué decir:** "Cada columna tiene un dueño; ninguna etapa pisa el trabajo de otra."

**Si sale mal:**
- Si renombra columnas, pide: "Usa exactamente los nombres que te di."
- Si falta `.gitignore` del paso 1, pídelo aquí en una línea.

---

## 4. Skill signal-radar — 4 min

**Objetivo:** encontrar cuentas a partir de señales reales, nunca de una lista.

**Prompt:**
```
Crea .claude/skills/signal-radar/SKILL.md (frontmatter name + description). Etapa 1, gratis (solo WebSearch + WebFetch).
Lee reference/icp.md y reference/schema.md. Inputs: signal_types (default expansion, leadership_change, systems_change), geography México y US, max_accounts default 5.
Pasos: buscar en español e inglés; abrir cada fuente con WebFetch; quedarse solo si la página abrió, tiene fecha explícita, está dentro de la frescura, la geografía coincide y la empresa fabrica en planta propia. domain solo si se confirma en el sitio oficial. Una fila por cuenta, la señal más fresca. Parar en max_accounts.
Salida: output/signal_radar_<YYYYMMDD_HHMM>.csv (columnas de schema hasta signal_date, data_label=real) y un _log.md con queries, descartes y razones.
Nunca inventar URL, fecha, empresa ni dominio.
```

**Debe salir:** `.claude/skills/signal-radar/SKILL.md`.

**Qué decir:** "No arranco de una lista de empresas: arranco de algo que pasó, con fecha y fuente, y de ahí deduzco la cuenta."

**Si sale mal:**
- Si la skill no aparece al invocarla, sal y vuelve a abrir `claude`; las skills nuevas a veces requieren reiniciar la sesión.
- Si agrega job_posting por defecto, quítalo: los portales de empleo cargan con JavaScript y no muestran fecha con WebFetch.

---

## 5. Correr signal-radar con 2 cuentas — 8 min

**Objetivo:** primera salida real con señales fechadas y con fuente.

**Prompt:**
```
Corre la skill signal-radar con max_accounts 2. Al final dime cuentas, fecha y fuente de cada una, y los principales motivos de descarte.
```

**En paralelo:** mientras corre, abre una segunda ventana de PowerShell en la misma carpeta, abre otro Claude Code y haz el paso 6 ahí. La segunda sesión solo crea la skill icp-gate; no toca output/.

**Debe salir:** `output/signal_radar_*.csv` con 2 filas y su `_log.md`.

**Qué decir:** "Fíjense en los descartes: una señal sin fecha o sin fuente que abra no entra, aunque la empresa sea perfecta."

**Si sale mal:**
- Si pasan 5 min sin 2 cuentas, acota: "Solo expansion, solo plantas de alimentos, bebidas o acero en México y US, 2026."
- Si una fuente no abre o no tiene fecha, esa señal debe descartarse. Es el comportamiento correcto y vale la pena señalarlo en la demo.
- Si sigue lento, acepta 1 cuenta y continúa; el gate funciona igual.
- Plan B: ten preparado el nombre de una empresa con señal conocida y pide "Corre signal-radar solo para <empresa>".

---

## 6. Skill icp-gate (segunda ventana) — 4 min, en paralelo al paso 5

**Objetivo:** decidir quién merece enrichment pagado antes de gastar.

**Dónde:** en el segundo Claude Code abierto durante el paso 5. Esta sesión solo crea la skill; no toca output/.

**Prompt:**
```
Crea .claude/skills/icp-gate/SKILL.md. Etapas 2-3 (Gate #0 + Segment), gratis.
Input: el signal_radar_*.csv más reciente. Por cuenta: qué hace la planta (sitio oficial, luego la fuente) -> company_type; tamaño con fuente verificable, si no hay = unknown; process_type (continuo = bebidas, acero, cemento, vidrio; híbrido = pharma, CPG; discreto = autopartes, vehículos); vertical; arquetipo (greenfield solo si es un sitio nuevo; si no, enterprise si tiene varias plantas, o mid_market); priority desde la matriz de icp.md.
gate_result en orden: exclusiones -> company_type -> geografía -> tamaño. pass, fail o unknown. gate_reason = una frase con la URL de la evidencia.
Salida: output/icp_gate_<YYYYMMDD_HHMM>.csv (signal-radar + columnas del gate) y _log.md con la evidencia.
```

**Debe salir:** `.claude/skills/icp-gate/SKILL.md`.

**Qué decir:** "Mientras una sesión investiga, la otra construye la siguiente etapa: así se trabaja con agentes, en paralelo pero sin pisarse."

**Si sale mal:**
- Si copia la matriz dentro de la skill, pide: "No copies icp.md: léelo." Esta es la regla de una sola fuente de verdad.
- Si la primera sesión no ve la skill en el paso 7, reinicia `claude` en esa ventana después de que termine el paso 5.

---

## 7. Correr icp-gate — 5 min

**Objetivo:** cada cuenta con pass, fail o unknown, y su evidencia.

**Prompt (en la primera ventana):**
```
Corre icp-gate sobre el último signal_radar. Dame pass/fail/unknown y una línea por cuenta con prioridad y razón.
```

**Debe salir:** `output/icp_gate_*.csv` y su `_log.md`.

**Qué decir:** "El gate corre antes de gastar: lo que sale fail o unknown nunca llega a una API pagada."

**Si sale mal:**
- Si no encuentra el tamaño, el resultado debe ser unknown, no pass. Úsalo en la demo: unknown nunca se paga.
- Si da pass sin URL de evidencia, pide: "Sin URL de evidencia no hay pass: corrígelo."
- Si tarda, limita la búsqueda a una fuente por cuenta (sitio oficial o la nota de la señal).

---

## 8. Script del cockpit simple — 5 min

**Objetivo:** una vista HTML del pipeline para mostrar en pantalla.

**Prompt:**
```
Crea scripts/build-cockpit.js en Node sin dependencias: lee el último output/signal_radar_*.csv y el último icp_gate_*.csv (parser CSV que respete comillas), une por account_name y escribe output/cockpit.html: embudo (señales -> pasan gate), una tarjeta por cuenta con señal, fecha, link a la fuente, gate y prioridad. Etiqueta "DEMO". Escapa el HTML. Luego córrelo.
```

**Debe salir:** `scripts/build-cockpit.js` y `output/cockpit.html`. Ábrelo con `start output\cockpit.html` (Windows) o `open output/cockpit.html` (Mac).

**Qué decir:** "El cockpit no tiene lógica propia: solo lee lo que cada etapa ya dejó escrito en output/."

**Si sale mal:**
- Si el HTML sale vacío, revisa el parser CSV: las comas dentro de `signal_detail` rompen un `split(",")` simple.
- Si no hay tiempo, muestra directamente los dos CSV y el `_log.md`: el embudo se puede leer ahí.

---

## 9. Opcional: skill committee + correr — 8 min

**Objetivo:** un champion y un economic buyer por cuenta que pasó el gate.

**Prompt:**
```
Crea .claude/skills/committee/SKILL.md, gratis: solo cuentas con gate pass. Apunta a la planta de la señal, no al corporativo. Champion (mantenimiento, confiabilidad, mejora continua, producción; greenfield: launch manager) y economic_buyer (director de planta, VP Ops, COO). Nunca CIO/CEO. Solo personas con nombre, cargo y empresa en una fuente y rol vigente. Máx 2. Sin contacto = fila vacía. Salida committee_*.csv (gitignored) + _log.md. Luego córrela.
```

**Debe salir:** `output/committee_*.csv` (gitignored) y su `_log.md`.

**Qué decir:** "Busco a quien siente el dolor en la línea y a quien firma, no al más senior; por eso el CEO queda fuera."

**Si sale mal:**
- Lo normal es no encontrar a nadie a nivel planta con fuentes gratis. Dilo en la demo: el siguiente paso es una API de personas paga, con muestra y aprobación.
- Si propone al CEO, recuérdale la regla y pídele que lo excluya.

---

## 10. Opcional: skill enrich, solo estimado — 5 min

**Objetivo:** mostrar el control de costo antes de cualquier llamada pagada.

**Prompt:**
```
Crea .claude/skills/enrich/SKILL.md: email waterfall con Deepline, dropleads -> hunter -> icypeas, parar en el primer email verificado. Verificado o vacío, nunca adivinar. Descubre los comandos con deepline --help. Primero saldo y ESTIMADO (contactos, dominio, proveedores, costo máximo) y DETENTE hasta mi OK. Tope 2 USD. Registra en output/cost_log.csv. Luego corre solo el estimado.
```

**Debe salir:** la skill y un estimado en pantalla. No se gastan créditos.

**Qué decir:** "Este es el único paso que cuesta dinero, y es el único donde el agente se detiene y me pide permiso."

**Si sale mal:**
- Corre cada comando de deepline con `DEEPLINE_NO_AUTO_UPDATE=1 DEEPLINE_SKIP_SKILLS_SYNC=1`.
- Si Deepline pide autenticación o no está instalado, quédate en el estimado: el punto de la demo es el freno antes de pagar.
- Si intenta ejecutar llamadas sin tu OK, detén la sesión (Esc) y señálalo.

---

## 11. Opcional: skill draft + correr — 6 min

**Objetivo:** primer mensaje desde la señal, auditado contra los guardrails.

**Prompt:**
```
Crea .claude/skills/draft/SKILL.md: email si está verificado, si no nota LinkedIn de máx 300 caracteres. Español MX, inglés US. Línea 1 = la señal. Audita las reglas de icp.md, más: P1 marcado para revisión humana, y timing (el mensaje coincide con la etapa actual de la señal). Si falla, reescribe una vez. Todo borrador empieza con "BORRADOR / DRAFT". Nunca enviar. Salida draft_*.csv + _log.md. Luego córrela.
```

**Debe salir:** `output/draft_*.csv` (gitignored) y su `_log.md` con la auditoría por regla.

**Qué decir:** "El auditor revisa reglas; la verdad la reviso yo. Por eso las cuentas P1 siempre pasan por una persona."

**Si sale mal:**
- Si no hay contactos del paso 9, pide un borrador para una persona ficticia marcada `illustrative`. Nunca uses un nombre real inventado.
- Lee el borrador en voz alta y verifica la regla de timing tú mismo.
