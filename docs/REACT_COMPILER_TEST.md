# React Compiler 테스트

## 🚨 중요: 의존성 충돌 문제

현재 프로젝트(upsight-webview)는 복잡한 의존성 트리를 가지고 있어서,
React Compiler 빌드 시 의존성 충돌이 발생할 수 있습니다.

**권장 해결책: 새 테스트 프로젝트 생성**

```bash
# 자동으로 깨끗한 테스트 프로젝트 생성
yarn compiler:create-test
```

자세한 내용은 [엣지 케이스 문서](docs/react-compiler-edge-cases.md)를 참고하세요.

---

## 🎯 목적

로컬에서 수정한 React Compiler를 실제 프로젝트에서 테스트합니다.

## 🚀 빠른 시작

### 1. 자동 셋업 (권장)

```bash
# 한 번에 모든 셋업 실행
yarn compiler:setup
```

이 스크립트는 다음을 수행합니다:

- React Compiler 빌드
- yarn link 생성
- 프로젝트에 링크
- 링크 확인

### 2. 개발 서버 시작

```bash
yarn dev
```

### 3. 테스트 페이지 접속

브라우저에서:

```
http://localhost:3000/ko/test-compiler
```

## 📝 테스트 케이스

### ❌ 케이스 1: 커스텀 훅에서 incompatible API

**파일**: `src/test-compiler/TestIncompatibleHook.tsx`

현재 주석 처리되어 있습니다. 주석을 해제하면 컴파일 에러 발생:

```tsx
// src/test-compiler/index.tsx
import { useTestIncompatibleHook } from "./TestIncompatibleHook"; // 주석 해제

// 결과: ❌ 컴파일 에러
// Error: Incompatible API used in custom hook
```

### ⚠️ 케이스 2: 컴포넌트에서 직접 사용

**파일**: `src/test-compiler/TestCompilerComponent.tsx`

경고는 표시되지만 정상 작동:

```tsx
const virtualizer = useVirtualizer({...}); // ⚠️ 경고
```

테스트 페이지에서 Virtual Scroll이 정상 작동하는지 확인하세요.

### ✅ 케이스 3: 정상적인 코드

**파일**: `src/test-compiler/TestNormalComponent.tsx`

에러/경고 없이 React Compiler가 최적화:

```tsx
const [count, setCount] = useState(0); // ✅ 정상
```

### ✅ 케이스 4: "use no memo" 디렉티브

**파일**: `src/test-compiler/TestNoMemoComponent.tsx`

"use no memo"로 최적화 비활성화:

```tsx
"use no memo";
const virtualizer = useVirtualizer({...}); // ✅ 경고 없음
```

## 🔄 실시간 개발

React Compiler를 수정하면서 실시간으로 테스트:

### Terminal 1: Compiler Watch

```bash
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler
yarn build --watch
```

### Terminal 2: Dev Server

```bash
cd /Users/manwook-han/Desktop/upsight/upsight-webview
yarn dev
```

### 워크플로우

1. React Compiler 코드 수정
2. Watch 모드가 자동 빌드
3. 브라우저 자동 리로드
4. `/ko/test-compiler`에서 즉시 확인

## 🛠️ 유용한 명령어

```bash
# 셋업
yarn compiler:setup          # React Compiler 링크 셋업

# 확인
yarn compiler:check          # 링크 상태 확인

# 해제
yarn compiler:unlink         # 링크 해제 및 공식 버전 복구

# 개발
yarn dev                     # 개발 서버
yarn build                   # 프로덕션 빌드
yarn test                    # 테스트 실행
```

## 🐛 문제 해결

### 링크가 안 됨

```bash
# 링크 재설정
yarn compiler:setup
```

### 변경사항이 반영 안 됨

```bash
# Vite 캐시 삭제
rm -rf node_modules/.vite .vite

# React Compiler 재빌드
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler
yarn build

# 개발 서버 재시작
cd /Users/manwook-han/Desktop/upsight/upsight-webview
yarn dev
```

### 링크 확인

```bash
yarn compiler:check
```

출력 예시:

```
lrwxr-xr-x ... babel-plugin-react-compiler -> /Users/.../babel-plugin-react-compiler
```

## 📚 상세 가이드

더 자세한 내용은 다음 문서를 참고하세요:

- **셋업 가이드**: `docs/react-compiler-local-test-guide.md`
- **충돌 문제**: `docs/react-compiler-tanstack-virtual-conflict.md`
- **Console.log 미스터리**: `docs/react-compiler-console-log-mystery.md`
- **초기화 문제**: `docs/react-compiler-virtual-scroll-initialization.md`

## ✅ 테스트 체크리스트

### 빌드

- [ ] `yarn build` 성공
- [ ] 빌드 로그에 경고 표시 확인
- [ ] dist 폴더 생성 확인

### 런타임

- [ ] `/ko/test-compiler` 접속
- [ ] TestCompilerComponent 렌더링
- [ ] Virtual Scroll 작동
- [ ] TestNormalComponent 작동
- [ ] TestNoMemoComponent 작동

### 에러/경고

- [ ] TestIncompatibleHook import 시 에러
- [ ] TestCompilerComponent 경고
- [ ] TestNoMemoComponent 경고 없음

## 🎯 다음 단계

1. **테스트 완료 후**:
   - React Compiler 저장소에 PR 생성
   - 테스트 결과 공유

2. **PR 머지 후**:
   - `yarn compiler:unlink`
   - `yarn add -D babel-plugin-react-compiler@latest`

3. **배포 전**:
   - 전체 빌드 테스트
   - E2E 테스트
   - 성능 벤치마크
