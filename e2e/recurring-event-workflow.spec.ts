import { test } from '@playwright/test';

import { EventFormFactory, DateHelper, EventTemplates } from './fixtures/test-data';
import { createHelpers } from './fixtures/test-helpers';
import { createAssertions } from './utils/assertions';

/**
 * 반복 일정 관리 워크플로우 E2E 테스트
 *
 * @description
 * 실제 사용자가 반복 일정을 생성, 조회, 수정, 삭제하는 전체 플로우를 검증합니다.
 * - Create: 반복 일정 생성 (매일, 매주, 매월)
 * - Read: 반복 일정 조회
 * - Update: 반복 일정 수정 (이 일정만, 앞으로 모든 일정, 모든 일정)
 * - Delete: 반복 일정 삭제
 * - Exception: 반복 일정 예외 처리
 */
test.describe('반복 일정 관리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.setup();
  });

  test.afterEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.teardown();
  });

  /**
   * 1. 반복 일정 생성 (Create)
   */
  test.describe('반복 일정 생성', () => {
    test('사용자가 매일 반복되는 일정을 생성할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 매일 반복 일정 데이터
      const eventData = EventTemplates.dailyRecurring({
        title: '매일 스탠드업 미팅',
        date: DateHelper.today(),
        startTime: '09:00',
        endTime: '09:30',
      });

      // When: 일정 폼 입력
      await helpers.eventForm.fillEventForm(eventData);

      // 반복 일정 설정
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 7), // 7일간
      });

      await helpers.eventForm.submitEvent();

      // Then: 일정 생성 성공
      await assert.toast.expectEventCreated();
      await assert.eventList.expectEventVisible('매일 스탠드업 미팅');
    });

    test('사용자가 매주 반복되는 일정을 생성할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 매주 반복 일정 데이터
      const eventData = EventTemplates.weeklyRecurring({
        title: '주간 보고',
        date: DateHelper.today(),
        startTime: '16:00',
        endTime: '17:00',
      });

      // When: 반복 일정 생성
      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'weekly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 28), // 4주간
      });
      await helpers.eventForm.submitEvent();

      // Then: 일정 생성 성공
      await assert.toast.expectEventCreated();
      await assert.eventList.expectEventVisible('주간 보고');
    });

    test('사용자가 매월 반복되는 일정을 생성할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 매월 반복 일정 데이터
      const eventData = EventTemplates.monthlyRecurring({
        title: '월간 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '12:00',
      });

      // When: 반복 일정 생성
      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'monthly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 90), // 3개월간
      });
      await helpers.eventForm.submitEvent();

      // Then: 일정 생성 성공
      await assert.toast.expectEventCreated();
      await assert.eventList.expectEventVisible('월간 회의');
    });

    test('사용자가 반복 종료일을 설정할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 종료일이 있는 일정 데이터
      const eventData = EventFormFactory.createRecurring('daily', {
        title: '2주간 운동',
        date: DateHelper.today(),
        startTime: '07:00',
        endTime: '08:00',
      });

      const endDate = DateHelper.addDays(DateHelper.today(), 14);

      // When: 반복 종료일 설정
      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 1,
        endDate: endDate,
      });
      await helpers.eventForm.submitEvent();

      // Then: 일정 생성 성공
      await assert.eventList.expectEventVisible('2주간 운동');
    });

    test('사용자가 반복 간격을 설정할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 2일 간격 반복 일정
      const eventData = EventFormFactory.createRecurring('daily', {
        title: '격일 스터디',
        date: DateHelper.today(),
        startTime: '19:00',
        endTime: '21:00',
      });

      // When: 반복 간격을 2로 설정
      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 2, // 2일 간격
        endDate: DateHelper.addDays(DateHelper.today(), 14),
      });
      await helpers.eventForm.submitEvent();

      // Then: 일정 생성 성공
      await assert.eventList.expectEventVisible('격일 스터디');
    });
  });

  /**
   * 2. 반복 일정 조회 (Read)
   */
  test.describe('반복 일정 조회', () => {
    test('사용자가 생성한 반복 일정을 목록에서 확인할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.dailyRecurring({
        title: '매일 조깅',
        date: DateHelper.today(),
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 7),
      });
      await helpers.eventForm.submitEvent();

      // When: 페이지 새로고침 (지속성 확인)
      await helpers.navigation.reload();

      // Then: 반복 일정이 여전히 표시됨
      await assert.eventList.expectEventVisible('매일 조깅');
    });

    test('사용자가 반복 일정을 클릭하면 반복 정보가 폼에 표시된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.weeklyRecurring({
        title: '주간 미팅',
        date: DateHelper.today(),
        startTime: '14:00',
        endTime: '15:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'weekly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 28),
      });
      await helpers.eventForm.submitEvent();

      // When: 일정 클릭
      await helpers.eventList.clickEvent('주간 미팅');

      // 반복 일정 다이얼로그가 표시되면 "이 일정만" 선택
      const hasDialog = await helpers.dialog.isDialogVisible();
      if (hasDialog) {
        await helpers.dialog.selectRepeatOption('this');
        // 다이얼로그가 닫히고 폼이 채워질 때까지 대기
        await page.waitForTimeout(500);
      }

      // Then: 폼에 일정 정보가 채워짐
      await assert.eventForm.expectFormValues({
        title: '주간 미팅',
        startTime: '14:00',
        endTime: '15:00',
      });

      // And: 수정 모드로 전환됨
      await assert.eventForm.expectEditMode();
    });
  });

  /**
   * 3. 반복 일정 수정 (Update)
   */
  test.describe('반복 일정 수정', () => {
    test.skip('사용자가 "이 일정만" 수정할 수 있다', async ({ page }) => {
      // TODO: 반복 일정 수정 다이얼로그 구현 후 테스트 작성
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.dailyRecurring({
        title: '매일 운동',
        date: DateHelper.today(),
        startTime: '07:00',
        endTime: '08:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 7),
      });
      await helpers.eventForm.submitEvent();

      // When: 일정 클릭 후 수정
      await helpers.eventList.clickEvent('매일 운동');
      await helpers.eventForm.updateEvent({
        startTime: '08:00',
        endTime: '09:00',
      });

      // 수정 옵션 다이얼로그에서 "이 일정만" 선택
      const hasDialog = await helpers.dialog.isDialogVisible();
      if (hasDialog) {
        await helpers.dialog.selectRepeatOption('this');
      }

      // Then: 해당 일정만 수정됨
      await assert.toast.expectEventUpdated();
    });

    test.skip('사용자가 "앞으로 모든 일정" 수정할 수 있다', async ({ page }) => {
      // TODO: 반복 일정 수정 다이얼로그 구현 후 테스트 작성
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.weeklyRecurring({
        title: '주간 스터디',
        date: DateHelper.today(),
        startTime: '19:00',
        endTime: '21:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'weekly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 28),
      });
      await helpers.eventForm.submitEvent();

      // When: 일정 클릭 후 수정
      await helpers.eventList.clickEvent('주간 스터디');
      await helpers.eventForm.updateEvent({
        location: '도서관',
      });

      // 수정 옵션 다이얼로그에서 "모든 일정" 선택 (현재는 단일/전체만 지원)
      const hasDialog = await helpers.dialog.isDialogVisible();
      if (hasDialog) {
        await helpers.dialog.selectRepeatOption('all');
      }

      // Then: 앞으로의 일정들이 수정됨
      await assert.toast.expectEventUpdated();
    });

    test.skip('사용자가 "모든 일정" 수정할 수 있다', async ({ page }) => {
      // TODO: 반복 일정 수정 다이얼로그 구현 후 테스트 작성
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.monthlyRecurring({
        title: '월간 리뷰',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'monthly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 90),
      });
      await helpers.eventForm.submitEvent();

      // When: 일정 클릭 후 수정
      await helpers.eventList.clickEvent('월간 리뷰');
      await helpers.eventForm.updateEvent({
        title: '월간 리뷰 (수정됨)',
        description: '분기별 목표 검토',
      });

      // 수정 옵션 다이얼로그에서 "모든 일정" 선택
      const hasDialog = await helpers.dialog.isDialogVisible();
      if (hasDialog) {
        await helpers.dialog.selectRepeatOption('all');
      }

      // Then: 모든 반복 일정이 수정됨
      await assert.toast.expectEventUpdated();
      await assert.eventList.expectEventVisible('월간 리뷰 (수정됨)');
    });
  });

  /**
   * 4. 반복 일정 삭제 (Delete)
   */
  test.describe('반복 일정 삭제', () => {
    test.skip('사용자가 "이 일정만" 삭제할 수 있다', async ({ page }) => {
      // TODO: 반복 일정 삭제 다이얼로그 구현 후 테스트 작성
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.dailyRecurring({
        title: '매일 알람',
        date: DateHelper.today(),
        startTime: '06:00',
        endTime: '06:01',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 7),
      });
      await helpers.eventForm.submitEvent();

      // When: 일정 삭제
      await helpers.eventForm.deleteEvent('매일 알람');

      // 삭제 옵션 다이얼로그에서 "이 일정만" 선택
      const hasDialog = await helpers.dialog.isDialogVisible();
      if (hasDialog) {
        await helpers.dialog.selectRepeatOption('this');
        await helpers.dialog.confirm();
      }

      // Then: 해당 일정만 삭제됨
      await assert.toast.expectEventDeleted();
    });

    test.skip('사용자가 "앞으로 모든 일정" 삭제할 수 있다', async ({ page }) => {
      // TODO: 반복 일정 삭제 다이얼로그 구현 후 테스트 작성
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.weeklyRecurring({
        title: '주간 청소',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '12:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'weekly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 28),
      });
      await helpers.eventForm.submitEvent();

      // When: 일정 삭제
      await helpers.eventForm.deleteEvent('주간 청소');

      // 삭제 옵션 다이얼로그에서 "모든 일정" 선택 (현재는 단일/전체만 지원)
      const hasDialog = await helpers.dialog.isDialogVisible();
      if (hasDialog) {
        await helpers.dialog.selectRepeatOption('all');
        await helpers.dialog.confirm();
      }

      // Then: 앞으로의 일정들이 삭제됨
      await assert.toast.expectEventDeleted();
    });

    test.skip('사용자가 "모든 일정" 삭제할 수 있다', async ({ page }) => {
      // TODO: 반복 일정 삭제 다이얼로그 구현 후 테스트 작성
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.monthlyRecurring({
        title: '월간 보고서',
        date: DateHelper.today(),
        startTime: '09:00',
        endTime: '10:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'monthly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 90),
      });
      await helpers.eventForm.submitEvent();

      // When: 일정 삭제
      await helpers.eventForm.deleteEvent('월간 보고서');

      // 삭제 옵션 다이얼로그에서 "모든 일정" 선택
      const hasDialog = await helpers.dialog.isDialogVisible();
      if (hasDialog) {
        await helpers.dialog.selectRepeatOption('all');
        await helpers.dialog.confirm();
      }

      // Then: 모든 반복 일정이 삭제됨
      await assert.toast.expectEventDeleted();
      await assert.eventList.expectEventNotVisible('월간 보고서');
    });

    test.skip('사용자가 반복 일정 삭제 후 페이지 새로고침해도 삭제가 유지된다', async ({
      page,
    }) => {
      // TODO: 반복 일정 삭제 다이얼로그 구현 후 테스트 작성
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성 및 삭제
      const eventData = EventTemplates.dailyRecurring({
        title: '삭제 테스트',
        date: DateHelper.today(),
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 7),
      });
      await helpers.eventForm.submitEvent();

      await helpers.eventForm.deleteEvent('삭제 테스트');

      const hasDialog = await helpers.dialog.isDialogVisible();
      if (hasDialog) {
        await helpers.dialog.selectRepeatOption('all');
        await helpers.dialog.confirm();
      }

      await helpers.wait.waitForToast('일정이 삭제되었습니다');

      // When: 페이지 새로고침
      await helpers.navigation.reload();

      // Then: 일정이 여전히 표시되지 않음
      await assert.eventList.expectEventNotVisible('삭제 테스트');
    });
  });

  /**
   * 5. 반복 일정 예외 처리
   */
  test.describe('반복 일정 예외 처리', () => {
    test.skip('사용자가 반복 일정 중 특정 날짜만 건너뛸 수 있다', async ({ page }) => {
      // TODO: 반복 일정 예외 처리 기능 구현 후 테스트 작성
      const helpers = createHelpers(page);

      // Given: 반복 일정 생성
      const eventData = EventTemplates.dailyRecurring({
        title: '매일 회의',
        date: DateHelper.today(),
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 7),
      });
      await helpers.eventForm.submitEvent();

      // When: 특정 날짜의 일정을 건너뛰기
      // TODO: 건너뛰기 기능 구현에 따라 테스트 작성
      await page.waitForTimeout(100);

      // Then: 해당 날짜에는 일정이 표시되지 않음
      // TODO: 검증 로직 작성
    });
  });

  /**
   * 6. 복합 시나리오
   */
  test.describe('복합 시나리오', () => {
    test('사용자가 여러 반복 일정을 생성하고 모두 목록에서 확인할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 여러 반복 일정 데이터
      const dailyEvent = EventTemplates.dailyRecurring({
        title: '매일 명상',
        date: DateHelper.today(),
        startTime: '06:00',
        endTime: '06:30',
      });

      const weeklyEvent = EventTemplates.weeklyRecurring({
        title: '주간 팀 미팅',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      const monthlyEvent = EventTemplates.monthlyRecurring({
        title: '월간 리포트',
        date: DateHelper.today(),
        startTime: '15:00',
        endTime: '16:00',
      });

      // When: 순차적으로 반복 일정 생성
      await helpers.eventForm.fillEventForm(dailyEvent);
      await helpers.eventForm.setRecurringEvent({
        type: 'daily',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 7),
      });
      await helpers.eventForm.submitEvent();
      // 일정이 목록에 나타날 때까지 대기
      await assert.eventList.expectEventVisible('매일 명상');

      await helpers.eventForm.fillEventForm(weeklyEvent);
      await helpers.eventForm.setRecurringEvent({
        type: 'weekly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 28),
      });
      await helpers.eventForm.submitEvent();
      // 일정이 목록에 나타날 때까지 대기
      await assert.eventList.expectEventVisible('주간 팀 미팅');

      await helpers.eventForm.fillEventForm(monthlyEvent);
      await helpers.eventForm.setRecurringEvent({
        type: 'monthly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 90),
      });
      await helpers.eventForm.submitEvent();
      // 일정이 목록에 나타날 때까지 대기
      await assert.eventList.expectEventVisible('월간 리포트');

      // Then: 모든 반복 일정이 목록에 표시됨
      await assert.eventList.expectEventsVisible(['매일 명상', '주간 팀 미팅', '월간 리포트']);
    });
  });
});
