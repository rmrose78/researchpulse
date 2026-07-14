---
name: claude-md-organizer
description: Slim down CLAUDE.md by classifying each section as keep / move-to-docs-reference / delete-as-duplicate, then rewriting CLAUDE.md as a lean index. Run whenever CLAUDE.md has grown reference material that doesn't need to load into every conversation.
---

# Skill: claude-md-organizer

CLAUDE.md loads in full on every single conversation. Sections that rarely
change and are only needed for specific tasks (design tokens, environment
variable lists, architecture diagrams) cost tokens every session for no
benefit. This skill keeps CLAUDE.md down to what's load-bearing every time,
and relocates everything else to `docs/reference/`.

## Classification

Read CLAUDE.md top to bottom. For each section, classify it:

**Keep in CLAUDE.md** — needed nearly every session, or changes often enough
that a pointer would go stale:
- Skill Shortcuts, Commands
- Critical Rules (short, load-bearing bullets)
- Collaboration/communication style
- Current Priority / living status
- Developer/team context that other rules directly depend on (e.g. an
  analogy table a "teaching mode" rule points at — the rule is meaningless
  without it)
- A "## Docs" index linking every relocated file

**Move to `docs/reference/<topic>.md`** — reference material, stable once
written, only needed when a task specifically touches that topic:
- Tech stack / hosting details
- Architecture diagrams
- Design direction / design tokens
- API endpoint status tables
- Roadmap / phases
- Environment variable lists

**Delete outright, replace with a one-line pointer** — content that's
already duplicated verbatim in a more canonical location (a skill's
standards file, a README, etc.). Grep for suspiciously familiar section
content elsewhere in the repo before assuming something is safe to move
rather than delete — duplicated content should point at its canonical
source, not get a second home in docs/reference.

## Process

1. Read CLAUDE.md in full.
2. For each section, propose a classification (keep / move / delete-duplicate)
   with a one-line reason. For delete-duplicate, name the canonical file.
3. Present the proposed split to the developer before moving anything —
   this is a structural change to a file every future session depends on.
4. Once confirmed: create `docs/reference/<topic>.md` for each "move"
   section, verbatim (don't paraphrase or "improve" the content — this is a
   relocation, not a rewrite). If content already looks stale or
   contradicts another section, flag it in the plan rather than silently
   reconciling it — reconciling facts is a product decision, not a filing
   decision.
5. Rewrite CLAUDE.md with only the "keep" sections plus the new "## Docs"
   index pointing at every relocated file and canonical duplicate location.
6. Grep the rest of the repo (skills, docs) for anything that pointed at the
   old CLAUDE.md section by name (e.g. "read CLAUDE.md's Design Direction
   section") and update those references to point at the new location.

## When Done

```
CLAUDE.md ORGANIZED

Kept: <list of sections retained>
Moved: <section → docs/reference/file.md>
Deleted as duplicate: <section → canonical file>
Cross-references updated: <files>

CLAUDE.md size: <before> lines → <after> lines
```
