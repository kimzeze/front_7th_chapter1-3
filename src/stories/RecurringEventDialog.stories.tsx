import type { Meta, StoryObj } from '@storybook/react-vite';

import RecurringEventDialog from '../components/dialogs/RecurringEventDialog';
import { Event } from '../types';

/**
 * RecurringEventDialog 컴포넌트
 *
 * 반복 일정 수정/삭제 다이얼로그입니다.
 * - 해당 일정만 수정/삭제할지
 * - 전체 반복 일정을 수정/삭제할지 선택 가능
 */
const meta = {
  title: 'Dialogs/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '반복 일정을 수정하거나 삭제할 때 표시되는 다이얼로그입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: '다이얼로그 열림 상태',
      control: 'boolean',
    },
    mode: {
      description: '다이얼로그 모드 (edit: 수정, delete: 삭제)',
      control: 'select',
      options: ['edit', 'delete'],
    },
    event: {
      description: '작업 대상 일정',
    },
    onClose: {
      description: '닫기 핸들러',
      action: 'closed',
    },
    onConfirm: {
      description: '확인 핸들러 (editSingleOnly: boolean)',
      action: 'confirmed',
    },
  },
} as Meta<typeof RecurringEventDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 이벤트 데이터
const baseEvent: Event = {
  id: '1',
  title: '주간 회의',
  date: '2024-11-05',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'weekly', interval: 1 },
  notificationTime: 10,
};

/**
 * 닫힌 상태
 *
 * 다이얼로그가 닫혀있을 때의 상태입니다.
 * 실제로는 null을 반환하여 렌더링되지 않습니다.
 * Docs 탭에서 기본적으로 이 스토리가 표시됩니다.
 */
export const Closed: Story = {
  args: {
    open: false,
    mode: 'edit',
    event: baseEvent,
    onClose: () => console.log('Dialog closed'),
    onConfirm: (editSingleOnly) => console.log('Confirmed:', editSingleOnly),
  },
};

/**
 * 열린 상태 - 수정 모드
 *
 * 반복 일정을 수정할 때 표시되는 다이얼로그입니다.
 * - "예" 버튼: 해당 일정만 수정
 * - "아니오" 버튼: 전체 반복 일정 수정
 */
export const OpenedEditMode: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: baseEvent,
    onClose: () => console.log('Dialog closed'),
    onConfirm: (editSingleOnly) => console.log('Confirmed:', editSingleOnly),
  },
  parameters: {
    // Docs에서 이 스토리는 제외 (모달이 문서를 가리지 않도록)
    docs: {
      disable: true,
    },
  },
};

/**
 * 열린 상태 - 삭제 모드
 *
 * 반복 일정을 삭제할 때 표시되는 다이얼로그입니다.
 * - "예" 버튼: 해당 일정만 삭제
 * - "아니오" 버튼: 전체 반복 일정 삭제
 */
export const OpenedDeleteMode: Story = {
  args: {
    open: true,
    mode: 'delete',
    event: baseEvent,
    onClose: () => console.log('Dialog closed'),
    onConfirm: (editSingleOnly) => console.log('Confirmed:', editSingleOnly),
  },
  parameters: {
    // Docs에서 이 스토리는 제외 (모달이 문서를 가리지 않도록)
    docs: {
      disable: true,
    },
  },
};
