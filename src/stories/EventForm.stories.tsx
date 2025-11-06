import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChangeEvent, useState } from 'react';

import EventForm from '../components/event/EventForm';
import { CATEGORIES, NOTIFICATION_OPTIONS } from '../constants';
import { RepeatType } from '../types';

/**
 * EventForm 컴포넌트
 *
 * 일정 추가/수정 폼입니다.
 * - 일정의 모든 정보를 입력받는 폼
 * - 추가 모드: 모든 필드 입력 가능, 반복 일정 설정 가능
 * - 수정 모드: 반복 일정 설정 숨김
 * - 시간 유효성 검증 (시작 시간 < 종료 시간)
 */
const meta = {
  title: 'Event/EventForm',
  component: EventForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '일정을 추가하거나 수정할 때 사용하는 폼 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isEditing: {
      description: '수정 중인 일정 여부 (null이면 추가 모드)',
      control: 'boolean',
    },
    title: {
      description: '제목',
      control: 'text',
    },
    date: {
      description: '날짜 (YYYY-MM-DD)',
      control: 'text',
    },
    startTime: {
      description: '시작 시간 (HH:mm)',
      control: 'text',
    },
    endTime: {
      description: '종료 시간 (HH:mm)',
      control: 'text',
    },
    category: {
      description: '카테고리',
      control: 'select',
      options: CATEGORIES,
    },
    notificationTime: {
      description: '알림 시간 (분 단위)',
      control: 'select',
      options: NOTIFICATION_OPTIONS.map((opt) => opt.value),
    },
  },
} as Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 빈 폼 (생성 모드)
 *
 * 새로운 일정을 추가할 때의 빈 폼입니다.
 * 모든 필드가 비어있고, 반복 일정 설정이 가능합니다.
 */
export const Empty: Story = {
  args: {
    isEditing: false,
    title: '',
    onTitleChange: () => {},
    date: '',
    onDateChange: () => {},
    startTime: '',
    onStartTimeChange: () => {},
    endTime: '',
    onEndTimeChange: () => {},
    description: '',
    onDescriptionChange: () => {},
    location: '',
    onLocationChange: () => {},
    category: CATEGORIES[0],
    onCategoryChange: () => {},
    isRepeating: false,
    onIsRepeatingChange: () => {},
    repeatType: 'none',
    onRepeatTypeChange: () => {},
    repeatInterval: 1,
    onRepeatIntervalChange: () => {},
    repeatEndDate: '',
    onRepeatEndDateChange: () => {},
    notificationTime: NOTIFICATION_OPTIONS[0].value,
    onNotificationTimeChange: () => {},
    startTimeError: null,
    endTimeError: null,
    onSubmit: () => console.log('Form submitted'),
  },
};

/**
 * 데이터 채워진 폼 (수정 모드)
 *
 * 기존 일정을 수정할 때의 폼입니다.
 * 모든 필드가 채워져 있고, 반복 일정 설정은 숨겨집니다.
 */
export const Filled: Story = {
  args: {
    isEditing: true,
    title: '팀 회의',
    onTitleChange: () => {},
    date: '2024-11-05',
    onDateChange: () => {},
    startTime: '10:00',
    onStartTimeChange: () => {},
    endTime: '11:00',
    onEndTimeChange: () => {},
    description: '주간 팀 미팅',
    onDescriptionChange: () => {},
    location: '회의실 A',
    onLocationChange: () => {},
    category: '업무',
    onCategoryChange: () => {},
    isRepeating: false,
    onIsRepeatingChange: () => {},
    repeatType: 'none',
    onRepeatTypeChange: () => {},
    repeatInterval: 1,
    onRepeatIntervalChange: () => {},
    repeatEndDate: '',
    onRepeatEndDateChange: () => {},
    notificationTime: 10,
    onNotificationTimeChange: () => {},
    startTimeError: null,
    endTimeError: null,
    onSubmit: () => console.log('Form submitted'),
  },
};

/**
 * 반복 설정 활성화
 *
 * 반복 일정을 생성할 때의 폼입니다.
 * 반복 일정 체크박스가 활성화되어 있고, 반복 설정 필드가 표시됩니다.
 */
export const WithRepeat: Story = {
  args: {
    isEditing: false,
    title: '아침 운동',
    onTitleChange: () => {},
    date: '2024-11-05',
    onDateChange: () => {},
    startTime: '07:00',
    onStartTimeChange: () => {},
    endTime: '08:00',
    onEndTimeChange: () => {},
    description: '매일 아침 운동',
    onDescriptionChange: () => {},
    location: '헬스장',
    onLocationChange: () => {},
    category: '운동',
    onCategoryChange: () => {},
    isRepeating: true,
    onIsRepeatingChange: () => {},
    repeatType: 'daily',
    onRepeatTypeChange: () => {},
    repeatInterval: 1,
    onRepeatIntervalChange: () => {},
    repeatEndDate: '2024-12-31',
    onRepeatEndDateChange: () => {},
    notificationTime: 30,
    onNotificationTimeChange: () => {},
    startTimeError: null,
    endTimeError: null,
    onSubmit: () => console.log('Form submitted'),
  },
};

