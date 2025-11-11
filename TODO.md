# TODO - 다음 단계

## 🎯 해야 할 일

### 1. GitHub 저장소 생성 ✋

```bash
cd /Users/manwook-han/Desktop/upsight/react-compiler-test

git init
git add .
git commit -m "Bug reproduction: eslint-disable-next-line causes unpredictable behavior"

# GitHub에서 저장소 생성 후
git remote add origin [YOUR_GITHUB_REPO_URL]
git push -u origin main
```

### 2. React 팀에 이슈 제출 ✋

**URL:** https://github.com/facebook/react/issues/new

**제목:**
```
[eslint-plugin-react-hooks] eslint-disable-next-line affects entire function, causing unpredictable component behavior
```

**내용:**
- `BUG_REPORT.md` 전체 내용 복사
- GitHub 저장소 URL 추가
- 재현 방법 강조

**카테고리/Labels:**
- Component: ESLint Rules
- Type: Bug
- Priority: P0 / Critical

---

## ✅ 제출 전 체크리스트

- [ ] GitHub 저장소 생성
- [ ] 코드 최종 확인 (`npm run lint`)
- [ ] 버그 재현 테스트 (Line 83 주석 토글)
- [ ] BUG_REPORT.md 최종 검토
- [ ] README.md 최종 검토
- [ ] React 이슈 제출
- [ ] 저장소 URL을 이슈에 추가

---

## 📝 이슈 제출 요약

### 핵심 메시지

```
Problem:
  Custom hook NOT memoized (due to eslint-disable)
  +
  Component IS memoized (React Compiler)
  =
  Unpredictable behavior (memo cache invalidated every render)

Impact:
  - Silent failure (no warnings)
  - Performance degradation
  - Very difficult to debug

Severity: Critical
```

### 재현 방법

```bash
# 1. Clone repo
git clone [YOUR_REPO_URL]
cd react-compiler-test
npm install

# 2. See the bug
npm run lint
# Result: Line 61 - NO warning (BUG!)

# 3. Remove eslint-disable
# Comment out line 83 in src/hooks/useIncompatibleMovieList.ts

# 4. Run lint again
npm run lint
# Result: Line 61 - Warning appears! (Expected)
```

---

## 🎬 참고 사항

### 예상 질문들

**Q: 왜 이게 버그인가요?**
A: `eslint-disable-next-line`은 다음 줄만 영향을 주어야 하는데, 실제로는 전체 함수에 영향을 줍니다.

**Q: 어떤 영향이 있나요?**
A: 
1. 커스텀 훅이 메모라이즈되지 않음
2. 컴포넌트는 메모라이즈됨
3. 하지만 훅이 매번 새 객체를 반환
4. → 메모 캐시가 무효화됨
5. → 예측 불가능한 동작

**Q: 왜 심각한가요?**
A: 
- 경고가 없어서 개발자가 모름
- 디버깅이 매우 어려움
- 프로덕션 성능 저하
- 모든 React Compiler 사용자에게 영향

**Q: 해결 방법은?**
A: 
1. React 팀: eslint-disable-next-line 스코프 수정
2. 개발자: eslint-disable 사용 안 함 또는 "use no memo" 사용

---

## 📊 예상 타임라인

- **Day 1:** GitHub 저장소 생성, 이슈 제출
- **Day 2-3:** React 팀 확인
- **Week 1-2:** 논의 및 재현 확인
- **Week 2-4:** 수정 작업
- **Week 4-6:** 테스트 및 릴리스

---

**준비 완료!** 🚀

이제 GitHub 저장소를 만들고 React 팀에 이슈를 제출하면 됩니다.

