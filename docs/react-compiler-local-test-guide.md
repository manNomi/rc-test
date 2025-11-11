# React Compiler 로컬 테스트 가이드

이 문서는 로컬에서 수정한 React Compiler를 현재 프로젝트에서 테스트하는 방법을 설명합니다.

## 📋 사전 준비

### 1. React Compiler 클론 및 빌드

```bash
# React Compiler 저장소 클론 (이미 완료된 경우 생략)
cd /Users/manwook-han/Desktop/upsight
git clone https://github.com/facebook/react.git
cd react

# Compiler 패키지로 이동
cd compiler/packages/babel-plugin-react-compiler

# 의존성 설치
yarn install

# 빌드
yarn build
```

### 2. 로컬 패키지 링크 생성

```bash
# React Compiler 디렉토리에서
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler

# yarn link 생성
yarn link
```

성공 시 출력:

```
success Registered "babel-plugin-react-compiler".
info You can now run `yarn link "babel-plugin-react-compiler"` in the projects where you want to use this package and it will be used instead.
```

### 3. 현재 프로젝트에 링크

```bash
# upsight-webview 프로젝트로 이동
cd /Users/manwook-han/Desktop/upsight/upsight-webview

# 로컬 React Compiler 링크
yarn link babel-plugin-react-compiler
```

성공 시 출력:

```
success Using linked package for "babel-plugin-react-compiler".
```

### 4. 링크 확인

```bash
# node_modules 확인
ls -la node_modules/babel-plugin-react-compiler

# 심볼릭 링크가 표시되어야 함:
# lrwxr-xr-x ... babel-plugin-react-compiler -> /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler
```

## 🧪 테스트 실행

### 방법 1: 개발 서버 (권장)

```bash
cd /Users/manwook-han/Desktop/upsight/upsight-webview

# 개발 서버 시작
yarn dev
```

브라우저에서 접속:

```
http://localhost:3000/ko/test-compiler
```

콘솔에서 React Compiler 경고/에러 확인:

```
⚠️ Warning: Compilation Skipped - incompatible library
Component TestCompilerComponent uses TanStack Virtual's useVirtualizer()
```

### 방법 2: 프로덕션 빌드

```bash
# 빌드 실행
yarn build

# 빌드 로그에서 에러/경고 확인
```

예상 출력:

```
⚠️ TestCompilerComponent.tsx: Compilation Skipped
⚠️ TestNoMemoComponent.tsx: Compilation Skipped (use no memo)
✅ TestNormalComponent.tsx: Compiled successfully
```

## 📝 테스트 케이스

### 1️⃣ 커스텀 훅에서 incompatible API 사용 (❌ 에러)

**파일**: `src/test-compiler/TestIncompatibleHook.tsx`

```tsx
export function useTestIncompatibleHook() {
  const virtualizer = useVirtualizer({...}); // ❌ 에러!
  return { virtualizer };
}
```

**예상 결과**:

- 컴파일 에러 발생
- "Incompatible API used in custom hook" 메시지
- 해결 방법 안내

**테스트 방법**:

```tsx
// index.tsx에서 주석 해제
import { useTestIncompatibleHook } from "./TestIncompatibleHook";
```

### 2️⃣ 컴포넌트에서 직접 incompatible API 사용 (⚠️ 경고)

**파일**: `src/test-compiler/TestCompilerComponent.tsx`

```tsx
export const TestCompilerComponent = () => {
  const virtualizer = useVirtualizer({...}); // ⚠️ 경고
  return <div>...</div>;
};
```

**예상 결과**:

- 경고 메시지 표시
- "Compilation Skipped" 메시지
- 코드는 정상 실행됨

**확인 방법**:

- 브라우저에서 `/ko/test-compiler` 접속
- Virtual scroll이 정상 작동하는지 확인

### 3️⃣ 정상적인 커스텀 훅 (✅ 정상)

**파일**: `src/test-compiler/TestNormalHook.tsx`

```tsx
export function useTestNormalHook() {
  const [count, setCount] = useState(0); // ✅ 정상
  return { count, setCount };
}
```

**예상 결과**:

- 에러/경고 없음
- React Compiler가 정상 최적화

### 4️⃣ "use no memo" 디렉티브 (✅ 정상)

**파일**: `src/test-compiler/TestNoMemoComponent.tsx`

```tsx
"use no memo";

export const TestNoMemoComponent = () => {
  const virtualizer = useVirtualizer({...}); // ✅ 정상
  return <div>...</div>;
};
```

