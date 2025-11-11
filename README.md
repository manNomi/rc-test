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

```typescript
// Custom hook
function useCustomHook() {
  const api = useVirtualizer({...});  // 😴 No warning!
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);  // ← Because of this
  
  return api;
}

// Component
function Component() {
  const $ = useMemoCache(10);  // ✅ Memoized
  const api = useCustomHook();  // ❌ New object every render
  
  // Memo cache invalidated every time
  if ($[1] !== api) {  // ← Always true!
    // Recalculate every time 💥
  }
}
```

**Result:**
- No ESLint warning → Developer doesn't know
- Component is memoized → Looks OK
- But internal objects have new references every render → Actually NG
- **→ Unpredictable behavior**

---

## 📋 What to Do

### Detailed Bug Report
**[BUG_REPORT.md](./BUG_REPORT.md)** - Issue report to submit to React team

### Submit Issue
1. Create GitHub repository (this project)
2. Submit React issue: https://github.com/facebook/react/issues
3. Copy BUG_REPORT.md content
4. Include repository URL

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
src/
├── hooks/
│   ├── useIncompatibleMovieList.ts  # Bug reproduction (line 61, 83)
│   └── edgeCaseTests.ts             # 15 test cases
├── pages/
│   ├── CustomHookPage.tsx           # Demo page
│   ├── IncompatiblePage.tsx         # Direct use example
│   └── ...
└── api/
    └── mockApi.ts                   # Mock data
```

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
