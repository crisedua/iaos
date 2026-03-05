# Plan: Comando /skills — Directorio de skills disponibles

**Created:** 2026-03-05
**Status:** Draft
**Request:** Crear un comando que liste todos los skills/comandos disponibles con descripción corta, para no tener que memorizarlos.

---

## Overview

### What This Plan Accomplishes

Crear un nuevo comando `/skills` que al ejecutarse muestre una tabla formateada con todos los comandos disponibles del workspace, incluyendo nombre, descripción corta, uso y ejemplo. El comando lee dinámicamente los archivos en `.claude/commands/` para que siempre esté actualizado sin mantenimiento manual.

### Why This Matters

El workspace tiene 7 comandos (y creciendo). Memorizar qué hace cada uno y cómo usarlo es fricción innecesaria. Un directorio accesible con `/skills` reduce la barrera de uso y hace el sistema más auto-documentado — alineado con el principio de que el workspace debe ser fácil de operar sin contexto previo.

---

## Current State

### Relevant Existing Structure

- `.claude/commands/` — contiene 7 archivos `.md`, cada uno define un skill
  - `prime.md` — inicializar sesión
  - `create-plan.md` — crear planes de implementación
  - `implement.md` — ejecutar planes
  - `weekly-leads.md` — revisión semanal de leads
  - `extract-leads-gmap.md` — extracción masiva de Google Maps
  - `outreach-leads.md` — sesión diaria de outreach
  - `ia-os-session.md` — sesiones IA OS (onboard/review/sprint/output)
- `CLAUDE.md` — documenta todos los comandos en la sección "Commands"

### Gaps or Problems Being Addressed

- **No hay forma rápida de ver todos los skills** sin abrir CLAUDE.md o recordarlos de memoria
- **No hay referencia in-session** — el usuario tiene que salir del flujo de trabajo para consultar qué comandos existen
- **Cuando se agregan nuevos comandos**, el usuario no tiene visibilidad inmediata de que existen

---

## Proposed Changes

### Summary of Changes

- Crear un nuevo comando `/skills` en `.claude/commands/skills.md`
- El comando lee dinámicamente los archivos `.md` en `.claude/commands/` y extrae el título (línea 1, `# Título`) y la primera línea descriptiva (línea con `>`)
- Presenta los resultados en una tabla formateada con: nombre del comando, descripción, y ejemplo de uso
- Actualizar `CLAUDE.md` para documentar el nuevo comando

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `.claude/commands/skills.md` | Comando que lista todos los skills disponibles con descripción y uso |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `CLAUDE.md` | Agregar `/skills` a la sección Commands |

### Files to Delete (if any)

Ninguno.

---

## Design Decisions

### Key Decisions Made

1. **Lectura dinámica de `.claude/commands/`**: En vez de mantener una lista estática (que se desincroniza), el comando instruye a Claude a escanear el directorio y extraer info de cada archivo. Así nunca queda desactualizado.

2. **Formato tabla con categorías**: Agrupar los comandos por tipo de uso (Setup, Planning, Leads, IA OS) para que sea más fácil encontrar lo que necesitas.

3. **Incluir ejemplo de uso por comando**: No solo el nombre y descripción, sino un ejemplo concreto de cómo invocarlo, para reducir fricción al máximo.

4. **Nombre `/skills`**: Corto, intuitivo, y consistente con el lenguaje que usa Claude Code internamente para referirse a estos comandos.

### Alternatives Considered

1. **Lista estática en un archivo `reference/skills-cheatsheet.md`** — Rechazado porque requiere mantenimiento manual y se desincroniza fácilmente.

2. **Agregar más detalle a la sección Commands de CLAUDE.md** — Rechazado porque CLAUDE.md se lee al inicio de sesión pero no es consultable rápidamente mid-session con un comando.

3. **Un script bash que liste los archivos** — Rechazado porque no da contexto ni formato útil; un comando de Claude puede generar una tabla rica con descripciones.

### Open Questions (if any)

Ninguno — la implementación es directa.

---

## Step-by-Step Tasks

### Step 1: Crear el comando `/skills`

Crear el archivo `.claude/commands/skills.md` con las instrucciones para Claude.

**Actions:**

- Crear el archivo con la estructura que instruye a Claude a:
  1. Listar los archivos en `.claude/commands/`
  2. Leer la primera línea (`# Título`) y la línea descriptiva (`> descripción`) de cada uno
  3. Presentar una tabla organizada por categoría con: comando, descripción, y ejemplo de uso
  4. Incluir un tip al final sobre cómo obtener más detalle de cada comando

**Contenido del archivo:**

