---
name: to-prd
description: Convert the grill-me interview into a Product Requirements Document including UI/UX decisions. Run after /grill-me is complete.
---

# Skill: to-prd

Convert the completed grill-me interview into a concise PRD.
This is the destination document — source of truth for what
is being built including visual and interaction decisions.

## Rules
- Only run after /grill-me is complete
- Do not invent requirements not discussed in the interview
- Capture design direction and UI decisions — not just data flow
- Save to `docs/prd/<feature-name>.md`
- If foundation was identified as missing — create a foundation
  PRD first at `docs/prd/frontend-foundation.md`

## PRD Structure

```markdown
# PRD: <Feature Name>

## Problem
One sentence. What problem does this solve and for whom?

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## User Stories
- As a user, I want to...

## Design Direction
Color palette: <colors>
Typography: <fonts>
Visual tone: <clinical / modern / minimal / data-dense>
Key interactions: <hover states, animations, transitions>
Mobile behavior: <how layout changes>

## UI States
| State | What the user sees |
|-------|-------------------|
| Loading | <description> |
| Empty | <description> |
| Error | <description> |
| Success | <description> |

## Scope
### In Scope
- What is included

### Out of Scope
- What is explicitly excluded

## Data
### Inputs
### Outputs
### Stored

## Edge Cases
- Edge case → expected behavior

## Open Questions
Any unresolved decisions needing input.
```

## When Done

```
PRD COMPLETE

Saved to: docs/prd/<feature-name>.md

Ready to run /to-issues
```