import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import EventCard from '../components/calendar/EventCard';
import { Event } from '../types';

/**
 * EventCard 컴포넌트
 *
 * 캘린더 셀 내부에 표시되는 일정 카드입니다.
 * - 알림 상태에 따른 시각적 표현 (빨간색/회색)
 * - 반복 일정 아이콘 및 툴팁 표시
 * - 드래그 앤 드롭 지원
 * - 긴 제목은 말줄임표 처리
 */
const meta = {
  title: 'Calendar/EventCard',
  component: EventCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '캘린더 셀에 표시되는 개별 일정 카드 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // DndContext로 감싸서 드래그 기능이 동작하도록 설정
      <DndContext>
        <div style={{ width: '200px', padding: '16px', backgroundColor: '#f5f5f5' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
  argTypes: {
    event: {
      description: '표시할 일정 데이터',
    },
    isNotified: {
      description: '알림이 발생한 일정 여부 (true일 때 빨간색 강조)',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 이벤트 데이터 (재사용을 위해)
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
 * 기본 일정 카드
 *
 * 가장 기본적인 일정 카드의 모습입니다.
 * 알림도 없고 반복도 없는 단순한 일정입니다.
 */
export const Default: Story = {
  args: {
    event: baseEvent,
    isNotified: false,
  },
};

/**
 * 알림 발생한 일정
 *
 * 알림 시간이 되어 빨간색으로 강조 표시됩니다.
 * 알림 아이콘(🔔)이 함께 표시됩니다.
 */
export const Notified: Story = {
  args: {
    event: baseEvent,
    isNotified: true,
  },
};

/**
 * 매일 반복 일정
 *
 * 반복 아이콘(🔁)이 표시되며, 마우스를 올리면 "1일마다 반복" 툴팁이 나타납니다.
 */
export const RepeatingDaily: Story = {
  args: {
    event: {
      ...baseEvent,
      title: '아침 운동',
      repeat: { type: 'daily', interval: 1 },
    },
    isNotified: false,
  },
};

/**
 * 매주 반복 일정
 *
 * 매주 반복되는 일정입니다. 툴팁에 "1주마다 반복"으로 표시됩니다.
 */
export const RepeatingWeekly: Story = {
  args: {
    event: {
      ...baseEvent,
      title: '주간 회의',
      repeat: { type: 'weekly', interval: 1 },
    },
    isNotified: false,
  },
};

/**
 * 매월 반복 일정
 *
 * 매월 반복되는 일정입니다. 종료일까지 설정되어 있습니다.
 */
export const RepeatingMonthly: Story = {
  args: {
    event: {
      ...baseEvent,
      title: '월간 보고',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
    },
    isNotified: false,
  },
};

/**
 * 매년 반복 일정
 *
 * 매년 반복되는 일정입니다 (예: 생일, 기념일).
 */
export const RepeatingYearly: Story = {
  args: {
    event: {
      ...baseEvent,
      title: '생일',
      repeat: { type: 'yearly', interval: 1 },
    },
    isNotified: false,
  },
};

/**
 * 긴 제목 처리
 *
 * 제목이 매우 길 경우 말줄임표(...)로 표시됩니다.
 * 카드 너비를 넘는 텍스트는 자동으로 잘립니다.
 */
export const LongTitle: Story = {
  args: {
    event: {
      ...baseEvent,
      title: '이것은 매우 긴 제목으로 말줄임표가 적용되어야 하는 일정입니다 더 길게 작성해봅니다',
    },
    isNotified: false,
  },
};

/**
 * 알림 + 반복 일정
 *
 * 알림과 반복이 모두 활성화된 상태입니다.
 * 알림 아이콘과 반복 아이콘이 함께 표시됩니다.
 */
export const NotifiedAndRepeating: Story = {
  args: {
    event: {
      ...baseEvent,
      title: '중요한 주간 회의',
      repeat: { type: 'weekly', interval: 1 },
    },
    isNotified: true,
  },
};

/**
 * 드래그 중 상태
 *
 * 사용자가 일정을 드래그하고 있을 때의 시각적 표현입니다.
 * 실제로는 @dnd-kit이 자동으로 처리하지만, 여기서는 시각적으로만 표현했습니다.
 *
 * 참고: 실제 드래그 기능은 캘린더 내에서만 동작합니다.
 */
export const DraggingState: Story = {
  args: {
    event: baseEvent,
    isNotified: false,
  },
  decorators: [
    (Story) => (
      <DndContext>
        <div style={{ width: '200px', padding: '16px', backgroundColor: '#f5f5f5' }}>
          {/* 드래그 중 상태를 시각적으로 표현 */}
          <div style={{ opacity: 0.5, cursor: 'grabbing' }}>
            <Story />
          </div>
        </div>
      </DndContext>
    ),
  ],
};

/**
 * 다양한 카테고리 예시
 *
 * 같은 스타일이지만 다른 카테고리의 일정들입니다.
 * 현재는 카테고리별 색상 구분이 없지만, 향후 추가 가능합니다.
 */
export const VariousCategories: Story = {
  render: () => (
    <DndContext>
      <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <EventCard
          event={{ ...baseEvent, title: '팀 회의', category: '업무' }}
          isNotified={false}
        />
        <EventCard
          event={{ ...baseEvent, id: '2', title: '점심 약속', category: '개인' }}
          isNotified={false}
        />
        <EventCard
          event={{ ...baseEvent, id: '3', title: '헬스장', category: '운동' }}
          isNotified={false}
        />
        <EventCard
          event={{ ...baseEvent, id: '4', title: '가족 모임', category: '가족' }}
          isNotified={true}
        />
      </div>
    </DndContext>
  ),
};

