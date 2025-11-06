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

1. **API mocking 구현**
   - Playwright `route()`로 `/api/events` 엔드포인트를 intercept
   - 각 테스트마다 빈 상태로 시작하여 독립적인 테스트 환경 구성
   - GET/POST/PUT/DELETE 모두 mocking하여 완전한 CRUD 지원

2. **MUI Select 컴포넌트 처리**
   - `<div>`로 렌더링되는 MUI Select는 `toHaveValue()` 사용 불가
   - `textContent()`로 값 검증

3. **정확한 텍스트 매칭**
   - 부분 매칭으로 인한 strict mode violation 해결
   - `getByText(text, { exact: true })` 사용

4. **Strict mode violation 해결**
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

### API Mocking 예시

```typescript
// test-helpers.ts의 setup() 메서드
async setup() {
  let mockEvents: any[] = [];

  // GET /api/events
  await this.page.route('**/api/events', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ events: mockEvents }),
      });
    }
  });

  // POST /api/events
  // ... mockEvents에 추가

  await this.page.goto('http://localhost:5173');
  await this.navigation.clearAllStorage();
  await this.page.reload();
}
```

---

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Best Practices](https://playwright.dev/docs/best-practices)
- 프로젝트 명세: `.claude/docs/e2e-test-specification.md`
