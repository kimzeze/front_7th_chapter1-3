import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import CalendarCell from './CalendarCell';
import { WEEK_DAYS } from '../../constants';
import { Event } from '../../types';
import { formatWeek } from '../../utils/dateUtils';

interface WeekViewProps {
  /** 현재 날짜 */
  currentDate: Date;
  /** 주간 날짜 배열 (7일) */
  weekDates: Date[];
  /** 필터링된 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: string[];
  /** 날짜 셀 클릭 핸들러 */
  onDateClick?: (date: Date) => void;
}

/**
 * 주간 캘린더 뷰
 *
 * @description
 * - 현재 날짜가 속한 주의 7일(일~토)을 표시
 * - 각 날짜별로 해당하는 일정 목록 표시
 * - 알림 발생한 일정은 빨간색으로 강조
 * - 반복 일정은 아이콘으로 표시
 *
 * @example
 * ```tsx
 * <WeekView
 *   currentDate={currentDate}
 *   weekDates={weekDates}
 *   events={filteredEvents}
 *   notifiedEventIds={notifiedEvents}
 * />
 * ```
 */
export default function WeekView({
  currentDate,
  weekDates,
  events,
  notifiedEventIds,
  onDateClick,
}: WeekViewProps) {
  /**
   * 특정 날짜의 일정 목록 반환
   * @param date - 조회할 날짜
   * @returns 해당 날짜의 일정 배열
   */
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => new Date(event.date).toDateString() === date.toDateString());
  };

  return (
    <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatWeek(currentDate)}</Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {WEEK_DAYS.map((day) => (
                <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {weekDates.map((date) => {
                // YYYY-MM-DD 형식으로 날짜 문자열 생성
                const dateString = date.toISOString().split('T')[0];

                return (
                  <CalendarCell
                    key={date.toISOString()}
                    day={date.getDate()}
                    dateString={dateString}
                    events={getEventsForDate(date)}
                    notifiedEventIds={notifiedEventIds}
                    onClick={() => onDateClick?.(date)}
                  />
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
