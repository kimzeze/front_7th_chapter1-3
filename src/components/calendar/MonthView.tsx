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
import { formatDate, formatMonth, getEventsForDay } from '../../utils/dateUtils';

interface MonthViewProps {
  /** 현재 날짜 */
  currentDate: Date;
  /** 월간 주 배열 (각 주는 7일) */
  weeks: (number | null)[][];
  /** 필터링된 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: string[];
  /** 공휴일 맵 (날짜 문자열 -> 공휴일명) */
  holidays: Record<string, string>;
  /** 날짜 셀 클릭 핸들러 */
  onDateClick?: (date: Date) => void;
}

/**
 * 월간 캘린더 뷰
 *
 * @description
 * - 현재 날짜가 속한 월의 모든 날짜를 주 단위로 표시
 * - 해당 월의 모든 주(최대 6주) 표시
 * - 각 날짜별로 해당하는 일정 목록 표시
 * - 공휴일 정보 표시
 * - 알림 발생한 일정은 빨간색으로 강조
 *
 * @example
 * ```tsx
 * <MonthView
 *   currentDate={currentDate}
 *   weeks={weeks}
 *   events={filteredEvents}
 *   notifiedEventIds={notifiedEvents}
 *   holidays={holidays}
 * />
 * ```
 */
export default function MonthView({
  currentDate,
  weeks,
  events,
  notifiedEventIds,
  holidays,
  onDateClick,
}: MonthViewProps) {
  return (
    <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatMonth(currentDate)}</Typography>
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
            {weeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const holiday = holidays[dateString];
                  const eventsForDay = day ? getEventsForDay(events, day) : [];

                  return (
                    <CalendarCell
                      key={dayIndex}
                      day={day}
                      dateString={dateString}
                      events={eventsForDay}
                      notifiedEventIds={notifiedEventIds}
                      holiday={holiday}
                      onClick={() => {
                        if (day && onDateClick) {
                          const clickedDate = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            day
                          );
                          onDateClick(clickedDate);
                        }
                      }}
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
