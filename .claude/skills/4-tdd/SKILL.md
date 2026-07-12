---
name: tdd
description: Implement a single issue using red-green-refactor TDD. Run on one issue at a time after /to-issues is complete.
---

# Skill: tdd

Implement a single vertical slice issue using strict red-green-refactor TDD. One issue at a time. Never move to the next issue until the current one is complete and all tests are green.

## Rules
- Only implement ONE issue per session
- Read the issue file from `docs/issues/<feature-name>/` before starting
- Never write implementation code before a failing test exists
- Never skip the red step — a test that was never seen failing is not a valid test
- Never fix a test to match broken code — fix the code
- Run the full test suite after every change to catch regressions
- Commit when all tests pass

## The Loop

Repeat this loop for every acceptance criterion in the issue:

```
1. RED   — write a failing test for ONE criterion
2. VERIFY RED — run tests, confirm this test fails
3. GREEN — write minimum code to make it pass
4. VERIFY GREEN — run tests, confirm it passes
5. REFACTOR — clean up if needed, tests must still pass
6. COMMIT — commit with a clear message
7. REPEAT — move to next criterion
```

⚠️ If the test passes without writing any implementation code — stop. The test is wrong. Fix the test before continuing.

## Stack-Specific Commands

### Backend (Python/FastAPI)
```bash
# Run all tests
cd backend && pytest tests/ -v

# Run specific test file
cd backend && pytest tests/test_<feature>.py -v

# Run specific test
cd backend && pytest tests/test_<feature>.py::test_<name> -v
```

### Frontend (React/TypeScript)
```bash
# Run all tests
cd frontend && npm test

# Run specific test file
cd frontend && npm test -- src/components/<component>.test.tsx

# Run in watch mode
cd frontend && npm test -- --watch
```

## Test Conventions

### Backend — pytest AAA structure
```python
def test_<behavior>_<expected_result>():
    # Arrange
    <set up data>

    # Act
    response = client.<method>(<url>)

    # Assert
    assert response.status_code == <expected>
    assert <other assertions>
```

### Frontend — React Testing Library AAA structure
```tsx
it('<behavior>', async () => {
    // Arrange
    render(<Component />)

    // Act
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Assert
    expect(screen.getByText(/success/i)).toBeInTheDocument()
})
```

## Commit Message Format
```
feat: <what was implemented>

- Test: <what the test verifies>
- Files changed: <list>
```

## Regression Check
Before marking an issue complete, run the full test suite:

```bash
# Backend
cd backend && pytest tests/ -v

# Frontend  
cd frontend && npm test
```

All tests must pass — not just the new ones.

## When Issue is Complete
Output exactly this:

```
ISSUE COMPLETE

Issue: <title>
Tests added: <n>
All tests passing: ✅

Red-green verified: ✅
Regression check: ✅

Commit: <commit message>

Ready for next issue: <next issue title or NONE if done>
```