import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { Notifications, Repeat } from '@mui/icons-material';

import { Event, RepeatType } from '../../types';
import { EVENT_BOX_STYLES } from '../../styles/eventBoxStyles';

/**
 * 반복 유형을 한글 단위로 변환
 * @param {RepeatType} type - 반복 유형 (daily, weekly, monthly, yearly)
 * @returns {string} 한글 단위 (일, 주, 월, 년)
 * @example
 * getRepeatTypeLabel('daily') // '일'
 * getRepeatTypeLabel('weekly') // '주'
 */
const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

interface EventCardProps {
  /** 표시할 일정 객체 */
  event: Event;
  /** 알림이 발생한 일정 여부 (빨간색 강조) */
  isNotified: boolean;
  /** 드래그 시작 핸들러 (D&D 기능) */
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  /** 드래그 종료 핸들러 (D&D 기능) */
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}

/**
 * 캘린더 셀 내부에 표시되는 일정 카드
 *
 * @description
 * - 알림 상태에 따른 시각적 표현 (빨간색/회색)
 * - 반복 일정 아이콘 및 툴팁 표시
 * - 드래그 앤 드롭 지원
 * - 긴 제목은 말줄임표 처리
 *
 * @example
 * ```tsx
 * <EventCard
 *   event={event}
 *   isNotified={notifiedEvents.includes(event.id)}
 *   onDragStart={handleDragStart}
 * />
 * ```
 */
export default function EventCard({ event, isNotified, onDragStart, onDragEnd }: EventCardProps) {
  const isRepeating = event.repeat.type !== 'none';

  return (
    <Box
      data-testid={`event-card-${event.id}`}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      sx={{
        ...EVENT_BOX_STYLES.common,
        ...(isNotified ? EVENT_BOX_STYLES.notified : EVENT_BOX_STYLES.normal),
        cursor: onDragStart ? 'move' : 'default',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {/* 알림 아이콘 */}
        {isNotified && <Notifications fontSize="small" data-testid="notification-icon" />}

        {/* 반복 일정 아이콘 */}
        {isRepeating && (
          <Tooltip
            title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
              event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
            }`}
          >
            <Repeat fontSize="small" data-testid="repeat-icon" />
          </Tooltip>
        )}

        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
}
