# Proposal: ESLint Rule to Detect React Compiler Interference

## 🎯 Problem Statement

Developers unknowingly use `eslint-disable` comments in custom hooks, which silently breaks React Compiler's warning system. They have no way to know their code is creating silent failures.

## 💡 Proposed Solution

Create a new ESLint rule that **warns developers when they use lint-disabling comments that interfere with React Compiler**.

---

## 📋 Rule Specification

### Rule Name
```
react-compiler/no-eslint-disable-in-hooks
```

or

```
react-hooks/warn-eslint-disable-compiler-impact
```

### What It Detects

Detect any lint-disabling comment in functions that:
1. Are custom hooks (name starts with `use`)
2. Use incompatible APIs (like `useVirtualizer`)
3. Have `eslint-disable` or `eslint-disable-next-line` for `react-hooks/*` rules

### Examples

#### ❌ Should Warn

```typescript
// Case 1: eslint-disable-next-line in hook with incompatible API
export function useVirtualScroll() {
  const virtualizer = useVirtualizer({...});
  
  // ⚠️ WARNING: This comment disables React Compiler analysis
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);
  
  return virtualizer;
}
```

**Warning Message:**
```
react-compiler/no-eslint-disable-in-hooks

Using 'eslint-disable-next-line react-hooks/exhaustive-deps' in a custom hook
prevents React Compiler from analyzing this hook and suppresses important warnings
like 'incompatible-library'.

This hook uses 'useVirtualizer' which requires the incompatible-library warning,
but it will be silently suppressed.

Suggested fixes:
1. Remove eslint-disable and list all dependencies
2. Add "use no memo" directive to explicitly opt-out of optimization
3. Use the incompatible API directly in the component
```

#### ❌ Should Warn (Various Patterns)

```typescript
// Case 2: eslint-disable (block comment)
export function useCustomHook() {
  const api = useIncompatibleAPI();
  
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {...}, []);
  /* eslint-enable react-hooks/exhaustive-deps */
  
  return api;
}

// Case 3: File-level disable
/* eslint-disable react-hooks/exhaustive-deps */
export function useMyHook() {
  const api = useIncompatibleAPI();
  return api;
}

// Case 4: Multiple disables
export function useAnotherHook() {
  const api = useIncompatibleAPI();
  
  // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps
  useEffect(() => {...}, []);
  
  return api;
}
```

#### ✅ Should NOT Warn

```typescript
// Case 1: No eslint-disable
export function useCleanHook() {
  const virtualizer = useVirtualizer({...});
  
  useEffect(() => {
    // All dependencies listed
  }, [virtualizer, dep1, dep2]);
  
  return virtualizer;
}

// Case 2: Explicit opt-out with "use no memo"
export function useOptedOut() {
  "use no memo";
  
  const virtualizer = useVirtualizer({...});
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []); // OK - already opted out
  
  return virtualizer;
}

// Case 3: Not a custom hook
function regularFunction() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // OK - not a hook
}

// Case 4: Component (not a hook)
export function MyComponent() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []); // OK - component, not hook
}
```

---

## 🔧 Rule Configuration

### Default Configuration

```json
{
  "rules": {
    "react-compiler/no-eslint-disable-in-hooks": "warn"
  }
}
```

### Options

```json
{
  "rules": {
    "react-compiler/no-eslint-disable-in-hooks": [
      "warn",
      {
        "checkIncompatibleAPIs": true,
        "incompatibleAPIs": [
          "useVirtualizer",
          "useInfiniteScroll",
          // ... user can add more
        ],
        "allowWithDirective": true, // Allow if "use no memo" is present
        "severity": "warn" // or "error"
      }
    ]
  }
}
```

---

## 📊 Detection Algorithm

### Step 1: Identify Custom Hooks

```javascript
function isCustomHook(node) {
  // Function name starts with "use" and is uppercase after
  return /^use[A-Z]/.test(node.id.name);
}
```

### Step 2: Check for Incompatible APIs

```javascript
function usesIncompatibleAPI(hookBody, incompatibleAPIs) {
  // Traverse AST to find calls to incompatible APIs
  const calls = findAllCallExpressions(hookBody);
  return calls.some(call => 
    incompatibleAPIs.includes(call.callee.name)
  );
}
```

