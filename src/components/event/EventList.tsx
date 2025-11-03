import { Stack, Typography } from '@mui/material';

import EventItem from './EventItem';
import EventSearchInput from './EventSearchInput';
import { Event } from '../../types';

interface EventListProps {
  /** 필터링된 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: string[];
  /** 검색어 */
  searchTerm: string;
  /** 검색어 변경 핸들러 */
  onSearchChange: (term: string) => void;
  /** 일정 수정 핸들러 */
  onEditEvent: (event: Event) => void;
  /** 일정 삭제 핸들러 */
  onDeleteEvent: (event: Event) => void;
}

/**
 * 일정 검색 및 목록 표시 컨테이너
 *
 * @description
 * - 일정 검색 입력 필드 (EventSearchInput)
 * - 일정 목록 표시 (EventItem)
 * - 검색 결과 없을 때 안내 메시지
 * - 우측 사이드바 영역 전체 관리
 *
 * @example
 * ```tsx
 * <EventList
 *   events={filteredEvents}
 *   notifiedEventIds={notifiedEvents}
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   onEditEvent={handleEditEvent}
 *   onDeleteEvent={handleDeleteEvent}
 * />
 * ```
 */
export default function EventList({
  events,
  notifiedEventIds,
  searchTerm,
  onSearchChange,
  onEditEvent,
  onDeleteEvent,
}: EventListProps) {
  return (
    <Stack
      data-testid="event-list"
      spacing={2}
      sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
    >
      <EventSearchInput value={searchTerm} onChange={onSearchChange} />

      {events.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            isNotified={notifiedEventIds.includes(event.id)}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
          />
        ))
      )}
    </Stack>
  );
}
