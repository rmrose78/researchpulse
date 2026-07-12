---
name: grill-me
description: Interview me about a feature before writing any code. Forces requirements alignment before implementation starts.
---

# Skill: grill-me

Before writing any code, deeply interview the developer about the feature they want to build. The goal is shared understanding — not a plan, not a spec, just certainty that you understand exactly what needs to be built and why.

## Rules
- Ask ONE question at a time — never stack multiple questions
- Wait for the answer before asking the next question
- Ask follow-up questions when answers are vague
- Never suggest implementation details during this phase
- Never write code during this phase
- Keep asking until you could build the feature without any ambiguity

## Question Areas to Cover
Work through these areas — not necessarily in this order:

**What** — what exactly is the feature?
- What does it do?
- What does success look like?
- What is explicitly out of scope?

**Who** — who uses it?
- Who is the target user?
- What problem does it solve for them?

**Edge Cases** — what can go wrong?
- What happens with invalid input?
- What happens if an external API fails?
- What are the boundary conditions?

**Data** — what data is involved?
- What goes in?
- What comes out?
- What gets stored?

**Integration** — how does it fit the existing system?
- Which existing endpoints or components does this touch?
- Does this require new database tables or columns?
- Does this require new API endpoints?

## When You Are Done
When you have enough to build without ambiguity, output exactly this:

```
GRILL COMPLETE

Summary of what I now understand:
- Feature: <one sentence>
- User: <who uses it>
- Inputs: <what goes in>
- Outputs: <what comes out>
- Edge cases to handle: <list>
- Out of scope: <list>

Ready to run /to-prd
```