---
name: tdd
description: Implement a single issue using TDD. Backend is test-first. Frontend is component-first with red-green verification. Run on one issue at a time.
---

# Skill: tdd

Implement one vertical slice issue at a time. Never move to the next
issue until the current one is visually verified and all tests green.

## Before Starting
1. Read the issue file from `docs/issues/<feature-name>/`
2. If frontend work is involved — read `fe-standards.md` in this directory
3. If committing — run through `pre-commit.md` in this directory

## Rules
- ONE issue per session
- Never commit without developer visual confirmation
- Never commit without running pre-commit.md checklist
- Act as UI/UX engineer — produce modern, accessible, polished UI
- Developer is product manager — flag design decisions for approval
- Never auto-commit — always show visual verification instructions first

---

## Backend Flow — Test First

```
1. RED    — write failing test for ONE criterion
2. VERIFY — run tests, confirm this test fails
3. GREEN  — write minimum code to pass
4. VERIFY — run tests, confirm it passes
5. REFACTOR — clean up, tests still pass
6. PRE-COMMIT — run pre-commit.md checklist
7. COMMIT
```

### Backend Commands
```bash
cd backend && pytest tests/ -v
cd backend && pytest tests/test_<feature>.py::test_<name> -v
```

### Backend Test Pattern
```python
def test_<behavior>_<expected_result>():
    # Arrange
    <set up data>

    # Act
    response = client.<method>(<url>)

    # Assert
    assert response.status_code == <expected>
```

⚠️ If test passes before writing implementation — stop. Test is wrong.

---

## Frontend Flow — Component First

```
1. READ    — read fe-standards.md before writing any component
2. BUILD   — create component following fe-standards.md
3. A11Y    — run through a11y-checklist.md before writing tests
4. TEST    — write test against the real component
5. FORCE RED — break something to confirm test can fail
6. RESTORE — fix back to correct
7. VERIFY GREEN — confirm test passes
8. VISUAL VERIFY — run through visual-verification.md, wait for confirmation
9. PRE-COMMIT — run pre-commit.md checklist
10. COMMIT
```

### Frontend Commands
```bash
cd frontend && npm run dev
cd frontend && npm test
cd frontend && npm test -- src/components/<component>.test.tsx
```

### Frontend Test Pattern
```tsx
it('<behavior>', async () => {
    // Arrange
    render(<Component />)

    // Act
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    // Assert
    expect(await screen.findByText(/results/i)).toBeInTheDocument()
})
```

---

## Visual Verification — Required Before Every Commit

Run through `visual-verification.md` in this directory. If a design
screenshot was provided, it drives an automated screenshot-compare-fix
loop via the Playwright MCP tools; otherwise it falls back to the manual
checklist. Either way, end by waiting for developer confirmation.

---

## Commit Message Format
```
feat: <what was implemented>

- A11y: <accessibility features added>
- Tests: <what tests verify>
- Visual: developer confirmed
```

## When Issue is Complete
```
ISSUE COMPLETE

Issue: <title>
Built: ✅
A11y checked: ✅
Tests: <n> added, all passing ✅
Red-green verified: ✅
Visual confirmed: ✅

Commit: <message>
Next issue: <title or NONE>
```