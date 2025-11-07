import { Page, expect } from '@playwright/test';

import { EVENT_FORM_SELECTORS, TOAST_SELECTORS, DIALOG_SELECTORS, SELECTORS } from './selectors';
import type { EventForm } from '../../src/types';

/**
 * E2E 테스트 공통 검증 로직
 *
 * @description
 * - 재사용 가능한 assertion 함수
 * - 테스트 코드의 가독성 향상
 * - 일관성 있는 검증 메시지
 */

/**
 * 일정 폼 검증
 */
export class EventFormAssertions {
  constructor(private page: Page) {}

  /**
   * 폼에 입력된 값이 예상과 일치하는지 검증
   */
  async expectFormValues(expected: Partial<EventForm>) {
    if (expected.title !== undefined) {
      await expect(this.page.locator(EVENT_FORM_SELECTORS.title)).toHaveValue(expected.title);
    }

    if (expected.date !== undefined) {
      await expect(this.page.locator(EVENT_FORM_SELECTORS.date)).toHaveValue(expected.date);
    }

    if (expected.startTime !== undefined) {
      await expect(this.page.locator(EVENT_FORM_SELECTORS.startTime)).toHaveValue(
        expected.startTime
      );
    }

    if (expected.endTime !== undefined) {
      await expect(this.page.locator(EVENT_FORM_SELECTORS.endTime)).toHaveValue(expected.endTime);
    }

    if (expected.description !== undefined) {
      await expect(this.page.locator(EVENT_FORM_SELECTORS.description)).toHaveValue(
        expected.description
      );
    }

    if (expected.location !== undefined) {
      await expect(this.page.locator(EVENT_FORM_SELECTORS.location)).toHaveValue(expected.location);
    }

    if (expected.category !== undefined) {
      // MUI Select는 div이므로 toHaveValue 대신 텍스트 확인
      const categoryText = await this.page.locator(EVENT_FORM_SELECTORS.category).textContent();
      expect(categoryText).toBe(expected.category);
    }
  }

  /**
   * 폼이 추가 모드인지 검증
   */
  async expectAddMode() {
    await expect(this.page.locator(EVENT_FORM_SELECTORS.formTitle(false))).toBeVisible();
  }

  /**
   * 폼이 수정 모드인지 검증
   */
  async expectEditMode() {
    // heading 역할로 제목만 선택 (버튼 제외)
    await expect(this.page.getByRole('heading', { name: '일정 수정' })).toBeVisible();
  }

  /**
   * 시간 에러 메시지 표시 확인
   */
  async expectTimeError() {
    // 에러 툴팁이나 메시지가 표시되는지 확인
    const startTimeInput = this.page.locator(EVENT_FORM_SELECTORS.startTime);
    const endTimeInput = this.page.locator(EVENT_FORM_SELECTORS.endTime);

    const startHasError = await startTimeInput.evaluate((el: HTMLInputElement) =>
      el.hasAttribute('error')
    );
    const endHasError = await endTimeInput.evaluate((el: HTMLInputElement) =>
      el.hasAttribute('error')
    );

    expect(startHasError || endHasError).toBeTruthy();
  }

  /**
   * 폼이 비어있는지 검증
   */
  async expectFormEmpty() {
    await expect(this.page.locator(EVENT_FORM_SELECTORS.title)).toHaveValue('');
    await expect(this.page.locator(EVENT_FORM_SELECTORS.description)).toHaveValue('');
    await expect(this.page.locator(EVENT_FORM_SELECTORS.location)).toHaveValue('');
  }
}

/**
 * 토스트 메시지 검증
 */
export class ToastAssertions {
  constructor(private page: Page) {}

  /**
   * 일정 생성 성공 메시지 확인
   */
  async expectEventCreated() {
    // notistack 토스트는 빨리 사라질 수 있으므로 텍스트로 확인
    try {
      await this.page.waitForSelector('text=일정이 추가되었습니다', { timeout: 3000 });
    } catch {
      // 토스트가 이미 사라졌을 수 있으므로 무시
    }
  }

