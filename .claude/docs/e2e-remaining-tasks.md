# E2E 테스트 남은 작업

## 현재 상태 (2025-11-06)

### 완료된 작업 ✅

1. **E2E 테스트 인프라 구축**
   - Playwright 설정
   - 공통 유틸리티 (test-data.ts, test-helpers.ts, selectors.ts, assertions.ts)
   - E2E 테스트 명세서 작성

2. **기본 일정 관리 워크플로우 테스트** ✅ **완료!**
   - 13개 테스트 케이스 작성
   - **12개 테스트 통과** (1개 skip - 앱 validation 미구현)
   - API mocking으로 events.json 간섭 제거
   - Material-UI 컴포넌트 선택자 수정

### 테스트 결과
```
  12 passed (1.5m)
  1 skipped
```

### 해결한 주요 이슈

1. **실제 API 사용 (Integration Test)**
   - `TEST_ENV=e2e` 환경변수로 Express 서버가 `e2e.json` 사용
   - Playwright API mocking 대신 실제 API 호출
   - 더 현실적이고 유지보수하기 쉬운 테스트 환경
   - `e2e.json`을 `.gitignore`에 추가하여 테스트 데이터 격리

2. **E2E 전용 서버 설정**
   - `server:e2e`: `TEST_ENV=e2e node --watch server.js`
   - `dev:e2e`: Express + Vite 동시 실행
   - `playwright.config.ts`에서 `pnpm dev:e2e` 사용

3. **MUI Select 컴포넌트 처리**
   - `<div>`로 렌더링되는 MUI Select는 `toHaveValue()` 사용 불가
   - `textContent()`로 값 검증

4. **정확한 텍스트 매칭**
   - 부분 매칭으로 인한 strict mode violation 해결
   - `getByText(text, { exact: true })` 사용

5. **Strict mode violation 해결**
   - `getByRole('heading', { name: '일정 수정' })`으로 구체적인 요소 선택

---

## 다음 작업 순서

### 1. 기본 테스트 수정 ✅ **완료!**
- [x] API mocking으로 깨끗한 테스트 환경 구성
- [x] 헬퍼 함수 수정 (route interception)
- [x] 선택자 및 assertion 수정 (MUI 대응)
- [x] 12개 테스트 모두 통과 확인

### 2. 나머지 테스트 작성 (우선순위 높음)
- [ ] 반복 일정 관리 워크플로우 (recurring-events.spec.ts)
- [ ] 일정 겹침 처리 (event-conflicts.spec.ts)
- [ ] 알림 시스템 (notifications.spec.ts)
- [ ] 검색 및 필터링 (search-filtering.spec.ts)
- [ ] 드래그 앤 드롭 (drag-drop.spec.ts) - 신규 기능
- [ ] 날짜 클릭으로 일정 생성 (date-click-create.spec.ts) - 신규 기능

### 3. CI/CD 통합
- [ ] GitHub Actions workflow 설정
- [ ] 테스트 실패 시 알림 설정
- [ ] 테스트 결과 리포트 생성

---

## 유용한 명령어

```bash
# 전체 E2E 테스트 실행
pnpm test:e2e

# 특정 테스트 파일만 실행
pnpm test:e2e basic-event-workflow.spec.ts

# UI 모드로 디버깅
pnpm test:e2e:ui

# 헤드 모드로 실행 (브라우저 보면서)
pnpm test:e2e:headed

# 특정 테스트만 UI 모드로
pnpm test:e2e:ui basic-event-workflow.spec.ts

# 특정 테스트 케이스만 실행
pnpm test:e2e basic-event-workflow.spec.ts -g "일정을 클릭하면"
```

---

## 코드 구조

### E2E 테스트 파일 구조
```
e2e/
├── fixtures/
│   ├── test-data.ts           # Factory pattern, DateHelper
│   └── test-helpers.ts         # Page Object Model helpers
├── utils/
│   ├── selectors.ts            # 공통 선택자
│   └── assertions.ts           # 재사용 가능한 검증 로직
└── *.spec.ts                   # 테스트 파일들
```

### E2E 환경 설정 예시

**server.js - 환경변수로 DB 분리**
```javascript
const dbName = process.env.TEST_ENV === 'e2e' ? 'e2e.json' : 'realEvents.json';
```

**package.json - E2E 전용 스크립트**
```json
{
  "server:e2e": "TEST_ENV=e2e node --watch server.js",
  "dev:e2e": "concurrently \"pnpm run server:e2e\" \"pnpm run start\""
}
```

**playwright.config.ts - E2E 서버 사용**
```typescript
webServer: {
  command: 'pnpm dev:e2e',  // TEST_ENV=e2e로 실행
  url: 'http://localhost:5173',
}
```

**test-helpers.ts - 실제 API로 초기화**
```typescript
async setup() {
  await this.page.goto('http://localhost:5173');
  await this.navigation.clearAllStorage();

  // e2e.json 초기화: 모든 기존 일정 삭제
  const response = await this.page.request.get('http://localhost:3000/api/events');
  const data = await response.json();

  for (const event of data.events) {
    await this.page.request.delete(`http://localhost:3000/api/events/${event.id}`);
  }

  await this.page.reload();
}
```

---

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Best Practices](https://playwright.dev/docs/best-practices)
- 프로젝트 명세: `.claude/docs/e2e-test-specification.md`
