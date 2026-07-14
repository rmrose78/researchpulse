---
name: grill-me
description: Interview the developer about a feature before writing any code. Discovers project state first, then conducts UI/UX and feature interviews.
---

# Skill: grill-me

Before writing any code, discover what exists then interview the
developer. Think like a UI/UX designer and product engineer.

## Flow

```
1. Run discovery.md — report project state
2. If frontend missing or incomplete — run foundation questions
3. Run ux-interview.md — visual and interaction requirements
4. Run feature interview — functional requirements
5. Run confidence gate — shared/confidence-gate.md
6. Output GRILL COMPLETE summary
```

## Step 1 — Discovery
Read and follow discovery.md in this directory.

## Step 2 — Foundation Check
If discovery reveals frontend does not exist or is missing core
infrastructure, ask these before feature questions:

- Do you have a frontend repo started or scaffolding from scratch?
- Do you have a design direction or should I read CLAUDE.md and propose one?
- What is the primary device target — desktop, mobile, or both?
- Is there a brand name or logo to incorporate?

Do NOT skip this if frontend doesn't exist.

## Step 3 — UI/UX Interview
Read and follow ux-interview.md in this directory.

## Step 4 — Feature Interview
Ask ONE question at a time. Wait for answer before next.

## Step 5 — Confidence Gate
Before producing the GRILL COMPLETE summary, run
`.claude/skills/shared/confidence-gate.md`. The question it's gating: is
there enough here that the feature summary has no gaps the developer will
have to correct later?

**What**
- What exactly does this feature do?
- What does success look like to the user?
- What is explicitly out of scope?

**Who**
- Who is the target user for this feature?
- What problem does it solve for them?

**Data**
- What data goes in?
- What comes out?
- What gets stored?

**Edge Cases**
- What happens with invalid input?
- What happens if the API fails?
- What are the boundary conditions?

**Integration**
- Which existing endpoints does this consume?
- Does this require new backend endpoints?
- Does this require new database tables?

## Rules
- ONE question at a time — never stack
- Wait for answer before asking next
- Never suggest implementation during this phase
- Never write code during this phase
- Read CLAUDE.md for project-specific context before starting

## When Done

```
GRILL COMPLETE

Project state:
- Frontend: <exists / needs scaffolding>
- Foundation needed: <yes / no>
- Design direction: <from CLAUDE.md or approved proposal>

Feature summary:
- Feature: <one sentence>
- User: <who>
- Inputs: <what goes in>
- Outputs: <what comes out>
- States: <loading / empty / error / success behaviors>
- Edge cases: <list>
- Out of scope: <list>

Ready to run /to-prd
```