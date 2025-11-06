import { Page } from '@playwright/test';

import type { EventForm } from '../../src/types';
import { EVENT_FORM_SELECTORS } from '../utils/selectors';

/**
 * E2E 테스트 공통 헬퍼 함수
 *
 * @description
 * - Page Object Model 패턴 사용
 * - 재사용 가능한 액션과 검증 로직
 * - 테스트 코드의 가독성 향상
 */

/**
 * 페이지 네비게이션 헬퍼
 */
export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * 앱 메인 페이지로 이동
   */
  async goto(options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }) {
    await this.page.goto('http://localhost:5173');
    await this.page.waitForLoadState(options?.waitUntil || 'networkidle');
  }

  /**
   * 페이지 새로고침
   */
  async reload() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * LocalStorage 초기화
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * SessionStorage 초기화
   */
  async clearSessionStorage() {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  /**
   * 모든 스토리지 초기화
   */
  async clearAllStorage() {
    await this.clearLocalStorage();
    await this.clearSessionStorage();
  }
}

/**
 * 일정 폼 조작 헬퍼
 */
export class EventFormHelper {
  constructor(private page: Page) {}

  /**
   * 일정 폼에 데이터 입력
   */
  async fillEventForm(eventData: Partial<EventForm>) {
    const { title, date, startTime, endTime, description, location, category, notificationTime } =
      eventData;

    // 제목
    if (title !== undefined) {
      await this.page.fill(EVENT_FORM_SELECTORS.title, title);
    }

    // 날짜
    if (date !== undefined) {
      await this.page.fill(EVENT_FORM_SELECTORS.date, date);
    }

    // 시작 시간
    if (startTime !== undefined) {
      await this.page.fill(EVENT_FORM_SELECTORS.startTime, startTime);
    }

    // 종료 시간
    if (endTime !== undefined) {
      await this.page.fill(EVENT_FORM_SELECTORS.endTime, endTime);
    }

    // 설명
    if (description !== undefined) {
      await this.page.fill(EVENT_FORM_SELECTORS.description, description);
    }

    // 위치
    if (location !== undefined) {
      await this.page.fill(EVENT_FORM_SELECTORS.location, location);
    }

    // 카테고리 (Material-UI Select)
    if (category !== undefined) {
      // MUI Select 클릭하여 드롭다운 열기
      await this.page.click(EVENT_FORM_SELECTORS.category);
      // 옵션 선택
      await this.page.click(`li[role="option"]:has-text("${category}")`);
    }

    // 알림 시간 (Material-UI Select)
    if (notificationTime !== undefined) {
      // MUI Select 클릭하여 드롭다운 열기
      await this.page.click(EVENT_FORM_SELECTORS.notification);
      // 옵션 선택 - 알림 시간 레이블 매핑 필요
      const notificationLabels: Record<number, string> = {
        0: '알림 없음',
        10: '10분 전',
        30: '30분 전',
        60: '1시간 전',
        1440: '1일 전',
      };
      const label = notificationLabels[notificationTime] || '10분 전';
      await this.page.click(`li[role="option"]:has-text("${label}")`);
    }
  }

