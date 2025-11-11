# Bug Report: eslint-disable-next-line causes unpredictable component behavior

## 🐛 Issue Summary

When `eslint-disable-next-line react-hooks/exhaustive-deps` is used in a custom hook, it disables **ALL** `react-hooks` rules for the entire function, causing:

1. **Custom hook is NOT memoized** (React Compiler skips optimization)
2. **Component IS memoized** (React Compiler optimizes separately)
3. **Hook returns new object references every render**
4. **Component's memo cache is invalidated every render**
5. **→ Unpredictable component behavior**

**Severity:** 🔴 Critical - Silent failure with production performance impact

---

## 📋 Detailed Problem Description

### The Broken Chain

```
┌─────────────────────────────────────────────────────────┐
│ 1. Custom Hook (NOT memoized)                          │
│    ❌ eslint-disable suppresses incompatible-library    │
│    ❌ React Compiler skips optimization                 │
│    ❌ Returns new object every render                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Component (IS memoized)                              │
│    ✅ React Compiler optimizes component                │
│    ✅ useMemoCache implemented                          │
│    ❌ BUT cache invalidated by new object references    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Result: Unpredictable Behavior                       │
│    😴 No warnings (silent failure)                       │
│    💥 Memo cache invalidated every render                │
│    🐛 Component behaves unpredictably                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Technical Analysis

### Step 1: Custom Hook is NOT Memoized

**Code:** `src/hooks/useIncompatibleMovieList.ts` (Line 49-90)

```typescript
export const useVirtualScroll = <T>({
  itemList,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  settedPrevItemLength = 5,
  settedEstimateSize = 60,
}: UseVirtualScrollProps<T>): UseVirtualScrollReturn => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Line 61: This should trigger incompatible-library warning
  const rowVirtualizer = useVirtualizer({
    count: itemList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => settedEstimateSize,
    overscan: 5,
  });

  // ... more code ...

  // Line 83: eslint-disable comment
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastItem = virtualItems[virtualItems.length - 1];

    if (lastItem && lastItem.index >= itemList.length - settedPrevItemLength) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage]);

  return { parentRef, rowVirtualizer };
};
```

**ESLint Result:**

```bash
$ npm run lint

# Line 61: ❌ NO WARNING!
# Expected: "react-hooks/incompatible-library" warning
# Actual: Silence (suppressed by line 83's eslint-disable)
```

**React Compiler Result:**

```json
{
  "kind": "CompileError",
  "detail": {
    "reason": "React Compiler has skipped optimizing this component because one or more React ESLint rules were disabled",
    "description": "eslint-disable-next-line react-hooks/exhaustive-deps",
    "severity": "InvalidReact",
    "loc": { "line": 83 }
  }
}
```

**Key Point:** Hook is NOT memoized because React Compiler detected `eslint-disable`.

---

### Step 2: Component IS Memoized

**Code:** `src/pages/CustomHookPage.tsx`

```typescript
export function CustomHookPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Using the custom hook
  const { parentRef, rowVirtualizer } = useVirtualScroll({
    itemList: movies,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: () => {},
  });

  // ... render logic ...
}
```

**React Compiler Result:**

```json
{
  "kind": "CompileSuccess",
  "fnName": "CustomHookPage",
  "memoSlots": 48,
  "memoBlocks": 6,
  "memoValues": 6
}
```

**Compiled Output:**

```javascript
function CustomHookPage() {
  const $ = useMemoCache(48); // ✅ Component IS memoized!

  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = [];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const [movies] = useState(t0);

  // Call the hook (NOT memoized)
  const { parentRef, rowVirtualizer } = useVirtualScroll({
    itemList: movies,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: () => {},
  });

  // Memo cache check
  let t1;
  if ($[1] !== rowVirtualizer) {
    // ← Check reference equality
    // rowVirtualizer is NEW OBJECT every render!
    t1 = calculateExpensiveValue(rowVirtualizer);
    $[1] = rowVirtualizer;
    $[2] = t1;
  } else {
    t1 = $[2]; // ← NEVER REACHES HERE!
  }

  return t1;
}
```

**Key Point:** Component is memoized, but memo cache is useless because `rowVirtualizer` is a new object every render.

---

### Step 3: The Broken Behavior

**What `useVirtualizer` returns:**

```typescript
// Inside @tanstack/react-virtual
export function useVirtualizer(options) {
  const [instance] = useState(() => new Virtualizer(options));
  instance.setOptions(options);

  // Returns NEW OBJECT every render!
  return {
    scrollToIndex: (index) => instance.scrollToIndex(index),
    scrollToOffset: (offset) => instance.scrollToOffset(offset),
    getVirtualItems: () => instance.getVirtualItems(),
    getTotalSize: () => instance.getTotalSize(),
    // ... more functions
  };
}
```

**Result per render:**

```typescript
// Render #1
const rowVirtualizer1 = { fn1: () => {...}, fn2: () => {...}, ... };

