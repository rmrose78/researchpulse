---
name: to-prd
description: Convert the grill-me interview into a Product Requirements Document. Run after /grill-me is complete.
---

# Skill: to-prd

Convert the completed grill-me interview into a concise Product Requirements Document (PRD). This becomes the destination document — the single source of truth for what is being built.

## Rules
- Only run after /grill-me is complete
- Do not invent requirements not discussed in the interview
- Keep it concise — this is a reference doc, not an essay
- No implementation details — what, not how
- Save the PRD to `docs/prd/<feature-name>.md`

## PRD Structure

```markdown
# PRD: <Feature Name>

## Problem
One sentence. What problem does this solve and for whom?

## Success Criteria
Bullet list. How do we know this feature is done?
- [ ] Criteria 1
- [ ] Criteria 2

## User Stories
As a <user>, I want to <action> so that <outcome>.
- As a user, I want to...
- As a user, I want to...

## Scope
### In Scope
- What is included

### Out of Scope
- What is explicitly excluded

## Data
### Inputs
What the feature receives

### Outputs
What the feature returns

### Stored
What gets persisted to the database

## Edge Cases
- Edge case 1 → expected behavior
- Edge case 2 → expected behavior

## Open Questions
Any unresolved decisions that need input before implementation.
```

## When Done
Output exactly this:

```
PRD COMPLETE

Saved to: docs/prd/<feature-name>.md

Ready to run /to-issues
```