# 왜 이게 치명적인 버그인가? 🔴

## 🎯 핵심 문제

```
커스텀 훅에 eslint-disable 사용 시:
1. ESLint 경고 안 뜸 ✓
2. React Compiler는 컴포넌트 메모라이즈 ✓
3. 하지만 useVirtualizer가 반환하는 객체는 매번 새 참조 ⚠️
4. → 메모 캐시가 무효화됨 ❌
5. → 컴포넌트가 예측 불가능하게 동작 💥
```

---

## 📊 단계별 분석

### 1단계: 커스텀 훅 작성 (문제 시작)

```typescript
// hooks/useVirtualScroll.ts
export function useVirtualScroll({ itemList, ... }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: itemList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // ... infinite scroll logic
  }, [hasNextPage, isFetchingNextPage]);

  return { parentRef, rowVirtualizer };  // ← 여기가 문제!
}
```

**문제점:**

- `useVirtualizer`는 매번 새로운 객체 반환
- 객체 안의 함수들도 매번 새로운 참조
- ESLint 경고는 `eslint-disable` 때문에 숨겨짐

---

### 2단계: 컴포넌트에서 사용 (개발자는 모름)

```typescript
function MovieList() {
  const [movies, setMovies] = useState([]);

  const { parentRef, rowVirtualizer } = useVirtualScroll({
    itemList: movies,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: () => {},
  });

  return (
    <div ref={parentRef}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div key={virtualRow.index}>{movies[virtualRow.index].title}</div>
      ))}
    </div>
  );
}
```

**개발자 입장:**

- ✅ ESLint 경고 없음 (clean!)
- ✅ TypeScript 에러 없음
- ✅ 빌드 성공
- ✅ 겉보기엔 정상 작동

**실제 상황:**

- ❌ `rowVirtualizer`는 매 렌더마다 새 객체
- ❌ React Compiler의 메모 캐시가 무효화됨
- ❌ 불필요한 재렌더링 발생

---

### 3단계: React Compiler의 메모라이즈 (역설적 상황)

```javascript
// React Compiler가 변환한 코드
function MovieList() {
  const $ = useMemoCache(20);  // ✅ 컴포넌트는 메모라이즈됨

  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = [];
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const [movies] = useState(t0);

  // 문제: rowVirtualizer는 매번 다른 객체!
  const { parentRef, rowVirtualizer } = useVirtualScroll({
    itemList: movies,
    // ...
  });

  // 메모 캐시 체크
  let t1;
  if ($[1] !== rowVirtualizer) {  // ← 매번 다름!
    t1 = rowVirtualizer.getVirtualItems().map(...);
    $[1] = rowVirtualizer;
    $[2] = t1;
  } else {
    t1 = $[2];  // ← 여기 도달 안 함!
  }

  return t1;
}
```

**결과:**

- 컴포넌트는 메모라이즈되었지만
- `rowVirtualizer` 참조가 매번 달라서
- 메모 캐시가 무효화됨
- → **메모라이즈가 사실상 무용지물**

---

## 💥 실제 영향

### 시나리오: 영화 목록 스크롤

```typescript
// 초기 렌더
render #1: rowVirtualizer = { scrollToIndex: fn1, getVirtualItems: fn2 }
           메모 캐시: $[1] = rowVirtualizer1

// 사용자가 스크롤 (state 변경 없음)
render #2: rowVirtualizer = { scrollToIndex: fn1', getVirtualItems: fn2' }
           $[1] !== rowVirtualizer2  // ← 참조가 다름!
           메모 캐시 무효화 → 전체 재계산

// 또 스크롤
render #3: rowVirtualizer = { scrollToIndex: fn1'', getVirtualItems: fn2'' }
           $[1] !== rowVirtualizer3  // ← 또 다름!
           메모 캐시 무효화 → 전체 재계산
```

**예상 동작:**

- movies 배열이 안 바뀌면 → 재계산 안 함

**실제 동작:**

- `rowVirtualizer` 참조가 바뀌면 → 매번 재계산
- state가 안 바뀌어도 → 재렌더링
- 스크롤할 때마다 → 불필요한 연산

---

## 🔍 왜 이게 예측 불가능한가?

### 경우 1: ESLint 경고가 있을 때 (정상)

