/**
 * 일정 카테고리 목록
 * 사용자가 일정 생성 시 선택할 수 있는 카테고리
 */
export const CATEGORIES = ['업무', '개인', '가족', '기타'] as const;

/**
 * 주중 요일 표시 배열 (일~토)
 * 일요일부터 토요일까지 순서대로 표시
 */
export const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 알림 시간 옵션 (분 단위)
 * 일정 시작 전 알림을 받을 시간을 분 단위로 정의
 */
export const NOTIFICATION_OPTIONS = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type NotificationOption = (typeof NOTIFICATION_OPTIONS)[number];
