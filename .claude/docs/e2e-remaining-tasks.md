# E2E 테스트 남은 작업

## 현재 상태 (2025-11-06)

### 완료된 작업 ✅
1. E2E 테스트 인프라 구축
   - Playwright 설정
   - 공통 유틸리티 (test-data.ts, test-helpers.ts, selectors.ts, assertions.ts)
   - E2E 테스트 명세서 작성

2. 기본 일정 관리 워크플로우 테스트 작성
   - 13개 테스트 케이스 작성
   - **4개 테스트 통과** (일정 생성 2개, 목록 확인, 유효성 검증)

### 테스트 결과 요약
- ✅ 통과: 4 / 13
- ❌ 실패: 9 / 13

---

## 실패한 테스트 수정 필요 사항

### 1. 일정 클릭 시 폼 채우기 (4번, 5번, 6번 테스트)

**문제**: 일정을 클릭했을 때 폼에 데이터가 채워지지 않음

**원인**:
- `EventListHelper.clickEvent()` 메서드가 올바른 요소를 클릭하지 못함
- 실제 앱에서 일정 클릭 시 어떤 동작이 일어나는지 확인 필요

**해결 방법**:
```typescript
// e2e/fixtures/test-helpers.ts - EventListHelper.clickEvent() 수정 필요
async clickEvent(title: string) {
  // 실제 앱의 일정 아이템 선택자 확인 필요
  // 예: [data-event-item], .event-card 등
  const event = this.page.locator(`[data-testid="event-item"]:has-text("${title}")`);
  await event.click();
  await this.page.waitForTimeout(500); // 폼 업데이트 대기
}
```

---

### 2. 삭제 버튼 찾기 (7번, 8번 테스트)

**문제**: 삭제 버튼을 찾을 수 없음 (Timeout 10초)

**원인**:
- 실제 앱에서 삭제 버튼이 다른 텍스트를 사용하거나
- 수정 모드일 때만 삭제 버튼이 표시되는데 수정 모드로 전환되지 않음

**해결 방법**:
1. 실제 앱을 열어서 삭제 버튼 확인
2. data-testid 사용 권장:
```typescript
// src/components/event/EventForm.tsx
<Button data-testid="delete-event-button">삭제</Button>

// e2e/utils/selectors.ts
deleteButton: '[data-testid="delete-event-button"]',
```

---

### 3. 토스트 메시지 확인 (2번, 5번, 6번, 8번, 12번, 13번 테스트)

**문제**: "일정이 추가되었습니다" / "일정이 수정되었습니다" 메시지를 찾을 수 없음

**원인**:
- 실제 토스트 메시지 텍스트가 다름
- 토스트가 너무 빨리 사라짐
- 선택자가 잘못됨

**해결 방법**:
1. 실제 토스트 메시지 텍스트 확인:
```bash
# 앱 실행 후 일정 추가하고 개발자 도구로 토스트 확인
pnpm dev
```

2. notistack 라이브러리 사용 시:
```typescript
// e2e/utils/selectors.ts
export const TOAST_SELECTORS = {
  toast: '[role="alert"], .notistack-snackbar',
  eventCreated: 'text=/일정.*추가/',  // 정규식 사용
  eventUpdated: 'text=/일정.*수정/',
  eventDeleted: 'text=/일정.*삭제/',
}
```

---

### 4. 여러 일정 생성 시 일부만 표시 (11번, 12번, 13번 테스트)

**문제**: 여러 일정을 생성할 때 마지막 일정이 표시되지 않음

**원인**:
- 토스트 메시지 대기 실패로 인해 두 번째 일정 생성이 시작되지 않음
- 일정 생성 사이에 충분한 대기 시간 필요

**해결 방법**:
```typescript
// 테스트 수정
for (const event of events) {
  await helpers.eventForm.fillEventForm(event);
  await helpers.eventForm.submitEvent();

  // 토스트 메시지를 기다리지 말고 일정 목록에 표시될 때까지 대기
  await helpers.eventList.isEventVisible(event.title);
  await page.waitForTimeout(500); // 안정화 대기
}
```

---

