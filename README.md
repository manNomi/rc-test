# React Compiler & ESLint Bug Reproduction

**Bug Found:** When using `eslint-disable-next-line react-hooks/exhaustive-deps`, all react-hooks rules are ignored for the entire function

---

## 🚀 Quick Start

```bash
npm install
npm run dev    # http://localhost:5173
npm run lint   # Check the bug
```

---

## 🐛 Bug Reproduction

### 1. Run lint
```bash
npm run lint
```

### 2. Check results

**File:** `src/hooks/useIncompatibleMovieList.ts`

| Line | Has eslint-disable | ESLint Warning | Expected |
|------|-------------------|----------------|----------|
| 13   | ❌ No             | ✅ Shows       | ✅ Correct |
| 61   | ✅ Yes (line 83)  | ❌ Hidden      | ❌ Bug! |

### 3. Reproduce the bug
- Remove the `eslint-disable-next-line` comment on line 83
- Run `npm run lint` again
- → Warning now appears on line 61 (expected behavior)

---

## 💥 Why This Matters

### The Core Problem: Broken Warning System

This is NOT just about optimization. **The warning system itself is silently broken.**

#### 🟢 Normal Scenario (Debuggable)
```typescript
// Without eslint-disable
function useCustomHook() {
  const api = useVirtualizer({...});  // ⚠️ Warning: incompatible-library
  return api;
}
```
**Result:** ✅ Developer sees warning → Can debug → Problem solved

#### 🔴 Bug Scenario (Silent Failure)
```typescript
// With eslint-disable
function useCustomHook() {
  const api = useVirtualizer({...});  // 😴 NO WARNING!
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);  // ← This breaks the warning system
  
  return api;
}
```
**Result:** 
- ❌ No ESLint warning (silently suppressed)
- ❌ Developer thinks everything is fine
- ❌ Hook returns unstable references
- ❌ Component memoization breaks
- ❌ **Cannot debug (no warnings!)**

### Why It's Critical

```
Without eslint-disable:
  useVirtualizer → ⚠️ Warning shown → Developer fixes → ✅ Problem solved
  
With eslint-disable:
  useVirtualizer → 😴 No warning → Developer unaware → ❌ Silent failure
```

**The warning exists to protect you. When `eslint-disable` removes it, you're coding blind.**

---

## 📋 What to Do

### 1. Understand the Problem
**[CORE_ISSUE.md](./CORE_ISSUE.md)** - Read this first to understand the core problem

### 2. Review the Bug Report
**[BUG_REPORT.md](./BUG_REPORT.md)** - Detailed technical analysis for React team

### 3. Check the Solution Proposal
**[PROPOSAL.md](./PROPOSAL.md)** - 💡 Proposed ESLint rule to prevent this issue

### 4. Submit Issues

#### Option A: Report the Bug
1. Go to React repository: https://github.com/facebook/react/issues
2. Create new issue with BUG_REPORT.md content
3. Include this repository URL

#### Option B: Propose the Solution (Recommended!)

Choose one of the templates:

**Long Version** (comprehensive):
1. Copy content from `ISSUE_TEMPLATE.md`
2. Go to: https://github.com/facebook/react/issues/new
3. Paste and submit

**Short Version** (concise):
1. Copy content from `ISSUE_TEMPLATE_SHORT.md`
2. Go to: https://github.com/facebook/react/issues/new
3. Paste and submit

Or contribute directly:
4. Fork `eslint-plugin-react-hooks`
5. Implement the rule based on `PROPOSAL.md`
6. Submit PR

### Workarounds

**1. Remove eslint-disable (recommended)**
```typescript
function useHook() {
  const api = useAPI();
  useEffect(() => {
    // ...
  }, [api, dep1, dep2]);  // List all dependencies
}
```

**2. Use "use no memo"**
```typescript
function useHook() {
  "use no memo";
  const api = useAPI();
  useEffect(() => {...}, []);
  return api;
}
```

**3. Use directly**
```typescript
function Component() {
  const api = useAPI();  // ✅ Warning shown
  // ...
}
```

---

## 📂 Key Files

```
├── CORE_ISSUE.md                    # 📌 Core problem explanation (READ THIS FIRST!)
├── BUG_REPORT.md                    # Detailed bug report for React team
├── PROPOSAL.md                      # 💡 Complete solution proposal with implementation details
├── ISSUE_TEMPLATE.md                # 📝 Long version - Copy/paste to submit issue
├── ISSUE_TEMPLATE_SHORT.md          # 📝 Short version - Quick issue submission
├── README.md                        # This file
└── src/
    ├── hooks/
    │   ├── useIncompatibleMovieList.ts  # Bug reproduction (line 78, 100)
    │   └── edgeCaseTests.ts             # 15 edge case tests
    ├── pages/
    │   ├── CustomHookPage.tsx           # Demo page
    │   ├── IncompatiblePage.tsx         # Direct use example
    │   └── ...
    └── api/
        └── mockApi.ts                   # Mock data
```

**Start here:** 
1. Read `CORE_ISSUE.md` to understand the problem
2. Read `PROPOSAL.md` to see the proposed solution

---

## 🛠 Tech Stack

- React 19.2.0
- React Compiler (experimental)
- ESLint 9.0.0
- eslint-plugin-react-hooks 7.0.1
- @tanstack/react-virtual 3.13.12
- Vite

---

## 📝 Summary

| Item | Value |
|------|-------|
| **Bug** | `eslint-disable-next-line` affects entire function |
| **Impact** | Silent failure, unpredictable behavior |
| **Severity** | 🔴 Critical |
| **Affected** | All React projects with custom hooks |
| **Workaround** | Avoid eslint-disable in hooks |

---

## 📞 Contact

**Submit issue:** https://github.com/facebook/react/issues  
**Category:** Bug Report - eslint-plugin-react-hooks

---

**Last Updated:** 2025-01-10
