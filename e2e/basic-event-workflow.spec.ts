import { test, expect } from '@playwright/test';

import { EventFormFactory, DateHelper, InvalidData } from './fixtures/test-data';
import { createHelpers } from './fixtures/test-helpers';
import { createAssertions } from './utils/assertions';

/**
 * 기본 일정 관리 워크플로우 E2E 테스트
 *
 * @description
 * 실제 사용자가 일정을 생성, 조회, 수정, 삭제하는 전체 플로우를 검증합니다.
 * - Create: 일정 생성
 * - Read: 일정 조회
 * - Update: 일정 수정
 * - Delete: 일정 삭제
 * - Validation: 유효성 검증
 */
test.describe('기본 일정 관리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.setup();
  });

  test.afterEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.teardown();
  });

  /**
   * 1. 일정 생성 (Create)
   */
  test('사용자가 모든 필드를 입력하여 새로운 일정을 생성할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 일정 데이터 준비
    const eventData = EventFormFactory.create({
      title: '팀 회의',
      date: DateHelper.today(),
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
    });

    // When: 일정 폼에 데이터 입력 후 제출
    await helpers.eventForm.fillEventForm(eventData);
    await helpers.eventForm.submitEvent();

    // Then: 성공 메시지 표시 및 일정 목록에 추가
    await assert.toast.expectEventCreated();
    await assert.eventList.expectEventVisible('팀 회의');
  });

  test('사용자가 필수 필드만 입력하여 일정을 생성할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 최소한의 필드만 있는 일정 데이터
    const eventData = EventFormFactory.create({
      title: '간단한 일정',
      date: DateHelper.today(),
      startTime: '14:00',
      endTime: '15:00',
    });

    // When: 일정 생성
    await helpers.eventForm.createEvent(eventData);

    // Then: 일정이 정상적으로 생성됨
    await assert.eventList.expectEventVisible('간단한 일정');
  });

  /**
   * 2. 일정 조회 (Read)
   */
  test('사용자가 생성한 일정을 목록에서 확인할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 일정 생성
    const eventData = EventFormFactory.create({
      title: '점심 약속',
      date: DateHelper.addDays(DateHelper.today(), 1),
      startTime: '12:00',
      endTime: '13:00',
      category: '개인',
    });

    await helpers.eventForm.createEvent(eventData);

    // When: 페이지 새로고침 (지속성 확인)
    await helpers.navigation.reload();

    // Then: 일정이 여전히 표시됨
    await assert.eventList.expectEventVisible('점심 약속');
  });

  test('사용자가 일정을 클릭하면 상세 정보가 폼에 표시된다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 일정 생성
    const eventData = EventFormFactory.create({
      title: '의사 예약',
      date: DateHelper.today(),
      startTime: '09:00',
      endTime: '10:00',
      description: '정기 검진',
      location: '병원',
      category: '개인',
    });

    await helpers.eventForm.createEvent(eventData);

    // When: 일정 클릭
    await helpers.eventList.clickEvent('의사 예약');

    // Then: 폼에 일정 정보가 채워짐
    await assert.eventForm.expectFormValues({
      title: '의사 예약',
      date: DateHelper.today(),
      startTime: '09:00',
      endTime: '10:00',
      description: '정기 검진',
      location: '병원',
      category: '개인',
    });

    // And: 수정 모드로 전환됨
    await assert.eventForm.expectEditMode();
  });

  /**
   * 3. 일정 수정 (Update)
   */
  test('사용자가 기존 일정의 정보를 수정할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 일정 생성
    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '오후 미팅',
        date: DateHelper.today(),
        startTime: '14:00',
        endTime: '15:00',
        category: '업무',
      })
    );

    // When: 일정 클릭 후 수정
    await helpers.eventList.clickEvent('오후 미팅');
    await helpers.eventForm.updateEvent({
      title: '오후 미팅 (수정됨)',
      description: '안건 추가됨',
      startTime: '14:30',
      endTime: '15:30',
    });

    // Then: 수정 성공 메시지 표시
    await assert.toast.expectEventUpdated();

    // And: 수정된 제목이 목록에 표시
    await assert.eventList.expectEventVisible('오후 미팅 (수정됨)');
    await assert.eventList.expectEventNotVisible('오후 미팅');
  });

  test('사용자가 일정 수정 중 다른 필드들도 함께 변경할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 일정 생성
    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '스터디 모임',
        date: DateHelper.today(),
        startTime: '19:00',
        endTime: '21:00',
        location: '카페',
        category: '개인',
      })
    );

    // When: 일정 클릭 후 여러 필드 수정
    await helpers.eventList.clickEvent('스터디 모임');
    await helpers.eventForm.updateEvent({
      location: '도서관',
      category: '업무',
      description: '프로젝트 논의',
    });

    // Then: 수정된 내용 확인
    await helpers.eventList.clickEvent('스터디 모임');
    await assert.eventForm.expectFormValues({
      location: '도서관',
      category: '업무',
      description: '프로젝트 논의',
    });
  });

  /**
   * 4. 일정 삭제 (Delete)
   */
  test('사용자가 일정을 삭제할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 일정 생성
    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '삭제할 일정',
        date: DateHelper.today(),
        startTime: '16:00',
        endTime: '17:00',
      })
    );

    // When: 일정의 삭제 버튼 클릭
    await helpers.eventForm.deleteEvent('삭제할 일정');

    // 삭제 확인 다이얼로그가 있다면 확인 클릭
    const hasDialog = await helpers.dialog.isDialogVisible();
    if (hasDialog) {
      await helpers.dialog.confirm();
    }

    // Then: 삭제 성공 메시지 표시
    await assert.toast.expectEventDeleted();

    // And: 일정이 목록에서 제거됨
    await assert.eventList.expectEventNotVisible('삭제할 일정');
  });

  test('사용자가 일정 삭제 후 페이지 새로고침해도 삭제가 유지된다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 일정 생성 및 삭제
    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '영구 삭제 테스트',
        date: DateHelper.today(),
        startTime: '18:00',
        endTime: '19:00',
      })
    );

    await helpers.eventForm.deleteEvent('영구 삭제 테스트');

    const hasDialog = await helpers.dialog.isDialogVisible();
    if (hasDialog) {
      await helpers.dialog.confirm();
    }

    await helpers.wait.waitForToast('일정이 삭제되었습니다');

    // When: 페이지 새로고침
    await helpers.navigation.reload();

    // Then: 일정이 여전히 표시되지 않음
    await assert.eventList.expectEventNotVisible('영구 삭제 테스트');
  });

  /**
   * 5. 유효성 검증 (Validation)
   */
  test('사용자가 시작 시간이 종료 시간보다 늦은 일정을 생성하려 하면 에러가 표시된다', async ({
    page,
  }) => {
    const helpers = createHelpers(page);

    // Given: 잘못된 시간 범위의 일정 데이터
    const invalidData = InvalidData.invalidTimeRange;

    // When: 일정 생성 시도
    await helpers.eventForm.fillEventForm(invalidData);
    await helpers.eventForm.submitEvent();

    // Then: 에러 메시지 표시 또는 일정이 생성되지 않음
    // 실제 앱의 동작에 따라 조정 필요
    const hasError = await page
      .locator('text=/종료 시간.*시작 시간/')
      .isVisible()
      .catch(() => false);

    if (!hasError) {
      // 에러 메시지가 없다면 일정이 생성되지 않았는지 확인
      const isEventVisible = await page
        .locator(`text=${invalidData.title}`)
        .isVisible()
        .catch(() => false);
      expect(isEventVisible).toBeFalsy();
    }
  });

  test.skip('사용자가 제목 없이 일정을 생성하려 하면 제출이 차단된다', async ({ page }) => {
    // TODO: 현재 앱은 빈 제목을 허용함. 향후 validation 추가 시 이 테스트 활성화
    const helpers = createHelpers(page);

    // Given: 제목이 비어있는 일정 데이터
    const invalidData = InvalidData.emptyTitle;

    // When: 제목 없이 제출 시도
    await helpers.eventForm.fillEventForm(invalidData);
    await helpers.eventForm.submitEvent();

    // Then: 제출 차단되거나 에러 표시
    // HTML5 validation이나 커스텀 validation 확인
    const titleInput = page.locator('#title');
    const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => {
      return !el.validity.valid || el.getAttribute('aria-invalid') === 'true';
    });

    // 제출이 차단되었는지 확인
    expect(isInvalid).toBeTruthy();
  });

  /**
   * 6. 여러 일정 관리
   */
  test('사용자가 여러 개의 일정을 생성하고 모두 목록에서 확인할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // Given: 여러 일정 데이터
    const events = [
      EventFormFactory.create({
        title: '아침 조깅',
        date: DateHelper.today(),
        startTime: '07:00',
        endTime: '08:00',
      }),
      EventFormFactory.create({
        title: '점심 회의',
        date: DateHelper.today(),
        startTime: '12:00',
        endTime: '13:00',
      }),
      EventFormFactory.create({
        title: '저녁 운동',
        date: DateHelper.today(),
        startTime: '18:00',
        endTime: '19:00',
      }),
    ];

    // When: 순차적으로 일정 생성
    for (const event of events) {
      await helpers.eventForm.createEvent(event);
    }

    // Then: 모든 일정이 목록에 표시됨
    await assert.eventList.expectEventsVisible(['아침 조깅', '점심 회의', '저녁 운동']);
  });

  test('사용자가 같은 날짜에 여러 일정을 생성할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    const today = DateHelper.today();

    // When: 같은 날짜에 다른 시간대의 일정 생성
    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '오전 일정',
        date: today,
        startTime: '09:00',
        endTime: '10:00',
      })
    );

    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '오후 일정',
        date: today,
        startTime: '15:00',
        endTime: '16:00',
      })
    );

    // Then: 두 일정 모두 표시됨
    await assert.eventList.expectEventsVisible(['오전 일정', '오후 일정']);
  });

  test('사용자가 다른 날짜에 일정을 생성할 수 있다', async ({ page }) => {
    const helpers = createHelpers(page);
    const assert = createAssertions(page);

    // When: 다른 날짜에 일정 생성
    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '오늘 일정',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      })
    );

    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '내일 일정',
        date: DateHelper.addDays(DateHelper.today(), 1),
        startTime: '10:00',
        endTime: '11:00',
      })
    );

    await helpers.eventForm.createEvent(
      EventFormFactory.create({
        title: '모레 일정',
        date: DateHelper.addDays(DateHelper.today(), 2),
        startTime: '10:00',
        endTime: '11:00',
      })
    );

    // Then: 모든 일정이 목록에 표시됨
    await assert.eventList.expectEventsVisible(['오늘 일정', '내일 일정', '모레 일정']);
  });
});