```typescript
function Component() {
  const virtualizer = useVirtualizer({...});  // 🔴 ESLint 경고!
  // "Compilation Skipped: Use of incompatible library"

  return <div>...</div>;
}
```

**개발자 반응:**

1. 경고를 본다
2. 문제를 인식한다
3. `"use no memo"` 추가 또는 다른 방법 사용
4. 예측 가능한 동작

---

### 경우 2: 커스텀 훅 + eslint-disable (문제)

```typescript
// 커스텀 훅
function useCustom() {
  const virtualizer = useVirtualizer({...});  // 😴 경고 없음
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);
  return virtualizer;
}

// 컴포넌트
function Component() {
  const virtualizer = useCustom();  // 😴 여기도 경고 없음
  return <div>...</div>;
}
```

**개발자 반응:**

1. 경고가 없다 → 문제 없다고 생각
2. React Compiler가 컴포넌트를 메모라이즈 → 최적화됐다고 생각
3. 실제로는 메모 캐시가 계속 무효화됨 → 모름
4. **예측 불가능한 동작!**

---

## 📊 비교표

| 항목                    | 직접 사용 | 커스텀 훅 (eslint-disable) |
| ----------------------- | --------- | -------------------------- |
| **ESLint 경고**         | ✅ 표시됨 | ❌ 숨겨짐                  |
| **문제 인식**           | ✅ 가능   | ❌ 불가능                  |
| **Compiler 메모라이즈** | ❌ 스킵   | ✅ 작동 (하지만...)        |
| **메모 캐시 유효성**    | N/A       | ❌ 매번 무효화             |
| **예측 가능성**         | ✅ 높음   | ❌ 낮음                    |
| **디버깅**              | ✅ 쉬움   | ❌ 어려움                  |

---

## 🎭 역설적 상황

```
경고 있을 때 (안전):
  ESLint 경고 🔴
  → 컴파일러 스킵
  → 메모라이즈 안됨
  → 하지만 예측 가능!

경고 없을 때 (위험):
  ESLint 경고 없음 ✅
  → 컴파일러 메모라이즈 ✅
  → 하지만 캐시 무효화 ❌
  → 예측 불가능! 💥
```

**역설:**

- 경고가 있으면 → 안전 (문제를 알 수 있음)
- 경고가 없으면 → 위험 (문제를 모름)

---

## 💡 실제 사례

### 업사이트 웹뷰에서의 경험

```typescript
// 직접 사용 - 작동 (경고 뜸)
function ConstrSelect() {
  const raw = useVirtualizer({
    count: constructions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 10,
  });
  // 🔴 ESLint: "incompatible-library"
  // → 개발자가 인식
}

// 커스텀 훅 분리 - 작동 안함 (경고 안 뜸)
function ConstrSelect() {
  const { raw } = useVirtualScroll({
    itemList: constructions,
    // ...
  });
  // 😴 경고 없음
  // → 개발자는 모름
  // → 예측 불가능한 동작 발생
}
```

**사용자 피드백:**

> "useVirtualScroll을 직접 박으면 작동하고,  
> 커스텀 훅으로 분리하면 작동을 안하더라고"

**"작동한다" = ESLint 경고가 뜨고, 문제를 인지할 수 있다**  
**"작동 안한다" = 경고 없이 조용히 실패한다**

---

## 🔬 기술적 분석

### useVirtualizer의 내부 구조

```typescript
// @tanstack/react-virtual
export function useVirtualizer(options) {
  const [instance] = useState(() => new Virtualizer(options));

  // 매 렌더마다 실행
  instance.setOptions(options);

  // 반환값
  return {
    // 이 함수들은 매번 새로운 참조!
    scrollToIndex: (index) => instance.scrollToIndex(index),
    scrollToOffset: (offset) => instance.scrollToOffset(offset),
    getVirtualItems: () => instance.getVirtualItems(),
    getTotalSize: () => instance.getTotalSize(),
    // ... 더 많은 함수들
  };
}
```

**문제:**

- 객체는 매 렌더마다 새로 생성
- 안의 함수들도 매번 새 참조
- `instance`는 같아도 반환 객체는 다름
- → React.memo, useMemo, React Compiler 모두 무용지물

---

### React Compiler가 감지하는 이유

React Compiler는 이런 API를 "incompatible"로 분류:

```typescript
// Incompatible API 패턴
function someHook() {
  return {
    fn1: () => {...},  // 매번 새 함수
    fn2: () => {...},  // 매번 새 함수
  };
}
```

