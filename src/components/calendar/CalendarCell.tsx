import { TableCell, Typography } from '@mui/material';
import { DragEvent } from 'react';

import EventCard from './EventCard';
import { Event } from '../../types';

interface CalendarCellProps {
  /** 날짜 (숫자) */
  day: number | null;
  /** 해당 날짜의 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: string[];
  /** 공휴일 이름 (선택) */
  holiday?: string;
  /** 셀 클릭 핸들러 */
  onClick?: (day: number) => void;
  /** 드롭 핸들러 (D&D) */
  onDrop?: (day: number, e: DragEvent<HTMLTableCellElement>) => void;
}

/**
 * 캘린더 개별 날짜 셀
 *
 * @description
 * - 날짜, 공휴일, 일정 목록 표시
 * - 셀 클릭으로 일정 생성 (날짜 자동 입력)
 * - 드래그 앤 드롭으로 일정 이동 (날짜 간 이동만 지원)
 *
 * @example
 * ```tsx
 * <CalendarCell
 *   day={15}
 *   events={eventsForDay}
 *   notifiedEventIds={[1, 2, 3]}
 *   holiday="설날"
 *   onClick={handleDateClick}
 *   onDrop={handleEventDrop}
 * />
 * ```
 */
export default function CalendarCell({
  day,
  events,
  notifiedEventIds,
  holiday,
  onClick,
  onDrop,
}: CalendarCellProps) {
  const handleClick = () => {
    if (day && onClick) {
      onClick(day);
    }
  };

  const handleDrop = (e: DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    if (day && onDrop) {
      onDrop(day, e);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
  };

  return (
    <TableCell
      data-testid={day ? `calendar-cell-${day}` : 'calendar-cell-empty'}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{
        height: '120px',
        verticalAlign: 'top',
        width: '14.28%',
        padding: 1,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { backgroundColor: '#f5f5f5' } : {},
      }}
    >
      {day && (
        <>
          <Typography variant="body2" fontWeight="bold">
            {day}
          </Typography>

          {/* 공휴일 표시 */}
          {holiday && (
            <Typography variant="body2" color="error">
              {holiday}
            </Typography>
          )}

          {/* 일정 카드 목록 */}
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isNotified={notifiedEventIds.includes(event.id)}
            />
          ))}
        </>
      )}
    </TableCell>
  );
}
