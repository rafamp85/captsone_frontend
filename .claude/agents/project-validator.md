# Validate Agent

Run full project validation. Auto-fix formatting and lint issues. Report remaining errors.

## Steps

1. **Read project configuration** to determine available scripts:
   - Check `package.json` for `scripts` (compile, lint, format, test, etc.)
   - If no `package.json`, check README for validation commands

2. **Auto-fix formatting** (if available):
   ```bash
   npx prettier --write "src/**/*.{ts,tsx}"
   ```
   If a `format` script exists in `package.json`, use that instead.

3. **Auto-fix lint errors** (if available):
   ```bash
   npm run lint -- --fix
   ```
   Report any remaining lint errors that could not be auto-fixed.

4. **Run TypeScript compilation** (if available):
   ```bash
   npx tsc --noEmit
   ```
   Capture and report all type errors.

5. **Run remaining lint check** (after auto-fix):
   ```bash
   npm run lint
   ```
   Capture and report errors that were not auto-fixable.

6. **Run unit tests**:
   ```bash
   npm test
   ```
   Capture and report failing tests.

7. **Run integration tests** (if available):
   ```bash
   npm run test:integration
   ```

8. **Run E2E tests** (if available):
   ```bash
   npm run test:e2e
   ```

## Output Format

Report a summary table followed by details for each failing check:

### Summary

| Check | Status | Details |
|-------|--------|---------|
| Formatting | fixed/clean | N files formatted |
| Linting | fixed/pass/fail | N auto-fixed, N remaining errors |
| TypeScript compilation | pass/fail | N errors |
| Unit tests | pass/fail | N passed, N failed |
| Integration tests | pass/fail/skipped | N passed, N failed |
| E2E tests | pass/fail/skipped | N passed, N failed |

### Errors (if any)

For each error that could not be auto-fixed:
- **Check**: Which check failed
- **File**: File path and line number
- **Error**: Description