**이유:**

- 반환값이 매번 달라짐
- 메모라이즈가 불가능
- Stale UI 발생 가능

**React Compiler의 대응:**

- 이런 API 감지 → 메모라이즈 스킵
- ESLint에 경고 표시
- 개발자에게 알림

**하지만 eslint-disable 사용 시:**

- 경고 무시됨
- Compiler도 함수 전체 스킵
- 컴포넌트는 메모라이즈되지만
- 내부 로직은 매번 실행됨

---

## 🎯 결론

### 왜 치명적인가?

1. **Silent Failure**

   - 경고 없음
   - 빌드 성공
   - 겉보기엔 정상

2. **예측 불가능**

   - 컴포넌트는 메모라이즈됨
   - 하지만 캐시는 무효화됨
   - 언제 재렌더링될지 모름

3. **디버깅 어려움**

   - "왜 느리지?"
   - "왜 계속 렌더링되지?"
   - 원인 파악 불가

4. **광범위한 영향**
   - 모든 커스텀 훅에 적용
   - 모든 incompatible APIs
   - 팀 전체에 영향

### 실제 시나리오

```
Day 1: 개발자가 커스텀 훅 작성
       eslint-disable 추가 (deps 경고 무시하려고)
       ✅ ESLint clean
       ✅ 테스트 통과
       → PR 승인

Day 2: 다른 개발자가 해당 훅 사용
       😴 경고 없음
       😴 문제 인식 못함
       → 프로덕션 배포

Day 7: 사용자 불만
       "앱이 느려요"
       "스크롤이 버벅거려요"

Day 8: 디버깅 시작
       Performance profiling
       React DevTools
       → 원인 파악 어려움

Day 10: 결국 발견
        "아, eslint-disable 때문이었구나"
        → 3일 낭비
```

---

## 💊 해결 방법

### 1. eslint-disable 제거 (권장)

```typescript
export function useVirtualScroll({ itemList, ... }) {
  const rowVirtualizer = useVirtualizer({...});

  useEffect(() => {
    const items = rowVirtualizer.getVirtualItems();
    const lastItem = items[items.length - 1];

    if (lastItem && lastItem.index >= itemList.length - 1) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [
    itemList.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rowVirtualizer,  // ← 모든 의존성 명시
  ]);

  return { parentRef, rowVirtualizer };
}
```

---

### 2. "use no memo" 추가 (명시적)

```typescript
export function useVirtualScroll({ itemList, ... }) {
  "use no memo";  // ← React Compiler에게 명시적으로 알림

  const rowVirtualizer = useVirtualizer({...});

  useEffect(() => {
    // ... 로직
  }, [hasNextPage, isFetchingNextPage]);

  return { parentRef, rowVirtualizer };
}
```

---

### 3. 직접 사용 (가장 명확)

```typescript
function MovieList() {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  // 무한 스크롤 로직도 여기에
  useEffect(() => {
    const items = rowVirtualizer.getVirtualItems();
    // ...
  }, [movies.length, hasNextPage]);

  return (
    <div ref={parentRef}>
      {rowVirtualizer.getVirtualItems().map(...)}
    </div>
  );
}
```

**장점:**

- ✅ ESLint 경고 표시됨
- ✅ 문제를 즉시 인식
- ✅ 예측 가능한 동작

---

## 📝 요약

```
┌─────────────────────────────────────────────┐
│ 커스텀 훅 + eslint-disable                   │
│                                             │
│ 1. ESLint 경고 숨김 😴                       │
│ 2. 개발자는 모름 😴                          │
│ 3. 컴포넌트 메모라이즈 ✅ (겉보기)           │
│ 4. 하지만 캐시 무효화 ❌ (실제)              │
│ 5. 예측 불가능한 동작 💥                     │
│ 6. 디버깅 어려움 🔥                          │
│                                             │
│ → 🔴 Critical Bug!                          │
└─────────────────────────────────────────────┘
```

**핵심 메시지:**

- eslint-disable는 경고만 숨김
- 실제 문제는 그대로
- 컴포넌트가 예측 불가능하게 동작
- Silent Failure → 치명적

---

**작성일:** 2025-01-10  
**중요도:** 🔴 Critical  
**영향:** 모든 React 개발자
