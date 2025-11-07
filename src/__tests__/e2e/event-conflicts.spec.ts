import { test, expect } from '@playwright/test';

import { EventFormFactory, DateHelper, EventTemplates } from './fixtures/test-data';
import { createHelpers } from './fixtures/test-helpers';
import { createAssertions } from './utils/assertions';

/**
 * 일정 겹침 처리 E2E 테스트
 *
 * @description
 * 일정이 겹칠 때의 처리 플로우를 검증합니다.
 * - 겹침 감지: 같은 시간대, 부분 겹침, 완전 포함
 * - 겹침 경고: 다이얼로그 표시 및 정보 제공
 * - 겹침 허용: 경고 후에도 일정 생성 가능
 * - 다양한 시나리오: 2개 이상 겹침, 반복 일정과 일반 일정 겹침
 */
test.describe('일정 겹침 처리', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.setup();
  });

  test.afterEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.teardown();
  });

  /**
   * 1. 겹침 감지
   */
  test.describe('겹침 감지', () => {
    test('사용자가 같은 시간대 일정을 추가하려고 하면 겹침이 감지된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 기존 일정 생성
      const existingEvent = EventFormFactory.create({
        title: '기존 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(existingEvent);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 같은 시간대의 새 일정 추가 시도
      const newEvent = EventFormFactory.create({
        title: '새로운 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(newEvent);
      await helpers.eventForm.submitEvent();

      // Then: 겹침 경고 다이얼로그 표시
      await assert.dialog.expectDialogVisible();
      await assert.dialog.expectDialogTitle('일정 겹침 경고');
    });

    test('사용자가 부분적으로 겹치는 일정을 추가하려고 하면 겹침이 감지된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 기존 일정 생성 (10:00-11:00)
      const existingEvent = EventFormFactory.create({
        title: '기존 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(existingEvent);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 부분적으로 겹치는 일정 추가 시도 (10:30-11:30)
      const newEvent = EventFormFactory.create({
        title: '겹치는 회의',
        date: DateHelper.today(),
        startTime: '10:30',
        endTime: '11:30',
      });

      await helpers.eventForm.fillEventForm(newEvent);
      await helpers.eventForm.submitEvent();

      // Then: 겹침 경고 다이얼로그 표시
      await assert.dialog.expectDialogVisible();
    });

    test('사용자가 완전히 포함되는 일정을 추가하려고 하면 겹침이 감지된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 기존 일정 생성 (10:00-12:00)
      const existingEvent = EventFormFactory.create({
        title: '긴 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '12:00',
      });

      await helpers.eventForm.fillEventForm(existingEvent);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 완전히 포함되는 일정 추가 시도 (10:30-11:30)
      const newEvent = EventFormFactory.create({
        title: '짧은 회의',
        date: DateHelper.today(),
        startTime: '10:30',
        endTime: '11:30',
      });

      await helpers.eventForm.fillEventForm(newEvent);
      await helpers.eventForm.submitEvent();

      // Then: 겹침 경고 다이얼로그 표시
      await assert.dialog.expectDialogVisible();
    });
  });

  /**
   * 2. 겹침 경고
   */
  test.describe('겹침 경고', () => {
    test('겹침 경고 다이얼로그에 겹치는 일정 정보가 표시된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 기존 일정 생성
      const existingEvent = EventFormFactory.create({
        title: '기존 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(existingEvent);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 겹치는 일정 추가 시도
      const newEvent = EventFormFactory.create({
        title: '새로운 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(newEvent);
      await helpers.eventForm.submitEvent();

      // Then: 다이얼로그에 겹치는 일정 정보 표시
      await assert.dialog.expectDialogVisible();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('text=기존 회의')).toBeVisible();
      await expect(dialog.locator('text=10:00-11:00')).toBeVisible();
    });

    test('사용자가 겹침 경고에서 취소할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 기존 일정 생성
      const existingEvent = EventFormFactory.create({
        title: '기존 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(existingEvent);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 겹치는 일정 추가 시도 후 취소
      const newEvent = EventFormFactory.create({
        title: '새로운 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(newEvent);
      await helpers.eventForm.submitEvent();

      await assert.dialog.expectDialogVisible();
      await helpers.dialog.cancel();

      // Then: 다이얼로그가 닫히고 일정이 생성되지 않음
      await assert.dialog.expectDialogHidden();
      await assert.eventList.expectEventNotVisible('새로운 회의');
    });

    test('사용자가 겹침 경고에서 계속 진행할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 기존 일정 생성
      const existingEvent = EventFormFactory.create({
        title: '기존 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(existingEvent);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 겹치는 일정 추가 시도 후 계속 진행
      const newEvent = EventFormFactory.create({
        title: '새로운 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(newEvent);
      await helpers.eventForm.submitEvent();

      await assert.dialog.expectDialogVisible();
      await page.click('button:has-text("계속 진행")');

      // Then: 일정이 생성됨
      await assert.toast.expectEventCreated();
      await assert.eventList.expectEventVisible('새로운 회의');
    });
  });

  /**
   * 3. 겹침 허용
   */
  test.describe('겹침 허용', () => {
    test('경고에도 불구하고 일정을 생성할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 기존 일정 생성
      const existingEvent = EventFormFactory.create({
        title: '기존 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(existingEvent);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 겹치는 일정 추가 후 계속 진행
      const newEvent = EventFormFactory.create({
        title: '겹치는 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(newEvent);
      await helpers.eventForm.submitEvent();
      await page.click('button:has-text("계속 진행")');

      // Then: 두 일정 모두 표시됨
      await assert.eventList.expectEventVisible('기존 회의');
      await assert.eventList.expectEventVisible('겹치는 회의');
    });

    test('겹치는 일정들이 모두 목록에 표시된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 여러 겹치는 일정 생성
      const event1 = EventFormFactory.create({
        title: '첫 번째 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(event1);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      const event2 = EventFormFactory.create({
        title: '두 번째 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(event2);
      await helpers.eventForm.submitEvent();
      await page.click('button:has-text("계속 진행")');
      await assert.toast.expectEventCreated();

      const event3 = EventFormFactory.create({
        title: '세 번째 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(event3);
      await helpers.eventForm.submitEvent();
      await page.click('button:has-text("계속 진행")');
      await assert.toast.expectEventCreated();

      // Then: 모든 일정이 목록에 표시됨
      await assert.eventList.expectEventsVisible(['첫 번째 회의', '두 번째 회의', '세 번째 회의']);
    });
  });

  /**
   * 4. 다양한 겹침 시나리오
   */
  test.describe('다양한 겹침 시나리오', () => {
    test('2개 일정이 겹칠 때 경고가 표시된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 기존 일정 생성
      const existingEvent = EventFormFactory.create({
        title: '기존 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(existingEvent);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 겹치는 일정 추가
      const newEvent = EventFormFactory.create({
        title: '새로운 회의',
        date: DateHelper.today(),
        startTime: '10:30',
        endTime: '11:30',
      });

      await helpers.eventForm.fillEventForm(newEvent);
      await helpers.eventForm.submitEvent();

      // Then: 겹침 경고 표시
      await assert.dialog.expectDialogVisible();
    });

    test('3개 이상 일정이 겹칠 때 모든 겹치는 일정이 경고에 표시된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 여러 일정 생성
      const event1 = EventFormFactory.create({
        title: '첫 번째 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(event1);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      const event2 = EventFormFactory.create({
        title: '두 번째 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(event2);
      await helpers.eventForm.submitEvent();
      await page.click('button:has-text("계속 진행")');
      await assert.toast.expectEventCreated();

      // When: 세 번째 겹치는 일정 추가
      const event3 = EventFormFactory.create({
        title: '세 번째 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(event3);
      await helpers.eventForm.submitEvent();

      // Then: 다이얼로그에 여러 겹치는 일정 표시
      await assert.dialog.expectDialogVisible();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('text=첫 번째 회의')).toBeVisible();
      await expect(dialog.locator('text=두 번째 회의')).toBeVisible();
    });

    test('반복 일정과 일반 일정이 겹칠 때 경고가 표시된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 반복 일정 생성
      const recurringEvent = EventTemplates.weeklyRecurring({
        title: '주간 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(recurringEvent);
      await helpers.eventForm.setRecurringEvent({
        type: 'weekly',
        interval: 1,
        endDate: DateHelper.addDays(DateHelper.today(), 14),
      });
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // When: 같은 시간대의 일반 일정 추가
      const normalEvent = EventFormFactory.create({
        title: '일반 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(normalEvent);
      await helpers.eventForm.submitEvent();

      // Then: 겹침 경고 표시
      await assert.dialog.expectDialogVisible();
    });
  });
});