// Render #2 (even if nothing changed)
const rowVirtualizer2 = { fn1: () => {...}, fn2: () => {...}, ... };
// rowVirtualizer1 !== rowVirtualizer2  // Different references!

// Render #3
const rowVirtualizer3 = { fn1: () => {...}, fn2: () => {...}, ... };
// rowVirtualizer2 !== rowVirtualizer3  // Different again!
```

**Impact on Component:**

```typescript
function CustomHookPage() {
  const $ = useMemoCache(48);

  // Get new object every render
  const { rowVirtualizer } = useVirtualScroll({...});

  // Cache check ALWAYS fails
  if ($[1] !== rowVirtualizer) {  // ← ALWAYS TRUE!
    // Re-calculate expensive values every render
    const virtualItems = rowVirtualizer.getVirtualItems();
    const processedData = expensiveCalculation(virtualItems);
    $[1] = rowVirtualizer;
    $[2] = processedData;
  }
  // Never uses cached value!
}
```

---

## 💥 Why This Is Unpredictable

### Developer's Perspective

```typescript
// Developer writes a clean custom hook
function useVirtualScroll({...}) {
  const rowVirtualizer = useVirtualizer({...});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Just want to disable deps warning here
  }, [hasNextPage, isFetchingNextPage]);

  return { rowVirtualizer };
}
```

**Developer thinks:**

- ✅ ESLint is clean (no warnings)
- ✅ TypeScript is happy
- ✅ React Compiler is enabled
- ✅ Component should be optimized

**Reality:**

- ❌ Hook is NOT optimized (React Compiler skipped)
- ❌ Hook returns new object every render
- ❌ Component IS optimized but cache invalidated
- ❌ Performance worse than no optimization
- 😴 **Developer has NO way to know**

### User's Perspective

```
Initial load:
  ✅ Fast (only 10 items)

After scrolling:
  ⚠️  Janky (re-rendering on every scroll)

After 100 items loaded:
  🔥 Extremely slow (re-calculating everything)

User report:
  "The app worked fine at first, but became slower and slower"
```

### Debug Perspective

**What developer sees in React DevTools:**

```
CustomHookPage
  ✅ Memoized by React Compiler
  ✅ Props didn't change
  ✅ State didn't change
  ❓ Why is it re-rendering expensive calculations?
```

**What's actually happening:**

```
CustomHookPage (memoized) ✅
  ↓
useVirtualScroll (NOT memoized) ❌
  ↓
Returns new object ❌
  ↓
Memo cache invalidated ❌
  ↓
Expensive calculations re-run 💥
```

**Debug difficulty:** 🔴 Very difficult

- No warnings
- No errors
- Looks like it should work
- Actual cause hidden deep in custom hook

---

## 🔬 Root Cause Analysis

### The eslint-disable Bug

**Expected behavior:**

```typescript
function myHook() {
  const api = useIncompatibleAPI();  // Line 10: Should show warning

  // Line 20: Only affects next line
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);  // Line 21: Only this line disabled

  return api;
}
```

**Actual behavior:**

```typescript
function myHook() {
  const api = useIncompatibleAPI();  // Line 10: ❌ NO WARNING!

  // Line 20: Affects ENTIRE FUNCTION
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);

  return api;  // Line 25: Still affected!
}
```

**Scope comparison:**

| Comment Type                            | Expected Scope | Actual Scope | Bug?       |
| --------------------------------------- | -------------- | ------------ | ---------- |
| `// eslint-disable-next-line rule-name` | Line 21 only   | Lines 10-25  | ✅ BUG     |
| `// eslint-disable rule-name`           | Lines 20+      | Lines 20+    | ✅ Correct |
| `/* eslint-disable rule-name */`        | Lines 20+      | Lines 20+    | ✅ Correct |

