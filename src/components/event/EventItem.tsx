import { Delete, Edit, Notifications, Repeat } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { NOTIFICATION_OPTIONS } from '../../constants';
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

interface EventItemProps {
  /** 일정 객체 */
  event: Event;
  /** 알림 발생 여부 */
  isNotified: boolean;
  /** 수정 버튼 클릭 핸들러 */
  onEdit: (event: Event) => void;
  /** 삭제 버튼 클릭 핸들러 */
  onDelete: (event: Event) => void;
}

/**
 * 일정 목록의 개별 일정 아이템
 *
 * @description
 * - 일정의 모든 상세 정보 표시 (제목, 날짜, 시간, 설명, 위치, 카테고리)
 * - 알림/반복 아이콘 표시
 * - 반복 일정의 경우 상세 반복 정보 표시
 * - 알림 설정 정보 표시
 * - 수정/삭제 버튼 제공
 *
 * @example
 * ```tsx
 * <EventItem
 *   event={event}
 *   isNotified={notifiedEvents.includes(event.id)}
 *   onEdit={handleEditEvent}
 *   onDelete={handleDeleteEvent}
 * />
 * ```
 */
export default function EventItem({ event, isNotified, onEdit, onDelete }: EventItemProps) {
  return (
    <Box
      data-testid={`event-item-${event.id}`}
      sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}
    >
      <Stack direction="row" justifyContent="space-between">
        {/* 일정 상세 정보 */}
        <Stack>
          {/* 제목 및 아이콘 */}
          <Stack direction="row" spacing={1} alignItems="center">
            {isNotified && <Notifications color="error" data-testid="notified-icon" />}
            {event.repeat.type !== 'none' && (
              <Tooltip
                title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
                  event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
                }`}
              >
                <Repeat fontSize="small" data-testid="repeat-icon" />
              </Tooltip>
            )}
            <Typography
              fontWeight={isNotified ? 'bold' : 'normal'}
              color={isNotified ? 'error' : 'inherit'}
            >
              {event.title}
            </Typography>
          </Stack>

          {/* 일정 세부 정보 */}
          <Typography>{event.date}</Typography>
          <Typography>
            {event.startTime} - {event.endTime}
          </Typography>
          <Typography>{event.description}</Typography>
          <Typography>{event.location}</Typography>
          <Typography>카테고리: {event.category}</Typography>

          {/* 반복 정보 */}
          {event.repeat.type !== 'none' && (
            <Typography>
              반복: {event.repeat.interval}
              {getRepeatTypeLabel(event.repeat.type)}마다
              {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
            </Typography>
          )}

          {/* 알림 정보 */}
          <Typography>
            알림:{' '}
            {NOTIFICATION_OPTIONS.find((option) => option.value === event.notificationTime)?.label}
          </Typography>
        </Stack>

        {/* 수정/삭제 버튼 */}
        <Stack>
          <IconButton aria-label="Edit event" onClick={() => onEdit(event)}>
            <Edit />
          </IconButton>
          <IconButton aria-label="Delete event" onClick={() => onDelete(event)}>
            <Delete />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