**예상 결과**:

- 경고 없음
- React Compiler 최적화 비활성화
- Virtual scroll 정상 작동

## 🔄 실시간 개발 워크플로우

React Compiler 코드를 수정하면서 실시간으로 테스트하려면:

### Terminal 1: React Compiler Watch 모드

```bash
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler

# Watch 모드로 빌드
yarn build --watch
```

### Terminal 2: 프로젝트 개발 서버

```bash
cd /Users/manwook-han/Desktop/upsight/upsight-webview

# 개발 서버 시작
yarn dev
```

### 워크플로우

1. React Compiler 코드 수정
2. Watch 모드가 자동 빌드
3. 브라우저 자동 리로드
4. 테스트 페이지에서 즉시 확인

## 🐛 문제 해결

### "Module not found" 에러

```bash
# 링크 재설정
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler
yarn unlink
yarn link

cd /Users/manwook-han/Desktop/upsight/upsight-webview
yarn unlink babel-plugin-react-compiler
yarn link babel-plugin-react-compiler
```

### 변경사항이 반영 안 됨

```bash
# 1. React Compiler 다시 빌드
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler
yarn build

# 2. Vite 캐시 삭제
cd /Users/manwook-han/Desktop/upsight/upsight-webview
rm -rf node_modules/.vite
rm -rf .vite

# 3. 다시 시작
yarn dev
```

### TypeScript 에러

```bash
# 타입 체크
cd /Users/manwook-han/Desktop/upsight/upsight-webview
yarn tsc --noEmit
```

### 링크 해제

```bash
# upsight-webview에서 링크 해제
cd /Users/manwook-han/Desktop/upsight/upsight-webview
yarn unlink babel-plugin-react-compiler

# npm 레지스트리 버전으로 복구
yarn install --force
```

## ✅ 테스트 체크리스트

### 빌드 테스트

- [ ] `yarn build` 성공
- [ ] 빌드 로그에 React Compiler 경고 표시
- [ ] dist 폴더 생성 확인

### 런타임 테스트

- [ ] `/ko/test-compiler` 페이지 접속
- [ ] TestCompilerComponent 렌더링 확인
- [ ] Virtual scroll 정상 작동 확인
- [ ] TestNormalComponent 정상 작동 확인
- [ ] TestNoMemoComponent 정상 작동 확인

### 에러/경고 테스트

- [ ] TestIncompatibleHook import 시 컴파일 에러
- [ ] TestCompilerComponent에서 경고 표시
- [ ] TestNoMemoComponent에서 경고 없음

### 성능 테스트

- [ ] 빌드 시간 체크
- [ ] 번들 크기 확인
- [ ] 런타임 성능 확인 (React DevTools Profiler)

## 📊 디버깅 팁

### React Compiler 디버그 로그 추가

React Compiler 코드에 로그 추가:

```typescript
// babel-plugin-react-compiler/src/index.ts
export function transform(code: string, options: Options) {
  console.log("[React Compiler] Processing:", options.filename);

  if (isIncompatibleAPI) {
    console.log("[React Compiler] ⚠️ Incompatible API detected:", apiName);
  }

  // ...
}
```

다시 빌드:

```bash
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler
yarn build
```

### Vite 빌드 로그 상세화

```bash
# 상세 로그와 함께 빌드
DEBUG=vite:* yarn build
```

### React DevTools Profiler

1. Chrome에서 React DevTools 설치
2. Profiler 탭 열기
3. 녹화 시작
4. 테스트 컴포넌트 인터랙션
5. 녹화 중지
6. 렌더링 성능 분석

## 🎯 다음 단계

1. **로컬 테스트 완료 후**:
   - React Compiler 저장소에 PR 생성
   - 테스트 결과 공유

2. **PR 머지 후**:
   - 링크 해제: `yarn unlink babel-plugin-react-compiler`
   - 공식 버전 설치: `yarn add -D babel-plugin-react-compiler@latest`

3. **프로덕션 배포 전**:
   - 전체 프로젝트 빌드 테스트
   - E2E 테스트 실행
   - 성능 벤치마크

## 📚 참고 자료

- [React Compiler 공식 문서](https://react.dev/learn/react-compiler)
- [TanStack Virtual 문서](https://tanstack.com/virtual/latest)
- [Vite 설정 가이드](https://vitejs.dev/guide/)