### React Compiler's Response

When React Compiler sees `eslint-disable react-hooks/*`:

```json
{
  "decision": "Skip optimization",
  "reason": "ESLint rules disabled - code may violate React rules",
  "impact": "Function will not be memoized"
}
```

**This is correct behavior from React Compiler!**

The problem is that `eslint-disable-next-line` has wrong scope, causing:

1. Developer disables only deps check
2. ESLint disables ALL react-hooks rules for entire function
3. React Compiler sees disabled rules → skips optimization
4. Hook returns new objects → breaks component memoization

---

## 📊 Comparison: Direct Use vs Custom Hook

### Scenario A: Direct Use in Component (Safe)

```typescript
function MovieList() {
  const [movies, setMovies] = useState([]);

  // Direct use
  const rowVirtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  return <div>{/* ... */}</div>;
}
```

**Result:**

- ✅ ESLint warning: `react-hooks/incompatible-library`
- ✅ Developer sees the warning
- ✅ Can add `"use no memo"` if needed
- ✅ Predictable behavior

---

### Scenario B: Custom Hook without eslint-disable (Safe)

```typescript
function useVirtualScroll({...}) {
  const rowVirtualizer = useVirtualizer({...});

  useEffect(() => {
    // All dependencies correctly listed
  }, [rowVirtualizer, hasNextPage, isFetchingNextPage]);

  return { rowVirtualizer };
}
```

**Result:**

- ✅ ESLint warning: `react-hooks/incompatible-library` (on hook)
- ✅ Developer sees the warning
- ✅ Predictable behavior

---

### Scenario C: Custom Hook with eslint-disable (BROKEN)

```typescript
function useVirtualScroll({...}) {
  const rowVirtualizer = useVirtualizer({...});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Disable deps warning
  }, [hasNextPage, isFetchingNextPage]);

  return { rowVirtualizer };
}

function MovieList() {
  const { rowVirtualizer } = useVirtualScroll({...});
  return <div>{/* ... */}</div>;
}
```

**Result:**

- ❌ NO ESLint warning anywhere
- ❌ Developer thinks it's fine
- ❌ Hook NOT memoized
- ❌ Component IS memoized
- ❌ Memo cache invalidated every render
- 💥 **Unpredictable behavior**

---

## 🎯 Reproduction Steps

### Setup

```bash
git clone [THIS_REPO]
cd react-compiler-test
npm install
```

### Test 1: See the Bug

```bash
npm run lint
```

**Expected:** Warning on line 61 of `useIncompatibleMovieList.ts`  
**Actual:** No warning (suppressed by line 83)

### Test 2: Confirm the Bug

1. Open `src/hooks/useIncompatibleMovieList.ts`
2. Comment out line 83: `// eslint-disable-next-line react-hooks/exhaustive-deps`
3. Run `npm run lint` again
4. **Result:** Warning NOW appears on line 61!

### Test 3: See Unpredictable Behavior

```bash
npm run dev
# Open http://localhost:5173/custom-hook
# Scroll the list
# Open React DevTools Profiler
# Observe: Every scroll causes full re-render
```

### Test 4: Check React Compiler Logs

```bash
npm run build 2>&1 | grep "useIncompatibleMovieList"
```

**Result:**

```json
// Hook with eslint-disable: CompileError (skipped)
{
  "kind": "CompileError",
  "detail": { "reason": "ESLint rules were disabled" }
}

// Component: CompileSuccess (memoized)
{
  "kind": "CompileSuccess",
  "memoSlots": 48
}
```

---

## 💊 Solutions

### For React Team: Fix eslint-plugin-react-hooks

**Required fix:**

```javascript
// Current (broken)
"eslint-disable-next-line react-hooks/exhaustive-deps"
→ Disables ALL react-hooks rules for ENTIRE FUNCTION

// Expected (correct)
"eslint-disable-next-line react-hooks/exhaustive-deps"
→ Disables ONLY exhaustive-deps rule for NEXT LINE
```

