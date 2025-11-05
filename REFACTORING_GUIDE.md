# App.tsx 리팩토링 가이드라인

## 📋 개요

이 문서는 `App.tsx` 파일을 컴포넌트 기반 구조로 리팩토링하는 과정의 가이드라인입니다.
Storybook 및 E2E 테스트 작성을 위해 컴포넌트를 적절히 분리하되, 기존 테스트는 절대 깨뜨리지 않습니다.

## 🎯 목표

1. **Storybook 작성을 위한 컴포넌트 분리**: 시각적 회귀 테스트가 가능한 독립적인 컴포넌트
2. **E2E 테스트 용이성**: 명확한 책임을 가진 컴포넌트로 테스트 작성 편의성 향상
3. **기존 테스트 보존**: 모든 기존 테스트가 정상 작동해야 함
4. **점진적 리팩토링**: 한 번에 하나씩, 검증 가능한 단위로 진행

## 📁 최종 폴더 구조

```
src/
├── components/
│   ├── calendar/
│   │   ├── CalendarView.tsx           # 캘린더 메인 컨테이너
│   │   ├── MonthView.tsx              # 월간 뷰 테이블
│   │   ├── WeekView.tsx               # 주간 뷰 테이블
│   │   ├── CalendarCell.tsx           # 개별 날짜 셀 (D&D, 클릭 이벤트)
│   │   ├── EventCard.tsx              # 셀 내 일정 카드
│   │   ├── CalendarNavigation.tsx     # 네비게이션 (이전/다음/뷰 선택)
│   │   └── index.ts                   # Barrel export
│   │
│   ├── event/
│   │   ├── EventForm.tsx              # 일정 입력 폼
│   │   ├── EventFormFields.tsx        # 폼 필드 그룹
│   │   ├── RepeatSettings.tsx         # 반복 일정 설정
│   │   ├── EventList.tsx              # 일정 목록 컨테이너
│   │   ├── EventItem.tsx              # 개별 일정 아이템
│   │   ├── EventSearchInput.tsx       # 검색 입력
│   │   └── index.ts
│   │
│   ├── dialogs/
│   │   ├── RecurringEventDialog.tsx   # 반복 일정 수정/삭제 다이얼로그
│   │   ├── OverlapDialog.tsx          # 일정 겹침 경고
│   │   └── index.ts
│   │
│   ├── notifications/
│   │   ├── NotificationToast.tsx      # 알림 토스트
│   │   └── index.ts
│   │
│   └── common/                         # 공통 컴포넌트 (필요시)
│       └── index.ts
│
├── constants/
│   └── index.ts                        # CATEGORIES, WEEK_DAYS, etc.
│
├── styles/
│   └── eventBoxStyles.ts               # 스타일 상수
│
├── hooks/                              # 기존 유지
├── utils/                              # 기존 유지
├── types/                              # 기존 유지
├── apis/                               # 기존 유지
└── App.tsx                             # 최상위 조합
```

## 🔄 리팩토링 단계

### Phase 0: 준비 작업 (필수 선행)

#### Step 0.1: 상수 분리

**목표**: App.tsx 상단의 상수를 별도 파일로 분리

**파일 생성**: `src/constants/index.ts`

```typescript
/**
 * 일정 카테고리 목록
 */
export const CATEGORIES = ['업무', '개인', '가족', '기타'] as const;

/**
 * 주중 요일 표시 배열 (일~토)
 */
export const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 알림 시간 옵션 (분 단위)
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
```

**파일 생성**: `src/styles/eventBoxStyles.ts`

```typescript
import { SxProps, Theme } from '@mui/material';

/**
 * 일정 박스 스타일 상수
 */
export const EVENT_BOX_STYLES = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
} as const satisfies Record<string, SxProps<Theme>>;
```

**수정**: `src/App.tsx`

- 상수 정의 부분 삭제
- import 추가: `import { CATEGORIES, WEEK_DAYS, NOTIFICATION_OPTIONS } from './constants'`
- import 추가: `import { EVENT_BOX_STYLES } from './styles/eventBoxStyles'`

**검증**:

```bash
npm test  # 모든 테스트 통과 확인
```

---

### Phase 1: Calendar 컴포넌트 분리

#### Step 1.1: EventCard 컴포넌트 생성