### 5. 제목 없이 일정 생성 차단 (10번 테스트)

**문제**: 제목 없이도 일정이 생성됨

**원인**:
- 실제 앱에서 제목 필수 검증이 없을 수 있음
- HTML5 validation이 작동하지 않음

**해결 방법**:
1. 앱에 validation 추가:
```typescript
// src/components/event/EventForm.tsx
<TextField
  id="title"
  required  // HTML5 validation
  value={title}
  onChange={(e) => onTitleChange(e.target.value)}
/>
```

2. 테스트 수정 - 실제 동작에 맞추기:
```typescript
// 앱이 제목 없이도 일정을 생성한다면
test('제목 없이도 일정을 생성할 수 있다', async ({ page }) => {
  // ...
});
```

---

## 다음 단계

### 1. 실제 앱 동작 확인

```bash
# 1. 앱 실행
pnpm dev

# 2. UI 테스트로 확인
pnpm test:e2e:ui
# 또는
pnpm test:e2e:headed
```

개발자 도구를 열고:
- 일정 생성 시 토스트 메시지 확인
- 일정 클릭 시 어떤 요소를 클릭하는지 확인
- 삭제 버튼 위치 및 텍스트 확인

### 2. data-testid 추가 (추천)

실제 앱 컴포넌트에 data-testid 추가:

```typescript
// src/components/event/EventList.tsx
{events.map((event) => (
  <div key={event.id} data-testid="event-item" onClick={() => onEventClick(event)}>
    {event.title}
  </div>
))}

// src/components/event/EventForm.tsx
<Button data-testid="delete-event-button">삭제</Button>
<Button data-testid="event-submit-button">
  {isEditing ? '일정 수정' : '일정 추가'}
</Button>
```

### 3. 헬퍼 함수 개선

```typescript
// e2e/fixtures/test-helpers.ts

// 토스트 메시지를 optional로 변경
async createEvent(eventData: Partial<EventForm>, options?: {
  waitForToast?: boolean;
  waitForVisible?: boolean;  // 새 옵션
}) {
  await this.fillEventForm(eventData);
  await this.submitEvent();

  if (options?.waitForVisible !== false && eventData.title) {
    // 일정이 목록에 표시될 때까지 대기
    await this.page.waitForSelector(`text=${eventData.title}`, { timeout: 10000 });
  }
}
```

### 4. 스크린샷 확인

실패한 테스트의 스크린샷을 확인:
```bash
open test-results/
```

각 실패한 테스트의 폴더에서:
- `test-failed-1.png` - 실패 시점의 화면
- `video.webm` - 테스트 전체 영상
- `error-context.md` - 에러 상세 정보

---

## 다음 작업 순서

1. **현재 테스트 수정** (우선순위 높음)
   - [ ] 실제 앱 동작 확인
   - [ ] data-testid 추가
   - [ ] 헬퍼 함수 수정
   - [ ] 토스트 선택자 수정
   - [ ] 13개 테스트 모두 통과 확인

2. **나머지 테스트 작성**
   - [ ] 2. 반복 일정 관리 워크플로우
   - [ ] 3. 일정 겹침 처리
   - [ ] 4. 알림 시스템
   - [ ] 5. 검색 및 필터링
   - [ ] 6. 드래그 앤 드롭 (신규 기능)
   - [ ] 7. 날짜 클릭으로 일정 생성 (신규 기능)

3. **CI/CD 통합**
   - [ ] GitHub Actions workflow 설정
   - [ ] 테스트 실패 시 알림 설정

---

## 유용한 명령어

```bash
# 특정 테스트만 실행
pnpm test:e2e basic-event-workflow.spec.ts

# UI 모드로 디버깅
pnpm test:e2e:ui

# 헤드 모드로 실행 (브라우저 보면서)
pnpm test:e2e:headed

# 특정 테스트만 UI 모드로
pnpm test:e2e:ui basic-event-workflow.spec.ts -g "일정을 클릭하면"
```

---

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Best Practices](https://playwright.dev/docs/best-practices)
- 프로젝트 명세: `.claude/docs/e2e-test-specification.md`
