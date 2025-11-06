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
    test.skip('사용자가 일정을 다른 날짜로 드래그할 수 있다', async ({ page }) => {
      // TODO: @dnd-kit 드래그 앤 드롭은 Playwright의 기본 dragTo로는 제대로 동작하지 않음
      // pointer 이벤트를 직접 시뮬레이션하는 방법 필요
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

    test.skip('드래그 후 일정 날짜가 업데이트된다', async ({ page }) => {
      // TODO: @dnd-kit 드래그 앤 드롭은 Playwright의 기본 dragTo로는 제대로 동작하지 않음
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

    test.skip('드래그 후 변경사항이 즉시 반영된다', async ({ page }) => {
      // TODO: @dnd-kit 드래그 앤 드롭은 Playwright의 기본 dragTo로는 제대로 동작하지 않음
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
   * 2. 반복 일정 드래그
   */
  test.describe('반복 일정 드래그', () => {
    test.skip('사용자가 반복 일정을 드래그하면 다이얼로그가 표시된다', async () => {
      // TODO: 현재 구현에서는 반복 일정 드래그 시 다이얼로그가 표시되지 않음
      // 반복 일정 드래그 시 "이 일정만" vs "모든 일정" 선택 기능이 필요
    });
  });

  /**
   * 3. 드래그 취소
   */
  test.describe('드래그 취소', () => {
    test.skip('같은 위치에 드롭하면 일정이 이동하지 않는다', async () => {
      // TODO: 같은 위치 드롭 테스트는 드래그 앤 드롭 구현 방식에 따라 조정 필요
      // 현재는 같은 날짜로 드래그하면 무시되지만, 테스트 방법 개선 필요
    });
  });
});