**우선순위**: ⭐⭐⭐ (가장 작고 독립적, Storybook 작성 필수)

**파일 생성**: `src/components/calendar/EventCard.tsx`

````typescript
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { Notifications, Repeat } from '@mui/icons-material';

import { Event, RepeatType } from '@/types';
import { EVENT_BOX_STYLES } from '@/styles/eventBoxStyles';

/**
 * 반복 유형을 한글 단위로 변환
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
````

**파일 수정**: `src/App.tsx`

- `getRepeatTypeLabel` 함수 삭제 (EventCard.tsx로 이동됨)
- `getRepeatTypeLabel`의 JSDoc 주석도 함께 EventCard.tsx로 이동
- `EventCard` import 추가
- `renderWeekView`와 `renderMonthView` 내부의 일정 카드 렌더링 부분을 `<EventCard />` 사용으로 변경
- 기존 주석 유지 (각 뷰 렌더링 함수의 JSDoc 주석 등)

**변경 예시**:

```typescript
// Before
<Box
  key={event.id}
  sx={{
    ...eventBoxStyles.common,
    ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
  }}
>
  <Stack direction="row" spacing={1} alignItems="center">
    {isNotified && <Notifications fontSize="small" />}
    {isRepeating && <Tooltip ...><Repeat /></Tooltip>}
    <Typography ...>{event.title}</Typography>
  </Stack>
</Box>

// After
<EventCard
  event={event}
  isNotified={isNotified}
/>
```

**검증**:

```bash
npm test  # 모든 테스트 통과 확인
```

---

#### Step 1.2: CalendarCell 컴포넌트 생성

**우선순위**: ⭐⭐⭐ (날짜 클릭, D&D 기능 추가 대상)

**파일 생성**: `src/components/calendar/CalendarCell.tsx`

````typescript
import { TableCell, Typography } from '@mui/material';

import { Event } from '@/types';
import EventCard from './EventCard';

interface CalendarCellProps {
  /** 날짜 (숫자) */
  day: number | null;
  /** 해당 날짜의 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: number[];
  /** 공휴일 이름 (선택) */
  holiday?: string;
  /** 셀 클릭 핸들러 */
  onClick?: (day: number) => void;
  /** 드롭 핸들러 (D&D) */
  onDrop?: (day: number, event: React.DragEvent<HTMLTableCellElement>) => void;
}

/**
 * 캘린더 개별 날짜 셀
 *
 * @description
 * - 날짜, 공휴일, 일정 목록 표시
 * - 셀 클릭으로 일정 생성 (날짜 자동 입력)
 * - 드래그 앤 드롭으로 일정 이동
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

  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    if (day && onDrop) {
      onDrop(day, e);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
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
````

**파일 수정**: `src/App.tsx`

- `CalendarCell` import 추가
- `renderWeekView`와 `renderMonthView`의 `TableCell` 부분을 `<CalendarCell />` 사용으로 변경

**검증**:

```bash
npm test
```

---

#### Step 1.3: CalendarNavigation 컴포넌트 생성

**우선순위**: ⭐⭐

**파일 생성**: `src/components/calendar/CalendarNavigation.tsx`

```typescript
import { IconButton, MenuItem, Select, Stack } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface CalendarNavigationProps {
  /** 현재 뷰 타입 */
  view: 'week' | 'month';
  /** 뷰 타입 변경 핸들러 */
  onViewChange: (view: 'week' | 'month') => void;
  /** 이전 버튼 클릭 핸들러 */
  onPrevious: () => void;
  /** 다음 버튼 클릭 핸들러 */
  onNext: () => void;
}

/**
 * 캘린더 네비게이션 (이전/다음/뷰 선택)
 */
export default function CalendarNavigation({
  view,
  onViewChange,
  onPrevious,
  onNext,
}: CalendarNavigationProps) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
      <IconButton aria-label="Previous" onClick={onPrevious}>
        <ChevronLeft />
      </IconButton>

      <Select
        size="small"
        aria-label="뷰 타입 선택"
        value={view}
        onChange={(e) => onViewChange(e.target.value as 'week' | 'month')}
      >
        <MenuItem value="week" aria-label="week-option">
          Week
        </MenuItem>
        <MenuItem value="month" aria-label="month-option">
          Month
        </MenuItem>
      </Select>

      <IconButton aria-label="Next" onClick={onNext}>
        <ChevronRight />
      </IconButton>
    </Stack>
  );
}
```

---

#### Step 1.4: MonthView/WeekView 컴포넌트 생성

**우선순위**: ⭐⭐

**파일 생성**: `src/components/calendar/WeekView.tsx`

```typescript
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