  /**
   * 반복 일정 설정
   */
  async setRecurringEvent(repeatConfig: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: string;
  }) {
    // 반복 일정 체크박스 활성화
    const checkbox = this.page.locator(EVENT_FORM_SELECTORS.repeatCheckbox);
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.check();
    }

    // 반복 유형 선택 (Material-UI Select)
    await this.page.click(EVENT_FORM_SELECTORS.repeatType);
    // 옵션 레이블 매핑
    const typeLabels = {
      daily: '매일',
      weekly: '매주',
      monthly: '매월',
      yearly: '매년',
    };
    await this.page.click(`li[role="option"]:has-text("${typeLabels[repeatConfig.type]}")`);

    // 반복 간격
    if (repeatConfig.interval !== undefined) {
      await this.page.fill(EVENT_FORM_SELECTORS.repeatInterval, String(repeatConfig.interval));
    }

    // 반복 종료일
    if (repeatConfig.endDate !== undefined) {
      await this.page.fill(EVENT_FORM_SELECTORS.repeatEndDate, repeatConfig.endDate);
    }
  }

  /**
   * 일정 추가 버튼 클릭
   */
  async submitEvent() {
    await this.page.click(EVENT_FORM_SELECTORS.submitButton);
  }

  /**
   * 일정 삭제 버튼 클릭
   * @description EventItem의 Delete 버튼을 클릭 (aria-label 사용)
   */
  async deleteEvent(title?: string) {
    if (title) {
      // 특정 일정의 삭제 버튼 클릭
      const eventItem = this.page.locator(`[data-testid^="event-item-"]:has-text("${title}")`);
      await eventItem.locator('[aria-label="Delete event"]').click();
    } else {
      // EventForm이 수정 모드일 때는 표시되지 않을 수 있으므로
      // 삭제 버튼이 보이는지 확인 후 클릭
      const deleteButton = this.page.locator('[aria-label="Delete event"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
      } else {
        throw new Error('Delete button not found');
      }
    }
  }

  /**
   * 일정 생성 (폼 입력 + 제출)
   */
  async createEvent(eventData: Partial<EventForm>, options?: { waitForToast?: boolean }) {
    await this.fillEventForm(eventData);
    await this.submitEvent();

    // 토스트 대신 일정이 목록에 나타날 때까지 대기
    if (options?.waitForToast !== false && eventData.title) {
      try {
        await this.page.waitForSelector(`text=${eventData.title}`, { timeout: 5000 });
      } catch {
        // 토스트가 빨리 사라질 수 있으므로 무시
      }
    }

    // 약간의 안정화 시간
    await this.page.waitForTimeout(300);
  }

  /**
   * 일정 수정 (폼 수정 + 제출)
   */
  async updateEvent(eventData: Partial<EventForm>) {
    await this.fillEventForm(eventData);
    await this.submitEvent();

    // 약간의 안정화 시간
    await this.page.waitForTimeout(500);
  }

  /**
   * 폼 초기화
   */
  async clearForm() {
    await this.page.fill(EVENT_FORM_SELECTORS.title, '');
    await this.page.fill(EVENT_FORM_SELECTORS.date, '');
    await this.page.fill(EVENT_FORM_SELECTORS.startTime, '');
    await this.page.fill(EVENT_FORM_SELECTORS.endTime, '');
    await this.page.fill(EVENT_FORM_SELECTORS.description, '');
    await this.page.fill(EVENT_FORM_SELECTORS.location, '');
  }

  /**
   * 폼 값 가져오기
   */
  async getFormValues(): Promise<Partial<EventForm>> {
    return {
      title: await this.page.inputValue(EVENT_FORM_SELECTORS.title),
      date: await this.page.inputValue(EVENT_FORM_SELECTORS.date),
      startTime: await this.page.inputValue(EVENT_FORM_SELECTORS.startTime),
      endTime: await this.page.inputValue(EVENT_FORM_SELECTORS.endTime),
      description: await this.page.inputValue(EVENT_FORM_SELECTORS.description),
      location: await this.page.inputValue(EVENT_FORM_SELECTORS.location),
      category: await this.page.inputValue(EVENT_FORM_SELECTORS.category),
    };
  }

  /**
   * 폼 모드 확인 (추가 vs 수정)
   */
  async isEditMode(): Promise<boolean> {
    const formTitle = await this.page.textContent(EVENT_FORM_SELECTORS.formTitle(true));
    return formTitle?.includes('수정') || false;
  }
}

/**
 * 일정 목록 조작 헬퍼
 */
export class EventListHelper {
  constructor(private page: Page) {}

  /**
   * 제목으로 일정 찾기
   */
  async findEventByTitle(title: string) {
    return this.page.locator(`text=${title}`).first();
  }

  /**
   * 일정 클릭 (수정 모드로 전환)
   * @description 일정의 Edit 버튼을 클릭하여 수정 모드로 전환
   */
  async clickEvent(title: string) {
    // 일정 제목이 있는 EventItem 찾기
    const eventItem = this.page.locator(`[data-testid^="event-item-"]:has-text("${title}")`);

    // Edit 버튼 클릭 (aria-label 사용)
    await eventItem.locator('[aria-label="Edit event"]').click();

    // 폼 업데이트 대기
    await this.page.waitForTimeout(500);
  }

