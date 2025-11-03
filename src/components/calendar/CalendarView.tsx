import { Stack, Typography } from '@mui/material';

import CalendarNavigation from './CalendarNavigation';
import MonthView from './MonthView';
import WeekView from './WeekView';
import { Event } from '../../types';
import { getWeekDates, getWeeksAtMonth } from '../../utils/dateUtils';

interface CalendarViewProps {
  /** 현재 뷰 타입 */
  view: 'week' | 'month';
  /** 뷰 타입 변경 핸들러 */
  onViewChange: (view: 'week' | 'month') => void;
  /** 현재 표시 중인 날짜 */
  currentDate: Date;
  /** 이전/다음 네비게이션 핸들러 */
  onNavigate: (direction: 'prev' | 'next') => void;
  /** 필터링된 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: string[];
  /** 공휴일 맵 */
  holidays: Record<string, string>;
  /** 날짜 클릭 핸들러 */
  onDateClick?: (date: Date) => void;
}

/**
 * 캘린더 뷰 메인 컨테이너
 *
 * @description
 * - 캘린더 네비게이션과 주간/월간 뷰를 통합한 컨테이너
 * - 뷰 타입에 따라 WeekView 또는 MonthView 렌더링
 * - 날짜 이동, 뷰 전환 등 캘린더 관련 모든 UI 통합
 *
 * @example
 * ```tsx
 * <CalendarView
 *   view={view}
 *   onViewChange={setView}
 *   currentDate={currentDate}
 *   onNavigate={navigate}
 *   events={filteredEvents}
 *   notifiedEventIds={notifiedEvents}
 *   holidays={holidays}
 * />
 * ```
 */
export default function CalendarView({
  view,
  onViewChange,
  currentDate,
  onNavigate,
  events,
  notifiedEventIds,
  holidays,
  onDateClick,
}: CalendarViewProps) {
  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">일정 보기</Typography>

      <CalendarNavigation
        view={view}
        onViewChange={onViewChange}
        onPrevious={() => onNavigate('prev')}
        onNext={() => onNavigate('next')}
      />

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          weekDates={getWeekDates(currentDate)}
          events={events}
          notifiedEventIds={notifiedEventIds}
          onDateClick={onDateClick}
        />
      )}

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          weeks={getWeeksAtMonth(currentDate)}
          events={events}
          notifiedEventIds={notifiedEventIds}
          holidays={holidays}
          onDateClick={onDateClick}
        />
      )}
    </Stack>
  );
}