/**
 * 알림 설정
 *
 * 알림이 설정된 일정 폼입니다.
 * 알림 시간이 선택되어 있습니다.
 */
export const WithNotification: Story = {
  args: {
    isEditing: false,
    title: '중요한 회의',
    onTitleChange: () => {},
    date: '2024-11-05',
    onDateChange: () => {},
    startTime: '14:00',
    onStartTimeChange: () => {},
    endTime: '15:00',
    onEndTimeChange: () => {},
    description: '프로젝트 발표',
    onDescriptionChange: () => {},
    location: '대회의실',
    onLocationChange: () => {},
    category: '업무',
    onCategoryChange: () => {},
    isRepeating: false,
    onIsRepeatingChange: () => {},
    repeatType: 'none',
    onRepeatTypeChange: () => {},
    repeatInterval: 1,
    onRepeatIntervalChange: () => {},
    repeatEndDate: '',
    onRepeatEndDateChange: () => {},
    notificationTime: 60, // 1시간 전 알림
    onNotificationTimeChange: () => {},
    startTimeError: null,
    endTimeError: null,
    onSubmit: () => console.log('Form submitted'),
  },
};

/**
 * 검증 에러 상태
 *
 * 시간 유효성 검증에 실패한 상태입니다.
 * 시작 시간이 종료 시간보다 늦을 때 에러 메시지가 표시됩니다.
 */
export const ValidationError: Story = {
  args: {
    isEditing: false,
    title: '회의',
    onTitleChange: () => {},
    date: '2024-11-05',
    onDateChange: () => {},
    startTime: '15:00',
    onStartTimeChange: () => {},
    endTime: '14:00',
    onEndTimeChange: () => {},
    description: '',
    onDescriptionChange: () => {},
    location: '',
    onLocationChange: () => {},
    category: CATEGORIES[0],
    onCategoryChange: () => {},
    isRepeating: false,
    onIsRepeatingChange: () => {},
    repeatType: 'none',
    onRepeatTypeChange: () => {},
    repeatInterval: 1,
    onRepeatIntervalChange: () => {},
    repeatEndDate: '',
    onRepeatEndDateChange: () => {},
    notificationTime: NOTIFICATION_OPTIONS[0].value,
    onNotificationTimeChange: () => {},
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    onSubmit: () => console.log('Form submitted'),
  },
};

/**
 * 인터랙티브 폼 컴포넌트
 *
 * 실제로 입력할 수 있는 인터랙티브 폼입니다.
 * 모든 필드를 변경할 수 있습니다.
 */
function InteractiveForm() {
  const [isEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(CATEGORIES[0]);
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [repeatInterval, setRepeatInterval] = useState<number>(1);
  const [repeatEndDate, setRepeatEndDate] = useState('');
  const [notificationTime, setNotificationTime] = useState<number>(NOTIFICATION_OPTIONS[0].value);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
    // 간단한 검증 (실제로는 getTimeErrorMessage 사용)
    if (e.target.value && endTime && e.target.value >= endTime) {
      setStartTimeError('시작 시간은 종료 시간보다 빨라야 합니다.');
    } else {
      setStartTimeError(null);
    }
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
    // 간단한 검증
    if (e.target.value && startTime && e.target.value <= startTime) {
      setEndTimeError('종료 시간은 시작 시간보다 늦어야 합니다.');
    } else {
      setEndTimeError(null);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value as (typeof CATEGORIES)[number]);
  };

  const handleNotificationTimeChange = (value: number) => {
    setNotificationTime(value);
  };

  return (
    <EventForm
      isEditing={isEditing}
      title={title}
      onTitleChange={setTitle}
      date={date}
      onDateChange={setDate}
      startTime={startTime}
      onStartTimeChange={handleStartTimeChange}
      endTime={endTime}
      onEndTimeChange={handleEndTimeChange}
      description={description}
      onDescriptionChange={setDescription}
      location={location}
      onLocationChange={setLocation}
      category={category}
      onCategoryChange={handleCategoryChange}
      isRepeating={isRepeating}
      onIsRepeatingChange={setIsRepeating}
      repeatType={repeatType}
      onRepeatTypeChange={setRepeatType}
      repeatInterval={repeatInterval}
      onRepeatIntervalChange={setRepeatInterval}
      repeatEndDate={repeatEndDate}
      onRepeatEndDateChange={setRepeatEndDate}
      notificationTime={notificationTime}
      onNotificationTimeChange={handleNotificationTimeChange}
      startTimeError={startTimeError}
      endTimeError={endTimeError}
      onSubmit={() => {
        console.log('Form submitted:', {
          title,
          date,
          startTime,
          endTime,
          description,
          location,
          category,
          isRepeating,
          repeatType,
          repeatInterval,
          repeatEndDate,
          notificationTime,
        });
      }}
    />
  );
}

/**
 * 인터랙티브 폼
 *
 * 실제로 입력할 수 있는 인터랙티브 폼입니다.
 * 모든 필드를 변경할 수 있습니다.
 */
export const Interactive: Story = {
  render: () => <InteractiveForm />,
};