  /**
   * 일정이 표시되는지 확인
   */
  async isEventVisible(title: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(`text=${title}`, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 일정 개수 확인
   */
  async getEventCount(): Promise<number> {
    const events = await this.page.locator('[data-testid^="event-item-"]').all();
    return events.length;
  }
}

/**
 * 캘린더 조작 헬퍼
 */
export class CalendarHelper {
  constructor(private page: Page) {}

  /**
   * 특정 날짜 셀 클릭
   */
  async clickDate(date: string) {
    // date 형식: YYYY-MM-DD
    const selector = `[data-date="${date}"]`;
    await this.page.click(selector);
  }

  /**
   * 빈 날짜 셀 클릭 (일정 생성)
   */
  async clickEmptyDate(date: string) {
    await this.clickDate(date);
  }

  /**
   * 다음 달로 이동
   */
  async goToNextMonth() {
    await this.page.click('button:has-text("다음")');
    await this.page.waitForTimeout(300); // 애니메이션 대기
  }

  /**
   * 이전 달로 이동
   */
  async goToPrevMonth() {
    await this.page.click('button:has-text("이전")');
    await this.page.waitForTimeout(300);
  }

  /**
   * 오늘로 이동
   */
  async goToToday() {
    await this.page.click('button:has-text("오늘")');
    await this.page.waitForTimeout(300);
  }

  /**
   * 현재 표시된 월 가져오기
   */
  async getCurrentMonth(): Promise<string> {
    return (await this.page.textContent('[data-testid="current-month"]')) || '';
  }

  /**
   * 주간 뷰로 전환
   */
  async switchToWeekView() {
    await this.page.click('button:has-text("Week")');
  }

  /**
   * 월간 뷰로 전환
   */
  async switchToMonthView() {
    await this.page.click('button:has-text("Month")');
  }
}

/**
 * 드래그 앤 드롭 헬퍼
 */
export class DragAndDropHelper {
  constructor(private page: Page) {}

  /**
   * 일정을 다른 날짜로 드래그
   */
  async dragEventToDate(eventTitle: string, targetDate: string) {
    const source = this.page.locator(`text=${eventTitle}`).first();
    const target = this.page.locator(`[data-date="${targetDate}"]`);

    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Source or target element not found');
    }

    // 드래그 시작
    await this.page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2
    );
    await this.page.mouse.down();

    // 드래그 중 (중간 지점 거치기)
    await this.page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
      { steps: 10 }
    );

    // 드롭
    await this.page.mouse.up();

    // 애니메이션 대기
    await this.page.waitForTimeout(500);
  }

  /**
   * 일정 시간 조정 (resize)
   * @todo 실제 UI에 따라 구현 필요
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resizeEvent(_eventTitle: string, _direction: 'start' | 'end', _offsetMinutes: number) {
    // 구현은 실제 UI에 따라 조정 필요
    // 예: 일정 카드의 상단/하단 핸들을 드래그
  }
}

/**
 * 검색 및 필터 헬퍼
 */
export class SearchFilterHelper {
  constructor(private page: Page) {}

  /**
   * 검색어 입력
   */
  async search(query: string) {
    const searchInput = this.page.locator('input[placeholder*="검색"]');
    await searchInput.fill(query);
    await this.page.waitForTimeout(500); // 디바운스 대기
  }

  /**
   * 검색 초기화
   */
  async clearSearch() {
    const searchInput = this.page.locator('input[placeholder*="검색"]');
    await searchInput.clear();
  }

  /**
   * 카테고리 필터 선택
   */
  async filterByCategory(category: string) {
    // 실제 UI에 따라 조정 필요
    await this.page.click(`[data-category="${category}"]`);
  }

  /**
   * 날짜 범위 필터 설정
   */
  async filterByDateRange(startDate: string, endDate: string) {
    await this.page.fill('[data-testid="date-range-start"]', startDate);
    await this.page.fill('[data-testid="date-range-end"]', endDate);
  }
}

/**
 * 알림 헬퍼
 */
export class NotificationHelper {
  constructor(private page: Page) {}

  /**
   * 알림 목록 열기
   */
  async openNotificationList() {
    await this.page.click('[data-testid="notification-badge"]');
  }

  /**
   * 알림 개수 확인
   */
  async getNotificationCount(): Promise<number> {
    const countText = await this.page.textContent('[data-testid="notification-count"]');
    return parseInt(countText || '0');
  }

  /**
   * 알림 클릭
   */
  async clickNotification(notificationId: string) {
    await this.page.click(`[data-notification-id="${notificationId}"]`);
  }

  /**
   * 모든 알림 삭제
   */
  async clearAllNotifications() {
    await this.page.click('button:has-text("모두 삭제")');
  }
}

/**
 * 다이얼로그 헬퍼
 */
