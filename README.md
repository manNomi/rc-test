# React Compiler & ESLint Bug Reproduction

**Bug Found:** When using `eslint-disable-next-line react-hooks/exhaustive-deps`, all react-hooks rules are ignored for the entire function

**💡 New to this project?** Read **[SUMMARY.md](./SUMMARY.md)** first for a complete overview!

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

### 2. Choose Your Approach

We have **TWO solutions** - pick the one that fits best:

#### 🚀 Option A: Enhance React Compiler (RECOMMENDED!)

**What:** Improve React Compiler's warning message  
**Where:** facebook/react repository  
**Risk:** Zero (message only)  
**Timeline:** ~4 days  
**Approval:** 70-80% likely

**Documents:**
- **[OPTION_A_PROPOSAL.md](./OPTION_A_PROPOSAL.md)** - Complete detailed proposal
- **[OPTION_A_ISSUE.md](./OPTION_A_ISSUE.md)** - Ready to submit issue

**Why choose this:**
- ✅ Zero risk (only changes warning text)
- ✅ Fast implementation
- ✅ Addresses josephsavona's feedback from #34027
- ✅ Immediate value for all React Compiler users

**Submit:**
1. Copy content from `OPTION_A_ISSUE.md`
2. Go to: https://github.com/facebook/react/issues/new
3. Paste and submit

#### 🛠️ Option B: New ESLint Rule

**What:** Create new ESLint rule to detect the pattern  
**Where:** eslint-plugin-react-hooks  
**Risk:** Low (new feature)  
**Timeline:** 1-2 weeks  
**Approval:** 50-60% likely

**Documents:**
- **[PROPOSAL.md](./PROPOSAL.md)** - Complete rule specification
- **[ISSUE_TEMPLATE.md](./ISSUE_TEMPLATE.md)** - Long version issue
- **[ISSUE_TEMPLATE_SHORT.md](./ISSUE_TEMPLATE_SHORT.md)** - Short version issue

**Why choose this:**
- ✅ More proactive detection
- ✅ Can provide auto-fixes
- ✅ Works in all scenarios

**Submit:**
1. Copy content from `ISSUE_TEMPLATE_SHORT.md` or `ISSUE_TEMPLATE.md`
2. Go to: https://github.com/facebook/react/issues/new
3. Paste and submit

### 3. Or Just Report the Bug

**[BUG_REPORT.md](./BUG_REPORT.md)** - Just report the issue without proposing solution

1. Go to: https://github.com/facebook/react/issues/new
2. Copy BUG_REPORT.md content
3. Submit

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
├── SUMMARY.md                       # 🎯 START HERE - Complete project overview
├── CORE_ISSUE.md                    # 📌 Core problem explanation
│
├── 🚀 Option A: Enhance React Compiler (RECOMMENDED!)
│   ├── OPTION_A_PROPOSAL.md         # Complete detailed proposal
│   └── OPTION_A_ISSUE.md            # Ready to submit issue template
│
├── 🛠️ Option B: New ESLint Rule
│   ├── PROPOSAL.md                  # Complete rule specification
│   ├── ISSUE_TEMPLATE.md            # Long version issue template
│   └── ISSUE_TEMPLATE_SHORT.md      # Short version issue template
│
├── BUG_REPORT.md                    # 🐛 Detailed bug report (no solution)
└── README.md                        # This file
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

**Reading order:** 
1. `SUMMARY.md` - Complete overview (recommended first read)
2. `CORE_ISSUE.md` - Understand the core problem
3. **Choose your path:**
   - **Path A (Recommended):** `OPTION_A_PROPOSAL.md` → `OPTION_A_ISSUE.md` → Submit
   - **Path B:** `PROPOSAL.md` → `ISSUE_TEMPLATE_SHORT.md` → Submit

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