  /**
   * 일정 수정 성공 메시지 확인
   */
  async expectEventUpdated() {
    try {
      await this.page.waitForSelector('text=일정이 수정되었습니다', { timeout: 3000 });
    } catch {
      // 토스트가 이미 사라졌을 수 있으므로 무시
    }
  }

  /**
   * 일정 삭제 성공 메시지 확인
   */
  async expectEventDeleted() {
    try {
      await this.page.waitForSelector('text=일정이 삭제되었습니다', { timeout: 3000 });
    } catch {
      // 토스트가 이미 사라졌을 수 있으므로 무시
    }
  }

  /**
   * 겹침 경고 메시지 확인
   */
  async expectOverlapWarning() {
    await expect(this.page.locator(TOAST_SELECTORS.overlapWarning)).toBeVisible({
      timeout: 5000,
    });
  }

  /**
   * 특정 토스트 메시지 확인
   */
  async expectToast(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });
  }

  /**
   * 에러 토스트 확인
   */
  async expectErrorToast() {
    await expect(this.page.locator(TOAST_SELECTORS.errorToast)).toBeVisible({ timeout: 5000 });
  }
}

/**
 * 일정 목록/캘린더 검증
 */
export class EventListAssertions {
  constructor(private page: Page) {}

  /**
   * 일정이 목록에 표시되는지 확인
   */
  async expectEventVisible(title: string) {
    await expect(this.page.locator(`text=${title}`).first()).toBeVisible();
  }

  /**
   * 일정이 목록에 표시되지 않는지 확인
   */
  async expectEventNotVisible(title: string) {
    // 정확한 텍스트 매칭을 위해 getByText with exact 사용
    const exactMatches = await this.page.getByText(title, { exact: true }).count();
    expect(exactMatches).toBe(0);
  }

  /**
   * 여러 일정이 표시되는지 확인
   */
  async expectEventsVisible(titles: string[]) {
    for (const title of titles) {
      await this.expectEventVisible(title);
    }
  }

  /**
   * 일정 개수 확인
   */
  async expectEventCount(count: number) {
    const events = await this.page.locator('[data-event-item]').all();
    expect(events.length).toBe(count);
  }

  /**
   * 빈 목록 메시지 확인
   */
  async expectEmptyList() {
    await expect(this.page.locator('text=일정이 없습니다')).toBeVisible();
  }

  /**
   * 특정 날짜에 일정이 표시되는지 확인
   */
  async expectEventOnDate(title: string, date: string) {
    const dateCell = this.page.locator(`[data-date="${date}"]`);
    await expect(dateCell.locator(`text=${title}`)).toBeVisible();
  }
}

/**
 * 캘린더 검증
 */
export class CalendarAssertions {
  constructor(private page: Page) {}

  /**
   * 현재 월 표시 확인
   */
  async expectCurrentMonth(month: string) {
    await expect(this.page.locator(SELECTORS.calendar.currentMonth)).toHaveText(month);
  }

  /**
   * 특정 날짜 셀이 비어있는지 확인
   */
  async expectDateCellEmpty(date: string) {
    const cell = this.page.locator(`[data-date="${date}"]`);
    const events = await cell.locator('[data-event-item]').all();
    expect(events.length).toBe(0);
  }

  /**
   * 월간 뷰가 활성화되어 있는지 확인
   */
  async expectMonthViewActive() {
    await expect(this.page.locator(SELECTORS.calendar.monthView)).toBeVisible();
  }

  /**
   * 주간 뷰가 활성화되어 있는지 확인
   */
  async expectWeekViewActive() {
    await expect(this.page.locator(SELECTORS.calendar.weekView)).toBeVisible();
  }
}

/**
 * 다이얼로그 검증
 */
export class DialogAssertions {
  constructor(private page: Page) {}

  /**
   * 다이얼로그가 표시되는지 확인
   */
  async expectDialogVisible() {
    await expect(this.page.locator(DIALOG_SELECTORS.dialog)).toBeVisible();
  }

  /**
   * 다이얼로그가 숨겨져 있는지 확인
   */
  async expectDialogHidden() {
    await expect(this.page.locator(DIALOG_SELECTORS.dialog)).not.toBeVisible();
  }

