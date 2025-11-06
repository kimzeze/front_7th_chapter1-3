import { DndContext } from '@dnd-kit/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import CalendarCell from '../components/calendar/CalendarCell';
import { Event } from '../types';

/**
 * CalendarCell 컴포넌트
 *
 * 캘린더의 개별 날짜 셀입니다.
 * - 날짜, 공휴일, 일정 목록 표시
 * - 셀 클릭으로 일정 생성 (날짜 자동 입력)
 * - 드래그 앤 드롭으로 일정 이동 지원
 */
const meta = {
  title: 'Calendar/CalendarCell',
  component: CalendarCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '캘린더의 개별 날짜 셀 컴포넌트입니다. 날짜, 공휴일, 일정을 표시합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      // DndContext로 감싸서 드롭 기능이 동작하도록 설정
      <DndContext>
        <table style={{ borderCollapse: 'collapse', width: '200px' }}>
          <tbody>
            <tr>
              <Story />
            </tr>
          </tbody>
        </table>
      </DndContext>
    ),
  ],
  argTypes: {
    day: {
      description: '날짜 (숫자), null이면 빈 셀',
      control: 'number',
    },
    dateString: {
      description: 'YYYY-MM-DD 형식의 날짜 문자열 (D&D용)',
      control: 'text',
    },
    events: {
      description: '해당 날짜의 일정 목록',
    },
    notifiedEventIds: {
      description: '알림이 발생한 일정 ID 배열',
    },
    holiday: {
      description: '공휴일 이름 (선택)',
      control: 'text',
    },
    onClick: {
      description: '셀 클릭 핸들러',
      action: 'clicked',
    },
  },
} satisfies Meta<typeof CalendarCell>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 이벤트 데이터 (EventCard.stories.tsx와 동일)
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
 * 빈 셀
 *
 * 날짜가 없는 빈 셀입니다.
 * 캘린더의 월간 뷰에서 해당 월에 포함되지 않는 날짜를 표시할 때 사용됩니다.
 */
export const Empty: Story = {
  args: {
    day: null,
    dateString: undefined,
    events: [],
    notifiedEventIds: [],
  },
};

/**
 * 날짜만 있는 셀
 *
 * 일정이 없는 날짜 셀입니다.
 * 클릭하면 해당 날짜로 일정 생성 폼이 열립니다.
 */
export const WithDate: Story = {
  args: {
    day: 15,
    dateString: '2024-11-15',
    events: [],
    notifiedEventIds: [],
    onClick: (day) => console.log('Date clicked:', day),
  },
};

/**
 * 공휴일 포함
 *
 * 공휴일이 있는 날짜 셀입니다.
 * 공휴일 이름이 빨간색으로 표시됩니다.
 */
export const WithHoliday: Story = {
  args: {
    day: 5,
    dateString: '2024-11-05',
    events: [],
    notifiedEventIds: [],
    holiday: '어린이날',
    onClick: (day) => console.log('Date clicked:', day),
  },
};

/**
 * 일정 1개
 *
 * 하나의 일정만 있는 날짜 셀입니다.
 */
export const WithSingleEvent: Story = {
  args: {
    day: 5,
    dateString: '2024-11-05',
    events: [baseEvent],
    notifiedEventIds: [],
    onClick: (day) => console.log('Date clicked:', day),
  },
};

/**
 * 일정 여러 개
 *
 * 여러 개의 일정이 있는 날짜 셀입니다.
 * 일정이 많을 경우 세로로 쌓여 표시됩니다.
 * overflow: hidden으로 인해 일정이 많이 있으면 잘릴 수 있습니다.
 */
export const WithMultipleEvents: Story = {
  args: {
    day: 10,
    dateString: '2024-11-10',
    events: [
      baseEvent,
      {
        ...baseEvent,
        id: '2',
        title: '점심 약속',
        startTime: '12:00',
        endTime: '13:00',
      },
      {
        ...baseEvent,
        id: '3',
        title: '오후 미팅',
        startTime: '14:00',
        endTime: '15:00',
      },
      {
        ...baseEvent,
        id: '4',
        title: '저녁 운동',
        startTime: '18:00',
        endTime: '19:00',
      },
    ],
    notifiedEventIds: [],
    onClick: (day) => console.log('Date clicked:', day),
  },
};

/**
 * 알림 발생한 일정
 *
 * 알림이 발생한 일정이 포함된 셀입니다.
 * 알림이 발생한 일정은 빨간색으로 강조 표시됩니다.
 */
export const WithNotifiedEvent: Story = {
  args: {
    day: 12,
    dateString: '2024-11-12',
    events: [
      baseEvent,
      {
        ...baseEvent,
        id: '2',
        title: '중요한 회의',
        startTime: '15:00',
        endTime: '16:00',
      },
    ],
    notifiedEventIds: ['2'], // 두 번째 일정에 알림 발생
    onClick: (day) => console.log('Date clicked:', day),
  },
};

/**
 * 반복 일정 포함
 *
 * 반복 일정이 포함된 셀입니다.
 * 반복 아이콘이 함께 표시됩니다.
 */
export const WithRepeatingEvent: Story = {
  args: {
    day: 8,
    dateString: '2024-11-08',
    events: [
      {
        ...baseEvent,
        title: '매주 회의',
        repeat: { type: 'weekly', interval: 1 },
      },
    ],
    notifiedEventIds: [],
    onClick: (day) => console.log('Date clicked:', day),
  },
};

/**
 * 드롭 존 하이라이트
 *
 * 일정을 드래그하여 셀 위에 올렸을 때의 상태입니다.
 * 배경색이 하늘색(#e3f2fd)으로 변경됩니다.
 * 실제로는 useDroppable의 isOver가 true일 때 자동으로 적용됩니다.
 */
export const DropHover: Story = {
  args: {
    day: 20,
    dateString: '2024-11-20',
    events: [],
    notifiedEventIds: [],
    onClick: (day) => console.log('Date clicked:', day),
  },
  render: (args) => (
    <DndContext>
      <table style={{ borderCollapse: 'collapse', width: '200px' }}>
        <tbody>
          <tr>
            {/* 드롭 호버 상태를 시각적으로 표현 */}
            <td style={{ backgroundColor: '#e3f2fd' }}>
              <CalendarCell {...args} />
            </td>
          </tr>
        </tbody>
      </table>
    </DndContext>
  ),
};

/**
 * 복합 상태
 *
 * 공휴일 + 여러 일정 + 알림이 모두 있는 셀입니다.
 * 실제 사용 시나리오를 종합적으로 보여줍니다.
 */
export const ComplexState: Story = {
  args: {
    day: 25,
    dateString: '2024-11-25',
    events: [
      {
        ...baseEvent,
        title: '크리스마스 파티',
        startTime: '18:00',
        endTime: '22:00',
      },
      {
        ...baseEvent,
        id: '2',
        title: '선물 준비',
        startTime: '14:00',
        endTime: '16:00',
      },
    ],
    notifiedEventIds: ['1'],
    holiday: '크리스마스',
    onClick: (day) => console.log('Date clicked:', day),
  },
};

