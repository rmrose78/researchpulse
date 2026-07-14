---
name: to-issues
description: Break a PRD into vertical slice implementation tasks and create GitHub Issues. Run after /to-prd is complete.
---

# Skill: to-issues

Break the PRD into small, vertical slice implementation tasks. Each task must cut through all layers — database, backend, frontend — and leave something visible and testable at the end. Then create GitHub Issues automatically.

## Rules
- Only run after /to-prd is complete
- Read the PRD from `docs/prd/<feature-name>.md` before generating issues
- Each issue must be a vertical slice — never horizontal
- Each issue must be independently completable
- Each issue must have a clear definition of done
- Issues should be small enough to complete in one Claude Code session
- Save issues to `docs/issues/<feature-name>/`
- After saving all markdown files, create GitHub Issues using the gh CLI

## What is a Vertical Slice

```
❌ Horizontal (wrong):
  Issue 1: Create all database tables
  Issue 2: Build all API endpoints
  Issue 3: Build all frontend components

✅ Vertical (correct):
  Issue 1: User can search PubMed and see results
  Issue 2: User can click article and see full detail
  Issue 3: User can save article to reading list
```

## Issue Structure

Save each issue as `docs/issues/<feature-name>/<number>-<slug>.md`:

```markdown
# Issue <number>: <Title>

## What
One sentence description of what this issue delivers.

## Why
Why does this matter to the user?

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Layers Touched
- [ ] Database — <what changes>
- [ ] Backend — <what endpoints>
- [ ] Frontend — <what components>

## Edge Cases
- Edge case → expected behavior

## Blocked By
List any issues that must be completed first. None if independent.

## Definition of Done
- [ ] Tests written and passing
- [ ] Red-green verified
- [ ] Manually tested in browser
```

## GitHub Issues — Auto Creation

After saving all markdown files, create GitHub Issues using the gh CLI.

For each issue run:

```bash
gh issue create \
  --title "<issue title>" \
  --body "$(cat docs/issues/<feature-name>/<number>-<slug>.md)" \
  --label "vertical-slice"
```

If the `vertical-slice` label doesn't exist yet, create it first:

```bash
gh label create "vertical-slice" --color "#0075ca" --description "Vertical slice feature ticket"
gh label create "phase-1" --color "#e4e669" --description "Phase 1 core features"
gh label create "phase-2" --color "#d93f0b" --description "Phase 2 trending features"
```

Add the appropriate phase label to each issue based on which phase it belongs to.

## Blocking Relationships

After generating all issues output a dependency graph:

```
Issue 1 → blocks nothing
Issue 2 → blocked by Issue 1
Issue 3 → blocked by Issue 1
Issue 4 → blocked by Issue 2, Issue 3
```

## Confidence Gate
Before producing the ISSUES COMPLETE summary, run
`.claude/skills/shared/confidence-gate.md`. The question it's gating: is
there enough here that each issue is a true vertical slice and
independently completable?

## When Done

Output exactly this:

```
ISSUES COMPLETE

Generated <n> issues saved to docs/issues/<feature-name>/
GitHub Issues created: <links to each issue>

Dependency order:
1. <Issue 1 title>
2. <Issue 2 title>
...

Ready to run /tdd on Issue 1
```