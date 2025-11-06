import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import OverlapDialog from '../components/dialogs/OverlapDialog';
import { Event } from '../types';

/**
 * OverlapDialog 컴포넌트
 *
 * 일정 겹침 경고 다이얼로그입니다.
 * - 새로운 일정이 기존 일정과 겹칠 때 표시
 * - 겹치는 일정 목록을 보여줌
 * - 사용자가 계속 진행할지 취소할지 선택 가능
 */
const meta = {
  title: 'Dialogs/OverlapDialog',
  component: OverlapDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '일정이 겹칠 때 표시되는 경고 다이얼로그입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: '다이얼로그 열림 상태',
      control: 'boolean',
    },
    overlappingEvents: {
      description: '겹치는 일정 목록',
    },
    onClose: {
      description: '닫기 핸들러',
      action: 'closed',
    },
    onConfirm: {
      description: '계속 진행 핸들러',
      action: 'confirmed',
    },
  },
} satisfies Meta<typeof OverlapDialog>;

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
 * 열린 상태 - 일정 1개와 겹침
 *
 * 하나의 일정과 겹칠 때 표시되는 다이얼로그입니다.
 */
export const OpenedWithSingleEvent: Story = {
  args: {
    open: true,
    overlappingEvents: [baseEvent],
    onClose: () => console.log('Dialog closed'),
    onConfirm: () => console.log('Confirmed'),
  },
};

/**
 * 열린 상태 - 일정 여러 개와 겹침
 *
 * 여러 개의 일정과 겹칠 때 표시되는 다이얼로그입니다.
 * 모든 겹치는 일정이 목록으로 표시됩니다.
 */
export const OpenedWithMultipleEvents: Story = {
  args: {
    open: true,
    overlappingEvents: [
      baseEvent,
      {
        ...baseEvent,
        id: '2',
        title: '점심 약속',
        date: '2024-11-05',
        startTime: '10:30',
        endTime: '11:30',
      },
      {
        ...baseEvent,
        id: '3',
        title: '오후 미팅',
        date: '2024-11-05',
        startTime: '10:45',
        endTime: '11:15',
      },
    ],
    onClose: () => console.log('Dialog closed'),
    onConfirm: () => console.log('Confirmed'),
  },
};

/**
 * 닫힌 상태
 *
 * 다이얼로그가 닫혀있을 때의 상태입니다.
 * 실제로는 렌더링되지 않습니다.
 */
export const Closed: Story = {
  args: {
    open: false,
    overlappingEvents: [],
    onClose: () => console.log('Dialog closed'),
    onConfirm: () => console.log('Confirmed'),
  },
};

