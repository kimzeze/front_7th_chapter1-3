import { DndContext } from '@dnd-kit/core';
import type { Meta, StoryObj } from '@storybook/react-vite';

import CalendarView from '../components/calendar/CalendarView';
import { Event } from '../types';

/**
 * CalendarView 컴포넌트
 *
 * 캘린더 뷰 메인 컨테이너입니다.
 * - 캘린더 네비게이션과 주간/월간 뷰를 통합
 * - 뷰 타입에 따라 WeekView 또는 MonthView 렌더링
 * - 날짜 이동, 뷰 전환 등 캘린더 관련 모든 UI 통합
 */
const meta = {
  title: 'Calendar/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '캘린더의 메인 뷰 컨테이너입니다. 주간/월간 뷰를 전환할 수 있습니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // DndContext로 감싸서 드래그 앤 드롭 기능이 동작하도록 설정
      <DndContext>
        <div style={{ padding: '24px', minHeight: '100vh' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
  argTypes: {
    view: {
      description: '현재 뷰 타입 (week: 주간, month: 월간)',
      control: 'select',
      options: ['week', 'month'],
    },
    currentDate: {
      description: '현재 표시 중인 날짜',
      control: 'date',
    },
    events: {
      description: '필터링된 일정 목록',
    },
    notifiedEventIds: {
      description: '알림이 발생한 일정 ID 배열',
    },
    holidays: {
      description: '공휴일 맵 (날짜 문자열 -> 공휴일명)',
    },
    onViewChange: {
      description: '뷰 타입 변경 핸들러',
      action: 'view changed',
    },
    onNavigate: {
      description: '이전/다음 네비게이션 핸들러',
      action: 'navigated',
    },
    onDateClick: {
      description: '날짜 클릭 핸들러',
      action: 'date clicked',
    },
  },
} as Meta<typeof CalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 이벤트 데이터
const baseEvent: Event = {
  id: '1',
  title: '팀 회의',
  date: '2024-11-05',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

/**
 * 월간 뷰
 *
 * 현재 월의 모든 날짜를 주 단위로 표시합니다.
 * 일정이 여러 개 포함되어 있습니다.
 */
export const MonthView: Story = {
  args: {
    view: 'month',
    currentDate: new Date('2024-11-05'),
    events: [
      baseEvent,
      {
        ...baseEvent,
        id: '2',
        title: '점심 약속',
        date: '2024-11-10',
        startTime: '12:00',
        endTime: '13:00',
      },
      {
        ...baseEvent,
        id: '3',
        title: '오후 미팅',
        date: '2024-11-15',
        startTime: '14:00',
        endTime: '15:00',
      },
      {
        ...baseEvent,
        id: '4',
        title: '저녁 운동',
        date: '2024-11-20',
        startTime: '18:00',
        endTime: '19:00',
      },
      {
        ...baseEvent,
        id: '5',
        title: '주간 회의',
        date: '2024-11-05',
        startTime: '09:00',
        endTime: '10:00',
        repeat: { type: 'weekly', interval: 1 },
      },
    ],
    notifiedEventIds: ['2'],
    holidays: { '2024-11-05': '어린이날' },
    onViewChange: (view) => console.log('View changed:', view),
    onNavigate: (direction) => console.log('Navigate:', direction),
    onDateClick: (date) => console.log('Date clicked:', date),
  },
};

/**
 * 주간 뷰
 *
 * 현재 주의 7일(일~토)을 표시합니다.
 * 일정이 여러 개 포함되어 있습니다.
 */
export const WeekView: Story = {
  args: {
    view: 'week',
    currentDate: new Date('2024-11-05'),
    events: [
      baseEvent,
      {
        ...baseEvent,
        id: '2',
        title: '점심 약속',
        date: '2024-11-06',
        startTime: '12:00',
        endTime: '13:00',
      },
      {
        ...baseEvent,
        id: '3',
        title: '오후 미팅',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
      },
    ],
    notifiedEventIds: ['2'],
    holidays: {},
    onViewChange: (view) => console.log('View changed:', view),
    onNavigate: (direction) => console.log('Navigate:', direction),
    onDateClick: (date) => console.log('Date clicked:', date),
  },
};

/**
 * 빈 캘린더
 *
 * 일정이 없는 빈 캘린더입니다.
 * 기본 레이아웃과 네비게이션만 표시됩니다.
 */
export const EmptyCalendar: Story = {
  args: {
    view: 'month',
    currentDate: new Date('2024-11-05'),
    events: [],
    notifiedEventIds: [],
    holidays: {},
    onViewChange: (view) => console.log('View changed:', view),
    onNavigate: (direction) => console.log('Navigate:', direction),
    onDateClick: (date) => console.log('Date clicked:', date),
  },
};

/**
 * 공휴일 포함 월간 뷰
 *
 * 공휴일이 여러 개 포함된 월간 뷰입니다.
 * 공휴일이 빨간색으로 표시됩니다.
 */
export const MonthViewWithHolidays: Story = {
  args: {
    view: 'month',
    currentDate: new Date('2024-11-05'),
    events: [
      {
        ...baseEvent,
        date: '2024-11-05',
      },
    ],
    notifiedEventIds: [],
    holidays: {
      '2024-11-05': '어린이날',
      '2024-11-11': '빼빼로데이',
      '2024-11-15': '가족의 날',
    },
    onViewChange: (view) => console.log('View changed:', view),
    onNavigate: (direction) => console.log('Navigate:', direction),
    onDateClick: (date) => console.log('Date clicked:', date),
  },
};

/**
 * 반복 일정 포함 월간 뷰
 *
 * 반복 일정이 포함된 월간 뷰입니다.
 * 반복 일정 아이콘이 여러 날짜에 표시됩니다.
 */
export const MonthViewWithRepeatingEvents: Story = {
  args: {
    view: 'month',
    currentDate: new Date('2024-11-05'),
    events: [
      {
        ...baseEvent,
        id: '1',
        title: '매주 회의',
        date: '2024-11-05',
        repeat: { type: 'weekly', interval: 1 },
      },
      {
        ...baseEvent,
        id: '2',
        title: '매주 회의',
        date: '2024-11-12',
        repeat: { type: 'weekly', interval: 1 },
      },
      {
        ...baseEvent,
        id: '3',
        title: '매주 회의',
        date: '2024-11-19',
        repeat: { type: 'weekly', interval: 1 },
      },
      {
        ...baseEvent,
        id: '4',
        title: '매주 회의',
        date: '2024-11-26',
        repeat: { type: 'weekly', interval: 1 },
      },
    ],
    notifiedEventIds: [],
    holidays: {},
    onViewChange: (view) => console.log('View changed:', view),
    onNavigate: (direction) => console.log('Navigate:', direction),
    onDateClick: (date) => console.log('Date clicked:', date),
  },
};