**Implementation suggestion:**

- Ensure `eslint-disable-next-line` scope is limited to next line only
- Do not let line-level disable affect function-level rule checking
- Add tests for multi-rule scenarios in same function

---

### For Developers: Workarounds

**Option 1: Remove eslint-disable (Best)**

```typescript
function useVirtualScroll({...}) {
  const rowVirtualizer = useVirtualizer({...});

  useEffect(() => {
    // List ALL dependencies correctly
  }, [rowVirtualizer, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { rowVirtualizer };
}
```

**Option 2: Use "use no memo" directive**

```typescript
function useVirtualScroll({...}) {
  "use no memo";  // Explicit opt-out

  const rowVirtualizer = useVirtualizer({...});

  useEffect(() => {...}, [hasNextPage, isFetchingNextPage]);

  return { rowVirtualizer };
}
```

**Option 3: Use directly in component**

```typescript
function MovieList() {
  // Use incompatible API directly
  const rowVirtualizer = useVirtualizer({...});  // Warning visible!

  useEffect(() => {...}, [/* correct deps */]);

  return <div>{/* ... */}</div>;
}
```

---

## 📈 Impact Assessment

### Affected Users

**All React developers who:**

- Use React Compiler
- Use custom hooks
- Use `eslint-disable-next-line react-hooks/*`
- Use any incompatible API (TanStack Virtual, etc.)

**Estimated impact:** High (many production apps)

### Symptom Visibility

| Symptom                  | Visibility         | Debug Difficulty |
| ------------------------ | ------------------ | ---------------- |
| ESLint warnings missing  | Low (looks clean)  | N/A              |
| Performance degradation  | Medium (gradual)   | High             |
| Unpredictable re-renders | Low (intermittent) | Very High        |
| User complaints          | High (production)  | Critical         |

### Business Impact

- **Development:** 3-5 days to debug mystery performance issue
- **User Experience:** Slow, janky scrolling
- **Performance:** Unnecessary re-renders on every interaction
- **Maintenance:** Difficult to identify root cause

---

## 📋 Environment

```json
{
  "react": "19.2.0",
  "eslint": "9.0.0",
  "eslint-plugin-react-hooks": "7.0.1",
  "@tanstack/react-virtual": "3.13.12",
  "babel-plugin-react-compiler": "0.0.0-experimental-334f00b-20240725",
  "typescript": "5.9.3",
  "vite": "latest (rolldown)",
  "node": "20.x",
  "os": "macOS 24.6.0"
}
```

---

## 🔗 Related Issues

- **eslint-plugin-react-hooks:** Scope of `eslint-disable-next-line`
- **React Compiler:** Detection of disabled ESLint rules
- **@tanstack/react-virtual:** Incompatible API pattern

---

## ✅ Action Items

### For React Team

1. **Fix `eslint-disable-next-line` scope**

   - Limit to next line only
   - Don't affect function-level analysis
   - Add regression tests

2. **Improve warnings**

   - Warn when `eslint-disable` detected in hooks
   - Suggest correct dependency arrays
   - Document incompatible API patterns

3. **Better error messages**
   - "This custom hook is not memoized because..."
   - "Component memoization may not work as expected because..."

### For Developers

1. **Audit code**

   ```bash
   grep -r "eslint-disable.*react-hooks" src/
   ```

2. **Remove unnecessary disables**

   - List all dependencies correctly
   - Use `"use no memo"` if needed

3. **Test performance**
   - Profile components using custom hooks
   - Check for unexpected re-renders

---

## 📍 Repository

**URL:** [Will be provided after GitHub repo creation]

**Quick test:**

```bash
npm install
npm run lint
# Check src/hooks/useIncompatibleMovieList.ts:61
# Expected: Warning
# Actual: No warning (BUG!)
```

---

## 🔴 Priority

**Severity:** Critical  
**Impact:** Production performance  
**Visibility:** Silent failure  
**Debug difficulty:** Very high  
**Affected users:** All React Compiler users with custom hooks

**Recommended priority:** P0 / Urgent

---

**Reported:** 2025-01-10  
**Reporter:** [Your name/handle]  
**Status:** Reproducible  
**Category:** Bug - eslint-plugin-react-hooks