export class DialogHelper {
  constructor(private page: Page) {}

  /**
   * 확인 버튼 클릭
   */
  async confirm() {
    await this.page.click('button:has-text("확인")');
  }

  /**
   * 취소 버튼 클릭
   */
  async cancel() {
    await this.page.click('button:has-text("취소")');
  }

  /**
   * 다이얼로그가 표시되는지 확인
   */
  async isDialogVisible(): Promise<boolean> {
    return this.page.locator('[role="dialog"]').isVisible();
  }

  /**
   * 반복 일정 수정/삭제 옵션 선택
   */
  async selectRepeatOption(option: 'this' | 'future' | 'all') {
    const buttonText = {
      this: '이 일정만',
      future: '앞으로 모든 일정',
      all: '모든 일정',
    };

    await this.page.click(`button:has-text("${buttonText[option]}")`);
  }
}

/**
 * 대기 헬퍼
 */
export class WaitHelper {
  constructor(private page: Page) {}

  /**
   * 토스트 메시지 대기
   */
  async waitForToast(message: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(`text=${message}`, {
      timeout: options?.timeout || 5000,
    });
  }

  /**
   * 로딩 완료 대기
   */
  async waitForLoading() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 특정 요소 사라질 때까지 대기
   */
  async waitForElementToDisappear(selector: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(selector, {
      state: 'hidden',
      timeout: options?.timeout || 5000,
    });
  }
}

/**
 * 모든 헬퍼를 하나로 모은 클래스
 */
export class TestHelpers {
  navigation: NavigationHelper;
  eventForm: EventFormHelper;
  eventList: EventListHelper;
  calendar: CalendarHelper;
  dragAndDrop: DragAndDropHelper;
  searchFilter: SearchFilterHelper;
  notification: NotificationHelper;
  dialog: DialogHelper;
  wait: WaitHelper;

  constructor(public page: Page) {
    this.navigation = new NavigationHelper(page);
    this.eventForm = new EventFormHelper(page);
    this.eventList = new EventListHelper(page);
    this.calendar = new CalendarHelper(page);
    this.dragAndDrop = new DragAndDropHelper(page);
    this.searchFilter = new SearchFilterHelper(page);
    this.notification = new NotificationHelper(page);
    this.dialog = new DialogHelper(page);
    this.wait = new WaitHelper(page);
  }

  /**
   * 테스트 시작 전 초기화
   */
  async setup() {
    // API mocking - 빈 상태로 시작
    let mockEvents: any[] = [];

    // /api/events 엔드포인트 mocking (GET, POST)
    await this.page.route('**/api/events', (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        // GET /api/events - 현재 mockEvents 반환
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ events: mockEvents }),
        });
      } else if (method === 'POST') {
        // POST /api/events - 일정 추가
        const newEvent = route.request().postDataJSON();
        newEvent.id = String(mockEvents.length + 1);
        mockEvents.push(newEvent);
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newEvent),
        });
      } else {
        route.continue();
      }
    });

    // /api/events/:id 엔드포인트 mocking (PUT, DELETE)
    await this.page.route('**/api/events/*', (route) => {
      const method = route.request().method();
      const url = route.request().url();
      const id = url.split('/').pop();

      if (method === 'PUT') {
        // PUT /api/events/:id - 일정 수정
        const updatedEvent = route.request().postDataJSON();
        const index = mockEvents.findIndex((e) => e.id === id);

        if (index !== -1) {
          mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockEvents[index]),
          });
        } else {
          route.fulfill({ status: 404 });
        }
      } else if (method === 'DELETE') {
        // DELETE /api/events/:id - 일정 삭제
        const index = mockEvents.findIndex((e) => e.id === id);

        if (index !== -1) {
          mockEvents.splice(index, 1);
          route.fulfill({ status: 204 });
        } else {
          route.fulfill({ status: 404 });
        }
      } else {
        route.continue();
      }
    });

    // Storage 초기화 후 페이지 이동
    await this.page.goto('http://localhost:5173');
    await this.navigation.clearAllStorage();
    await this.page.reload(); // 깨끗한 상태로 재로드
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 테스트 종료 후 정리
   */
  async teardown() {
    await this.navigation.clearAllStorage();
  }
}

/**
 * 헬퍼 팩토리 함수
 */
export function createHelpers(page: Page): TestHelpers {
  return new TestHelpers(page);
}
