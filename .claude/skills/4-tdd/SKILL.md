---
name: tdd
description: Implement a single issue using TDD. Backend is test-first. Frontend is component-first with red-green verification. Run on one issue at a time.
---

# Skill: tdd

Implement a single vertical slice issue. One issue at a time. Never move to the next issue until the current one is complete and all tests are green.

## Rules
- Only implement ONE issue per session
- Read the issue file from `docs/issues/<feature-name>/` before starting
- Never skip red-green verification — a test never seen failing is not valid
- Never fix a test to match broken code — fix the code
- Run the full test suite after every change to catch regressions
- Commit when all tests pass

---

## Backend Flow — Test First

For FastAPI endpoints follow strict red-green-refactor:

```
1. RED    — write a failing test for ONE acceptance criterion
2. VERIFY — run tests, confirm this specific test fails
3. GREEN  — write minimum code to make it pass
4. VERIFY — run tests, confirm it passes
5. REFACTOR — clean up, tests must still pass
6. COMMIT — commit with clear message
7. REPEAT — next acceptance criterion
```

⚠️ If a test passes before writing any implementation — stop. The test is wrong. Fix it before continuing.

### Backend Test Commands
```bash
# Run all tests
cd backend && pytest tests/ -v

# Run specific test file
cd backend && pytest tests/test_<feature>.py -v

# Run specific test
cd backend && pytest tests/test_<feature>.py::test_<name> -v
```

### Backend Test Pattern — AAA
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

---

## Frontend Flow — Component First

For React components follow component-first with red-green verification:

```
1. BUILD     — create the component, get it rendering correctly
2. WRITE TEST — write a test that should pass against the real component
3. FORCE RED  — temporarily break the component or flip an assertion to confirm the test can fail
4. RESTORE   — fix back to correct implementation
5. VERIFY GREEN — confirm test passes
6. REFACTOR  — clean up if needed
7. COMMIT    — commit with clear message
8. REPEAT    — next acceptance criterion
```

⚠️ Never skip step 3. If you never see the test fail you don't know if it's actually testing anything.

### Frontend Test Commands
```bash
# Run all tests
cd frontend && npm test

# Run specific test file
cd frontend && npm test -- src/components/<component>.test.tsx

# Watch mode during development
cd frontend && npm test -- --watch
```

### Frontend Test Pattern — RTL + AAA
```tsx
it('<behavior description>', async () => {
    // Arrange
    render(<Component prop="value" />)

    // Act
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    // Assert
    expect(screen.getByText(/results/i)).toBeInTheDocument()
})
```

### Frontend Gotchas
⚠️ Always mock API calls — never hit real endpoints in tests:
```tsx
global.fetch =