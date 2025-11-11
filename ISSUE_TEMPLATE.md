# [Proposal] ESLint Rule to Detect React Compiler Interference

## 🎯 Summary

Developers unknowingly use `eslint-disable` comments in custom hooks, which silently breaks React Compiler's warning system. I propose creating a new ESLint rule that warns developers when their lint-disabling comments interfere with React Compiler.

## 💡 The Problem

When developers add `eslint-disable-next-line react-hooks/exhaustive-deps` to a custom hook:

1. React Compiler abandons analysis of the entire hook
2. **Critical `incompatible-library` warnings are silently suppressed**
3. Developer sees clean ESLint output (thinks everything is fine)
4. Hook returns unstable references → Component memoization breaks
5. **Silent failure in production → Impossible to debug**

### Real-World Example

```typescript
// Developer writes this, thinking it's safe:
export function useVirtualScroll({...}) {
  const virtualizer = useVirtualizer({...});  // ← Should warn!
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);  // ← This kills all warnings
  
  return { virtualizer };
}

// Result:
// ❌ No warning shown (silently suppressed)
// ❌ Developer has no idea there's a problem
// ❌ Production performance degrades
// ❌ Days spent debugging with no clues
```

## 💡 Proposed Solution

Create a new ESLint rule: `react-compiler/no-eslint-disable-in-hooks`

### What It Does

Detects and warns when:
- A custom hook uses `eslint-disable` or `eslint-disable-next-line`
- The hook contains incompatible APIs (like `useVirtualizer`)
- The disable comment affects React Compiler's analysis

### Example Warning

```
⚠️ react-compiler/no-eslint-disable-in-hooks

Using 'eslint-disable-next-line' in this custom hook prevents React Compiler
from analyzing it and suppresses the 'incompatible-library' warning.

This hook uses 'useVirtualizer' which requires a warning, but it will be
silently suppressed, causing silent failures.

💡 Suggested fixes:
1. Remove eslint-disable and list all dependencies
2. Add "use no memo" directive to explicitly opt-out
3. Use the incompatible API directly in components

📚 Learn more: [link to documentation]
```

## 📋 Benefits

### For Developers
- ✅ Immediate feedback when eslint-disable affects React Compiler
- ✅ Clear guidance on how to fix
- ✅ Prevent silent failures before they reach production
- ✅ Learn best practices

### For Teams
- ✅ Catch issues in code review
- ✅ Block problematic patterns in CI/CD
- ✅ Enforce best practices across codebase
- ✅ Reduce debugging time

### For React Ecosystem
- ✅ Safer React Compiler adoption
- ✅ Better developer experience
- ✅ Fewer "why doesn't this work?" issues
- ✅ Community education

## 🔧 Implementation Approach

### Detection Logic

```javascript
1. Is it a custom hook? (name starts with "use")
2. Does it use incompatible APIs? (useVirtualizer, etc.)
3. Does it have eslint-disable comments?
4. Does it have "use no memo" directive? (if yes, allow)

If conditions 1-3 are true and 4 is false → Warn
```

### Auto-fix Suggestions

1. **Remove disable + list dependencies**
   ```typescript
   useEffect(() => {...}, [virtualizer, dep1, dep2]);
   ```

2. **Add "use no memo" directive**
   ```typescript
   export function useHook() {
     "use no memo";
     // ... code
   }
   ```

## 📊 Real-World Impact

This issue was discovered in production at our company:

- **Day 1-2**: Clean code written, PR approved (ESLint was clean)
- **Day 7**: User complaints about slow app
- **Day 8-10**: 3 days debugging with no warnings or errors
- **Day 11**: Finally discovered eslint-disable was the cause

**Total cost**: 3+ days of debugging time, poor user experience, production issues

With this rule, it would have been caught on **Day 1** during development.

## 🔗 Full Details

I've created a complete proposal with:
- Detailed rule specification
- Implementation algorithm
- Examples of what should/shouldn't warn
- Configuration options
- IDE integration ideas

**Repository**: https://github.com/[your-repo]/react-compiler-test

Key files:
- `CORE_ISSUE.md` - Explanation of the core problem
- `PROPOSAL.md` - Full detailed proposal
- `BUG_REPORT.md` - Technical bug analysis
- `src/` - Working reproduction

## 🤔 Discussion Questions

1. Should this be part of `eslint-plugin-react-hooks` or a separate plugin?
2. Should it be `warn` or `error` by default?
3. What other incompatible APIs should be detected?
4. Should we provide auto-fix or just suggestions?

## ✅ Next Steps

If this proposal is accepted, I'm happy to:
- Implement the ESLint rule
- Write comprehensive tests
- Create documentation
- Submit PR to eslint-plugin-react-hooks

## 📞 References

- Reproduction repository: [link]
- Related React Compiler docs: https://react.dev/learn/react-compiler
- Related ESLint plugin: https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks

---

**Type**: Feature Request / Proposal  
**Component**: ESLint / React Compiler  
**Priority**: Medium-High (affects developer experience and production stability)

