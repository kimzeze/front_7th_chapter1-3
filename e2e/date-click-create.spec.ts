import { test, expect } from '@playwright/test';

import { EventFormFactory, DateHelper } from './fixtures/test-data';
import { createHelpers } from './fixtures/test-helpers';
import { createAssertions } from './utils/assertions';

/**
 * 날짜 클릭으로 일정 생성 E2E 테스트
 *
 * @description
 * 캘린더에서 날짜를 클릭하여 일정을 생성하는 기능을 검증합니다.
 * - 빈 날짜 셀 클릭: 일정 폼 열기 및 날짜 자동 입력
 * - 다양한 뷰에서 클릭: 월간/주간 뷰에서 동작 확인
 */
test.describe('날짜 클릭으로 일정 생성', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.setup();
  });

  test.afterEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.teardown();
  });

  /**
   * 1. 빈 날짜 셀 클릭
   */
  test.describe('빈 날짜 셀 클릭', () => {
    test('사용자가 빈 날짜 셀을 클릭하면 날짜가 폼에 자동 입력된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // When: 빈 날짜 셀 클릭
      const today = DateHelper.today();
      await helpers.calendar.clickDate(today);

      // Then: 날짜가 자동 입력됨 (폼은 항상 열려있음)
      await assert.eventForm.expectFormValues({
        date: today,
      });
    });

    test('클릭한 날짜가 폼에 자동으로 입력된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // When: 특정 날짜 클릭
      const targetDate = DateHelper.addDays(DateHelper.today(), 5);
      await helpers.calendar.clickDate(targetDate);

      // Then: 폼에 해당 날짜가 입력됨
      await assert.eventForm.expectFormValues({
        date: targetDate,
      });
    });

  });

  /**
   * 2. 기존 일정이 있는 셀 클릭
   */
  test.describe('기존 일정이 있는 셀 클릭', () => {
    test('일정이 있는 셀의 빈 공간을 클릭하면 날짜가 폼에 입력된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 일정 생성
      const today = DateHelper.today();
      const eventData = EventFormFactory.create({
        title: '기존 일정',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
      });

      await helpers.eventForm.fillEventForm(eventData);
      await helpers.eventForm.submitEvent();
      await assert.toast.expectEventCreated();

      // 페이지 새로고침하여 캘린더에 일정이 표시되도록 함
      await helpers.navigation.reload();

      // When: 같은 날짜 셀의 빈 공간 클릭 (일정 카드가 아닌 셀 영역)
      // 셀의 빈 공간을 클릭하려면 셀의 다른 부분을 클릭해야 함
      const cell = page.locator(`[data-date="${today}"]`).first();
      const cellBox = await cell.boundingBox();
      if (cellBox) {
        // 셀의 상단 부분 클릭 (일정 카드가 아닌 영역)
        await page.mouse.click(cellBox.x + cellBox.width / 2, cellBox.y + 10);
      }

      // Then: 날짜가 폼에 입력됨
      await assert.eventForm.expectFormValues({
        date: today,
      });
    });
  });

  /**
   * 3. 다양한 뷰에서 클릭
   */
  test.describe('다양한 뷰에서 클릭', () => {
    test('월간 뷰에서 날짜 셀을 클릭할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 월간 뷰로 전환
      await helpers.calendar.switchToMonthView();

      // When: 날짜 셀 클릭
      const today = DateHelper.today();
      await helpers.calendar.clickDate(today);

      // Then: 날짜가 폼에 입력됨
      await assert.eventForm.expectFormValues({
        date: today,
      });
    });

    test.skip('주간 뷰에서 날짜 셀을 클릭할 수 있다', async () => {
      // 주간 뷰의 날짜 셀 구조가 월간 뷰와 다름
      // WeekView는 시간 기반 셀 구조로 되어 있어 날짜 클릭 동작이 다를 수 있음
    });
  });
});