```markdown
# Skills Directory

> Quick reference of all available slash commands in this workspace.

## Instructions

Scan the `.claude/commands/` directory and read the first 3 lines of each `.md` file to extract:
- **Command name**: derived from the filename (e.g., `prime.md` → `/prime`)
- **Title**: from the `# Title` line (line 1)
- **Description**: from the `> description` line (usually line 3)

Then present the results in this format:

---

## Available Skills

### Session & Planning

| Command | Description | Example |
|---|---|---|
| `/prime` | Initialize session with full context | `/prime` |
| `/create-plan` | Create a detailed implementation plan | `/create-plan add competitor analysis` |
| `/implement` | Execute a plan step by step | `/implement plans/2026-03-05-my-plan.md` |
| `/skills` | Show this directory of available commands | `/skills` |

### Lead Generation & Outreach

| Command | Description | Example |
|---|---|---|
| `/weekly-leads` | Weekly lead generation review and planning | `/weekly-leads` |
| `/extract-leads-gmap` | Bulk-extract leads from Google Maps (Chile) | `/extract-leads-gmap` |
| `/outreach-leads` | Daily outreach session — queue, follow-ups, scripts | `/outreach-leads` |

### IA OS — Director Sessions

| Command | Description | Example |
|---|---|---|
| `/ia-os-session` | Run a structured IA OS session | `/ia-os-session review personal` |

**IA OS Session modes:**
- `onboard [client]` — First session: intake + Context OS
- `review [client|personal]` — Weekly review + priorities
- `sprint [client|personal]` — Focused work session
- `output [type] [client|personal]` — Generate deliverable (proposal, sop, report, email, post, checklist, summary)

---

**Tip:** Para ver el detalle completo de cualquier comando, pídeme: "muéstrame qué hace /[comando]" y te lo explico.

---

**IMPORTANT:** If new `.md` files exist in `.claude/commands/` that are NOT listed in the tables above, add them to the appropriate category. Always reflect the current state of the commands directory.
```

**Files affected:**

- `.claude/commands/skills.md`

---

### Step 2: Actualizar CLAUDE.md

Agregar el comando `/skills` a la sección Commands de CLAUDE.md.

**Actions:**

- Agregar una entrada para `/skills` después de la sección de `/prime` (ya que es un comando de referencia/setup)
- Mantener el mismo formato que los demás comandos documentados

**Texto a agregar después de la sección de `/prime`:**

```markdown
### /skills

**Purpose:** Show a quick-reference directory of all available slash commands.

Run anytime to see what commands are available, what they do, and how to use them. Reads `.claude/commands/` dynamically so it's always up to date.

Example: `/skills`
```

**Files affected:**

- `CLAUDE.md`

---

## Connections & Dependencies

### Files That Reference This Area

- `CLAUDE.md` — sección Commands (será actualizada)
- `.claude/commands/prime.md` — menciona "What commands are available" en su summary, pero no necesita cambio

### Updates Needed for Consistency

- `CLAUDE.md` debe incluir `/skills` en la sección Commands

### Impact on Existing Workflows

- **Impacto positivo**: Cualquier sesión nueva puede usar `/skills` para orientarse rápidamente
- **Sin impacto negativo**: No modifica ningún comando existente
- **Mantenimiento futuro**: Cuando se cree un nuevo comando, el archivo `skills.md` incluye instrucciones para que Claude agregue dinámicamente cualquier comando nuevo que detecte

---

## Validation Checklist

- [ ] Archivo `.claude/commands/skills.md` creado y con contenido completo
- [ ] El comando `/skills` es ejecutable y muestra la tabla de comandos
- [ ] Todos los 7 comandos existentes + `/skills` aparecen listados
- [ ] `CLAUDE.md` actualizado con la entrada de `/skills`
- [ ] El formato es consistente con los demás comandos del workspace

---

## Success Criteria

1. Al ejecutar `/skills`, el usuario ve una tabla clara con todos los comandos disponibles, organizados por categoría
2. Cada comando muestra nombre, descripción corta, y ejemplo de uso
3. `CLAUDE.md` documenta el nuevo comando `/skills`
4. Si se agregan nuevos comandos en el futuro, `/skills` los detecta automáticamente

---

## Notes

- El enfoque "semi-dinámico" (tabla base + instrucción de detectar nuevos) es el mejor balance entre consistencia y mantenibilidad
- En el futuro, si el workspace crece mucho, se podría agregar filtrado por categoría (e.g., `/skills leads`) pero por ahora no es necesario
- Este comando complementa bien a `/prime` — prime carga todo el contexto, skills es una referencia rápida mid-session
