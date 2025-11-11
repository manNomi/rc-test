# React Compiler 테스트 시 발생하는 엣지 케이스

## 🐛 문제 상황

### 현재 발견된 엣지 케이스

#### 1. React Compiler 빌드 의존성 충돌

**증상:**

```bash
$ yarn compiler:setup
Error: Cannot find module '@tsconfig/strictest/tsconfig.json'
```

**원인:**

- React Compiler를 빌드할 때 현재 프로젝트(upsight-webview)의 `node_modules`를 참조
- React Compiler는 자체 의존성(`@tsconfig/strictest`)이 필요한데, 현재 프로젝트에는 없음
- `yarn build` 실행 시 현재 디렉토리 컨텍스트에서 의존성 해결 시도

**왜 이런 일이 발생하는가:**

```bash
# setup-compiler-link.sh에서
cd "$COMPILER_PATH"
yarn build  # ← 이 명령이 현재 프로젝트의 node_modules를 참조함!
```

#### 2. Symbolic Link와 Node Module Resolution

**증상:**

```bash
yarn link babel-plugin-react-compiler
# 심볼릭 링크 생성됨

yarn dev
# 하지만 React Compiler의 의존성이 현재 프로젝트와 충돌
```

**원인:**

- `yarn link`는 심볼릭 링크만 생성
- React Compiler가 필요로 하는 `peerDependencies`나 내부 의존성은 링크 안 됨
- 런타임에 모듈 해결 실패

---

## 🎯 해결책: 새 프로젝트에서 테스트

현재 프로젝트는 복잡한 의존성 트리를 가지고 있어서, **독립된 테스트 프로젝트**를 만드는 것이 안전합니다.

### 방법 1: Vite + React 최소 프로젝트 (권장)

```bash
# 1. 테스트 프로젝트 생성
cd /Users/manwook-han/Desktop/upsight
npm create vite@latest react-compiler-test -- --template react-ts

# 2. 프로젝트로 이동
cd react-compiler-test

# 3. 의존성 설치
npm install

# 4. TanStack Virtual 설치 (테스트용)
npm install @tanstack/react-virtual

# 5. React Compiler를 package.json에 직접 경로 지정
npm install --save-dev file:../react/compiler/packages/babel-plugin-react-compiler
```

**장점:**

- ✅ 깨끗한 의존성 트리
- ✅ React Compiler 의존성이 격리됨
- ✅ 빌드 문제 없음
- ✅ 빠른 테스트 가능

### 방법 2: 기존 프로젝트 복사본

```bash
# 1. 현재 프로젝트 복사
cd /Users/manwook-han/Desktop/upsight
cp -r upsight-webview upsight-webview-compiler-test

# 2. 복사본으로 이동
cd upsight-webview-compiler-test

# 3. node_modules 삭제 (깨끗한 상태)
rm -rf node_modules yarn.lock

# 4. React Compiler를 package.json에 추가
# (yarn link 대신 직접 경로 사용)
```

**`package.json` 수정:**

```json
{
  "devDependencies": {
    "babel-plugin-react-compiler": "file:../react/compiler/packages/babel-plugin-react-compiler"
    // ... 나머지 의존성
  }
}
```

```bash
# 5. 의존성 설치
yarn install

# 6. 개발 서버 시작
yarn dev
```

**장점:**

- ✅ 실제 프로덕션 환경과 유사
- ✅ 모든 기존 테스트 케이스 사용 가능
- ✅ React Compiler 의존성이 프로젝트에 포함됨

**단점:**

- ⚠️ 큰 프로젝트 복사
- ⚠️ 의존성 설치 시간이 김

### 방법 3: 독립 테스트 앱 생성 (가장 간단)

완전히 새로운 최소 프로젝트를 만들어서 테스트합니다.

#### 프로젝트 구조

```
react-compiler-test/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── TestIncompatibleHook.tsx
    ├── TestCompilerComponent.tsx
    └── TestNoMemoComponent.tsx
```

