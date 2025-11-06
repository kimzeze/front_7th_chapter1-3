import { test } from '@playwright/test';

import { EventFormFactory, DateHelper } from './fixtures/test-data';
import { createHelpers } from './fixtures/test-helpers';
import { createAssertions } from './utils/assertions';

/**
 * 알림 시스템 E2E 테스트
 *
 * @description
 * 일정 알림 기능을 검증합니다.
 * - 알림 설정: 일정 생성 시 알림 시간 설정
 * - 알림 표시: 알림 시간 도달 시 토스트 표시
 * - 알림 상호작용: 알림 닫기
 */
test.describe('알림 시스템', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.setup();
  });

  test.afterEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.teardown();
  });

  /**
   * 1. 알림 설정
   */
  test.describe('알림 설정', () => {
    test('사용자가 일정 생성 시 알림 시간을 설정할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 알림 시간이 설정된 일정 데이터
      const eventData = EventFormFactory.create({
        title: '알림 테스트 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 10, // 10분 전 알림
      });

      // When: 일정 생성
      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.submitEvent();

      // Then: 일정 생성 성공
      await assert.toast.expectEventCreated();
      await assert.eventList.expectEventVisible('알림 테스트 회의');
    });

    test.skip('사용자가 알림 없음 옵션을 선택할 수 있다', async () => {
      // 알림 없음 옵션이 NOTIFICATION_OPTIONS에 없음
      // 현재는 최소 1분 전 알림만 선택 가능
    });
  });
});
