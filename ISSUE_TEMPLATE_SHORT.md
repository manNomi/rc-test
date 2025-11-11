# [Proposal] ESLint Rule: Detect `eslint-disable` Breaking React Compiler Warnings

## Problem

Developers unknowingly break React Compiler's warning system by using `eslint-disable` in custom hooks.

**What happens:**
1. Developer adds `eslint-disable-next-line react-hooks/exhaustive-deps` to silence deps warning
2. React Compiler sees it and abandons analyzing the entire hook
3. **Critical `incompatible-library` warnings are silently suppressed**
4. Developer sees clean ESLint (thinks it's fine)
5. Production: Silent failures, impossible to debug

## Example

```typescript
export function useVirtualScroll({...}) {
  const virtualizer = useVirtualizer({...});  // Should warn "incompatible-library"!
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);  // This kills the warning above ⬆️
  
  return { virtualizer };  // Returns unstable reference → breaks memoization
}
```

**Expected**: Warning on line 2  
**Actual**: No warning (silently suppressed)  
**Result**: Days of debugging with no clues

## Proposed Solution

New ESLint rule: `react-compiler/no-eslint-disable-in-hooks`

**Detects:** `eslint-disable` in custom hooks that use incompatible APIs  
**Action:** Warns developer with clear explanation and fix suggestions

**Warning message:**
```
⚠️ eslint-disable in this hook suppresses React Compiler warnings

This hook uses 'useVirtualizer' but the warning is silently suppressed.

Fix:
1. Remove eslint-disable and list all dependencies, or
2. Add "use no memo" directive to explicitly opt-out
```

## Benefits

- ✅ Catch issues immediately (not after 3 days of debugging)
- ✅ Clear guidance on how to fix
- ✅ Prevent silent failures in production
- ✅ Better React Compiler adoption experience

## Implementation

I've created a complete proposal with:
- Full rule specification and algorithm
- Working reproduction + examples
- Auto-fix suggestions

**Repository**: https://github.com/manNomi/rc-test

Key files:
- `PROPOSAL.md` - Complete detailed proposal
- `CORE_ISSUE.md` - Problem explanation
- `src/` - Working bug reproduction

## Questions

1. Should this be in `eslint-plugin-react-hooks` or separate plugin?
2. Default severity: `warn` or `error`?
3. Should it auto-fix or just suggest?

I'm happy to implement this if the proposal is accepted.

---

**Type**: Feature Proposal  
**Priority**: Medium-High (DX & production stability)