#### 단계별 가이드

**1단계: 프로젝트 생성**

```bash
cd /Users/manwook-han/Desktop/upsight
npm create vite@latest react-compiler-test -- --template react-ts
cd react-compiler-test
```

**2단계: 의존성 설치**

```bash
# 기본 의존성
npm install

# TanStack Virtual (테스트용)
npm install @tanstack/react-virtual

# React Compiler (로컬 경로)
npm install --save-dev file:../react/compiler/packages/babel-plugin-react-compiler
```

**3단계: Vite 설정**

`vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});
```

**4단계: 테스트 컴포넌트 복사**

기존 프로젝트에서 테스트 파일을 복사:

```bash
# upsight-webview의 테스트 파일을 새 프로젝트로 복사
cp ../upsight-webview/src/test-compiler/*.tsx ./src/
```

**5단계: App.tsx 수정**

```tsx
import { TestCompilerComponent } from "./TestCompilerComponent";
import { TestNoMemoComponent } from "./TestNoMemoComponent";

function App() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">React Compiler Test</h1>

      <div className="rounded border p-4">
        <h2 className="mb-2 text-xl">Test 1: Compiler Component</h2>
        <TestCompilerComponent />
      </div>

      <div className="rounded border p-4">
        <h2 className="mb-2 text-xl">Test 2: No Memo Component</h2>
        <TestNoMemoComponent />
      </div>
    </div>
  );
}

export default App;
```

**6단계: 실행**

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 📋 각 방법 비교

| 방법                         | 셋업 시간 | 의존성 충돌    | 실제 환경 유사도 | 추천도     |
| ---------------------------- | --------- | -------------- | ---------------- | ---------- |
| **방법 1: 새 Vite 프로젝트** | 5분       | ✅ 없음        | ⭐⭐             | ⭐⭐⭐⭐⭐ |
| **방법 2: 프로젝트 복사**    | 10분      | ⚠️ 가능성 있음 | ⭐⭐⭐⭐⭐       | ⭐⭐⭐     |
| **방법 3: 독립 테스트 앱**   | 3분       | ✅ 없음        | ⭐⭐⭐           | ⭐⭐⭐⭐⭐ |

---

## 🔧 엣지 케이스 해결 방법

### Case 1: React Compiler 빌드 실패

**문제:**

```bash
Error: Cannot find module '@tsconfig/strictest/tsconfig.json'
```

**해결:**

```bash
# React Compiler 디렉토리에서 의존성 설치
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler
yarn install  # 또는 npm install

# 빌드
yarn build
```

### Case 2: yarn link 후 모듈 해결 실패

**문제:**

```bash
Error: Cannot find module 'some-peer-dependency'
```

**해결 1: file: 프로토콜 사용 (권장)**

```json
{
  "devDependencies": {
    "babel-plugin-react-compiler": "file:../react/compiler/packages/babel-plugin-react-compiler"
  }
}
```

**해결 2: 링크 재설정**

```bash
# 링크 해제
yarn unlink babel-plugin-react-compiler

# React Compiler에서 다시 링크
cd /path/to/react/compiler/packages/babel-plugin-react-compiler
yarn link

# 프로젝트에서 링크
cd /path/to/project
yarn link babel-plugin-react-compiler
```

### Case 3: 변경사항이 반영 안 됨

**문제:**
React Compiler 코드를 수정했는데 프로젝트에 반영 안 됨

**해결:**

```bash
# 1. React Compiler 재빌드
cd /path/to/react/compiler/packages/babel-plugin-react-compiler
yarn build

# 2. 프로젝트 캐시 삭제
cd /path/to/project
rm -rf node_modules/.vite .vite

# 3. 개발 서버 재시작
npm run dev  # 또는 yarn dev
```

### Case 4: TypeScript 타입 에러

**문제:**

```
Cannot find type definition for 'babel-plugin-react-compiler'
```

**해결:**