### Step 3: Detect eslint-disable Comments

```javascript
function hasESLintDisable(node) {
  const comments = node.comments || [];
  return comments.some(comment => 
    /eslint-disable(-next-line)?.*react-hooks/.test(comment.value)
  );
}
```

### Step 4: Check for "use no memo" Directive

```javascript
function hasNoMemoDirective(node) {
  const firstStatement = node.body.body[0];
  return firstStatement?.type === 'ExpressionStatement' &&
         firstStatement.expression.value === 'use no memo';
}
```

### Step 5: Report Warning

```javascript
function checkHook(context, node) {
  if (!isCustomHook(node)) return;
  
  const hasNoMemo = hasNoMemoDirective(node);
  if (hasNoMemo) return; // Explicitly opted out - OK
  
  const usesIncompatible = usesIncompatibleAPI(node.body);
  const hasDisable = hasESLintDisable(node);
  
  if (usesIncompatible && hasDisable) {
    context.report({
      node,
      message: 'eslint-disable in custom hook suppresses React Compiler warnings',
      suggest: [
        {
          desc: 'Remove eslint-disable and list all dependencies',
          fix: (fixer) => removeESLintDisable(fixer, node)
        },
        {
          desc: 'Add "use no memo" directive',
          fix: (fixer) => addNoMemoDirective(fixer, node)
        }
      ]
    });
  }
}
```

---

## 💬 Warning Message Format

### Detailed Warning Message

```
Warning: react-compiler/no-eslint-disable-in-hooks

This custom hook uses 'eslint-disable' which prevents React Compiler from
properly analyzing the hook and suppresses critical warnings.

Hook: useVirtualScroll (line 66)
Incompatible API detected: useVirtualizer (line 78)
eslint-disable found: line 100

⚠️ IMPACT:
- React Compiler will skip analyzing this hook
- 'incompatible-library' warning will be silently suppressed
- Hook will return unstable references
- Components using this hook may have broken memoization

💡 SUGGESTED FIXES:

1. Remove eslint-disable and list all dependencies:
   useEffect(() => {...}, [virtualizer, dep1, dep2]);

2. Add "use no memo" directive at the top of the function:
   export function useVirtualScroll() {
     "use no memo";
     // ... rest of code
   }

3. Use the incompatible API directly in components instead of wrapping in a hook

📚 Learn more: https://react.dev/learn/react-compiler#incompatible-libraries
```

---

## 🎨 IDE Integration

### VSCode Integration

```json
// settings.json
{
  "eslint.rules.customizations": [
    {
      "rule": "react-compiler/no-eslint-disable-in-hooks",
      "severity": "warn"
    }
  ]
}
```

### Visual Feedback

```typescript
export function useVirtualScroll() {
  const virtualizer = useVirtualizer({...});
  //                   ~~~~~~~~~~~~~ ⚠️ Incompatible API detected
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ⚠️ This disables React Compiler warnings
  useEffect(() => {...}, []);
  
  return virtualizer;
}
```

---

## 📈 Expected Benefits

### For Developers

1. ✅ **Immediate Feedback**: Know right away when eslint-disable affects React Compiler
2. ✅ **Clear Guidance**: Suggested fixes help resolve the issue
3. ✅ **Prevent Silent Failures**: Catch issues before they reach production
4. ✅ **Learn Best Practices**: Understand why and how to fix

### For Teams

1. ✅ **Code Review**: Catch these issues in PR reviews
2. ✅ **CI/CD Integration**: Block problematic patterns in CI
3. ✅ **Consistent Patterns**: Enforce best practices across codebase
4. ✅ **Reduce Debugging Time**: Prevent days of investigation

### For React Ecosystem

1. ✅ **Better Developer Experience**: Reduce frustration with React Compiler
2. ✅ **Safer Adoption**: Make React Compiler adoption less error-prone
3. ✅ **Community Education**: Spread awareness of this issue
4. ✅ **Fewer Bug Reports**: Reduce "why doesn't this work?" issues

---

## 🚀 Implementation Plan

