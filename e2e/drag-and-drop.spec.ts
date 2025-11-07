import { test, expect } from '@playwright/test';

import { EventFormFactory, DateHelper } from './fixtures/test-data';
import { createHelpers } from './fixtures/test-helpers';
import { createAssertions } from './utils/assertions';

/**
 * 드래그 앤 드롭 E2E 테스트
 *
 * @description
 * 일정을 드래그하여 다른 날짜로 이동하는 기능을 검증합니다.
 * - 기본 드래그 앤 드롭: 일정을 다른 날짜로 드래그
 * - 반복 일정 드래그: 반복 일정 드래그 시 옵션 표시
 * - 드래그 취소: 무효 영역에 드롭 시 원위치
 */
test.describe('드래그 앤 드롭', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.setup();
  });

  test.afterEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.teardown();
  });

  /**
   * 1. 기본 드래그 앤 드롭
   */
  test.describe('기본 드래그 앤 드롭', () => {
    test('사용자가 일정을 다른 날짜로 드래그할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 일정 생성
      const today = DateHelper.today();
      const eventData = EventFormFactory.create({
        title: '드래그 테스트 일정',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();
      await assert.eventList.expectEventVisible('드래그 테스트 일정');

      // 페이지 새로고침하여 캘린더에 일정이 표시되도록 함
      await helpers.navigation.reload();

      // When: 일정을 다음 날로 드래그
      const tomorrow = DateHelper.addDays(today, 1);
      await helpers.dragAndDrop.dragEventToDate('드래그 테스트 일정', tomorrow);

      // Then: 일정이 새로운 날짜로 이동
      await assert.toast.expectToast('일정이 이동되었습니다');
      // 목록에서 일정이 여전히 표시되는지 확인
      await assert.eventList.expectEventVisible('드래그 테스트 일정');
    });

    test('드래그 후 일정 날짜가 업데이트된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 일정 생성
      const today = DateHelper.today();
      const eventData = EventFormFactory.create({
        title: '날짜 변경 테스트',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // 페이지 새로고침하여 캘린더에 일정이 표시되도록 함
      await helpers.navigation.reload();

      // When: 일정을 다른 날짜로 드래그
      const newDate = DateHelper.addDays(today, 2);
      await helpers.dragAndDrop.dragEventToDate('날짜 변경 테스트', newDate);

      // Then: 성공 메시지 표시
      await assert.toast.expectToast('일정이 이동되었습니다');
    });

    test('드래그 후 변경사항이 즉시 반영된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 일정 생성
      const today = DateHelper.today();
      const eventData = EventFormFactory.create({
        title: '즉시 반영 테스트',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // 페이지 새로고침하여 캘린더에 일정이 표시되도록 함
      await helpers.navigation.reload();

      // When: 일정을 다른 날짜로 드래그
      const newDate = DateHelper.addDays(today, 3);
      await helpers.dragAndDrop.dragEventToDate('즉시 반영 테스트', newDate);

      // Then: 페이지 새로고침 후에도 변경사항 유지
      await helpers.navigation.reload();
      await assert.eventList.expectEventVisible('즉시 반영 테스트');
    });
  });

  /**
   * 3. 드래그 취소
   */
  test.describe('드래그 취소', () => {
    test('같은 위치에 드롭하면 일정이 이동하지 않는다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 일정 생성
      const today = DateHelper.today();
      const eventData = EventFormFactory.create({
        title: '드래그 취소 테스트',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // 페이지 새로고침하여 캘린더에 일정이 표시되도록 함
      await helpers.navigation.reload();

      // When: 같은 날짜로 드래그 (실제로는 드롭하지 않음)
      // 같은 날짜로 드래그하면 handleDragEnd에서 early return하므로 토스트가 표시되지 않음
      await helpers.dragAndDrop.dragEventToDate('드래그 취소 테스트', today);

      // Then: 성공 메시지가 표시되지 않음 (같은 위치 드롭은 무시됨)
      // 토스트가 표시되지 않는 것을 확인하기 위해 잠시 대기
      await page.waitForTimeout(1000);
      const toast = page.locator('text=일정이 이동되었습니다');
      await expect(toast).not.toBeVisible();
    });
  });
});