```typescript
// vite-env.d.ts 또는 global.d.ts
declare module "babel-plugin-react-compiler" {
  const plugin: any;
  export default plugin;
}
```

---

## 🎯 권장 워크플로우 (새 프로젝트)

### 최종 권장 방법

```bash
# 1. 테스트 프로젝트 생성
cd /Users/manwook-han/Desktop/upsight
npm create vite@latest react-compiler-test -- --template react-ts
cd react-compiler-test

# 2. 의존성 설치
npm install
npm install @tanstack/react-virtual

# 3. React Compiler를 package.json에 추가
npm install --save-dev file:../react/compiler/packages/babel-plugin-react-compiler

# 4. vite.config.ts 설정
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
EOF

# 5. 테스트 컴포넌트 복사 (기존 프로젝트에서)
cp ../upsight-webview/src/test-compiler/TestCompilerComponent.tsx ./src/
cp ../upsight-webview/src/test-compiler/TestNoMemoComponent.tsx ./src/

# 6. 실행
npm run dev
```

### React Compiler 개발 워크플로우

```bash
# Terminal 1: React Compiler Watch
cd /Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler
npm run build -- --watch

# Terminal 2: 테스트 프로젝트 Dev Server
cd /Users/manwook-han/Desktop/upsight/react-compiler-test
npm run dev
```

### 변경사항 테스트

1. React Compiler 코드 수정
2. Watch 모드가 자동 빌드
3. 테스트 프로젝트 자동 리로드
4. 브라우저에서 확인

---

## 📝 체크리스트

### 새 프로젝트 셋업

- [ ] Vite 프로젝트 생성
- [ ] React Compiler를 `file:` 프로토콜로 설치
- [ ] `vite.config.ts`에 babel 플러그인 설정
- [ ] 테스트 컴포넌트 작성/복사
- [ ] `npm run dev` 실행
- [ ] 브라우저에서 동작 확인

### React Compiler 빌드

- [ ] React Compiler 저장소 클론
- [ ] `yarn install` (의존성 설치)
- [ ] `yarn build` (빌드)
- [ ] `dist` 폴더 생성 확인

### 테스트 실행

- [ ] 개발 서버 정상 시작
- [ ] 컴파일 경고/에러 확인
- [ ] Virtual Scroll 정상 작동
- [ ] "use no memo" 정상 작동

---

## 🚨 주의사항

### yarn link vs file: 프로토콜

**yarn link (기존 방법):**

```bash
yarn link babel-plugin-react-compiler
```

- ❌ 의존성 충돌 가능
- ❌ peerDependencies 문제
- ❌ 복잡한 디버깅

**file: 프로토콜 (권장):**

```json
{
  "devDependencies": {
    "babel-plugin-react-compiler": "file:../react/compiler/packages/babel-plugin-react-compiler"
  }
}
```

- ✅ 의존성 격리
- ✅ npm/yarn이 자동으로 의존성 해결
- ✅ 간단한 디버깅

### 경로 주의사항

절대 경로 사용 시:

```json
{
  "devDependencies": {
    "babel-plugin-react-compiler": "file:/Users/manwook-han/Desktop/upsight/react/compiler/packages/babel-plugin-react-compiler"
  }
}
```

상대 경로 사용 시:

```json
{
  "devDependencies": {
    "babel-plugin-react-compiler": "file:../react/compiler/packages/babel-plugin-react-compiler"
  }
}
```

---

## 결론

**현재 프로젝트 (upsight-webview)**:

- 복잡한 의존성 트리
- React Compiler 빌드 시 충돌 가능
- 기존 코드와의 호환성 테스트에 적합

**새 테스트 프로젝트 (권장)**:

- 깨끗한 환경
- React Compiler 개발/테스트에 최적
- 빠른 반복 개발 가능

**최종 권장:**

1. 새 Vite 프로젝트 생성
2. `file:` 프로토콜로 React Compiler 설치
3. 테스트 컴포넌트 작성
4. React Compiler 개발 후 실제 프로젝트에 적용