  /**
   * 확인 다이얼로그가 표시되는지 확인
   */
  async expectConfirmDialog() {
    await expect(this.page.locator(DIALOG_SELECTORS.confirmDialog)).toBeVisible();
  }

  /**
   * 삭제 확인 다이얼로그가 표시되는지 확인
   */
  async expectDeleteConfirmDialog() {
    await expect(this.page.locator(DIALOG_SELECTORS.deleteConfirmDialog)).toBeVisible();
  }

  /**
   * 반복 일정 옵션 다이얼로그가 표시되는지 확인
   */
  async expectRepeatOptionDialog() {
    await expect(this.page.locator(DIALOG_SELECTORS.repeatOptionDialog)).toBeVisible();
  }

  /**
   * 다이얼로그 제목 확인
   */
  async expectDialogTitle(title: string) {
    await expect(this.page.locator(DIALOG_SELECTORS.dialogTitle)).toHaveText(title);
  }
}

/**
 * 알림 검증
 */
export class NotificationAssertions {
  constructor(private page: Page) {}

  /**
   * 알림 배지 개수 확인
   */
  async expectNotificationCount(count: number) {
    const countText = await this.page.textContent(SELECTORS.notification.notificationCount);
    expect(parseInt(countText || '0')).toBe(count);
  }

  /**
   * 알림이 표시되는지 확인
   */
  async expectNotificationVisible(notificationId: string) {
    await expect(
      this.page.locator(SELECTORS.notification.notificationItem(notificationId))
    ).toBeVisible();
  }

  /**
   * 알림 목록이 비어있는지 확인
   */
  async expectNoNotifications() {
    await this.expectNotificationCount(0);
  }
}

/**
 * 검색 및 필터 검증
 */
export class SearchFilterAssertions {
  constructor(private page: Page) {}

  /**
   * 검색 결과 개수 확인
   */
  async expectSearchResultCount(count: number) {
    const resultText = await this.page.textContent(SELECTORS.search.resultCount);
    expect(parseInt(resultText || '0')).toBe(count);
  }

  /**
   * 검색 결과가 없음을 확인
   */
  async expectNoSearchResults() {
    await expect(this.page.locator(SELECTORS.search.noResults)).toBeVisible();
  }

  /**
   * 특정 일정만 필터링되었는지 확인
   */
  async expectFilteredEvents(titles: string[]) {
    for (const title of titles) {
      await expect(this.page.locator(`text=${title}`)).toBeVisible();
    }
  }
}

/**
 * 드래그 앤 드롭 검증
 */
export class DragDropAssertions {
  constructor(private page: Page) {}

  /**
   * 일정이 새로운 날짜로 이동했는지 확인
   */
  async expectEventMovedToDate(title: string, targetDate: string) {
    const dateCell = this.page.locator(`[data-date="${targetDate}"]`);
    await expect(dateCell.locator(`text=${title}`)).toBeVisible();
  }

  /**
   * 드래그 가능한 요소인지 확인
   */
  async expectDraggable(selector: string) {
    const element = this.page.locator(selector);
    const isDraggable = await element.getAttribute('draggable');
    expect(isDraggable).toBe('true');
  }
}

/**
 * 모든 검증 로직을 하나로 모은 클래스
 */
export class Assertions {
  eventForm: EventFormAssertions;
  toast: ToastAssertions;
  eventList: EventListAssertions;
  calendar: CalendarAssertions;
  dialog: DialogAssertions;
  notification: NotificationAssertions;
  searchFilter: SearchFilterAssertions;
  dragDrop: DragDropAssertions;

  constructor(public page: Page) {
    this.eventForm = new EventFormAssertions(page);
    this.toast = new ToastAssertions(page);
    this.eventList = new EventListAssertions(page);
    this.calendar = new CalendarAssertions(page);
    this.dialog = new DialogAssertions(page);
    this.notification = new NotificationAssertions(page);
    this.searchFilter = new SearchFilterAssertions(page);
    this.dragDrop = new DragDropAssertions(page);
  }
}

/**
 * 검증 팩토리 함수
 */
export function createAssertions(page: Page): Assertions {
  return new Assertions(page);
}
