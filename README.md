# React Compiler & ESLint Bug Reproduction

**발견한 버그:** `eslint-disable-next-line react-hooks/exhaustive-deps` 사용 시 전체 함수의 모든 react-hooks 규칙이 무시됨

---

## 🚀 Quick Start

```bash
npm install
npm run dev    # http://localhost:5173
npm run lint   # 버그 확인
```

---

## 🐛 Bug Reproduction

### 1. 린트 실행
```bash
npm run lint
```

### 2. 결과 확인

**File:** `src/hooks/useIncompatibleMovieList.ts`

| Line | Has eslint-disable | ESLint Warning | Expected |
|------|-------------------|----------------|----------|
| 13   | ❌ No             | ✅ Shows       | ✅ Correct |
| 61   | ✅ Yes (line 83)  | ❌ Hidden      | ❌ Bug! |

### 3. 버그 재현
- Line 83의 `eslint-disable-next-line` 주석 제거
- `npm run lint` 재실행
- → Line 61에 경고 표시됨 (정상)

---

## 💥 Why This Matters

```typescript
// 커스텀 훅
function useCustomHook() {
  const api = useVirtualizer({...});  // 😴 경고 없음!
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);  // ← 이것 때문에
  
  return api;
}

// 컴포넌트
function Component() {
  const $ = useMemoCache(10);  // ✅ 메모라이즈됨
  const api = useCustomHook();  // ❌ 매번 새 객체
  
  // 메모 캐시가 매번 무효화됨
  if ($[1] !== api) {  // ← 항상 true!
    // 매번 재계산 💥
  }
}
```

**결과:**
- ESLint 경고 없음 → 개발자는 모름
- 컴포넌트는 메모라이즈됨 → 겉보기엔 OK
- 하지만 내부 객체는 매번 새 참조 → 실제론 NG
- **→ 예측 불가능한 동작**

---

## 📋 What to Do

### 상세 버그 리포트
**[BUG_REPORT.md](./BUG_REPORT.md)** - React 팀에 제출할 이슈 리포트

### 이슈 제출
1. GitHub 저장소 생성 (이 프로젝트)
2. React 이슈 제출: https://github.com/facebook/react/issues
3. BUG_REPORT.md 내용 복사
4. 저장소 URL 포함

### 해결 방법 (임시)

**1. eslint-disable 제거 (권장)**
```typescript
function useHook() {
  const api = useAPI();
  useEffect(() => {
    // ...
  }, [api, dep1, dep2]);  // 모든 의존성 명시
}
```

**2. "use no memo" 사용**
```typescript
function useHook() {
  "use no memo";
  const api = useAPI();
  useEffect(() => {...}, []);
  return api;
}
```

**3. 직접 사용**
```typescript
function Component() {
  const api = useAPI();  // ✅ 경고 표시됨
  // ...
}
```

---

## 📂 Key Files

```
src/
├── hooks/
│   ├── useIncompatibleMovieList.ts  # 버그 재현 (line 61, 83)
│   └── edgeCaseTests.ts             # 15개 테스트 케이스
├── pages/
│   ├── CustomHookPage.tsx           # 데모 페이지
│   ├── IncompatiblePage.tsx         # 직접 사용 예시
│   └── ...
└── api/
    └── mockApi.ts                   # Mock 데이터
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

**이슈 제출:** https://github.com/facebook/react/issues  
**카테고리:** Bug Report - eslint-plugin-react-hooks

---

**Last Updated:** 2025-01-10