### Phase 1: Core Rule (Week 1-2)

- [ ] Create basic ESLint rule structure
- [ ] Implement custom hook detection
- [ ] Implement eslint-disable detection
- [ ] Write basic tests

### Phase 2: Incompatible API Detection (Week 3-4)

- [ ] Implement AST traversal for API calls
- [ ] Add common incompatible APIs list
- [ ] Allow user configuration for custom APIs
- [ ] Add tests for various API patterns

### Phase 3: Smart Suggestions (Week 5-6)

- [ ] Implement auto-fix suggestions
- [ ] Add "use no memo" directive insertion
- [ ] Add dependency array completion
- [ ] Test auto-fix functionality

### Phase 4: Documentation & Release (Week 7-8)

- [ ] Write comprehensive documentation
- [ ] Create example repository
- [ ] Add to eslint-plugin-react-hooks or create separate plugin
- [ ] Publish to npm

---

## 📦 Package Structure

### Option 1: Add to eslint-plugin-react-hooks

```
eslint-plugin-react-hooks/
├── lib/
│   ├── rules/
│   │   ├── exhaustive-deps.js
│   │   ├── rules-of-hooks.js
│   │   └── no-eslint-disable-in-hooks.js  ← NEW
│   └── index.js
```

### Option 2: Create Separate Plugin

```
eslint-plugin-react-compiler/
├── lib/
│   ├── rules/
│   │   ├── no-eslint-disable-in-hooks.js
│   │   ├── warn-incompatible-api.js
│   │   └── enforce-no-memo-directive.js
│   └── index.js
├── docs/
│   └── rules/
│       └── no-eslint-disable-in-hooks.md
├── tests/
├── package.json
└── README.md
```

---

## 🤔 Alternative Approaches

### Approach 1: Babel Plugin

Instead of ESLint rule, create a Babel plugin that warns during compilation:

**Pros:**
- Can analyze more deeply
- Access to full type information

**Cons:**
- Runs later in the process (after developer writes code)
- Less immediate feedback

### Approach 2: TypeScript Plugin

Create a TypeScript language service plugin:

**Pros:**
- Real-time feedback in IDE
- Can use type information

**Cons:**
- TypeScript-only
- More complex implementation

### Approach 3: React Compiler Plugin

Modify React Compiler itself to emit better warnings:

**Pros:**
- Most accurate
- No additional setup needed

**Cons:**
- Requires changes to React Compiler
- Slower to implement

**Recommended:** Start with ESLint rule (fastest to implement, works for everyone)

---

## 🎯 Success Metrics

### Adoption Metrics

- NPM downloads per week
- GitHub stars
- Community feedback

### Impact Metrics

- Reduction in related GitHub issues
- Positive developer testimonials
- Adoption by major projects

### Quality Metrics

- Test coverage > 90%
- Zero false positives in testing
- < 1% false negative rate

---

## 📚 Related Work

### Existing Tools

1. **eslint-plugin-react-hooks**: Existing plugin we can extend
2. **@typescript-eslint/eslint-plugin**: Similar pattern detection
3. **eslint-plugin-react-compiler**: If it exists, we can contribute

### Similar Rules

1. `react-hooks/exhaustive-deps`: Checks dependency arrays
2. `react-hooks/rules-of-hooks`: Checks hook usage rules
3. Our rule: Checks eslint-disable impact on React Compiler

---

## 💬 Community Feedback Request

### Questions for Discussion

1. Should this be part of `eslint-plugin-react-hooks` or a separate plugin?
2. Should it be `warn` or `error` by default?
3. What other incompatible APIs should be detected?
4. Should we auto-fix or just suggest?

### Where to Discuss

- React GitHub Discussions
- React Compiler RFC
- ESLint Community
- Twitter/X React community

---

## ✅ Call to Action

### For React Team

- Review this proposal
- Provide feedback on approach
- Help identify all patterns that need detection

### For Community

- Try the rule when implemented
- Report false positives/negatives
- Contribute to incompatible APIs list
- Spread the word

---

**Author**: Based on real-world production issues  
**Date**: 2025-11-11  
**Status**: Proposal  
**Priority**: High - Affects developer experience and production stability

