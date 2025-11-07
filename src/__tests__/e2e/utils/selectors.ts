/**
 * E2E 테스트에서 사용되는 공통 선택자
 *
 * @description
 * - 재사용 가능한 선택자를 중앙에서 관리
 * - 컴포넌트 변경 시 선택자 업데이트를 한 곳에서 처리
 * - data-testid, id, aria-label 등을 사용
 */

/**
 * 일정 폼 선택자
 */
export const EVENT_FORM_SELECTORS = {
  // 제목
  title: '#title',
  titleLabel: 'label[for="title"]',

  // 날짜
  date: '#date',
  dateLabel: 'label[for="date"]',

  // 시간
  startTime: '#start-time',
  startTimeLabel: 'label[for="start-time"]',
  endTime: '#end-time',
  endTimeLabel: 'label[for="end-time"]',

  // 설명 및 위치
  description: '#description',
  descriptionLabel: 'label[for="description"]',
  location: '#location',
  locationLabel: 'label[for="location"]',

  // 카테고리
  category: '#category',
  categoryLabel: '#category-label',
  categoryOption: (category: string) => `[aria-label="${category}-option"]`,

  // 반복 일정
  repeatCheckbox: 'input[type="checkbox"]',
  repeatCheckboxLabel: 'text=반복 일정',
  repeatType: '[aria-label="반복 유형"]',
  repeatTypeOption: (type: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
    `[aria-label="${type}-option"]`,
  repeatInterval: '#repeat-interval',
  repeatEndDate: '#repeat-end-date',

  // 알림
  notification: '#notification',
  notificationLabel: 'label[for="notification"]',

  // 버튼
  submitButton: '[data-testid="event-submit-button"]',
  submitButtonByText: (isEditing: boolean) =>
    `button:has-text("${isEditing ? '일정 수정' : '일정 추가'}")`,
  deleteButton: '[aria-label="Delete event"]',
  editButton: '[aria-label="Edit event"]',
  cancelButton: 'button:has-text("취소")',

  // 폼 제목
  formTitle: (isEditing: boolean) => `text=${isEditing ? '일정 수정' : '일정 추가'}`,
} as const;

/**
 * 캘린더 뷰 선택자
 */
export const CALENDAR_SELECTORS = {
  // 뷰 타입
  monthView: '[data-view="month"]',
  weekView: '[data-view="week"]',

  // 네비게이션
  prevButton: 'button:has-text("이전")',
  nextButton: 'button:has-text("다음")',
  todayButton: 'button:has-text("오늘")',
  currentMonth: '[data-testid="current-month"]',

  // 셀
  calendarCell: (date: string) => `[data-date="${date}"]`,
  emptyCell: '[data-empty="true"]',

  // 일정 카드
  eventCard: (eventId: string) => `[data-event-id="${eventId}"]`,
  eventCardByTitle: (title: string) => `text=${title}`,

  // 드래그 앤 드롭
  draggable: '[draggable="true"]',
  dropzone: '[data-dropzone="true"]',
} as const;

/**
 * 일정 목록 선택자
 */
export const EVENT_LIST_SELECTORS = {
  list: '[data-testid="event-list"]',
  listItem: (eventId: string) => `[data-event-id="${eventId}"]`,
  listItemByTitle: (title: string) => `text=${title}`,
  emptyMessage: 'text=일정이 없습니다',
} as const;

/**
 * 검색 및 필터 선택자
 */
export const SEARCH_FILTER_SELECTORS = {
  // 검색
  searchInput: '[data-testid="search-input"]',
  searchInputByPlaceholder: 'input[placeholder*="검색"]',
  searchButton: 'button:has-text("검색")',
  clearSearchButton: 'button:has-text("초기화")',

  // 카테고리 필터
  categoryFilter: '[data-testid="category-filter"]',
  categoryFilterOption: (category: string) => `[data-category="${category}"]`,

  // 날짜 범위 필터
  dateRangeStart: '[data-testid="date-range-start"]',
  dateRangeEnd: '[data-testid="date-range-end"]',

  // 필터 결과
  resultCount: '[data-testid="result-count"]',
  noResults: 'text=검색 결과가 없습니다',
} as const;

/**
 * 알림 선택자
 */
export const NOTIFICATION_SELECTORS = {
  // 알림 목록
  notificationList: '[data-testid="notification-list"]',
  notificationItem: (notificationId: string) => `[data-notification-id="${notificationId}"]`,

  // 알림 배지
  notificationBadge: '[data-testid="notification-badge"]',
  notificationCount: '[data-testid="notification-count"]',

  // 알림 상호작용
  notificationCloseButton: '[aria-label="알림 닫기"]',
  notificationClearAllButton: 'button:has-text("모두 삭제")',

  // 알림 필터
  unreadFilter: '[data-filter="unread"]',
  readFilter: '[data-filter="read"]',
} as const;

/**
 * 다이얼로그 및 모달 선택자
 */
export const DIALOG_SELECTORS = {
  // 일반 다이얼로그
  dialog: '[role="dialog"]',
  dialogTitle: '[role="dialog"] h2',
  dialogContent: '[role="dialog"] [role="document"]',

  // 확인 다이얼로그
  confirmDialog: '[data-testid="confirm-dialog"]',
  confirmButton: 'button:has-text("확인")',
  cancelButton: 'button:has-text("취소")',

  // 삭제 확인
  deleteConfirmDialog: '[data-testid="delete-confirm-dialog"]',
  deleteConfirmButton: 'button:has-text("삭제")',

  // 반복 일정 수정/삭제 옵션 다이얼로그
  repeatOptionDialog: '[data-testid="repeat-option-dialog"]',
  repeatOptionThisOnly: 'button:has-text("이 일정만")',
  repeatOptionThisAndFuture: 'button:has-text("앞으로 모든 일정")',
  repeatOptionAll: 'button:has-text("모든 일정")',
} as const;

/**
 * 토스트/스낵바 선택자
 */
export const TOAST_SELECTORS = {
  toast: '[role="alert"]',
  successToast: '[data-type="success"]',
  errorToast: '[data-type="error"]',
  warningToast: '[data-type="warning"]',

  // 메시지 내용
  eventCreated: 'text=일정이 추가되었습니다',
  eventUpdated: 'text=일정이 수정되었습니다',
  eventDeleted: 'text=일정이 삭제되었습니다',

  // 겹침 경고
  overlapWarning: 'text=/.*겹치는.*일정.*/',
} as const;

/**
 * 공통 UI 선택자
 */
export const COMMON_SELECTORS = {
  // 로딩
  loading: '[data-testid="loading"]',
  spinner: '[role="progressbar"]',

  // 에러
  errorMessage: '[role="alert"][data-type="error"]',
  errorBoundary: '[data-testid="error-boundary"]',

  // 페이지
  pageTitle: 'h1',
  pageSubtitle: 'h2',
} as const;

/**
 * 모든 선택자를 하나의 객체로 export
 */
export const SELECTORS = {
  eventForm: EVENT_FORM_SELECTORS,
  calendar: CALENDAR_SELECTORS,
  eventList: EVENT_LIST_SELECTORS,
  search: SEARCH_FILTER_SELECTORS,
  notification: NOTIFICATION_SELECTORS,
  dialog: DIALOG_SELECTORS,
  toast: TOAST_SELECTORS,
  common: COMMON_SELECTORS,
} as const;
