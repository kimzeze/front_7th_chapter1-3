import { test } from '@playwright/test';

import { EventFormFactory, DateHelper } from './fixtures/test-data';
import { createHelpers } from './fixtures/test-helpers';
import { createAssertions } from './utils/assertions';

/**
 * 검색 및 필터링 E2E 테스트
 *
 * @description
 * 일정 검색 기능을 검증합니다.
 * - 검색 기능: 제목, 설명, 위치로 검색
 * - 검색 결과 표시: 검색어 없을 때 전체 표시, 결과 없을 때 처리
 */
test.describe('검색 및 필터링', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.setup();

    // 테스트용 일정 생성
    const events = [
      EventFormFactory.create({
        title: '팀 회의',
        date: DateHelper.today(),
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
      }),
      EventFormFactory.create({
        title: '점심 약속',
        date: DateHelper.today(),
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심',
        location: '식당',
        category: '개인',
      }),
      EventFormFactory.create({
        title: '운동',
        date: DateHelper.today(),
        startTime: '18:00',
        endTime: '19:00',
        description: '헬스장 운동',
        location: '헬스장',
        category: '개인',
      }),
      EventFormFactory.create({
        title: '프로젝트 회의',
        date: DateHelper.today(),
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행 상황 논의',
        location: '회의실 B',
        category: '업무',
      }),
    ];

    for (const event of events) {
      await helpers.eventForm.fillEventForm(event);
      await helpers.eventForm.submitEvent();
      await page.waitForTimeout(300);
    }
  });

  test.afterEach(async ({ page }) => {
    const helpers = createHelpers(page);
    await helpers.teardown();
  });

  /**
   * 1. 검색 기능
   */
  test.describe('검색 기능', () => {
    test('사용자가 제목으로 일정을 검색할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // When: 제목으로 검색
      await helpers.searchFilter.search('팀 회의');

      // Then: 검색 결과에 해당 일정만 표시
      await assert.eventList.expectEventVisible('팀 회의');
      await assert.eventList.expectEventNotVisible('점심 약속');
    });

    test('사용자가 설명으로 일정을 검색할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // When: 설명으로 검색
      await helpers.searchFilter.search('주간 팀 미팅');

      // Then: 검색 결과에 해당 일정 표시
      await assert.eventList.expectEventVisible('팀 회의');
    });

    test('사용자가 위치로 일정을 검색할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // When: 위치로 검색
      await helpers.searchFilter.search('회의실 A');

      // Then: 검색 결과에 해당 일정 표시
      await assert.eventList.expectEventVisible('팀 회의');
    });

    test('사용자가 부분 일치로 일정을 검색할 수 있다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // When: 부분 일치 검색
      await helpers.searchFilter.search('회의');

      // Then: 회의 관련 일정 모두 표시
      await assert.eventList.expectEventVisible('팀 회의');
      await assert.eventList.expectEventVisible('프로젝트 회의');
    });

    test('검색어가 없을 때 전체 일정이 표시된다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // Given: 검색어 입력
      await helpers.searchFilter.search('회의');

      // When: 검색어 삭제
      await helpers.searchFilter.clearSearch();

      // Then: 전체 일정 표시
      await assert.eventList.expectEventVisible('팀 회의');
      await assert.eventList.expectEventVisible('점심 약속');
      await assert.eventList.expectEventVisible('운동');
      await assert.eventList.expectEventVisible('프로젝트 회의');
    });
  });

  /**
   * 2. 검색 결과 표시
   */
  test.describe('검색 결과 표시', () => {
    test('검색 결과가 없을 때 일정이 표시되지 않는다', async ({ page }) => {
      const helpers = createHelpers(page);
      const assert = createAssertions(page);

      // When: 존재하지 않는 검색어 입력
      await helpers.searchFilter.search('존재하지 않는 일정');

      // Then: 일정이 표시되지 않음
      await page.waitForTimeout(500);
      await assert.eventList.expectEventNotVisible('팀 회의');
      await assert.eventList.expectEventNotVisible('점심 약속');
    });
  });
});
