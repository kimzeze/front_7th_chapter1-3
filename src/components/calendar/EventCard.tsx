import { useDraggable } from '@dnd-kit/core';
import { Notifications, Repeat } from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { EVENT_BOX_STYLES } from '../../styles/eventBoxStyles';
import { Event, RepeatType } from '../../types';

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
}

/**
 * 캘린더 셀 내부에 표시되는 일정 카드
 *
 * @description
 * - 알림 상태에 따른 시각적 표현 (빨간색/회색)
 * - 반복 일정 아이콘 및 툴팁 표시
 * - @dnd-kit을 사용한 드래그 앤 드롭 지원
 * - 긴 제목은 말줄임표 처리
 *
 * @example
 * ```tsx
 * <EventCard
 *   event={event}
 *   isNotified={notifiedEvents.includes(event.id)}
 * />
 * ```
 */
export default function EventCard({ event, isNotified }: EventCardProps) {
  const isRepeating = event.repeat.type !== 'none';

  // @dnd-kit useDraggable hook
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: event.id,
    data: { event }, // 드래그 중인 일정 데이터 전달
  });

  // 드래그 중 스타일 적용 (DragOverlay 사용 시 transform 불필요)
  const style = {
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'move',
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`event-card-${event.id}`}
      onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지 (날짜 클릭과 충돌 방지)
      sx={{
        ...EVENT_BOX_STYLES.common,
        ...(isNotified ? EVENT_BOX_STYLES.notified : EVENT_BOX_STYLES.normal),
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