import { Event } from '@/types';
import { WEEK_DAYS } from '@/constants';
import { formatWeek } from '@/utils/dateUtils';
import CalendarCell from './CalendarCell';

interface WeekViewProps {
  /** 현재 날짜 */
  currentDate: Date;
  /** 주간 날짜 배열 (7일) */
  weekDates: Date[];
  /** 필터링된 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: number[];
  /** 날짜 셀 클릭 핸들러 */
  onDateClick?: (date: Date) => void;
}

/**
 * 주간 캘린더 뷰
 */
export default function WeekView({
  currentDate,
  weekDates,
  events,
  notifiedEventIds,
  onDateClick,
}: WeekViewProps) {
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
              {weekDates.map((date) => (
                <CalendarCell
                  key={date.toISOString()}
                  day={date.getDate()}
                  events={getEventsForDate(date)}
                  notifiedEventIds={notifiedEventIds}
                  onClick={() => onDateClick?.(date)}
                />
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
```

**파일 생성**: `src/components/calendar/MonthView.tsx`

```typescript
import {
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';

import { Event } from '@/types';
import { WEEK_DAYS } from '@/constants';
import { formatMonth, formatDate, getEventsForDay } from '@/utils/dateUtils';
import CalendarCell from './CalendarCell';

interface MonthViewProps {
  /** 현재 날짜 */
  currentDate: Date;
  /** 월간 주 배열 (각 주는 7일) */
  weeks: (number | null)[][];
  /** 필터링된 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: number[];
  /** 공휴일 맵 (날짜 문자열 -> 공휴일명) */
  holidays: Record<string, string>;
  /** 날짜 셀 클릭 핸들러 */
  onDateClick?: (date: Date) => void;
}

/**
 * 월간 캘린더 뷰
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
```

---

#### Step 1.5: CalendarView 컨테이너 생성

**우선순위**: ⭐

**파일 생성**: `src/components/calendar/CalendarView.tsx`

```typescript
import { Stack, Typography } from '@mui/material';

import { Event } from '@/types';
import { getWeekDates, getWeeksAtMonth } from '@/utils/dateUtils';
import CalendarNavigation from './CalendarNavigation';
import WeekView from './WeekView';
import MonthView from './MonthView';

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
  notifiedEventIds: number[];
  /** 공휴일 맵 */
  holidays: Record<string, string>;
  /** 날짜 클릭 핸들러 */
  onDateClick?: (date: Date) => void;
}

/**
 * 캘린더 뷰 메인 컨테이너
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
```

**파일 생성**: `src/components/calendar/index.ts`

```typescript
export { default as CalendarView } from './CalendarView';
export { default as CalendarCell } from './CalendarCell';
export { default as CalendarNavigation } from './CalendarNavigation';
export { default as EventCard } from './EventCard';
export { default as MonthView } from './MonthView';
export { default as WeekView } from './WeekView';
```

---

### Phase 2: Event 컴포넌트 분리

#### Step 2.1: EventItem 컴포넌트 생성

**우선순위**: ⭐⭐⭐

**파일 생성**: `src/components/event/EventItem.tsx`

```typescript
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Delete, Edit, Notifications, Repeat } from '@mui/icons-material';

import { Event, RepeatType } from '@/types';
import { NOTIFICATION_OPTIONS } from '@/constants';

/**
 * 반복 유형을 한글 단위로 변환
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
 * - 일정의 모든 상세 정보 표시
 * - 알림/반복 아이콘 표시
 * - 수정/삭제 버튼 제공
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
              {event.repeat.type === 'daily' && '일'}
              {event.repeat.type === 'weekly' && '주'}
              {event.repeat.type === 'monthly' && '월'}
              {event.repeat.type === 'yearly' && '년'}
              마다
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
```

---

#### Step 2.2: EventSearchInput 컴포넌트 생성

**파일 생성**: `src/components/event/EventSearchInput.tsx`

```typescript
import { FormControl, FormLabel, TextField } from '@mui/material';

interface EventSearchInputProps {
  /** 검색어 */
  value: string;
  /** 검색어 변경 핸들러 */
  onChange: (value: string) => void;
}

/**
 * 일정 검색 입력 필드
 */
export default function EventSearchInput({ value, onChange }: EventSearchInputProps) {
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor="search">일정 검색</FormLabel>
      <TextField
        id="search"
        size="small"
        placeholder="검색어를 입력하세요"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
```

---

#### Step 2.3: EventList 컴포넌트 생성

**파일 생성**: `src/components/event/EventList.tsx`

```typescript
import { Stack, Typography } from '@mui/material';

import { Event } from '@/types';
import EventSearchInput from './EventSearchInput';
import EventItem from './EventItem';

interface EventListProps {
  /** 필터링된 일정 목록 */
  events: Event[];
  /** 알림이 발생한 일정 ID 배열 */
  notifiedEventIds: number[];
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
```

---

#### Step 2.4: EventForm 관련 컴포넌트 (선택 사항)

> **참고**: EventForm은 복잡도가 높으므로 Storybook 작성 우선순위에 따라 나중에 분리 가능

**Barrel Export**: `src/components/event/index.ts`

```typescript
export { default as EventList } from './EventList';
export { default as EventItem } from './EventItem';
export { default as EventSearchInput } from './EventSearchInput';
```

---

### Phase 3: Dialog 컴포넌트 정리

#### Step 3.1: OverlapDialog 분리

**파일 생성**: `src/components/dialogs/OverlapDialog.tsx`

```typescript
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event, EventForm } from '@/types';

interface OverlapDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 겹치는 일정 목록 */
  overlappingEvents: Event[];
  /** 계속 진행 핸들러 */
  onConfirm: () => void;
}

/**
 * 일정 겹침 경고 다이얼로그
 */
export default function OverlapDialog({
  open,
  onClose,
  overlappingEvents,
  onConfirm,
}: OverlapDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        {overlappingEvents.map((event) => (
          <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
            {event.title} ({event.date} {event.startTime}-{event.endTime})
          </Typography>
        ))}
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button color="error" onClick={onConfirm}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**파일 이동**: `src/components/RecurringEventDialog.tsx` → `src/components/dialogs/RecurringEventDialog.tsx`

**Barrel Export**: `src/components/dialogs/index.ts`

```typescript
export { default as OverlapDialog } from './OverlapDialog';
export { default as RecurringEventDialog } from './RecurringEventDialog';
```

---

### Phase 4: Notification 컴포넌트 분리

**파일 생성**: `src/components/notifications/NotificationToast.tsx`

```typescript
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';
import { Close } from '@mui/icons-material';

interface Notification {
  message: string;
}

interface NotificationToastProps {
  /** 알림 목록 */
  notifications: Notification[];
  /** 알림 닫기 핸들러 */
  onClose: (index: number) => void;
}

/**
 * 화면 우측 상단 고정 알림 토스트
 */
export default function NotificationToast({ notifications, onClose }: NotificationToastProps) {
  if (notifications.length === 0) return null;

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => onClose(index)}>
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
}
```

---

## 🔒 핵심 규칙 (절대 준수)

### 1. 기존 테스트 보존

- **모든 단계마다** `npm test` 실행하여 테스트 통과 확인
- `data-testid` 속성 절대 변경/삭제 금지
- 기존 aria-label 유지

### 2. 점진적 리팩토링

- **한 번에 하나의 컴포넌트만** 분리
- 각 컴포넌트 분리 후 즉시 검증
- 문제 발생 시 즉시 롤백

### 3. Import 경로 규칙

```typescript
// ✅ 올바른 예시
import { Event } from '@/types';
import { CATEGORIES } from '@/constants';
import { EVENT_BOX_STYLES } from '@/styles/eventBoxStyles';
import EventCard from '@/components/calendar/EventCard';

// ❌ 잘못된 예시
import { Event } from '../../types';
import { CATEGORIES } from '../constants';
```

### 4. 컴포넌트 작성 규칙

- **항상 JSDoc 주석** 포함
- **Props interface 정의** 필수
- **data-testid 속성** 추가 (E2E 테스트용)
- **기존 동작 완전히 동일**하게 유지

### 5. JSDoc 주석 유지 규칙 ⭐

- **App.tsx에서 컴포넌트로 분리할 때 기존 JSDoc 주석을 반드시 유지**
- 함수나 컴포넌트가 분리되면 해당 JSDoc 주석도 함께 이동
- 새로운 컴포넌트에는 추가 JSDoc 작성
- 변경되는 동작이 있다면 JSDoc 내용도 함께 업데이트

```typescript
// ✅ 올바른 예시 - App.tsx의 함수를 컴포넌트로 분리
// Before (App.tsx)
/**
 * 반복 유형을 한글 단위로 변환
 * @param {RepeatType} type - 반복 유형 (daily, weekly, monthly, yearly)
 * @returns {string} 한글 단위 (일, 주, 월, 년)
 */
const getRepeatTypeLabel = (type: RepeatType): string => { ... }

// After (EventCard.tsx) - JSDoc 주석을 그대로 이동
/**
 * 반복 유형을 한글 단위로 변환
 * @param {RepeatType} type - 반복 유형 (daily, weekly, monthly, yearly)
 * @returns {string} 한글 단위 (일, 주, 월, 년)
 */
const getRepeatTypeLabel = (type: RepeatType): string => { ... }
```

### 6. Barrel Export 패턴

- 각 폴더에 `index.ts` 생성
- named export 사용

```typescript
// src/components/calendar/index.ts
export { default as CalendarView } from './CalendarView';
export { default as EventCard } from './EventCard';
```

---

## 🧪 검증 체크리스트

각 단계 완료 후 아래 항목 확인:

```bash
# 1. 모든 테스트 통과
npm test

# 2. 타입 에러 없음
npm run type-check  # (있다면)

# 3. Lint 에러 없음
npm run lint

# 4. 빌드 성공
npm run build

# 5. 개발 서버 정상 실행
npm run dev
```

---

## 📊 진행 상황 추적

> **참고**: 진행 상황은 `REFACTORING_PROGRESS.md` 파일에서 상세히 확인할 수 있습니다.

### Phase 0: 준비 작업

- [x] Step 0.1: 상수 분리 (`constants/index.ts`, `styles/eventBoxStyles.ts`) ✅ 완료

### Phase 1: Calendar 컴포넌트

- [x] Step 1.1: EventCard 생성 ✅ 완료
- [x] Step 1.2: CalendarCell 생성 ✅ 완료
- [x] Step 1.3: CalendarNavigation 생성 ✅ 완료
- [x] Step 1.4: MonthView/WeekView 생성 ✅ 완료
- [x] Step 1.5: CalendarView 컨테이너 생성 ✅ 완료

### Phase 2: Event 컴포넌트

- [x] Step 2.1: EventItem 생성 ✅ 완료
- [x] Step 2.2: EventSearchInput 생성 ✅ 완료
- [x] Step 2.3: EventList 생성 ✅ 완료
- [x] Step 2.4: EventForm 분리 ✅ 완료

### Phase 3: Dialog 컴포넌트

- [x] Step 3.1: OverlapDialog 분리 ✅ 완료
- [x] Step 3.2: RecurringEventDialog 이동 ✅ 완료

### Phase 4: Notification 컴포넌트

- [x] Step 4.1: NotificationToast 생성 ✅ 완료

---

## 🎨 Storybook 작성 가이드

각 컴포넌트 분리 후 Storybook 작성:

### 우선순위

1. **EventCard** (필수) - 시각적 회귀 테스트 핵심
2. **EventItem** (필수)
3. **CalendarCell** (필수)
4. **OverlapDialog** (필수)
5. **RecurringEventDialog** (필수)

### Story 작성 템플릿

```typescript
// EventCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import EventCard from './EventCard';

const meta = {
  title: 'Calendar/EventCard',
  component: EventCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    event: {
      id: 1,
      title: '팀 미팅',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    isNotified: false,
  },
};

export const Notified: Story = {
  args: {
    ...Default.args,
    isNotified: true,
  },
};

export const Repeating: Story = {
  args: {
    event: {
      ...Default.args.event!,
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
    },
    isNotified: false,
  },
};

export const LongTitle: Story = {
  args: {
    event: {
      ...Default.args.event!,
      title: '매우 긴 제목의 일정입니다. 이것은 말줄임표로 처리되어야 합니다. 더 긴 텍스트 추가',
    },
    isNotified: false,
  },
};
```

---

## 🚨 문제 발생 시 대응

### 테스트 실패

1. 변경 사항 검토
2. `data-testid` 확인
3. 동작 로직 동일한지 확인
4. 필요시 이전 단계로 롤백

### 타입 에러

1. import 경로 확인
2. Props interface 정의 확인
3. 타입 일치 여부 확인

### 빌드 에러

1. 순환 참조 확인
2. import 경로 확인
3. 누락된 export 확인

---

## 📝 최종 App.tsx 구조 (리팩토링 완료 후)

```typescript
function App() {
  // Hooks
  const { ... } = useEventForm()
  const { events, saveEvent, ... } = useEventOperations(...)
  const { ... } = useRecurringEventOperations(...)
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events)
  const { view, setView, currentDate, holidays, navigate } = useCalendarView()
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(...)

  // State
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false)
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([])
  // ... 기타 상태

  // Handlers
  const handleRecurringConfirm = async (editSingleOnly: boolean) => { ... }
  const handleEditEvent = (event: Event) => { ... }
  const handleDeleteEvent = (event: Event) => { ... }
  const addOrUpdateEvent = async () => { ... }

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        {/* 좌측: 일정 입력 폼 */}
        <Stack spacing={2} sx={{ width: '20%' }}>
          {/* EventForm 컴포넌트 또는 기존 폼 */}
        </Stack>

        {/* 중앙: 캘린더 뷰 */}
        <CalendarView
          view={view}
          onViewChange={setView}
          currentDate={currentDate}
          onNavigate={navigate}
          events={filteredEvents}
          notifiedEventIds={notifiedEvents}
          holidays={holidays}
        />

        {/* 우측: 일정 목록 */}
        <EventList
          events={filteredEvents}
          notifiedEventIds={notifiedEvents}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      </Stack>

      {/* 다이얼로그 */}
      <OverlapDialog
        open={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        onConfirm={handleOverlapConfirm}
      />

      <RecurringEventDialog
        open={isRecurringDialogOpen}
        onClose={...}
        onConfirm={handleRecurringConfirm}
        event={...}
        mode={recurringDialogMode}
      />

      {/* 알림 토스트 */}
      <NotificationToast
        notifications={notifications}
        onClose={(index) => setNotifications(prev => prev.filter((_, i) => i !== index))}
      />
    </Box>
  )
}
```

---

## 🎯 다음 단계 (리팩토링 완료 후)

1. **새 기능 개발**

   - 날짜 클릭으로 일정 생성 (CalendarCell 활용)
   - 드래그 앤 드롭 (useDragAndDrop 훅 + EventCard/CalendarCell)

2. **Storybook 작성**

   - 각 컴포넌트별 스토리 작성
   - Chromatic 연동

3. **E2E 테스트 작성**
   - Playwright 설정
   - 5가지 필수 테스트 시나리오 작성

---

## 📚 참고사항

- **AI Agent에게 작업 지시 시**: 이 문서의 해당 Step을 명확히 지정
- **예시**: "Phase 1, Step 1.1을 진행해줘. EventCard 컴포넌트를 생성하고, App.tsx에서 사용하도록 수정해줘."
- **검증은 필수**: 각 단계마다 테스트 실행 확인

## 📝 진행 상황 업데이트 방법

### 각 Step 완료 후 해야 할 일

1. **`REFACTORING_GUIDE.md` 업데이트**

   ```markdown
   - [x] Step X.Y: [작업명] ✅ 완료
   ```

2. **`REFACTORING_PROGRESS.md`에 상세 기록 추가**

   - 날짜, 작업자, 커밋 메시지
   - 생성/수정된 파일 목록
   - 테스트 결과
   - 변경 사항 요약
   - 문제 및 해결 방법 (있는 경우)

3. **커밋**
   ```bash
   git add .
   git commit -m "refactor: [Phase X.Y] [작업 설명]"
   ```

### Agent에게 요청하는 방법

```
@REFACTORING_GUIDE.md Phase X, Step X.Y를 진행해줘.
작업 완료 후 REFACTORING_PROGRESS.md도 업데이트해줘.
```

---

이 가이드를 따라 천천히, 확실하게 리팩토링을 진행하세요! 🚀
